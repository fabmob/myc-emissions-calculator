import * as models from '../models'
import * as types from '../types'
import {energyAndEmissionsDefaultValues} from '../defaults'

const jestConsole = console
beforeEach(() => {global.console = require('console')})
afterEach(() => {global.console = jestConsole})

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
        "Private car": {"occupancy": 1, triplength: 1, network: "rail", type: "private transport"},
        "Individual taxi": {"occupancy": 2, triplength: 1, network: "rail", type: "public transport"},
        "Some random category": {"occupancy": 20, triplength: 1, network: "rail", type: "private transport"}
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
    const referenceYears = [2020, 2025, 2030, 2035, 2040, 2050]
    const outputVktPerFuelComputed = computevktfuel()
    const outputAverageEnergyConsumptionComputed = computeAverageEnergyConsumption()
    const vehicleStats : types.VehicleStats = {
        "Individual taxi": {"occupancy": 1, triplength: 1, network: "road", type: "public transport"},
        "Private car": {"occupancy": 1, triplength: 5, network: "road", type: "private transport"}
    }
    const outputComputeTotalEnergyAndEmissions = models.computeTotalEnergyAndEmissions(outputAverageEnergyConsumptionComputed, energyAndEmissionsDefaultValues.WTW, null, outputVktPerFuelComputed, vehicleStats, referenceYears)
    const outputSumTotalEnergyAndEmissions = models.sumTotalEnergyAndEmissions(outputComputeTotalEnergyAndEmissions, referenceYears)
    expect(outputSumTotalEnergyAndEmissions['Private car'].co2.map(e => Math.round(e*100)/100)).toEqual([212.34, 234.56, 259.1, 288.61, 321.46, 392.24])
    expect(outputSumTotalEnergyAndEmissions['Individual taxi'].energy.map(e => Math.round(e*100)/100)).toEqual([430.31, 463.68, 499.64, 538.39, 580.14, 673.6])
    expect(outputSumTotalEnergyAndEmissions['Individual taxi'].co2.map(e => Math.round(e*100)/100)).toEqual([38.9, 41.92, 45.17, 48.67, 52.44, 60.89])
})

test('computeVktBaseAfterAvoid basic', () => {
    const vtype = "Minibus"
    const BAUVkt : types.VehicleKilometresTravelledComputed = {
        "Minibus": [2000, 3077, 3927, 5013, 6098, 7434]
    }
    const inputAvoidedVkt : types.InputClimateWithoutUpstreamStep1 = {
        vtypes: {
            "Minibus": {
                source: "",
                avoidedVkt: [10, 0, 0, 0, 0]
            }
        },
        note: ""
    }
    let baseVkt : types.TransportPerformance = {}
    const expectedResults = [2000, 3077-2000-(3077-2000)*0.1, 3927-3077, 5013-3927, 6098-5013, 7434-6098]
    for (let y = 0; y < 6; y++) {
        let vktStartOfYear = models.computeVktBaseAfterAvoid(vtype, y, BAUVkt, inputAvoidedVkt, baseVkt)
        expect(vktStartOfYear).toBe(expectedResults[y])
    }
})

test('computeVktBaseAfterAvoid with moving baseVkt', () => {
    const vtype = "Minibus"
    const BAUVkt : types.VehicleKilometresTravelledComputed = {
        "Minibus": [2000, 3077, 3927, 5013, 6098, 7434]
    }
    const inputAvoidedVkt : types.InputClimateWithoutUpstreamStep1 = {
        vtypes: {
            "Minibus": {
                source: "",
                avoidedVkt: [10, 0, 0, 0, 0]
            }
        },
        note: ""
    }
    let baseVkt : types.TransportPerformance = {"Minibus": []}
    const expectedResults = [2000, 3077-2000+2000-(3077-2000+2000)*0.1, 3619.3, 4705.3, 5790.3, 7126.3]
    for (let y = 0; y < 6; y++) {
        let vktStartOfYear = models.computeVktBaseAfterAvoid(vtype, y, BAUVkt, inputAvoidedVkt, baseVkt)
        expect(vktStartOfYear).toBe(expectedResults[y])
        baseVkt[vtype].push(vktStartOfYear)
    }
})

