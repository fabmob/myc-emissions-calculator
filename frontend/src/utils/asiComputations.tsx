import * as types from '../frontendTypes'

export function computeVktBaseAfterAvoid(
    vtype: string, // Vehicle type
    y: number, // Year index in referenceYears, 0 is reference year, >0 are climate milestones
    BAUVkt: types.VehicleKilometresTravelledComputed, // 1) Base vkt table (vkt per year per vtype)
    inputAvoidedVkt: types.InputClimateWithoutUpstreamStep1, // 1) avoided vkt (% per year per vtype)
    baseVkt: types.TransportPerformance // Vkt at the end of each climate milestone
) : number {
    let originalVkt = BAUVkt[vtype][y]
    if (y>0) {
        // BAUVKT for this year minus what was removed from previous years
        originalVkt = (BAUVkt[vtype][y] - BAUVkt[vtype][y-1] + (baseVkt?.[vtype]?.[y-1] || 0))
    }
    const avoidPercent = parseFloat(inputAvoidedVkt.vtypes?.[vtype].avoidedVkt?.[y-1] || '0') // y -1 because inputAvoidedVkt does NOT include a reference year
    if (!baseVkt[vtype]) {
        baseVkt[vtype] = []
    }
    return originalVkt - (originalVkt * avoidPercent / 100)
}

export function distributeReductionInReducedPkm(
    reducedPkm: {[key: string]: number}, // total pkm(tkm) to be reduced for each vtype, this is altered by this function
    inputOriginModeMatrix: types.OriginModeMatrix, // 2.3) origin mode of transportation (% per year per vtype per vtype)
    vehicleStats: types.VehicleStats, // 2.2) BAU occupancy table (pass per vtype) +  2.3) avg BAU trip length (km per vtye)
    vtype: string, // origin of pkm(tkm)
    pkmAddedThisYear: number, // Number of pkm(tkm) coming from origin vtype, to be dispatched according to inputOriginModeMatrix
    y: number // Year index in referenceYears, 0 is reference year, >0 are climate milestones
) {
    const reductionDistributionForCurrentVtype : {[originvtype: string]: number} = {}
    const originVehicleTypeArray = Object.keys(inputOriginModeMatrix?.[vtype] || [])
    let sumOfCoeffs = 0
    for (let j = 0; j < originVehicleTypeArray.length; j++) {
        const originVtype = originVehicleTypeArray[j];
        const matrixYearVal = parseFloat(inputOriginModeMatrix[vtype][originVtype].value[y-1]) / 100 // y-1 because ref year is not included

        sumOfCoeffs += vehicleStats[originVtype].triplength * matrixYearVal
    }
    
    for (let j = 0; j < originVehicleTypeArray.length; j++) {
        const originVtype = originVehicleTypeArray[j]
        const matrixYearVal = parseFloat(inputOriginModeMatrix[vtype][originVtype].value[y-1]) / 100 // y-1 because ref year is not included
        if (!reducedPkm[originVtype]) reducedPkm[originVtype] = 0
        const coeff = matrixYearVal * vehicleStats[originVtype].triplength
        const reducedPkmForOrigin = (pkmAddedThisYear) * coeff / sumOfCoeffs
        reducedPkm[originVtype] += reducedPkmForOrigin || 0
        reductionDistributionForCurrentVtype[originVtype] = reducedPkmForOrigin || 0
    }
    return reductionDistributionForCurrentVtype
}

