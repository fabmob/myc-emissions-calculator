import {energyAndEmissionsDefaultValues} from './defaults'
import * as types from './types'
import * as models from './models'

const inputSocioEconomicData : types.SocioEconomicData = {
    population: 500000,
    populationRate: [1, 1, 1, 1, 1],
    gdp: 5,
    gdpRate: [1, 1, 1, 1, 1]
}
let referenceYears = [2020, 2025, 2030, 2035, 2040, 2050]
let socioEconomicDataCalc = models.computeSocioEconomicData(inputSocioEconomicData, referenceYears)
console.log("socioEconomicDataCalc", socioEconomicDataCalc)

const inputVehicleKilometresTravelled : types.VehicleKilometresTravelled = {
    "Private car": {vkt: 1000, vktRate: [1, 1, 1, 1, 1]},
    "Individual taxi": {vkt: 200, vktRate: [0.5, 0.5, 0.5, 0.5, 0.5]},
    "Some random category": {vkt: 100, vktRate: [0.5, 1, 1.5, 2, 2.5]}
}

let vehicleKilometresTravelledComputed = models.computeVehicleKilometresTravelled(inputVehicleKilometresTravelled, referenceYears)
console.log("vehicleKilometresTravelledComputed", vehicleKilometresTravelledComputed)

const inputVktPerFuel: types.VktPerFuel = {
    "Private car": {
        "Gasoline": [50, 50, 50, 55, 60],
        "Diesel": [50, 50, 50, 45, 40]
    },
    "Individual taxi": {
        "Diesel": [100, 100, 100, 100, 100]
    },
    "Some random category": {
        "Diesel": [100, 100, 100, 100, 100]
    }
}

let outputVktPerFuelComputed = models.computeVktPerFuel(inputVktPerFuel, vehicleKilometresTravelledComputed)
console.log("outputVktPerFuelComputed", outputVktPerFuelComputed)

const inputVehicleStats : types.VehicleStats = {
    "Private car": {"occupancy": 1},
    "Individual taxi": {"occupancy": 2},
    "Some random category": {"occupancy": 20}
}

let outputTransportPerformance = models.computeTransportPerformance(vehicleKilometresTravelledComputed, inputVehicleStats)
console.log("outputTransportPerformance (Mill pkm)", outputTransportPerformance)

let outputModalShare = models.computeModalShare(outputTransportPerformance)
console.log("outputModalShare", outputModalShare)

const inputAverageEnergyConsumption : types.AverageEnergyConsumption = {
    "Private car": {
        "Gasoline": [8, 1, 1, 1, 1, 1],
        "Diesel": [6, 1, 1, 1, 1, 1]
    },
    "Individual taxi": {
        "Diesel": [6, 1, 1, 1, 1, 1]
    },
    "Some random category": {
        "Diesel": [6, 1, 1, 1, 1, 1]
    }
}
let outputAverageEnergyConsumptionComputed = models.computeAverageEnergyConsumption(inputAverageEnergyConsumption, referenceYears)
console.log("outputAverageEnergyConsumptionComputed", outputAverageEnergyConsumptionComputed)

let outputComputeTotalEnergyAndEmissions = models.computeTotalEnergyAndEmissions(outputAverageEnergyConsumptionComputed, energyAndEmissionsDefaultValues, outputVktPerFuelComputed)
// console.log("outputComputeTotalEnergyAndEmissions", outputComputeTotalEnergyAndEmissions["Private car"])

let outputSumTotalEnergyAndEmissions = models.sumTotalEnergyAndEmissions(outputComputeTotalEnergyAndEmissions)
console.log("outputSumTotalEnergyAndEmissions", outputSumTotalEnergyAndEmissions)