test('distributeReductionInReducedPkm', () => {
    const inputOriginModeMatrix : types.OriginModeMatrix = {
        "Minibus": {
            "NMT": {source: '', value: [100,100,50,100,25].map(e=>e.toString())},
            "Private car": {source: '', value: [0,0,50,0,75].map(e=>e.toString())}
        }
    }
    const vehicleStats : types.VehicleStats = {
        "NMT": {"occupancy": 1, triplength: 1, network: "rail", type: "private transport"},
        "Private car": {"occupancy": 1, triplength: 5, network: "road", type: "private transport"},
        "Minibus": {"occupancy": 8, triplength: 10, network: "road", type: "public transport"},
    }
    const vtype = "Minibus"
    const pkmAddedThisYear = 500
    const expectedResultsNMT = [0, 500, 500, 83, 500, 31]
    const expectedResultsCar = [0, 0, 0, 500-83, 0, 500-31]
    for (let y = 0; y < 6; y++) {
        let reducedPkm: {[key: string]: number} = {}
        models.distributeReductionInReducedPkm(reducedPkm, inputOriginModeMatrix, vehicleStats, vtype, pkmAddedThisYear, y)
        expect(Math.round(reducedPkm["NMT"])).toBe(expectedResultsNMT[y])
        expect(Math.round(reducedPkm["Private car"])).toBe(expectedResultsCar[y])
        expect(reducedPkm["Minibus"]).toBe(undefined)
    }
})

test('da big one: computeScenarioWithoutUpstreamGHGEmissions', () => {
    const referenceYears = [2020, 2025, 2030, 2035, 2040, 2050]
    const inputAvoidedVkt : types.InputClimateWithoutUpstreamStep1 = {
        vtypes: {
            "Minibus": {
                source: "",
                avoidedVkt: [10, 0, 0, 0, 0]
            }
        },
        note: ""
    }
    const BAUVkt : types.VehicleKilometresTravelledComputed = {
        "NMT": [1000, 1000, 1000, 1000, 1000, 1000],
        "Private car": [2000, 2000, 2000, 2000, 2000, 2000],
        "Minibus": [2000, 3077, 3927, 5013, 6098, 7434]
    }
    const inputAdditionalVkt : types.InputClimateWithoutUpstreamStep2 = {
        vtypes: {
            "NMT": {
                source: "",
                addedVkt: [1000, 0, 0, 0, 0].map(e => e.toString())
            },
            "Minibus": {
                source: "",
                addedVkt: [0, 100, 50, 0, 30].map(e => e.toString())
            }
        },
        note: ""
    }
    const inputOccupancyRate : types.InputClimateWithoutUpstreamStep3 = {
        vtypes: {
            "Minibus": {
                source: "",
                load: [8.1, 8, 8, 8, 8].map(e => e.toString())
            }
        },
        note: ""
    }
    const vehicleStats : types.VehicleStats = {
        "NMT": {"occupancy": 1, triplength: 1, network: "rail", type: "private transport"},
        "Private car": {"occupancy": 1, triplength: 5, network: "road", type: "private transport"},
        "Minibus": {"occupancy": 8, triplength: 10, network: "road", type: "public transport"},
    }
    const inputOriginModeMatrix : types.OriginModeMatrix = {
        "Minibus": {
            "NMT": {source: '', value: [100,100,50,100,25].map(e=>e.toString())},
            "Private car": {source: '', value: [0,0,50,0,75].map(e=>e.toString())}
        },
        "NMT": {
            "Private car": {source: '', value: [100,100,100,100,100].map(e=>e.toString())}
        }
    }
    const inputVktPerFuel: types.VktPerFuel = {
        "Private car": {
            "Gasoline": [70, 70, 70, 70, 70, 70],
            "Diesel": [30, 30, 30, 30, 30, 30]
        },
        "Minibus": {
            "Gasoline": [100, 100, 100, 100, 100, 100]
        }
    }
    const inputAverageEnergyConsumption : types.AverageEnergyConsumption = {
        "Private car": {
            "Gasoline": [6, 6, 6, 6, 6, 6],
            "Diesel": [5, 5, 5, 5, 5, 5]
        },
        "Minibus": {
            "Gasoline": [20, 20, 20, 20, 20, 20]
        }
    }
    const scenarioWithoutUpstreamGHGEmissions = models.computeScenarioWithoutUpstreamGHGEmissions(
        referenceYears,
        inputAvoidedVkt,
        BAUVkt,
        inputAdditionalVkt,
        inputOccupancyRate,
        vehicleStats,
        inputOriginModeMatrix,
        inputVktPerFuel ,
        inputAverageEnergyConsumption ,
        energyAndEmissionsDefaultValues.WTW,
        null // TODO: in WTW this should be gco2 for electricity
    )
    console.log(scenarioWithoutUpstreamGHGEmissions)
    expect(scenarioWithoutUpstreamGHGEmissions['Private car'].energy.map(e => Math.round(e))).toEqual([3779, 1890, 1890, 1260, 1260, 835])
    expect(scenarioWithoutUpstreamGHGEmissions['Private car'].co2.map(e => Math.round(e))).toEqual([339, 169, 169, 113, 113, 75])
    expect(scenarioWithoutUpstreamGHGEmissions['Minibus'].energy.map(e => Math.round(e))).toEqual([12874, 17825, 23940, 31253, 38237, 47029])
    expect(scenarioWithoutUpstreamGHGEmissions['Minibus'].co2.map(e => Math.round(e))).toEqual([1151, 1594, 2140, 2794, 3418, 4204])
})

