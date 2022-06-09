import * as types from './types'
let dates : types.date[] = [0, 2025, 2030, 2035, 2040, 2050]

export function computeSocioEconomicData(
    inputSocioEconomicData : types.SocioEconomicData,
    referenceYear: number
) : types.SocioEconomicDataComputed {
    let outputSocioEconomicDataComputed: types.SocioEconomicDataComputed = {
        population: [inputSocioEconomicData.population, 0, 0, 0, 0, 0],
        gdp: [inputSocioEconomicData.gdp, 0, 0, 0, 0, 0]
    }
    for (let i = 1; i < dates.length; i++) {
        let numberOfYears = dates[i] - dates[i - 1]
        if (i === 1) {
            numberOfYears = dates[i] - referenceYear
        }
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
    referenceYear: number
) : types.VehicleKilometresTravelledComputed {
    let outputVehicleKilometresTravelledComputed = <types.VehicleKilometresTravelledComputed>{}
    let vehicleTypeArray = Object.keys(inputVehicleKilometresTravelled)
    // Initialize output with default values
    for (let i = 0; i < vehicleTypeArray.length; i++) {
        let vtype = vehicleTypeArray[i]
        outputVehicleKilometresTravelledComputed[vtype] = [inputVehicleKilometresTravelled[vtype]?.vkt || 0, 0, 0, 0, 0]
    }
    const keys = Object.keys(inputVehicleKilometresTravelled)
    // Compute increases according to rate
    for (let k = 0; k < keys.length; k++) {
        for (let i = 1; i < dates.length; i++) {
            let numberOfYears = dates[i] - dates[i - 1]
            if (i === 1) {
                numberOfYears = dates[i] - referenceYear
            }
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
    let vehicleTypes = Object.keys(inputVktPerFuel)
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
                    vehicleKilometresTravelledComputed[vtype][4]/100 * yearlyVkt[4],
                    vehicleKilometresTravelledComputed[vtype][5]/100 * yearlyVkt[5]
                ]
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
        outputTransportPerformance[vtype] = [
            vTauxOccupation * yearlyVkt[0],
            vTauxOccupation * yearlyVkt[1],
            vTauxOccupation * yearlyVkt[2],
            vTauxOccupation * yearlyVkt[3],
            vTauxOccupation * yearlyVkt[4],
            vTauxOccupation * yearlyVkt[5]
        ]
    }
    return outputTransportPerformance
}

export function computeModalShare (
    transportPerformance: types.TransportPerformance
) : types.ModalShare {
    let outputModalShare : types.ModalShare = {}
    let vehicleTypes = Object.keys(transportPerformance)
    let totalsPerDate = [0, 0, 0, 0, 0, 0]
    for (let i = 0; i < vehicleTypes.length; i++) {
        let vtype = vehicleTypes[i]
        totalsPerDate[0] += transportPerformance[vtype][0]
        totalsPerDate[1] += transportPerformance[vtype][1]
        totalsPerDate[2] += transportPerformance[vtype][2]
        totalsPerDate[3] += transportPerformance[vtype][3]
        totalsPerDate[4] += transportPerformance[vtype][4]
        totalsPerDate[5] += transportPerformance[vtype][5]
    }
    for (let i = 0; i < vehicleTypes.length; i++) {
        let vtype = vehicleTypes[i]
        outputModalShare[vtype] = [0, 0, 0, 0, 0, 0]
        for (let d = 0; d < dates.length; d++) {
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
    referenceYear: number
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
                let inputAnnualChangePerCarburant = inputAnnualChangePerVehicle[fuelTypes[k]] || [0, 0, 0, 0, 0]
                let outputConsomationCurrentCarburant = outputConsomationCurrentVehicle[fuelTypes[k]]
                outputConsomationCurrentCarburant = [
                    inputAnnualChangePerCarburant[0] || 0,
                    0,
                    0,
                    0,
                    0,
                    0
                ]

                for (let i = 1; i < dates.length; i++) {
                    let numberOfYears = dates[i] - dates[i - 1]
                    if (i === 1) {
                        numberOfYears = dates[i] - referenceYear
                    }
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
    vktPerFuelComputed: types.VktPerFuelComputed
) : types.TotalEnergyAndEmissions {
    let outputTotalEnergyAndEmissions = <types.TotalEnergyAndEmissions>{}
    let vehicleTypeArray = Object.keys(averageEnergyConsumptionComputed)
    for (let i = 0; i < vehicleTypeArray.length; i++) {
        let vtype = vehicleTypeArray[i]
        outputTotalEnergyAndEmissions[vtype] = {}
        let fuelTypes = Object.keys(energyAndEmissionsDefaultValues) as types.FuelType[]
        for (let j = 0; j < fuelTypes.length; j++) {
            outputTotalEnergyAndEmissions[vtype][fuelTypes[j]] = {
                energy: [0, 0, 0, 0, 0, 0],
                co2: [0, 0, 0, 0, 0, 0]
            }
            for (let k = 0; k < dates.length; k++) {
                let tmp = outputTotalEnergyAndEmissions[vtype][fuelTypes[j]]
                let pci = energyAndEmissionsDefaultValues?.[fuelTypes[j]]?.pci || 0
                let co2default = energyAndEmissionsDefaultValues?.[fuelTypes[j]]?.ges[k] || 0
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
    totalEnergyAndEmissions: types.TotalEnergyAndEmissions
) : types.SumTotalEnergyAndEmissions {
    let outputSumTotalEnergyAndEmissions = <types.SumTotalEnergyAndEmissions>{}
    let vehicleTypeArray = Object.keys(totalEnergyAndEmissions)
    for (let i = 0; i < vehicleTypeArray.length; i++) {
        let vtype = vehicleTypeArray[i]
        outputSumTotalEnergyAndEmissions[vtype] = {
            energy: [0, 0, 0, 0, 0, 0],
            co2: [0, 0, 0, 0, 0, 0]
        }
        let fuelTypes = Object.keys(totalEnergyAndEmissions[vtype]) as types.FuelType[]
        for (let j = 0; j < fuelTypes.length; j++) {
            for (let k = 0; k < dates.length; k++) {
                outputSumTotalEnergyAndEmissions[vtype].energy[k] += totalEnergyAndEmissions?.[vtype]?.[fuelTypes[j]]?.energy?.[k] || 0
                outputSumTotalEnergyAndEmissions[vtype].co2[k] += totalEnergyAndEmissions?.[vtype]?.[fuelTypes[j]]?.co2?.[k] || 0
            }
        }
    }
    return outputSumTotalEnergyAndEmissions
}
