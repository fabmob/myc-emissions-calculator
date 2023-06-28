import * as types from './types'

export function computeSocioEconomicData(
    inputSocioEconomicData : types.SocioEconomicData,
    referenceYears: number[]
) : types.SocioEconomicDataComputed {
    let outputSocioEconomicDataComputed: types.SocioEconomicDataComputed = {
        population: [inputSocioEconomicData.population, 0, 0, 0, 0, 0],
        gdp: [inputSocioEconomicData.gdp, 0, 0, 0, 0, 0]
    }
    for (let i = 1; i < 6; i++) {
        let numberOfYears = referenceYears[i] - referenceYears[i - 1]
        let lastValue = outputSocioEconomicDataComputed.population[i-1]
        let percentIncrease = inputSocioEconomicData.populationRate[i-1]
        outputSocioEconomicDataComputed.population[i] = lastValue * Math.pow((1 + percentIncrease / 100), numberOfYears)

        lastValue = outputSocioEconomicDataComputed.gdp[i-1]
        percentIncrease = inputSocioEconomicData.gdpRate[i-1]
        outputSocioEconomicDataComputed.gdp[i] = lastValue * Math.pow((1 + percentIncrease / 100), numberOfYears)
    }
    return outputSocioEconomicDataComputed
}


export function computeVehicleKilometresTravelled(
    inputVehicleKilometresTravelled : types.VehicleKilometresTravelled,
    referenceYears: number[]
) : types.VehicleKilometresTravelledComputed {
    let outputVehicleKilometresTravelledComputed = <types.VehicleKilometresTravelledComputed>{}
    let vehicleTypeArray = Object.keys(inputVehicleKilometresTravelled)
    // Initialize output with default values
    for (let i = 0; i < vehicleTypeArray.length; i++) {
        let vtype = vehicleTypeArray[i]
        outputVehicleKilometresTravelledComputed[vtype] = [inputVehicleKilometresTravelled[vtype]?.vkt || 0, 0, 0, 0, 0]
    }
    // Compute increases according to rate
    for (let k = 0; k < vehicleTypeArray.length; k++) {
        let vtype = vehicleTypeArray[k]
        for (let i = 1; i < referenceYears.length; i++) {
            let numberOfYears = referenceYears[i] - referenceYears[i - 1]
            let lastValue = outputVehicleKilometresTravelledComputed[vtype][i-1]
            let percentIncrease = inputVehicleKilometresTravelled[vtype]?.vktRate[i-1] || 0
            outputVehicleKilometresTravelledComputed[vtype][i] = lastValue * Math.pow((1 + percentIncrease / 100), numberOfYears)
        }
    }
    return outputVehicleKilometresTravelledComputed
}

export function computeVktPerFuel (
    inputVktPerFuel: types.VktPerFuel,
    vehicleKilometresTravelledComputed: types.VehicleKilometresTravelledComputed
) : types.VktPerFuelComputed {
    let outputVktPerFuelComputed : types.VktPerFuelComputed = {}
    let vehicleTypes = Object.keys(inputVktPerFuel)
    for (let i = 0; i < vehicleTypes.length; i++) {
        let vtype = vehicleTypes[i]
        let outputVktCurrentVehicle = outputVktPerFuelComputed[vtype]
        outputVktCurrentVehicle = {}
        let inputVktParVehicle = inputVktPerFuel[vtype]
        if (inputVktParVehicle && vehicleKilometresTravelledComputed[vtype]) {
            let fuelTypes = Object.keys(inputVktParVehicle) as types.FuelType[]
            for (let j = 0; j < fuelTypes.length; j++) {
                let yearlyVkt = inputVktParVehicle[fuelTypes[j]] as types.YearlyValues<types.MillKm>
                outputVktCurrentVehicle[fuelTypes[j]] = []
                for (let y = 0; y < yearlyVkt.length; y++) {
                    outputVktCurrentVehicle[fuelTypes[j]]?.push(vehicleKilometresTravelledComputed[vtype][y]/100 * yearlyVkt[y])
                }
            }
        }
        outputVktPerFuelComputed[vtype] = outputVktCurrentVehicle
    }
    return outputVktPerFuelComputed
}