test('da big one: computeScenarioWithoutUpstreamGHGEmissions, diff values', () => {
    const referenceYears = [2020, 2025, 2030, 2035, 2040, 2050]

    const inputAvoidedVkt : types.InputClimateWithoutUpstreamStep1 = {
        vtypes: {
            "Minibus": {
                source: "",
                avoidedVkt: [ 10, 1, 0, 0, 0]
            },
            "Private car": {
                source: "",
                avoidedVkt: [0, 1, 0, 0, 0]
            }
        },
        note: ""
    }
    const BAUVkt : types.VehicleKilometresTravelledComputed = {
        "NMT": [1000, 1000, 1000, 1000, 1000, 1000],
        "Private car": [2000, 2000, 2000, 2000, 2000, 2000],
        "Minibus": [2000, 3077, 3927, 5013, 6098, 7434]
    }
    const inputAdditionalVkt : types.InputClimateWithoutUpstreamStep2 = {
        vtypes: {
            "NMT": {
                source: "",
                addedVkt: [1000, 0, 0, 0, 0].map(e => e.toString())
            },
            "Minibus": {
                source: "",
                addedVkt: [0, 100, 50, 0, 30].map(e => e.toString())
            }
        },
        note: ""
    }
    const inputOccupancyRate : types.InputClimateWithoutUpstreamStep3 = {
        vtypes: {
            "Minibus": {
                source: "",
                load: [8.1, 7.9, 8, 8, 8].map(e => e.toString())
            }
        },
        note: ""
    }
    const vehicleStats : types.VehicleStats = {
        "NMT": {"occupancy": 1, triplength: 1, network: "rail", type: "private transport"},
        "Private car": {"occupancy": 1, triplength: 5, network: "road", type: "private transport"},
        "Minibus": {"occupancy": 8, triplength: 10, network: "road", type: "public transport"},
    }
    const inputOriginModeMatrix : types.OriginModeMatrix = {
        "Minibus": {
            "NMT": {source: '', value: [100,100,50,100,25].map(e=>e.toString())},
            "Private car": {source: '', value: [0,0,50,0,75].map(e=>e.toString())}
        },
        "NMT": {
            "Private car": {source: '', value: [100,100,100,100,100].map(e=>e.toString())}
        }
    }
    const inputVktPerFuel: types.VktPerFuel = {
        "Private car": {
            "Gasoline": [70, 70, 80, 90, 100, 100],
            "Diesel": [30, 30, 20, 10, 0, 0]
        },
        "Minibus": {
            "Gasoline": [100, 100, 100, 100, 100, 100]
        }
    }
    const inputAverageEnergyConsumption : types.AverageEnergyConsumption = {
        "Private car": {
            "Gasoline": [6, 6, 5.9, 5.8, 5.7, 5.6],
            "Diesel": [5, 5, 5, 5, 5, 5]
        },
        "Minibus": {
            "Gasoline": [20, 20, 20, 20, 20, 20]
        }
    }
    const scenarioWithoutUpstreamGHGEmissions = models.computeScenarioWithoutUpstreamGHGEmissions(
        referenceYears,
        inputAvoidedVkt,
        BAUVkt,
        inputAdditionalVkt,
        inputOccupancyRate,
        vehicleStats,
        inputOriginModeMatrix,
        inputVktPerFuel ,
        inputAverageEnergyConsumption ,
        energyAndEmissionsDefaultValues.WTW,
        null // TODO: in WTW this should be gco2 for electricity
    )
    console.log(scenarioWithoutUpstreamGHGEmissions)
    expect(scenarioWithoutUpstreamGHGEmissions['Private car'].co2.map(e => Math.round(e))).toEqual([339, 169, 167, 43, 43, 6])
    expect(scenarioWithoutUpstreamGHGEmissions['Minibus'].co2.map(e => Math.round(e))).toEqual([1151, 1594, 2119, 2773, 3398, 4184])
})