export function computeVktAfterASI(
    referenceYears: number[],
    inputAvoidedVkt: types.InputClimateWithoutUpstreamStep1, // 1) avoided vkt (% per year per vtype)
    BAUVkt: types.VehicleKilometresTravelledComputed, // 1) Base vkt table (vkt per year per vtype)
    inputAdditionalVkt?: types.InputClimateWithoutUpstreamStep2, // 2.1) additional vkt (vkt per year per vtype)
    inputOccupancyRate?: types.InputClimateWithoutUpstreamStep3, // 2.2) occupancy rate (pass per year per vtype)
    vehicleStats?: types.VehicleStats, // 2.2) BAU occupancy table (pass per vtype) +  2.3) avg BAU trip length (km per vtye)
    inputOriginModeMatrix?: types.OriginModeMatrix, // 2.3) origin mode of transportation (% per year per vtype per vtype)
) {
    let reductionDistribution : {[goalvtype: string]: {[originvtype: string]: number}}[] = []
    let pkmsStartOfYear : {[goalvtype: string]: number}[] = []
    let pkmsAdded : {[goalvtype: string]: number}[] = []
    let pkmsEndOfYear : {[goalvtype: string]: number}[] = []
    let baseVkt : types.TransportPerformance = {}
    const vehicleTypeArray = Object.keys(BAUVkt)
    for (let y = 0; y < referenceYears.length; y++) {
        let reducedPkm : {[key: string]: number} = {}
        reductionDistribution.push({})
        pkmsAdded.push({})
        for (let i = 0; i < vehicleTypeArray.length; i++) {
            let vtype = vehicleTypeArray[i]
            
            // compute base vkt for this year after avoid
            const vktStartOfYear = computeVktBaseAfterAvoid(vtype, y, BAUVkt, inputAvoidedVkt, baseVkt)
            baseVkt[vtype].push(vktStartOfYear)
            if (!inputAdditionalVkt) {
                continue
            }
            // Add additional vkt, if any in input
            baseVkt[vtype][y] += parseFloat(inputAdditionalVkt.vtypes?.[vtype].addedVkt?.[y-1]) || 0 // y = 0 is reference year, which is not included in inputAddtionalVkt, a shift by one is needed
            if (!inputOccupancyRate || !vehicleStats || !inputOriginModeMatrix) {
                continue
            }
            // From here on, the vkt cannot increase, only reduce. The table above is the maximum theorical vkt for each vtype
            // The goal now is to remove part of what was added depending on sources
            // Let's move to pkm(tkm)
            const occupancy = parseFloat(inputOccupancyRate?.vtypes[vtype].load[y-1]) || vehicleStats[vtype].occupancy // y=0 is referenced year, not included in inputOccupancyRate either
            let pkm = baseVkt[vtype][y] * occupancy // pkm(tkm) is always vkt * occupancy(load)

            // We can now figure out how much pkm was added during the year
            const pkmStartOfYear = vktStartOfYear * (parseFloat(inputOccupancyRate?.vtypes[vtype].load[y-2]) || vehicleStats[vtype].occupancy)
            const pkmAddedThisYear = pkm - pkmStartOfYear
            pkmsAdded[y][vtype] = pkmAddedThisYear
            if (!pkmsStartOfYear[y]) pkmsStartOfYear[y] ={}
            pkmsStartOfYear[y][vtype] = pkmStartOfYear
            // console.log("pkm Added in", referenceYears[y] , "for", vtype, "is", pkmAddedThisYear)

            // This value is the one that should be divided in trips and imputed from the other vtypes
            const reductionDistributionForCurrentVtype = distributeReductionInReducedPkm(reducedPkm, inputOriginModeMatrix, vehicleStats, vtype, pkmAddedThisYear, y)
            reductionDistribution[y][vtype] = reductionDistributionForCurrentVtype
            // console.log("leading to the following reductions:", reducedPkm) // should match Q144 table
        }
        if (!inputOccupancyRate || !vehicleStats || !inputOriginModeMatrix) {
            continue
        }
        // Once all reduction are computed, we can move that back to vkt, and remove them from this year base
        const sourceVehicleTypeArray = Object.keys(reducedPkm)
        for (let j = 0; j < sourceVehicleTypeArray.length; j++) {
            const sourceVtype = sourceVehicleTypeArray[j]
            const occupancy = parseFloat(inputOccupancyRate?.vtypes[sourceVtype].load?.[y-1]) || vehicleStats[sourceVtype].occupancy
            baseVkt[sourceVtype][y] -= reducedPkm[sourceVtype] / occupancy // vkt is always pkm(tkm) / occupancy(load)
            if (!pkmsEndOfYear[y]) pkmsEndOfYear[y] ={}
            pkmsEndOfYear[y][sourceVtype] = baseVkt[sourceVtype][y] * occupancy
        }
    }
    return {
        baseVkt: baseVkt,
        reductionDistribution: reductionDistribution,
        pkmsAdded: pkmsAdded,
        pkmsStartOfYear: pkmsStartOfYear,
        pkmsEndOfYear: pkmsEndOfYear
    }
}