export function computeTransportPerformance (
    vehicleKilometresTravelledComputed: types.VehicleKilometresTravelledComputed,
    vehicleStats: types.VehicleStats
) : types.TransportPerformance {
    let outputTransportPerformance : types.TransportPerformance = {}
    let vehicleTypes = Object.keys(vehicleKilometresTravelledComputed)
    for (let i = 0; i < vehicleTypes.length; i++) {
        let vtype = vehicleTypes[i]
        let vTauxOccupation = vehicleStats?.[vtype]?.occupancy || 1 as types.UsersPerVehicle
        let yearlyVkt = vehicleKilometresTravelledComputed[vtype]
        outputTransportPerformance[vtype] = []
        for (let y = 0; y < yearlyVkt.length; y++) {
            outputTransportPerformance[vtype].push(vTauxOccupation * yearlyVkt[y])
        }
    }
    return outputTransportPerformance
}

export function computeModalShare (
    transportPerformance: types.TransportPerformance
) : types.ModalShare {
    let outputModalShare : types.ModalShare = {}
    let vehicleTypes = Object.keys(transportPerformance)
    let totalsPerDate: number[] = []
    for (let i = 0; i < vehicleTypes.length; i++) {
        let vtype = vehicleTypes[i]
        for (let y = 0; y < transportPerformance[vtype].length; y++) {
            if (!totalsPerDate[y]) {
                totalsPerDate[y] = 0
            }
            totalsPerDate[y] += transportPerformance[vtype][y]
        }
    }
    for (let i = 0; i < vehicleTypes.length; i++) {
        let vtype = vehicleTypes[i]
        outputModalShare[vtype] = [] as number[]
        for (let d = 0; d < totalsPerDate.length; d++) {
            let a = transportPerformance[vtype]
            if (a) {
                let b = a[d]
                let c = totalsPerDate[d] || 1
                outputModalShare[vtype][d] = b / c
            }
        }
    }
    return outputModalShare
}

export function computeAverageEnergyConsumption(
    inputAverageEnergyConsumption: types.AverageEnergyConsumption,
    referenceYears: number[]
) : types.AverageEnergyConsumptionComputed {
    let outputAverageEnergyConsumptionComputed: types.AverageEnergyConsumptionComputed = {}
    let vehicleTypes = Object.keys(inputAverageEnergyConsumption)
    for (let i = 0; i < vehicleTypes.length; i++) {
        let vtype = vehicleTypes[i]
        let inputAnnualChangePerVehicle = inputAverageEnergyConsumption[vtype] || {}
        let outputConsomationCurrentVehicle = outputAverageEnergyConsumptionComputed[vtype]
        outputConsomationCurrentVehicle = {}
        if (inputAnnualChangePerVehicle) {
            let fuelTypes = Object.keys(inputAnnualChangePerVehicle) as types.FuelType[]
            for (let k = 0; k < fuelTypes.length; k++) {
                let inputAnnualChangePerCarburant = inputAnnualChangePerVehicle[fuelTypes[k]] || referenceYears.map(_=>0)
                let outputConsomationCurrentCarburant = referenceYears.map(_=>0)
                outputConsomationCurrentCarburant[0] = inputAnnualChangePerCarburant[0] || 0
                for (let i = 1; i < referenceYears.length; i++) {
                    let numberOfYears = referenceYears[i] - referenceYears[i - 1]
                    let lastValue = outputConsomationCurrentCarburant[i-1]
                    let percentIncrease = inputAnnualChangePerCarburant[i] || 0
                    outputConsomationCurrentCarburant[i] = lastValue * Math.pow((1 + percentIncrease / 100), numberOfYears)
                }

                outputConsomationCurrentVehicle[fuelTypes[k]] = outputConsomationCurrentCarburant
            }
        }
        outputAverageEnergyConsumptionComputed[vtype] = outputConsomationCurrentVehicle
    }
    return outputAverageEnergyConsumptionComputed
}