test('da big one: computeScenarioWithoutUpstreamGHGEmissions, more PT', () => {
    const referenceYears = [2020, 2025, 2030, 2035, 2040, 2050]

    const inputAvoidedVkt : types.InputClimateWithoutUpstreamStep1 = {
        vtypes: {
            "Minibus": {
                source: "",
                avoidedVkt: [ 10, 1, 0, 0, 0]
            },
            "Private car": {
                source: "",
                avoidedVkt: [0, 1, 0, 0, 0]
            },
            "Metro": {
                source: "",
                avoidedVkt: [1, 1, 1, 1, 1]
            }
        },
        note: ""
    }
    const BAUVkt : types.VehicleKilometresTravelledComputed = {
        "NMT": [1000, 1000, 1000, 1000, 1000, 1000],
        "Private car": [200000, 200000, 200000, 200000, 200000, 200000],
        "Minibus": [2000, 3077, 3927, 5013, 6098, 7434],
        "Metro": [300, 300, 300, 300, 300, 300]
    }
    const inputAdditionalVkt : types.InputClimateWithoutUpstreamStep2 = {
        vtypes: {
            "NMT": {
                source: "",
                addedVkt: [1000, 0, 0, 0, 0].map(e => e.toString())
            },
            "Minibus": {
                source: "",
                addedVkt: [0, 100, 50, 0, 30].map(e => e.toString())
            },
            "Metro": {
                source: "",
                addedVkt: [100, 100, 110, 120, 130].map(e => e.toString())
            }
        },
        note: ""
    }
    const inputOccupancyRate : types.InputClimateWithoutUpstreamStep3 = {
        vtypes: {
            "Minibus": {
                source: "",
                load: [8.1, 7.9, 8, 8, 8].map(e => e.toString())
            },
            "Metro": {
                source: "",
                load: [210, 220, 230, 240, 240].map(e => e.toString())
            }
        },
        note: ""
    }
    const vehicleStats : types.VehicleStats = {
        "NMT": {"occupancy": 1, triplength: 1, network: "rail", type: "private transport"},
        "Private car": {"occupancy": 1, triplength: 5, network: "road", type: "private transport"},
        "Minibus": {"occupancy": 8, triplength: 10, network: "road", type: "public transport"},
        "Metro": {"occupancy": 200, triplength: 10, network: "rail", type: "public transport"},
    }
    const inputOriginModeMatrix : types.OriginModeMatrix = {
        "Minibus": {
            "NMT": {source: '', value: [100,100,50,100,25].map(e=>e.toString())},
            "Private car": {source: '', value: [0,0,50,0,75].map(e=>e.toString())}
        },
        "NMT": {
            "Private car": {source: '', value: [100,100,100,100,100].map(e=>e.toString())}
        },
        "Metro": {
            "Private car": {source: '', value: [100,100,100,100,100].map(e=>e.toString())}
        }
    }
    const inputVktPerFuel: types.VktPerFuel = {
        "Private car": {
            "Gasoline": [70, 70, 80, 90, 100, 100],
            "Diesel": [30, 30, 20, 10, 0, 0]
        },
        "Minibus": {
            "Gasoline": [100, 100, 100, 100, 100, 100]
        },
        "Metro": {
            "Electric": [100, 100, 100, 100, 100, 100]
        }
    }
    const inputAverageEnergyConsumption : types.AverageEnergyConsumption = {
        "Private car": {
            "Gasoline": [6, 6, 5.9, 5.8, 5.7, 5.6],
            "Diesel": [5, 5, 5, 5, 5, 5]
        },
        "Minibus": {
            "Gasoline": [20, 20, 20, 20, 20, 20]
        },
        "Metro": {
            "Electric": [150, 150, 150, 150, 150, 150]
        }
    }
    const scenarioWithoutUpstreamGHGEmissions = models.computeScenarioWithoutUpstreamGHGEmissions(
        referenceYears,
        inputAvoidedVkt,
        BAUVkt,
        inputAdditionalVkt,
        inputOccupancyRate,
        vehicleStats,
        inputOriginModeMatrix,
        inputVktPerFuel ,
        inputAverageEnergyConsumption ,
        energyAndEmissionsDefaultValues.WTW,
        null // TODO: in WTW this should be gco2 for electricity
    )
    console.log(scenarioWithoutUpstreamGHGEmissions)
    expect(scenarioWithoutUpstreamGHGEmissions['Private car'].co2.map(e => Math.round(e))).toEqual([33894, 29662, 24788, 19375, 13402, 8103])
    expect(scenarioWithoutUpstreamGHGEmissions['Minibus'].co2.map(e => Math.round(e))).toEqual([1151, 1594, 2119, 2773, 3398, 4184])
    expect(scenarioWithoutUpstreamGHGEmissions['Metro'].co2.map(e => Math.round(e))).toEqual([0, 0, 0, 0, 0, 0])
})

