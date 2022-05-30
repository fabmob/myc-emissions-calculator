import {defaultsFacteursEnergetiqueEmission} from './defaults'
import * as types from './types'
import * as models from './models'

const inputSocioEconomicData : types.SocioEconomicData = {
    population: 500000,
    populationRate: [1, 1, 1, 1, 1],
    gdp: 5,
    gdpRate: [1, 1, 1, 1, 1]
}

let socioEconomicDataCalc = models.computeSocioEconomicData(inputSocioEconomicData)
console.log("socioEconomicDataCalc", socioEconomicDataCalc)

const inputVehiculeKilometresTravelled : types.VehiculeKilometresTravelled = {
    "Private car": {vkt: 1000, vktRate: [1, 1, 1, 1, 1]},
    "Individual taxi": {vkt: 200, vktRate: [0.5, 0.5, 0.5, 0.5, 0.5]}
}

let vehiculeKilometresTravelledComputed = models.computeVehiculeKilometresTravelled(inputVehiculeKilometresTravelled)
console.log("vehiculeKilometresTravelledComputed", vehiculeKilometresTravelledComputed)

const inputVktPerFuel: types.VktPerFuel = {
    "Private car": {
        "Gasoline": [50, 50, 50, 55, 60],
        "Diesel": [50, 50, 50, 45, 40]
    },
    "Individual taxi": {
        "Diesel": [100, 100, 100, 100, 100]
    }
}

let outputVktPerFuelComputed = models.computeVktPerFuel(inputVktPerFuel, vehiculeKilometresTravelledComputed)
console.log("outputVktPerFuelComputed", outputVktPerFuelComputed)

const inputVehicleStats : types.VehicleStats = {
    "Private car": {"occupancy": 1, "tripLength": 20},
    "Individual taxi": {"occupancy": 2, "tripLength": 20}
}

let outputTransportPerformance = models.computeTransportPerformance(outputVktPerFuelComputed, inputVehicleStats)
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
    }
}
let outputAverageEnergyConsumptionComputed = models.computeAverageEnergyConsumption(inputAverageEnergyConsumption)
console.log("outputAverageEnergyConsumptionComputed", outputAverageEnergyConsumptionComputed)

let outputComputeTotalEnergyAndEmissions = models.computeTotalEnergyAndEmissions(outputAverageEnergyConsumptionComputed, defaultsFacteursEnergetiqueEmission, outputVktPerFuelComputed)
// console.log("outputComputeTotalEnergyAndEmissions", outputComputeTotalEnergyAndEmissions["Private car"])

let outputSumTotalEnergyAndEmissions = models.sumTotalEnergyAndEmissions(outputComputeTotalEnergyAndEmissions)
console.log("outputSumTotalEnergyAndEmissions", outputSumTotalEnergyAndEmissions)