export function computeTotalEnergyAndEmissions(
    averageEnergyConsumptionComputed: types.AverageEnergyConsumptionComputed,
    energyAndEmissionsDefaultValues: types.EnergyAndEmissionsDefaultValues,
    energyProductionEmissions: types.InputBAUStep4 | null,
    vktPerFuelComputed: types.VktPerFuelComputed,
    vehicleStats: types.VehicleStats,
    referenceYears: number[]
) : types.TotalEnergyAndEmissions {
    let outputTotalEnergyAndEmissions = <types.TotalEnergyAndEmissions>{}
    let vehicleTypeArray = Object.keys(averageEnergyConsumptionComputed)
    for (let i = 0; i < vehicleTypeArray.length; i++) {
        let vtype = vehicleTypeArray[i]
        outputTotalEnergyAndEmissions[vtype] = {}
        let fuelTypes = Object.keys(averageEnergyConsumptionComputed[vtype]) as types.FuelType[]
        for (let j = 0; j < fuelTypes.length; j++) {
            outputTotalEnergyAndEmissions[vtype][fuelTypes[j]] = {
                energy: referenceYears.map(_=>0),
                co2: referenceYears.map(_=>0)
            }
            for (let k = 0; k < referenceYears.length; k++) {
                let tmp = outputTotalEnergyAndEmissions[vtype][fuelTypes[j]]
                let pci = parseFloat(energyAndEmissionsDefaultValues?.[fuelTypes[j]]?.pci) || 0
                let co2default = parseFloat(energyAndEmissionsDefaultValues?.[fuelTypes[j]]?.ges) || 0
                if (fuelTypes[j] === 'Electric' && vehicleStats[vtype] && energyProductionEmissions) {
                    co2default = parseFloat(energyProductionEmissions.electricity[vehicleStats[vtype].network].value[k] || energyProductionEmissions.electricity[vehicleStats[vtype].network].value[0]) / pci * 1000
                }
                if (fuelTypes[j] === 'Hydrogen' && vehicleStats[vtype] && energyProductionEmissions) {
                    co2default = parseFloat(energyProductionEmissions.hydrogen[vehicleStats[vtype].network].value[k] || energyProductionEmissions.hydrogen[vehicleStats[vtype].network].value[0]) / pci * 1000
                }
                let vkt = vktPerFuelComputed?.[vtype]?.[fuelTypes[j]]?.[k] || 0
                let avg = averageEnergyConsumptionComputed?.[vtype]?.[fuelTypes[j]]?.[k] || 0
                if (tmp) {
                    tmp.energy[k] = pci * vkt * avg / 100
                    tmp.co2[k] = tmp.energy[k] * co2default / 1000000
                }
                outputTotalEnergyAndEmissions[vtype][fuelTypes[j]] = tmp
            }
        }
    }
    return outputTotalEnergyAndEmissions
}

export function sumTotalEnergyAndEmissions(
    totalEnergyAndEmissions: types.TotalEnergyAndEmissions,
    referenceYears: number[]
) : types.SumTotalEnergyAndEmissions {
    let outputSumTotalEnergyAndEmissions = <types.SumTotalEnergyAndEmissions>{}
    let vehicleTypeArray = Object.keys(totalEnergyAndEmissions)
    for (let i = 0; i < vehicleTypeArray.length; i++) {
        let vtype = vehicleTypeArray[i]
        outputSumTotalEnergyAndEmissions[vtype] = {
            energy: referenceYears.map(_=>0),
            co2: referenceYears.map(_=>0)
        }
        let fuelTypes = Object.keys(totalEnergyAndEmissions[vtype]) as types.FuelType[]
        for (let j = 0; j < fuelTypes.length; j++) {
            for (let k = 0; k < referenceYears.length; k++) {
                outputSumTotalEnergyAndEmissions[vtype].energy[k] += totalEnergyAndEmissions?.[vtype]?.[fuelTypes[j]]?.energy?.[k] || 0
                outputSumTotalEnergyAndEmissions[vtype].co2[k] += totalEnergyAndEmissions?.[vtype]?.[fuelTypes[j]]?.co2?.[k] || 0
            }
        }
    }
    return outputSumTotalEnergyAndEmissions
}

