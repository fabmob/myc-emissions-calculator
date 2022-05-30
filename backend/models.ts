import * as types from './types'
const dates : types.date[] = [2020, 2025, 2030, 2040, 2050]

export function computeSocioEconomicData(
    inputSocioEconomicData : types.SocioEconomicData
) : types.SocioEconomicDataComputed {
    let outputSocioEconomicDataComputed: types.SocioEconomicDataComputed = {
        population: [inputSocioEconomicData.population, 0, 0, 0, 0],
        gdp: [inputSocioEconomicData.gdp, 0, 0, 0, 0]
    }
    for (let i = 1; i < dates.length; i++) {
        let numberOfYears = dates[i] - dates[i - 1]
        let lastValue = outputSocioEconomicDataComputed.population[i-1]
        let percentIncrease = inputSocioEconomicData.populationRate[i-1]
        outputSocioEconomicDataComputed.population[i] = lastValue * Math.pow((1 + percentIncrease / 100), numberOfYears)

        lastValue = outputSocioEconomicDataComputed.gdp[i-1]
        percentIncrease = inputSocioEconomicData.gdpRate[i-1]
        outputSocioEconomicDataComputed.gdp[i] = lastValue * Math.pow((1 + percentIncrease / 100), numberOfYears)
    }
    return outputSocioEconomicDataComputed
}


export function computeVehiculeKilometresTravelled(
    inputVehiculeKilometresTravelled : types.VehiculeKilometresTravelled
) : types.VehiculeKilometresTravelledComputed {
    let outputVehiculeKilometresTravelledComputed = <types.VehiculeKilometresTravelledComputed>{}
    // Initialize output with default values
    for (let i = 0; i < types.VehiculeTypeArray.length; i++) {
        let vtype = types.VehiculeTypeArray[i] as types.VehiculeType
        outputVehiculeKilometresTravelledComputed[vtype] = [inputVehiculeKilometresTravelled[vtype]?.vkt || 0, 0, 0, 0, 0]
    }
    const keys = Object.keys(inputVehiculeKilometresTravelled) as types.VehiculeType[]
    // Compute increases according to rate
    for (let k = 0; k < keys.length; k++) {
        for (let i = 1; i < dates.length; i++) {
            let numberOfYears = dates[i] - dates[i - 1]
            let lastValue = outputVehiculeKilometresTravelledComputed[keys[k]][i-1]
            let percentIncrease = inputVehiculeKilometresTravelled[keys[k]]?.vktRate[i-1] || 0
            outputVehiculeKilometresTravelledComputed[keys[k]][i] = lastValue * Math.pow((1 + percentIncrease / 100), numberOfYears)
        }
    }
    return outputVehiculeKilometresTravelledComputed
}

export function computeVktPerFuel (
    inputVktPerFuel: types.VktPerFuel,
    vehiculeKilometresTravelledComputed: types.VehiculeKilometresTravelledComputed
) : types.VktPerFuelComputed {
    let outputVktPerFuelComputed : types.VktPerFuelComputed = {}
    let vehiculeTypes = Object.keys(inputVktPerFuel) as types.VehiculeType[]
    for (let i = 0; i < vehiculeTypes.length; i++) {
        let vtype = vehiculeTypes[i]
        let outputVktCurrentVehicule = outputVktPerFuelComputed[vtype]
        outputVktCurrentVehicule = {}
        let inputVktParVehicule = inputVktPerFuel[vtype]
        if (inputVktParVehicule) {
            let fuelTypes = Object.keys(inputVktParVehicule) as types.FuelType[]
            for (let j = 0; j < fuelTypes.length; j++) {
                let yearlyVkt = inputVktParVehicule[fuelTypes[j]] as types.YearlyValues<types.MillKm>
                outputVktCurrentVehicule[fuelTypes[j]] = [
                    vehiculeKilometresTravelledComputed[vtype][0]/100 * yearlyVkt[0],
                    vehiculeKilometresTravelledComputed[vtype][1]/100 * yearlyVkt[1],
                    vehiculeKilometresTravelledComputed[vtype][2]/100 * yearlyVkt[2],
                    vehiculeKilometresTravelledComputed[vtype][3]/100 * yearlyVkt[3],
                    vehiculeKilometresTravelledComputed[vtype][4]/100 * yearlyVkt[4]
                ]
            }
        }
        outputVktPerFuelComputed[vtype] = outputVktCurrentVehicule
    }
    return outputVktPerFuelComputed
}

