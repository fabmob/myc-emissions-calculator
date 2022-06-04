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


export function computeVehicleKilometresTravelled(
    inputVehicleKilometresTravelled : types.VehicleKilometresTravelled
) : types.VehicleKilometresTravelledComputed {
    let outputVehicleKilometresTravelledComputed = <types.VehicleKilometresTravelledComputed>{}
    // Initialize output with default values
    for (let i = 0; i < types.VehicleTypeArray.length; i++) {
        let vtype = types.VehicleTypeArray[i] as types.VehicleType
        outputVehicleKilometresTravelledComputed[vtype] = [inputVehicleKilometresTravelled[vtype]?.vkt || 0, 0, 0, 0, 0]
    }
    const keys = Object.keys(inputVehicleKilometresTravelled) as types.VehicleType[]
    // Compute increases according to rate
    for (let k = 0; k < keys.length; k++) {
        for (let i = 1; i < dates.length; i++) {
            let numberOfYears = dates[i] - dates[i - 1]
            let lastValue = outputVehicleKilometresTravelledComputed[keys[k]][i-1]
            let percentIncrease = inputVehicleKilometresTravelled[keys[k]]?.vktRate[i-1] || 0
            outputVehicleKilometresTravelledComputed[keys[k]][i] = lastValue * Math.pow((1 + percentIncrease / 100), numberOfYears)
        }
    }
    return outputVehicleKilometresTravelledComputed
}

export function computeVktPerFuel (
    inputVktPerFuel: types.VktPerFuel,
    vehicleKilometresTravelledComputed: types.VehicleKilometresTravelledComputed
) : types.VktPerFuelComputed {
    let outputVktPerFuelComputed : types.VktPerFuelComputed = {}
    let vehicleTypes = Object.keys(inputVktPerFuel) as types.VehicleType[]
    for (let i = 0; i < vehicleTypes.length; i++) {
        let vtype = vehicleTypes[i]
        let outputVktCurrentVehicle = outputVktPerFuelComputed[vtype]
        outputVktCurrentVehicle = {}
        let inputVktParVehicle = inputVktPerFuel[vtype]
        if (inputVktParVehicle) {
            let fuelTypes = Object.keys(inputVktParVehicle) as types.FuelType[]
            for (let j = 0; j < fuelTypes.length; j++) {
                let yearlyVkt = inputVktParVehicle[fuelTypes[j]] as types.YearlyValues<types.MillKm>
                outputVktCurrentVehicle[fuelTypes[j]] = [
                    vehicleKilometresTravelledComputed[vtype][0]/100 * yearlyVkt[0],
                    vehicleKilometresTravelledComputed[vtype][1]/100 * yearlyVkt[1],
                    vehicleKilometresTravelledComputed[vtype][2]/100 * yearlyVkt[2],
                    vehicleKilometresTravelledComputed[vtype][3]/100 * yearlyVkt[3],
                    vehicleKilometresTravelledComputed[vtype][4]/100 * yearlyVkt[4]
                ]
            }
        }
        outputVktPerFuelComputed[vtype] = outputVktCurrentVehicle
    }
    return outputVktPerFuelComputed
}

export function computeTransportPerformance (
    vktPerFuelComputed: types.VktPerFuelComputed,
    vehicleStats: types.VehicleStats
) : types.TransportPerformance {
    let outputTransportPerformance : types.TransportPerformance = {}
    let vehicleTypes = Object.keys(vktPerFuelComputed) as types.VehicleType[]
    for (let i = 0; i < vehicleTypes.length; i++) {
        let vtype = vehicleTypes[i]
        let vTauxOccupation = vehicleStats?.[vtype]?.occupancy || 1 as types.UsersPerVehicle
        let outputTransportPerformanceCurrentVehicle = outputTransportPerformance[vtype]
        outputTransportPerformanceCurrentVehicle = {}
        let vktPerFuelComputedPerVehicle = vktPerFuelComputed[vtype]
        if (vktPerFuelComputedPerVehicle) {
            let fuelTypes = Object.keys(vktPerFuelComputedPerVehicle) as types.FuelType[]
            for (let j = 0; j < fuelTypes.length; j++) {
                let yearlyVkt = vktPerFuelComputedPerVehicle[fuelTypes[j]] as types.YearlyValues<types.MillKm>
                outputTransportPerformanceCurrentVehicle[fuelTypes[j]] = [
                    vTauxOccupation * yearlyVkt[0],
                    vTauxOccupation * yearlyVkt[1],
                    vTauxOccupation * yearlyVkt[2],
                    vTauxOccupation * yearlyVkt[3],
                    vTauxOccupation * yearlyVkt[4]
                ]
            }
        }
        outputTransportPerformance[vtype] = outputTransportPerformanceCurrentVehicle
    }
    return outputTransportPerformance
}