// Obsolete ?
export function computeEnergyBalance(totalEnergyAndEmissions: types.TotalEnergyAndEmissions, vtypesInfo: types.InputStep2) : types.EnergyBalance {
    let outputEnergyBalance = {passengers: {}, freight: {}} as types.EnergyBalance
    let vehicleTypeArray = Object.keys(totalEnergyAndEmissions)
    let ftypes = Object.values(types.FuelType)
    for (let j = 0; j < ftypes.length; j++) {
        const ftype = ftypes[j];
        let ftypeEnergyBalancePassengers = 0
        let ftypeEnergyBalanceFreight = 0
        for (let i = 0; i < vehicleTypeArray.length; i++) {
            const vtype = vehicleTypeArray[i]
            if (vtypesInfo[vtype].isFreight) {
                ftypeEnergyBalanceFreight += totalEnergyAndEmissions?.[vtype]?.[ftype]?.energy[0] || 0
            } else {
                ftypeEnergyBalancePassengers += totalEnergyAndEmissions?.[vtype]?.[ftype]?.energy[0] || 0
            }
        }
        outputEnergyBalance.passengers[ftype] = ftypeEnergyBalancePassengers * 1000 / 41868 * 1000
        outputEnergyBalance.freight[ftype] = ftypeEnergyBalanceFreight * 1000 / 41868 * 1000
    }
    return outputEnergyBalance
}

export function computeScenarioWithUpstreamGHGEmissions(
    // transportPerformance: types.TransportPerformance, // pkm per year per 
    referenceYears: number[],
    vkt: types.VehicleKilometresTravelledComputed, // vkt per year per vtype
    inputVktPerFuel : types.VktPerFuel, // %vkt share per year per ftype per vtype (3 - improve) (aka. fuel breakdown)
    inputAverageEnergyConsumption : types.AverageEnergyConsumption, // l/100km per year per ftype per vtype (4 - improve) (aka. fuel consumption)
    energyAndEmissionsDefaultValues: types.EnergyAndEmissionsDefaultValues,
    electricityProductionEmissions: types.InputBAUStep4 | null,
    vehicleStats: types.VehicleStats
): types.SumTotalEnergyAndEmissions {
    // const averageEnergyConsumptionComputed = computeAverageEnergyConsumption(inputAverageEnergyConsumption, referenceYears)
    const vktPerFuelComputed = computeVktPerFuel(inputVktPerFuel, vkt)
    const totalEnergyAndEmissions = computeTotalEnergyAndEmissions(inputAverageEnergyConsumption, energyAndEmissionsDefaultValues, electricityProductionEmissions, vktPerFuelComputed, vehicleStats, referenceYears)
    return sumTotalEnergyAndEmissions(totalEnergyAndEmissions, referenceYears)
}

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
    const avoidPercent = inputAvoidedVkt.vtypes?.[vtype]?.avoidedVkt?.[y-1] || 0 // y-1 because inputAvoidedVkt does NOT include a reference year
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
    const originVehicleTypeArray = Object.keys(inputOriginModeMatrix?.[vtype] || [])
    let sumOfCoeffs : number[] = []
    for (let j = 0; j < originVehicleTypeArray.length; j++) {
        const originVtype = originVehicleTypeArray[j];
        const matrixYearVal = parseFloat(inputOriginModeMatrix[vtype][originVtype].value[y-1]) / 100 // y-1 because ref year is not included
        if (!sumOfCoeffs[y]) {
            sumOfCoeffs[y] = 0
        }
        sumOfCoeffs[y] += vehicleStats[originVtype].triplength * matrixYearVal
    }
    
    for (let j = 0; j < originVehicleTypeArray.length; j++) {
        const originVtype = originVehicleTypeArray[j]
        const matrixYearVal = parseFloat(inputOriginModeMatrix[vtype][originVtype].value[y-1]) / 100 // y-1 because ref year is not included
        if (!reducedPkm[originVtype]) reducedPkm[originVtype] = 0
        const coeff = matrixYearVal * vehicleStats[originVtype].triplength
        const reducedPkmForOrigin = (pkmAddedThisYear) * coeff / sumOfCoeffs[y]
        reducedPkm[originVtype] += reducedPkmForOrigin || 0
    }
}