export function computeTransportPerformance (
    vktPerFuelComputed: types.VktPerFuelComputed,
    vehicleStats: types.VehicleStats
) : types.TransportPerformance {
    let outputTransportPerformance : types.TransportPerformance = {}
    let vehiculeTypes = Object.keys(vktPerFuelComputed) as types.VehiculeType[]
    for (let i = 0; i < vehiculeTypes.length; i++) {
        let vtype = vehiculeTypes[i]
        let vTauxOccupation = vehicleStats?.[vtype]?.occupancy || 1 as types.UsersPerVehicle
        let outputTransportPerformanceCurrentVehicule = outputTransportPerformance[vtype]
        outputTransportPerformanceCurrentVehicule = {}
        let vktPerFuelComputedPerVehicule = vktPerFuelComputed[vtype]
        if (vktPerFuelComputedPerVehicule) {
            let fuelTypes = Object.keys(vktPerFuelComputedPerVehicule) as types.FuelType[]
            for (let j = 0; j < fuelTypes.length; j++) {
                let yearlyVkt = vktPerFuelComputedPerVehicule[fuelTypes[j]] as types.YearlyValues<types.MillKm>
                outputTransportPerformanceCurrentVehicule[fuelTypes[j]] = [
                    vTauxOccupation * yearlyVkt[0],
                    vTauxOccupation * yearlyVkt[1],
                    vTauxOccupation * yearlyVkt[2],
                    vTauxOccupation * yearlyVkt[3],
                    vTauxOccupation * yearlyVkt[4]
                ]
            }
        }
        outputTransportPerformance[vtype] = outputTransportPerformanceCurrentVehicule
    }
    return outputTransportPerformance
}

export function computeModalShare (
    prestationsTransport: types.TransportPerformance
) : types.ModalShare {
    let outputModalShare : types.ModalShare = {}
    let vehiculeTypes = Object.keys(prestationsTransport) as types.VehiculeType[]
    let toots = [0, 0, 0, 0, 0]
    let sumsPerVehiculeType: types.SumsPerVehiculeType = {}
    for (let i = 0; i < vehiculeTypes.length; i++) {
        let vtype = vehiculeTypes[i]
        if (!sumsPerVehiculeType[vtype]) {
            sumsPerVehiculeType[vtype] = [0, 0, 0, 0, 0]
        }
        let prestationsTransportPerVehicule = prestationsTransport[vtype]
        if (prestationsTransportPerVehicule) {
            let fuelTypes = Object.keys(prestationsTransportPerVehicule) as types.FuelType[]
            for (let j = 0; j < fuelTypes.length; j++) {
                let prestationsTransportPerVehiculePerCarburant = prestationsTransportPerVehicule[fuelTypes[j]]
                if (prestationsTransportPerVehiculePerCarburant) {
                    toots[0] += prestationsTransportPerVehiculePerCarburant[0]
                    toots[1] += prestationsTransportPerVehiculePerCarburant[1]
                    toots[2] += prestationsTransportPerVehiculePerCarburant[2]
                    toots[3] += prestationsTransportPerVehiculePerCarburant[3]
                    toots[4] += prestationsTransportPerVehiculePerCarburant[4]
                    let tmp = sumsPerVehiculeType[vtype]
                    if (tmp) {
                        tmp[0] += prestationsTransportPerVehiculePerCarburant[0]
                        tmp[1] += prestationsTransportPerVehiculePerCarburant[1]
                        tmp[2] += prestationsTransportPerVehiculePerCarburant[2]
                        tmp[3] += prestationsTransportPerVehiculePerCarburant[3]
                        tmp[4] += prestationsTransportPerVehiculePerCarburant[4]
                    }
                    sumsPerVehiculeType[vtype] = tmp
                }
            }
        }
    }
    for (let i = 0; i < vehiculeTypes.length; i++) {
        let vtype = vehiculeTypes[i]
        let tmp = [0, 0, 0, 0, 0]
        for (let d = 0; d < dates.length; d++) {
            let a = sumsPerVehiculeType[vtype]
            if (a) {
                let b = a[d]
                let c = toots[d] || 1
                tmp[d] = b / c
            }
        }
        outputModalShare[vtype] = tmp
    }
    return outputModalShare
}

