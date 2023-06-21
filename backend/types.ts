export type NbPop = number & {}  // Population number
export type MrdUsd = number & {}
export type Percent = number & {}
export type MillUnitKm = number & {} // unit can be passengers or tons
export type MillKmPerYear = number & {}
export type MillKm = number & {}
export type Km = number & {}
export type UsersPerVehicle = number & {}
export type Part = number & {} // [0:1]
export type UnitPerHundredKm = number & {} // l-kW-kg / 100 km
export type Tj = number & {} // l-kW-kg / 100 km
export type MilTons = number & {} // // mton CO2e

export interface SocioEconomicData {
    population: NbPop,
    populationRate: YearlyValues<Percent>,
    gdp: MrdUsd, // Produit interieur brut, Mrd USD
    gdpRate: YearlyValues<Percent>,
}

export type YearlyValues<Type> = Type[]

export interface SocioEconomicDataComputed {
    population: YearlyValues<NbPop>
    gdp: YearlyValues<MrdUsd>
}

export type YearlyGrowth = YearlyValues<Percent>

// valeur: mil km / year
export type VehicleKilometresTravelled = {
    [key: string]: {vkt: MillKmPerYear, vktRate: YearlyGrowth}
}
export type InputStep2 = {
    [key: string]: {isActive: boolean, isFreight: boolean}
}
export type VehicleKilometresTravelledComputed = {
    [key: string]: YearlyValues<MillKm>
}

export type VehicleStats = {
    [key: string]: {
        occupancy: UsersPerVehicle // passagers / vehicle ou tonnes / vehicles,
        triplength: number
        network: "road" | "rail",
        type: "freight" | "private transport" | "public transport"
    }
}

export enum FuelType {
    "Gasoline" = "Gasoline",
    "Diesel" = "Diesel",
    "LPG" = "LPG",
    "CNG" = "CNG",
    "LNG" = "LNG",
    "Hybrid" = "Hybrid",
    "Electric" = "Electric",
    "Hydrogen" = "Hydrogen",
    "None" = "None"
}

export type VktPerFuel = {
    [key: string]: {
        [key in FuelType]?: YearlyValues<Percent> // %
    }
}

export type VktPerFuelComputed = {
    [key: string]: {
        [key in FuelType]?: YearlyValues<MillKm> // km
    }
}

export type TransportPerformance = {
    [key: string]: YearlyValues<MillUnitKm> // mill pkm or mill tkm
}

export type ModalShare = {
    [key: string]: YearlyValues<Part>
}
export type SumsPerVehicleType = {
    [key: string]: YearlyValues<MillUnitKm>
}

export type AverageEnergyConsumption = {
    [key: string]: {
        [key in FuelType]?: YearlyValues<UnitPerHundredKm>
    }
}

export type AnnualChange = {
    [key: string]: {
        [key in FuelType]?: YearlyValues<Percent> // %
    }
}

export type AverageEnergyConsumptionComputed = {
    [key: string]: {
        [key in FuelType]?: YearlyValues<UnitPerHundredKm>
    }
}

export type TotalEnergyAndEmissions = {
    [key: string]: {
        [key in FuelType]?: {
            energy: YearlyValues<Tj>,
            co2: YearlyValues<MilTons>
        }
    }
}
export type SumTotalEnergyAndEmissions = {
    [key: string]: {
        energy: YearlyValues<Tj>,
        co2: YearlyValues<MilTons>
    }
}
type EmissionParams = {
    lowerHeatingValue: string,
    density: string,
    pci: string,
    ges: string,
    source?: string
}
export type EnergyAndEmissionsDefaultValues = {
    [key in FuelType]: EmissionParams
} & {
    ElectricRail?: EmissionParams,
    ElectricRoad?: EmissionParams
}

export type EnergyBalance = {
    passengers: {
        [key in FuelType]?: number
    },
    freight: {
        [key in FuelType]?: number
    }
}

export type Project = {
    projectName: string,
    createdDate: Date,
    modifiedDate: Date,
    isSump: boolean,
    projectCountry: string,
    projectCity: string,
    partnerLocation: string,
    projectArea: string,
    projectReferenceYears: number[]
}

export type ProjectStage = "Inventory" | "BAU" | "Climate"

export type AvoidedMotorisedVkt = {
    [key: string]: YearlyValues<Percent>
}
export type OccupancyRate = {
    [key: string]: YearlyValues<UsersPerVehicle>
}
export type OriginModeMatrix = {
    [key: string]: { // vtype goal
        [key: string]: {
            source: string
            value: YearlyValues<string> // vtype origin : Yearly vals
        }
    }
}


export type InputInventoryStep1 = {
    vtypes: {
        [key: string]: {
            network: "road" | "rail",
            type: "freight" | "public transport" | "private transport",
            fuels: {[key in FuelType]?: boolean}
        }
    },
    note: string | undefined
}
export type InputInventoryStep2 = {
    vtypes: {
        [vtype: string]: {
            vkt: string,
            vktSource: string
            fuels: {
                [key in FuelType]?: {
                    percent: string,
                    percentSource: string
                }
            },
            fleetStock: string,
            fleetMileage: string
        }
    },
    note: string | undefined
}
export type InputInventoryStep3 = {
    vtypes: {
        [vtype: string]: {
            fuels: {
                [key in FuelType]?: {
                    cons: string,
                    consSource: string
                }
            }
        }
    },
    note: string | undefined
}
export type InputInventoryStep4 = {
    road: {
        source: string | undefined,
        value: string
    },
    rail: {
        source: string | undefined,
        value: string
    },
    note: string | undefined
}