test('da big one: computeScenarioWithoutUpstreamGHGEmissions, with freight', () => {
    const referenceYears = [2020, 2025, 2030, 2035, 2040, 2050]

    const inputAvoidedVkt : types.InputClimateWithoutUpstreamStep1 = {
        vtypes: {
            "Minibus": {
                source: "",
                avoidedVkt: [10, 1, 0, 0, 0]
            },
            "Private car": {
                source: "",
                avoidedVkt: [0, 1, 0, 0, 0]
            },
            "Metro": {
                source: "",
                avoidedVkt: [1, 1, 1, 1, 1]
            }
        },
        note: ""
    }
    const BAUVkt : types.VehicleKilometresTravelledComputed = {
        "NMT": [1000, 1000, 1000, 1000, 1000, 1000],
        "Private car": [200000, 200000, 200000, 200000, 200000, 200000],
        "Minibus": [2000, 3077, 3927, 5013, 6098, 7434],
        "Metro": [300, 300, 300, 300, 300, 300],
        "Cargo": [1,1,1,1,1,1],
        "LCV": [100,100,100,100,100,100],
        "Truck": [100,100,100,100,100,100],
    }
    const inputAdditionalVkt : types.InputClimateWithoutUpstreamStep2 = {
        vtypes: {
            "NMT": {
                source: "",
                addedVkt: [1000, 0, 0, 0, 0].map(e => e.toString())
            },
            "Minibus": {
                source: "",
                addedVkt: [0, 100, 50, 0, 30].map(e => e.toString())
            },
            "Metro": {
                source: "",
                addedVkt: [100, 100, 110, 120, 130].map(e => e.toString())
            },
            "Cargo": {
                source: "",
                addedVkt: [50, 50, 50, 50, 50].map(e => e.toString())
            }
        },
        note: ""
    }
    const inputOccupancyRate : types.InputClimateWithoutUpstreamStep3 = {
        vtypes: {
            "Minibus": {
                source: "",
                load: [8.1, 7.9, 8, 8, 8].map(e => e.toString())
            },
            "Metro": {
                source: "",
                load: [210, 220, 230, 240, 240].map(e => e.toString())
            }
        },
        note: ""
    }
    const vehicleStats : types.VehicleStats = {
        "NMT": {"occupancy": 1, triplength: 1, network: "rail", type: "private transport"},
        "Private car": {"occupancy": 1, triplength: 5, network: "road", type: "private transport"},
        "Minibus": {"occupancy": 8, triplength: 10, network: "road", type: "public transport"},
        "Metro": {"occupancy": 200, triplength: 10, network: "rail", type: "public transport"},
        "Cargo": {"occupancy": 0.1, triplength: 1, network: "road", type: "freight"},
        "LCV": {"occupancy": 10, triplength: 1, network: "road", type: "freight"},
        "Truck": {"occupancy": 20, triplength: 1, network: "road", type: "freight"},
    }
    const inputOriginModeMatrix : types.OriginModeMatrix = {
        "Minibus": {
            "NMT": {source: '', value: [100,100,50,100,25].map(e=>e.toString())},
            "Private car": {source: '', value: [0,0,50,0,75].map(e=>e.toString())}
        },
        "NMT": {
            "Private car": {source: '', value: [100,100,100,100,100].map(e=>e.toString())}
        },
        "Metro": {
            "Private car": {source: '', value: [100,100,100,100,100].map(e=>e.toString())}
        },
        "Cargo": {
            "LCV": {source: '', value: [50,50,50,50,50].map(e=>e.toString())},
            "Truck": {source: '', value: [50,50,50,50,50].map(e=>e.toString())},
        }
    }
    const inputVktPerFuel: types.VktPerFuel = {
        "Private car": {
            "Gasoline": [70, 70, 80, 90, 100, 100],
            "Diesel": [30, 30, 20, 10, 0, 0]
        },
        "Minibus": {
            "Gasoline": [100, 100, 100, 100, 100, 100]
        },
        "Metro": {
            "Electric": [100, 100, 100, 100, 100, 100]
        },
        "Cargo": {
            "None": [100, 100, 100, 100, 100, 100]
        },
        "LCV": {
            "Diesel": [100, 100, 100, 100, 100, 100]
        },
        "Truck": {
            "Diesel": [100, 100, 100, 100, 100, 100]
        }
    }
    const inputAverageEnergyConsumption : types.AverageEnergyConsumption = {
        "Private car": {
            "Gasoline": [6, 6, 5.9, 5.8, 5.7, 5.6],
            "Diesel": [5, 5, 5, 5, 5, 5]
        },
        "Minibus": {
            "Gasoline": [20, 20, 20, 20, 20, 20]
        },
        "Metro": {
            "Electric": [150, 150, 150, 150, 150, 150]
        },
        "LCV": {
            "Diesel": [5, 5, 5, 5, 5, 5]
        },
        "Truck": {
            "Diesel": [120, 120, 120, 120, 120, 120]
        },
    }
    const scenarioWithoutUpstreamGHGEmissions = models.computeScenarioWithoutUpstreamGHGEmissions(
        referenceYears,
        inputAvoidedVkt,
        BAUVkt,
        inputAdditionalVkt,
        inputOccupancyRate,
        vehicleStats,
        inputOriginModeMatrix,
        inputVktPerFuel ,
        inputAverageEnergyConsumption ,
        energyAndEmissionsDefaultValues.WTW,
        null // TODO: in WTW this should be gco2 for electricity
    )
    console.log(scenarioWithoutUpstreamGHGEmissions)
    expect(scenarioWithoutUpstreamGHGEmissions['Private car'].co2.map(e => Math.round(e))).toEqual([33894, 29662, 24788, 19375, 13402, 8103])
    expect(scenarioWithoutUpstreamGHGEmissions['Minibus'].co2.map(e => Math.round(e))).toEqual([1151, 1594, 2119, 2773, 3398, 4184])
    expect(scenarioWithoutUpstreamGHGEmissions['Metro'].co2.map(e => Math.round(e))).toEqual([0, 0, 0, 0, 0, 0])
    expect(scenarioWithoutUpstreamGHGEmissions['LCV'].co2.map(e => Math.round(e))).toEqual([16, 16, 16, 16, 16, 16])
    expect(scenarioWithoutUpstreamGHGEmissions['Truck'].co2.map(e => Math.round(e))).toEqual([389,389,388,388,387,387])
})