export function computeAverageEnergyConsumption(
    inputAverageEnergyConsumption: types.AverageEnergyConsumption
) : types.AverageEnergyConsumptionComputed {
    let outputAverageEnergyConsumptionComputed: types.AverageEnergyConsumptionComputed = {}
    let vehiculeTypes = Object.keys(inputAverageEnergyConsumption) as types.VehiculeType[]
    for (let i = 0; i < vehiculeTypes.length; i++) {
        let vtype = vehiculeTypes[i]
        let inputAnnualChangePerVehicle = inputAverageEnergyConsumption[vtype] || {}
        let outputConsomationCurrentVehicule = outputAverageEnergyConsumptionComputed[vtype]
        outputConsomationCurrentVehicule = {}
        if (inputAnnualChangePerVehicle) {
            let fuelTypes = Object.keys(inputAnnualChangePerVehicle) as types.FuelType[]
            for (let k = 0; k < fuelTypes.length; k++) {
                let inputAnnualChangePerCarburant = inputAnnualChangePerVehicle[fuelTypes[k]] || [0, 0, 0, 0, 0]
                let outputConsomationCurrentCarburant = outputConsomationCurrentVehicule[fuelTypes[k]]
                outputConsomationCurrentCarburant = [
                    inputAnnualChangePerCarburant[0] || 0,
                    0,
                    0,
                    0,
                    0
                ]

                for (let i = 1; i < dates.length; i++) {
                    let numberOfYears = dates[i] - dates[i - 1]
                    let lastValue = outputConsomationCurrentCarburant[i-1]
                    let percentIncrease = inputAnnualChangePerCarburant[i] || 0
                    outputConsomationCurrentCarburant[i] = lastValue * Math.pow((1 + percentIncrease / 100), numberOfYears)
                }

                outputConsomationCurrentVehicule[fuelTypes[k]] = outputConsomationCurrentCarburant
            }
        }
        outputAverageEnergyConsumptionComputed[vtype] = outputConsomationCurrentVehicule
    }
    return outputAverageEnergyConsumptionComputed
}

export function computeTotalEnergyAndEmissions(
    consomationMoyenneEnergieComputed: types.AverageEnergyConsumptionComputed,
    defaultsFacteursEnergetiqueEmission: types.EnergyAndEmissionsDefaultValues,
    vktPerFuelComputed: types.VktPerFuelComputed
) : types.TotalEnergyAndEmissions {
    let outputTotalEnergyAndEmissions = <types.TotalEnergyAndEmissions>{}
    console.log("vktPerFuelComputed", vktPerFuelComputed['Bus'])
    for (let i = 0; i < types.VehiculeTypeArray.length; i++) {
        let vtype = types.VehiculeTypeArray[i] as types.VehiculeType
        outputTotalEnergyAndEmissions[vtype] = {}
        let fuelTypes = Object.keys(defaultsFacteursEnergetiqueEmission[vtype]) as types.FuelType[]
        for (let j = 0; j < fuelTypes.length; j++) {
            outputTotalEnergyAndEmissions[vtype][fuelTypes[j]] = {
                energie: [0, 0, 0, 0, 0],
                co2: [0, 0, 0, 0, 0]
            }
            for (let k = 0; k < dates.length; k++) {
                let tmp = outputTotalEnergyAndEmissions[vtype][fuelTypes[j]]
                let pci = defaultsFacteursEnergetiqueEmission?.[vtype]?.[fuelTypes[j]]?.pci || 0
                let co2default = defaultsFacteursEnergetiqueEmission?.[vtype]?.[fuelTypes[j]]?.ges[k] || 0
                let vkt = vktPerFuelComputed?.[vtype]?.[fuelTypes[j]]?.[k] || 0
                let consomoy = consomationMoyenneEnergieComputed?.[vtype]?.[fuelTypes[j]]?.[k] || 0
                if (vtype === "Bus") {
                    console.log("fuelTypes[j]", "pci", "co2default", "vkt", "consomoy")
                    console.log(fuelTypes[j], pci, co2default, vkt, consomoy)
                }
                if (tmp) {
                    tmp.energie[k] = pci * vkt * consomoy / 100
                    tmp.co2[k] = tmp.energie[k] * co2default / 1000000
                }
                outputTotalEnergyAndEmissions[vtype][fuelTypes[j]] = tmp
            }
        }
    }
    console.log("outputTotalEnergyAndEmissions['Bus']", outputTotalEnergyAndEmissions["Bus"])
    return outputTotalEnergyAndEmissions
}

export function sumTotalEnergyAndEmissions(
    energieTotaleEmissionsGes: types.TotalEnergyAndEmissions
) : types.SumTotalEnergyAndEmissions {
    let outputSumTotalEnergyAndEmissions = <types.SumTotalEnergyAndEmissions>{}
    for (let i = 0; i < types.VehiculeTypeArray.length; i++) {
        let vtype = types.VehiculeTypeArray[i] as types.VehiculeType
        outputSumTotalEnergyAndEmissions[vtype] = {
            energie: [0, 0, 0, 0, 0],
            co2: [0, 0, 0, 0, 0]
        }
        let fuelTypes = Object.keys(energieTotaleEmissionsGes[vtype]) as types.FuelType[]
        for (let j = 0; j < fuelTypes.length; j++) {
            for (let k = 0; k < dates.length; k++) {
                outputSumTotalEnergyAndEmissions[vtype].energie[k] += energieTotaleEmissionsGes?.[vtype]?.[fuelTypes[j]]?.energie?.[k] || 0
                outputSumTotalEnergyAndEmissions[vtype].co2[k] += energieTotaleEmissionsGes?.[vtype]?.[fuelTypes[j]]?.co2?.[k] || 0
            }
        }
    }
    return outputSumTotalEnergyAndEmissions
}
