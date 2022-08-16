import * as models from '../models'
import * as types from '../types'
import {energyAndEmissionsDefaultValues} from '../defaults'

test('socioeconomicdata computation', () => {
    const inputSocioEconomicData : types.SocioEconomicData = {
        population: 500000,
        populationRate: [1, 1, 1, 1, 1],
        gdp: 5,
        gdpRate: [1, 1, 1, 1, 1]
    }
    const referenceYears = [2020, 2025, 2030, 2035, 2040, 2050]
    const socioEconomicDataCalc = models.computeSocioEconomicData(inputSocioEconomicData, referenceYears)
    expect(socioEconomicDataCalc.gdp.length).toBe(6)
    expect(socioEconomicDataCalc.population.length).toBe(6)
    expect(socioEconomicDataCalc.population.map(e => parseFloat(e.toFixed(9)))).toEqual([500000, 525505.02505, 552311.062705602, 580484.477684999, 610095.019973984, 673924.457666453])
    expect(socioEconomicDataCalc.gdp.map(e => parseFloat(e.toFixed(9)))).toEqual([5, 5.255050251, 5.523110627, 5.804844777, 6.1009502, 6.739244577])
});

test('socioeconomicdata computation bigger year gap', () => {
    const inputSocioEconomicData : types.SocioEconomicData = {
        population: 500000,
        populationRate: [1, 1, 1, 1, 1],
        gdp: 5,
        gdpRate: [1, 1, 1, 1, 1]
    }
    const referenceYears = [2020, 2025, 2030, 2035, 2040, 2100]
    const socioEconomicDataCalc = models.computeSocioEconomicData(inputSocioEconomicData, referenceYears)
    expect(socioEconomicDataCalc.gdp.length).toBe(6)
    expect(socioEconomicDataCalc.population.length).toBe(6)
    expect(socioEconomicDataCalc.population.map(e => parseFloat(e.toFixed(9)))).toEqual([500000, 525505.02505, 552311.062705602, 580484.477684999, 610095.019973984, 1108357.60859713])
    expect(socioEconomicDataCalc.gdp.map(e => parseFloat(e.toFixed(9)))).toEqual([5, 5.255050251, 5.523110627, 5.804844777, 6.1009502, 11.083576086])
});

test('socioeconomicdata with null growth computation', () => {
    const inputSocioEconomicData : types.SocioEconomicData = {
        population: 500000,
        populationRate: [0, 0, 0, 0, 0],
        gdp: 5,
        gdpRate: [0, 0, 0, 0, 0]
    }
    const referenceYears = [2020, 2025, 2030, 2035, 2040, 2050]
    const socioEconomicDataCalc = models.computeSocioEconomicData(inputSocioEconomicData, referenceYears)
    expect(socioEconomicDataCalc.gdp.length).toBe(6)
    expect(socioEconomicDataCalc.population.length).toBe(6)
    expect(socioEconomicDataCalc.population.map(e => parseFloat(e.toFixed(9)))).toEqual([500000, 500000, 500000, 500000, 500000, 500000])
    expect(socioEconomicDataCalc.gdp.map(e => parseFloat(e.toFixed(9)))).toEqual([5, 5, 5, 5, 5, 5])
});

test('socioeconomicdata with negative growth computation', () => {
    const inputSocioEconomicData : types.SocioEconomicData = {
        population: 500000,
        populationRate: [-1, -2, -3, -1, -1],
        gdp: 5,
        gdpRate: [-1, -4, -5, -1, -1]
    }
    const referenceYears = [2020, 2025, 2030, 2035, 2040, 2050]
    const socioEconomicDataCalc = models.computeSocioEconomicData(inputSocioEconomicData, referenceYears)
    expect(socioEconomicDataCalc.gdp.length).toBe(6)
    expect(socioEconomicDataCalc.population.length).toBe(6)
    expect(socioEconomicDataCalc.population.map(e => parseFloat(e.toFixed(9)))).toEqual([500000, 475495.02495, 429809.84182724, 369092.335757786, 351003.138800004, 317440.947002551])
    expect(socioEconomicDataCalc.gdp.map(e => parseFloat(e.toFixed(7)))).toEqual([5, 4.7549502, 3.8770566, 2.9999925, 2.8529630, 2.5801686])
});

const computevkt = () => {
    const inputVehicleKilometresTravelled : types.VehicleKilometresTravelled = {
        "Private car": {vkt: 1000, vktRate: [1, 1, 1, 1, 1]},
        "Individual taxi": {vkt: 200, vktRate: [0.5, 0.5, 0.5, 0.5, 0.5]},
        "Some random category": {vkt: 100, vktRate: [0.5, 1, 1.5, 2, 2.5]}
    }
    const referenceYears = [2020, 2025, 2030, 2035, 2040, 2050]
    return models.computeVehicleKilometresTravelled(inputVehicleKilometresTravelled, referenceYears) 
}
test('vkt computation', () => {
    const vehicleKilometresTravelledComputed = computevkt()
    expect(vehicleKilometresTravelledComputed['Private car']).toEqual([1000, 1051.0100501000002, 1104.622125411205, 1160.968955369999, 1220.1900399479675, 1347.8489153329065])
    expect(vehicleKilometresTravelledComputed['Individual taxi']).toEqual([200, 205.05025062562487, 210.22802640815786, 215.53654751761627, 220.9791154373456, 232.28001657906833])
    expect(vehicleKilometresTravelledComputed['Some random category']).toEqual([100, 102.52512531281243, 107.7549370915278, 116.08267006826996, 128.1646476065761, 164.06158451355063])
})