export function computeModalShare (
    transportPerformance: types.TransportPerformance
) : types.ModalShare {
    let outputModalShare : types.ModalShare = {}
    let vehicleTypes = Object.keys(transportPerformance) as types.VehicleType[]
    let toots = [0, 0, 0, 0, 0]
    let sumsPerVehicleType: types.SumsPerVehicleType = {}
    for (let i = 0; i < vehicleTypes.length; i++) {
        let vtype = vehicleTypes[i]
        if (!sumsPerVehicleType[vtype]) {
            sumsPerVehicleType[vtype] = [0, 0, 0, 0, 0]
        }
        let transportPerformancePerVehicle = transportPerformance[vtype]
        if (transportPerformancePerVehicle) {
            let fuelTypes = Object.keys(transportPerformancePerVehicle) as types.FuelType[]
            for (let j = 0; j < fuelTypes.length; j++) {
                let transportPerformancePerVehiclePerFuel = transportPerformancePerVehicle[fuelTypes[j]]
                if (transportPerformancePerVehiclePerFuel) {
                    toots[0] += transportPerformancePerVehiclePerFuel[0]
                    toots[1] += transportPerformancePerVehiclePerFuel[1]
                    toots[2] += transportPerformancePerVehiclePerFuel[2]
                    toots[3] += transportPerformancePerVehiclePerFuel[3]
                    toots[4] += transportPerformancePerVehiclePerFuel[4]
                    let tmp = sumsPerVehicleType[vtype]
                    if (tmp) {
                        tmp[0] += transportPerformancePerVehiclePerFuel[0]
                        tmp[1] += transportPerformancePerVehiclePerFuel[1]
                        tmp[2] += transportPerformancePerVehiclePerFuel[2]
                        tmp[3] += transportPerformancePerVehiclePerFuel[3]
                        tmp[4] += transportPerformancePerVehiclePerFuel[4]
                    }
                    sumsPerVehicleType[vtype] = tmp
                }
            }
        }
    }
    for (let i = 0; i < vehicleTypes.length; i++) {
        let vtype = vehicleTypes[i]
        let tmp = [0, 0, 0, 0, 0]
        for (let d = 0; d < dates.length; d++) {
            let a = sumsPerVehicleType[vtype]
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
    let vehicleTypes = Object.keys(inputAverageEnergyConsumption) as types.VehicleType[]
    for (let i = 0; i < vehicleTypes.length; i++) {
        let vtype = vehicleTypes[i]
        let inputAnnualChangePerVehicle = inputAverageEnergyConsumption[vtype] || {}
        let outputConsomationCurrentVehicle = outputAverageEnergyConsumptionComputed[vtype]
        outputConsomationCurrentVehicle = {}
        if (inputAnnualChangePerVehicle) {
            let fuelTypes = Object.keys(inputAnnualChangePerVehicle) as types.FuelType[]
            for (let k = 0; k < fuelTypes.length; k++) {
                let inputAnnualChangePerCarburant = inputAnnualChangePerVehicle[fuelTypes[k]] || [0, 0, 0, 0, 0]
                let outputConsomationCurrentCarburant = outputConsomationCurrentVehicle[fuelTypes[k]]
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

                outputConsomationCurrentVehicle[fuelTypes[k]] = outputConsomationCurrentCarburant
            }
        }
        outputAverageEnergyConsumptionComputed[vtype] = outputConsomationCurrentVehicle
    }
    return outputAverageEnergyConsumptionComputed
}

export function computeTotalEnergyAndEmissions(
    consomationMoyenneEnergieComputed: types.AverageEnergyConsumptionComputed,
    energyAndEmissionsDefaultValues: types.EnergyAndEmissionsDefaultValues,
    vktPerFuelComputed: types.VktPerFuelComputed
) : types.TotalEnergyAndEmissions {
    let outputTotalEnergyAndEmissions = <types.TotalEnergyAndEmissions>{}
    for (let i = 0; i < types.VehicleTypeArray.length; i++) {
        let vtype = types.VehicleTypeArray[i] as types.VehicleType
        outputTotalEnergyAndEmissions[vtype] = {}
        let fuelTypes = Object.keys(energyAndEmissionsDefaultValues) as types.FuelType[]
        for (let j = 0; j < fuelTypes.length; j++) {
            outputTotalEnergyAndEmissions[vtype][fuelTypes[j]] = {
                energie: [0, 0, 0, 0, 0],
                co2: [0, 0, 0, 0, 0]
            }
            for (let k = 0; k < dates.length; k++) {
                let tmp = outputTotalEnergyAndEmissions[vtype][fuelTypes[j]]
                let pci = energyAndEmissionsDefaultValues?.[fuelTypes[j]]?.pci || 0
                let co2default = energyAndEmissionsDefaultValues?.[fuelTypes[j]]?.ges[k] || 0
                let vkt = vktPerFuelComputed?.[vtype]?.[fuelTypes[j]]?.[k] || 0
                let consomoy = consomationMoyenneEnergieComputed?.[vtype]?.[fuelTypes[j]]?.[k] || 0
                if (tmp) {
                    tmp.energie[k] = pci * vkt * consomoy / 100
                    tmp.co2[k] = tmp.energie[k] * co2default / 1000000
                }
                outputTotalEnergyAndEmissions[vtype][fuelTypes[j]] = tmp
            }
        }
    }
    return outputTotalEnergyAndEmissions
}

export function sumTotalEnergyAndEmissions(
    energieTotaleEmissionsGes: types.TotalEnergyAndEmissions
) : types.SumTotalEnergyAndEmissions {
    let outputSumTotalEnergyAndEmissions = <types.SumTotalEnergyAndEmissions>{}
    for (let i = 0; i < types.VehicleTypeArray.length; i++) {
        let vtype = types.VehicleTypeArray[i] as types.VehicleType
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