test('compute scenario modal share', () => {
    const referenceYears = [2020, 2025, 2030, 2035, 2040, 2050]

    const inputAvoidedVkt : types.InputClimateWithoutUpstreamStep1 = {
        vtypes: {
            "Minibus": {
                source: "",
                avoidedVkt: [10, 1, 0, 0, 0]
            },
            "Private car": {
                source: "",
                avoidedVkt: [0, 1, 0, 0, 0]
            },
            "Metro": {
                source: "",
                avoidedVkt: [1, 1, 1, 1, 1]
            }
        },
        note: ""
    }
    const BAUVkt : types.VehicleKilometresTravelledComputed = {
        "NMT": [1000, 1000, 1000, 1000, 1000, 1000],
        "Private car": [200000, 200000, 200000, 200000, 200000, 200000],
        "Minibus": [2000, 3077, 3927, 5013, 6098, 7434],
        "Metro": [300, 300, 300, 300, 300, 300],
        "Cargo": [1,1,1,1,1,1],
        "LCV": [100,100,100,100,100,100],
        "Truck": [100,100,100,100,100,100],
    }
    const inputAdditionalVkt : types.InputClimateWithoutUpstreamStep2 = {
        vtypes: {
            "NMT": {
                source: "",
                addedVkt: [1000, 0, 0, 0, 0].map(e => e.toString())
            },
            "Minibus": {
                source: "",
                addedVkt: [0, 100, 50, 0, 30].map(e => e.toString())
            },
            "Metro": {
                source: "",
                addedVkt: [100, 100, 110, 120, 130].map(e => e.toString())
            },
            "Cargo": {
                source: "",
                addedVkt: [50, 50, 50, 50, 50].map(e => e.toString())
            }
        },
        note: ""
    }
    const inputOccupancyRate : types.InputClimateWithoutUpstreamStep3 = {
        vtypes: {
            "Minibus": {
                source: "",
                load: [8.1, 7.9, 8, 8, 8].map(e => e.toString())
            },
            "Metro": {
                source: "",
                load: [210, 220, 230, 240, 240].map(e => e.toString())
            }
        },
        note: ""
    }
    const vehicleStats : types.VehicleStats = {
        "NMT": {"occupancy": 1, triplength: 1, network: "rail", type: "private transport"},
        "Private car": {"occupancy": 1, triplength: 5, network: "road", type: "private transport"},
        "Minibus": {"occupancy": 8, triplength: 10, network: "road", type: "public transport"},
        "Metro": {"occupancy": 200, triplength: 10, network: "rail", type: "public transport"},
        "Cargo": {"occupancy": 0.1, triplength: 1, network: "road", type: "freight"},
        "LCV": {"occupancy": 10, triplength: 1, network: "road", type: "freight"},
        "Truck": {"occupancy": 20, triplength: 1, network: "road", type: "freight"},
    }
    const inputOriginModeMatrix : types.OriginModeMatrix = {
        "Minibus": {
            "NMT": {source: '', value: [100,100,50,100,25].map(e=>e.toString())},
            "Private car": {source: '', value: [0,0,50,0,75].map(e=>e.toString())}
        },
        "NMT": {
            "Private car": {source: '', value: [100,100,100,100,100].map(e=>e.toString())}
        },
        "Metro": {
            "Private car": {source: '', value: [100,100,100,100,100].map(e=>e.toString())}
        },
        "Cargo": {
            "LCV": {source: '', value: [50,50,50,50,50].map(e=>e.toString())},
            "Truck": {source: '', value: [50,50,50,50,50].map(e=>e.toString())},
        }
    }
    const baseVkt = models.computeVktAfterASI(
        referenceYears,
        inputAvoidedVkt,
        BAUVkt,
        inputAdditionalVkt,
        inputOccupancyRate,
        vehicleStats,
        inputOriginModeMatrix,
    )
    const modalShare = models.computeScenarioModalShare(referenceYears, baseVkt, inputOccupancyRate, vehicleStats)
    console.log(modalShare)
    expect(modalShare.passengers['NMT'].map(e => parseFloat(e.toFixed(3)))).toEqual([0.004,0.006,0.006,0.005,0.005,0.005])
    expect(modalShare.passengers['Private car'].map(e => parseFloat(e.toFixed(3)))).toEqual([0.722,0.619,0.514,0.396,0.271,0.162])
    expect(modalShare.passengers['Minibus'].map(e => parseFloat(e.toFixed(3)))).toEqual([0.058, 0.079, 0.102, 0.131, 0.157, 0.187])
    expect(modalShare.passengers['Metro'].map(e => parseFloat(e.toFixed(3)))).toEqual([0.217,0.295,0.379,0.468,0.567,0.646])
    expect(modalShare.freight['Cargo'].map(e => parseFloat(e.toFixed(3)))).toEqual([0.000, 0.002, 0.003, 0.005, 0.007, 0.008])
    expect(modalShare.freight['LCV'].map(e => parseFloat(e.toFixed(3)))).toEqual([0.333, 0.332, 0.332, 0.331, 0.330, 0.329])
    expect(modalShare.freight['Truck'].map(e => parseFloat(e.toFixed(3)))).toEqual([0.667, 0.666,0.665,0.664,0.663,0.662])
})