type ClassicFuels = {
    fuels: {
        [key in FuelType]?: {
            source: string,
            value: string
        }
    }
}
type TopDownSubType = {
    road: ClassicFuels,
    rail: ClassicFuels
}
export type InputInventoryStep5 = {
    energy: TopDownSubType,
    emissions: TopDownSubType,
    note: string | undefined
}
export type InputInventoryStep6 = {
    vtypes: {
        [key: string]: {
            source: string,
            value: string // occupancy or
        }
    },
    note: string | undefined
}
export type EmissionsFactors = {
    "WTW": EnergyAndEmissionsDefaultValues,
    "TTW": EnergyAndEmissionsDefaultValues
}
export type InputInventoryStep7 = {
    emissionFactors: EmissionsFactors,
    note: string | undefined
}
export type InputInventoryStep8 = {
    vtypes: {
        [key: string]: {
            source: string,
            value: string // trip len
        }
    },
    note: string | undefined
}
export type InputBAUStep1 = {
    vtypes: {
        [key: string]: {
            source: string,
            vktRate: YearlyValues<Percent>
        }
    },
    note: string | undefined
}
export type InputBAUStep2 = {
    vtypes: {
        [vtype: string]: {
            fuels: {
                [key in FuelType]?: {
                    percent: string[],
                    percentSource: string
                }
            }
        }
    },
    note: string | undefined
}
export type InputBAUStep3 = {
    vtypes: {
        [vtype: string]: {
            fuels: {
                [key in FuelType]?: {
                    cons: string[],
                    consSource: string
                }
            }
        }
    },
    note: string | undefined
}
export type InputBAUStep4 = {
    road: {
        source: string,
        value: string[]
    },
    rail: {
        source: string,
        value: string[]
    },
    note: string | undefined
}
export type InputClimateWithUpstreamStep1 = {
    vtypes: {
        [key: string]: {
            source: string,
            vkt: YearlyValues<string>
        }
    },
    note: string | undefined
}

export type InputClimateWithUpstreamStep2 = {
    vtypes: {
        [key: string]: {
            source: string,
            ukm: YearlyValues<string>
        }
    },
    note: string | undefined
}
export type InputClimateWithoutUpstreamStep1 = {
    vtypes: {
        [key: string]: {
            source: string,
            avoidedVkt: YearlyValues<Percent>
        }
    },
    note: string | undefined
}

export type InputClimateWithoutUpstreamStep2 = {
    vtypes: {
        [key: string]: {
            source: string,
            addedVkt: YearlyValues<string>
        }
    },
    note: string | undefined
}
export type InputClimateWithoutUpstreamStep3 = {
    vtypes: {
        [key: string]: {
            source: string,
            load: YearlyValues<string>
        }
    },
    note: string | undefined
}
export type InputClimateWithoutUpstreamStep4 = {
    vtypes: OriginModeMatrix,
    note: string | undefined
}
// Scenario types
// With upstream calculations
    // First table:
    // TransportPerformance (1) (without ref year)

    // Second table:
    // VehicleKilometresTravelledComputed (without ref year)

    // Viz: modal split (Million pkm / vtype), using bau data (pkm = vkt*occupancy) for ref year, and TransportPerformance (1) for the rest
    // $'4B Calcul. Climat Scen.'.$G$254:$L$266,$'4B Calcul. Climat Scen.'.$D$255:$D$266
    // Graph is a percent stacked, so computation is needed

// Without
    // Avoid
    // First table: vkt per vtype (project.vehicleKilometresTravelledComputed)

    // Second table (input): % avoid per vtype (without ref year)
    // export type AvoidedMotorisedVkt = {
    //     [key: string]: YearlyValues<Percent>
    // }

    // third table: computation of 2 previous ones, some UI could be done type: VehicleKilometresTravelledComputed
    // Note: strangely, avoid has an impact in future years as well, reducing 100% in the first years, means 0 for all following years
    // This seems hard to understand to me, or is it ?

    // Shift
    // Table 1: base vkt (project.vehicleKilometresTravelledComputed, without personal transport)
    // NOTE: this requires a new input: is the vtype public transport ?
    // OR, could we ignore that and allow adding ANY additional vkt ? I'm wondering for measures like "free electrics cars" would increase car usage but reduce co2 compared to buses

    // Table 2: additional vkt input (VehicleKilometresTravelledComputed, without personal transport)

    // Table 3: updated occupancy rate, filled with project step 4 (type: VehicleStats)
    // Also input table of occupancy per year
    // export type OccupancyRate = {
    //     [key: string]: YearlyValues<UsersPerVehicle>
    // }
    // Note: additional pkm is computed as: "additional vkt input" * "new occupancy" if both are defined
    // If we only have "additional vkt input", it is "additional vkt input" * "old occupancy"
    // If we only have "new occupancy", it is "old vkt" * "new occupancy" - "old pkm"
    // If we have neither, it's 0
    // Note: new transport performance is simply "old pkm" + "additional pkm"

    // Table 4: "the big one": input repartition of sources for additional vkt
    // This clearly needs an interactive UI, bounding acceptable percent and precising target goals
    // In the excel it's not very clear when errors happens: 100% of 10M additional bus pkm coming from cars requires 10M pkm avaible on cars to begin with
    // And this after occupancy calculation AND avoidance ..
    // The only displayed data is av BAU trip length ... which I don't see being usefull
    // Without UI changes the table can follow this type spec:
    // export type OriginModeMatrix = {
    //     [key: string]: { // vtype goal
    //         [key: string]?: YearlyValues<Percent> // vtype origin : Yearly vals
    //     }
    // }