export function computeVktAfterASI(
    referenceYears: number[],
    inputAvoidedVkt: types.InputClimateWithoutUpstreamStep1, // 1) avoided vkt (% per year per vtype)
    BAUVkt: types.VehicleKilometresTravelledComputed, // 1) Base vkt table (vkt per year per vtype)
    inputAdditionalVkt: types.InputClimateWithoutUpstreamStep2, // 2.1) additional vkt (vkt per year per vtype)
    inputOccupancyRate: types.InputClimateWithoutUpstreamStep3, // 2.2) occupancy rate (pass per year per vtype)
    vehicleStats: types.VehicleStats, // 2.2) BAU occupancy table (pass per vtype) +  2.3) avg BAU trip length (km per vtye)
    inputOriginModeMatrix: types.OriginModeMatrix, // 2.3) origin mode of transportation (% per year per vtype per vtype)
) : types.TransportPerformance { // TODO: this should return vkts, not ukms (type error)
    let baseVkt : types.TransportPerformance = {}
    const vehicleTypeArray = Object.keys(BAUVkt)
    for (let y = 0; y < referenceYears.length; y++) {
        let reducedPkm : {[key: string]: number} = {}
        for (let i = 0; i < vehicleTypeArray.length; i++) {
            let vtype = vehicleTypeArray[i]
            
            // compute base vkt for this year after avoid
            const vktStartOfYear = computeVktBaseAfterAvoid(vtype, y, BAUVkt, inputAvoidedVkt, baseVkt)
            baseVkt[vtype].push(vktStartOfYear)
            // console.log("vtype", vtype, "y", y, "baseVkt[vtype][y]", baseVkt[vtype][y])
            // Add additional vkt, if any in input
            baseVkt[vtype][y] += parseFloat(inputAdditionalVkt.vtypes?.[vtype]?.addedVkt?.[y-1]) || 0 // y = 0 is reference year, which is not included in inputAddtionalVkt, a shift by one is needed
            // console.log("vtype", vtype, "y", y, "baseVkt[vtype][y]", baseVkt[vtype][y])
            // From here on, the vkt cannot increase, only reduce. The table above is the maximum theorical vkt for each vtype
            // The goal now is to remove part of what was added depending on sources
            // Let's move to pkm(tkm)
            const occupancy = parseFloat(inputOccupancyRate?.vtypes[vtype]?.load?.[y-1]) || vehicleStats[vtype].occupancy // y=0 is referenced year, not included in inputOccupancyRate either
            let pkm = baseVkt[vtype][y] * occupancy // pkm(tkm) is always vkt * occupancy(load)

            // We can now figure out how much pkm was added during the year
            const pkmStartOfYear = vktStartOfYear * (parseFloat(inputOccupancyRate?.vtypes[vtype]?.load?.[y-2]) || vehicleStats[vtype].occupancy)
            const pkmAddedThisYear = pkm - pkmStartOfYear

            // console.log("pkm Added in", referenceYears[y] , "for", vtype, "is", pkmAddedThisYear)

            // This value is the one that should be divided in trips and imputed from the other vtypes
            distributeReductionInReducedPkm(reducedPkm, inputOriginModeMatrix, vehicleStats, vtype, pkmAddedThisYear, y)

            // console.log("leading to the following reductions:", reducedPkm) // should match Q144 table
        }
        // Once all reduction are computed, we can move that back to vkt, and remove them from this year base
        const sourceVehicleTypeArray = Object.keys(reducedPkm)
        for (let j = 0; j < sourceVehicleTypeArray.length; j++) {
            const sourceVtype = sourceVehicleTypeArray[j]
            const occupancy = parseFloat(inputOccupancyRate?.vtypes[sourceVtype]?.load?.[y-1]) || vehicleStats[sourceVtype].occupancy
            baseVkt[sourceVtype][y] -= reducedPkm[sourceVtype] / occupancy // vkt is always pkm(tkm) / occupancy(load)
        }
    }
    return baseVkt
}