const computevktfuel = () => {
    const vehicleKilometresTravelledComputed = computevkt()
    const inputVktPerFuel: types.VktPerFuel = {
        "Private car": {
            "Gasoline": [50, 50, 50, 55, 60, 60],
            "Diesel": [50, 50, 50, 45, 40, 40]
        },
        "Individual taxi": {
            "Diesel": [100, 100, 100, 100, 100, 100]
        },
        "Some random category": {
            "Diesel": [100, 100, 100, 100, 100, 100]
        }
    }
    return models.computeVktPerFuel(inputVktPerFuel, vehicleKilometresTravelledComputed)

}
test('vkt per fuel computation', () => {
    const outputVktPerFuelComputed = computevktfuel()
    expect(outputVktPerFuelComputed['Private car'].Gasoline).toEqual([500, 525.5050250500001, 552.3110627056025, 638.5329254534995, 732.1140239687805, 808.7093491997439])
    expect(outputVktPerFuelComputed['Private car'].Diesel).toEqual([500, 525.5050250500001, 552.3110627056025, 522.4360299164996, 488.07601597918705, 539.1395661331626])
    expect(outputVktPerFuelComputed['Individual taxi'].Diesel).toEqual([200, 205.05025062562487, 210.2280264081579, 215.53654751761627, 220.9791154373456, 232.28001657906833])
    expect(outputVktPerFuelComputed['Some random category'].Diesel).toEqual([100, 102.52512531281243, 107.7549370915278, 116.08267006826995, 128.1646476065761, 164.06158451355063])
})

const transportPerf = (vehicleKilometresTravelledComputed: types.VehicleKilometresTravelledComputed) => {
    const inputVehicleStats : types.VehicleStats = {
        "Private car": {"occupancy": 1},
        "Individual taxi": {"occupancy": 2},
        "Some random category": {"occupancy": 20}
    }
    
    return models.computeTransportPerformance(vehicleKilometresTravelledComputed, inputVehicleStats)
}
test('transport performance computation', () => {
    const vehicleKilometresTravelledComputed = computevkt()
    const outputTransportPerformance = transportPerf(vehicleKilometresTravelledComputed)
    expect(outputTransportPerformance['Private car']).toEqual(vehicleKilometresTravelledComputed['Private car'])
    expect(outputTransportPerformance['Individual taxi']).toEqual(vehicleKilometresTravelledComputed['Individual taxi'].map(e => e*2))
    expect(outputTransportPerformance['Some random category']).toEqual(vehicleKilometresTravelledComputed["Some random category"].map(e => e*20))
})

test('modal share computation', () => {
    const vehicleKilometresTravelledComputed = computevkt()
    const outputTransportPerformance = transportPerf(vehicleKilometresTravelledComputed)
    const outputModalShare = models.computeModalShare(outputTransportPerformance)
    expect(outputModalShare['Private car'].map(e => parseFloat(e.toFixed(3)))).toEqual([0.294,0.299,0.3,0.297,0.289,0.265])
    expect(outputModalShare['Individual taxi'].map(e => parseFloat(e.toFixed(3)))).toEqual([0.118,0.117,0.114,0.110,0.105,0.091])
    expect(outputModalShare['Some random category'].map(e => parseFloat(e.toFixed(3)))).toEqual([0.588,0.584,0.586,0.593,0.607,0.644])
})

const computeAverageEnergyConsumption = () => {
    const referenceYears = [2020, 2025, 2030, 2035, 2040, 2050]
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
    return models.computeAverageEnergyConsumption(inputAverageEnergyConsumption, referenceYears)
}
test('average energy consumption computation', () => {
    const sixGrowth = [6,6.3060603006000004,6.627732752467228,6.965813732219993,7.321140239687804,8.087093491997438]
    const outputAverageEnergyConsumptionComputed = computeAverageEnergyConsumption()
    expect(outputAverageEnergyConsumptionComputed['Private car'].Gasoline).toEqual([8,8.408080400800001,8.836977003289638,9.287751642959991,9.761520319583738,10.782791322663249])
    expect(outputAverageEnergyConsumptionComputed['Private car'].Diesel).toEqual(sixGrowth)
    expect(outputAverageEnergyConsumptionComputed['Individual taxi'].Diesel).toEqual(sixGrowth)
    expect(outputAverageEnergyConsumptionComputed['Some random category'].Diesel).toEqual(sixGrowth)
})

test('energy and emissions computation', () => {
    const outputVktPerFuelComputed = computevktfuel()
    const outputAverageEnergyConsumptionComputed = computeAverageEnergyConsumption()
    const outputComputeTotalEnergyAndEmissions = models.computeTotalEnergyAndEmissions(outputAverageEnergyConsumptionComputed, energyAndEmissionsDefaultValues, outputVktPerFuelComputed)
    const outputSumTotalEnergyAndEmissions = models.sumTotalEnergyAndEmissions(outputComputeTotalEnergyAndEmissions)
    expect(outputSumTotalEnergyAndEmissions['Private car'].co2.map(e => Math.round(e*100)/100)).toEqual([212.67,234.92,259.49,288.49,320.72,391.34])
    expect(outputSumTotalEnergyAndEmissions['Individual taxi'].energy.map(e => Math.round(e*100)/100)).toEqual([435.44,469.21,505.60,544.81,587.06,681.64])
    expect(outputSumTotalEnergyAndEmissions['Individual taxi'].co2.map(e => Math.round(e*100)/100)).toEqual([39.79,42.87,46.20,49.78,53.64,62.28])
})

    