// Results
// Table 1: Scenario vkt (type: VehicleKilometresTravelledComputed)
// Computed as: 0 if no occupancy data, 
// Otherwise: pkm (see table2) / occupancy

// Table 2: Scenario transport performance (type TransportPerformance)
// With upstream calculation:
// computed as: 
// af95 + J124 - R146
// if "transport performance" then "transport performance"
// else : "pkm after avoid" + "additional pkm" - "reduced pkm"
// ("avoid vkt" * "occupancy") + "additional pkm" - "sum of reduced pkm for each source"
// ("avoid vkt" * "transport performance" (0?) / "VehicleKilometresTravelledComputed") 
// + "additional pkm (0?)" 
// - ("additional pkm(goalvtype)" * "av BAU trip length(orgvtype)" * "originmatrix(goalvtype,orgvtype)%" / sum("av BAU trip length(orgvtype)" * "originmatrix(goalvtype,orgvtype)%")
// pseudo code for reduce pkm:
    // reduced_pkm = 0
    // for (goalvtype in goalvtypes) {
    //     totalpkmreducedforgoalvtype = 0
    //     for (orgvtype in orgvtypes) {
    //         totalpkmreducedforgoalvtype += avBAUtripLength[orgvtype] * originmatrix(goalvtype,orgvtype)
    //     }
    //     for (orgvtype in orgvtypes) {
    //         reduced_pkm += additionalpkm[goalvtype] * avBAUtripLength[orgvtype] * originmatrix(goalvtype,orgvtype) / totalpkmreducedforgoalvtype
    //     }
    // }
// I'm a bit confused, because it looks to be zero no matter what in upstream calculation when transport performance is not set, so all this computation is useless

// Without upstream calculation:
// computed as:
// same way, except "occupancy" is W256
// =IF(AB71="", // occupancy in upstream data (pkm / vkt)
//     IF(ISERROR(VLOOKUP(D256,C135:C142,1,0)), // vtype is not a shiftable vtypes (public transport)
//         SUMIF(K95:K106,D256,T95:T106), // Use BAU occupancy
//         IF(SUMIF(C135:C142,Q162,D135:D142)>0, // vtype occupancy has changed for this year
//             SUMIF(C135:C142,Q162,D135:D142), // use new occupancy value
//             SUMIF(K95:K106,D256,T95:T106)) // Use BAU occupancy
//     ),
//     SUMIF(D70:D81,D256,AB70:AB81) // occupancy in upstream data
// )
// In english : use new occupancy if set, BAU occupancy otherwise.


// Improve: Penetration of alternatives energies
// %vkt per ftype per vtype
    // for BAU
    // computed using total vkt per vtype / vkt per ftype&vtype
    // So it's: for each vtype, which % of vkt is used by a ftype
    // which is exactly the same values as the InputStep6, computation is useless

    // for climate, same input as inputStep6, without ref year

// Computed table: vkt by fuel climate scenario (mio. km)
// same as computeVktPerFuel

// Improve: Adjusment of fuel/energy consumption
// Bau is using results from Inputstep7
// Input is the same as inputstep7, without ref year
// computed table is total TJ, which should be the same as computeTotalEnergyAndEmissions

// Top overview
    // Sceniario vkt (milkm): total vkt bau + scenario, should be pretty easy
    // GHG emission reduction: graph is non-standard
        // for BAU: outputComputeTotalEnergyAndEmissionsWTW
        // for Climate : computed the same way, with result from total TJ

// Overview
    // Table 1 : total GHG by CRF code IPCC categories
        // NOTE: This requires a new input: which category does the vtype fit in
        // Then it's just a simple sum by category
    // Graph 1 : associated pie chart to table 1
    // Table 2 : total ghg BAU, so outputComputeTotalEnergyAndEmissionsWTW summed (note: divided between passengers, freight and summed)
    // Table 3 : total ghg Scenario, same
    // Table 4 : percent diff between the two last tables
    // Graph 2 : associated bar chart to tables 2 & 3 (maybe 4 ?)
    // Graph 3 : Bar chart with cumulated values for each year. 
        // Smoothing needed on each interval year, e.g. 2025 100 to 2023 50 must include 2024 75