export function computeScenarioWithoutUpstreamGHGEmissions(
    referenceYears: number[],
    inputAvoidedVkt: types.InputClimateWithoutUpstreamStep1, // 1) avoided vkt (% per year per vtype)
    BAUVkt: types.VehicleKilometresTravelledComputed, // 1) Base vkt table (vkt per year per vtype)
    inputAdditionalVkt: types.InputClimateWithoutUpstreamStep2, // 2.1) additional vkt (vkt per year per vtype)
    inputOccupancyRate: types.InputClimateWithoutUpstreamStep3, // 2.2) occupancy rate (pass per year per vtype)
    vehicleStats: types.VehicleStats, // 2.2) BAU occupancy table (pass per vtype) +  2.3) avg BAU trip length (km per vtye)
    inputOriginModeMatrix: types.OriginModeMatrix, // 2.3) origin mode of transportation (% per year per vtype per vtype)
    inputVktPerFuel : types.VktPerFuel, // %vkt share per year per ftype per vtype (3 - improve) (aka. fuel breakdown)
    inputAverageEnergyConsumption : types.AverageEnergyConsumption, // l/100km per year per ftype per vtype (4 - improve) (aka. fuel consumption)
    energyAndEmissionsDefaultValues: types.EnergyAndEmissionsDefaultValues,
    electricityProductionEmissions: types.InputBAUStep4 | null
): types.SumTotalEnergyAndEmissions {
    const baseVkt = computeVktAfterASI(referenceYears, inputAvoidedVkt, BAUVkt, inputAdditionalVkt, inputOccupancyRate, vehicleStats, inputOriginModeMatrix)
    return computeScenarioWithUpstreamGHGEmissions(referenceYears, baseVkt, inputVktPerFuel, inputAverageEnergyConsumption, energyAndEmissionsDefaultValues, electricityProductionEmissions, vehicleStats)
}


export function computeScenarioTransportPerformances(
    referenceYears: number[],
    baseVkt: types.TransportPerformance, // vkt after ASI
    inputOccupancyRate: types.InputClimateWithoutUpstreamStep3, // 2.2) occupancy rate (pass per year per vtype)
    vehicleStats: types.VehicleStats, // 2.2) BAU occupancy table (pass per vtype)
) : {"passengers": types.TransportPerformance, "freight": types.TransportPerformance} {
    // Convert vkt into pkm, and split into passengers and freight
    let passengersTransportPerformance : types.TransportPerformance = {}
    let freightTransportPerformance : types.TransportPerformance = {}
    const vehicleTypeArray = Object.keys(vehicleStats)
    for (let y = 0; y < referenceYears.length; y++) {
        for (let i = 0; i < vehicleTypeArray.length; i++) {
            const vtype = vehicleTypeArray[i]
            const occupancy = parseFloat(inputOccupancyRate?.vtypes?.[vtype]?.load?.[y-1]) || vehicleStats[vtype].occupancy
            const vkt = baseVkt?.[vtype]?.[y] || 0
            if (vehicleStats[vtype].type === "freight") {
                if (!freightTransportPerformance[vtype]) freightTransportPerformance[vtype] = []
                freightTransportPerformance[vtype][y] = occupancy * vkt
            } else {
                if (!passengersTransportPerformance[vtype]) passengersTransportPerformance[vtype] = []
                passengersTransportPerformance[vtype][y] = occupancy * vkt
            }
        }
    }
    // console.log("passengersTransportPerformance", passengersTransportPerformance)
    return {
        "passengers": passengersTransportPerformance,
        "freight": freightTransportPerformance
    }
}
export function computeScenarioModalShare(
    scenarioTransportPerformances: {"passengers": types.TransportPerformance, "freight": types.TransportPerformance}
) : {"passengers": types.ModalShare, "freight": types.ModalShare} {
    return {
        "passengers": computeModalShare(scenarioTransportPerformances.passengers),
        "freight": computeModalShare(scenarioTransportPerformances.freight)
    }
}