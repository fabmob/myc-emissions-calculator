export type ProjectStage = "Inventory" | "BAU" | "Climate"
export type ProjectType = {
    id: number,
    createdDate: Date,
    modifiedDate: Date,
    owner: string,
    name: string,
    isSump: boolean,
    city: string,
    country: string,
    partnerLocation: string,
    area: string,
    referenceYears: number[],
    sources: {
        projectId: number,
        sourceId: number,
        value: string
    }[],
    stages: {
        [stage in ProjectStage]: {
            steps: any[],
            step: number
        }[]
    },
    status: 'draft' | 'validated',
    outputSocioEconomicDataComputed?: {
        population: number[],
        gdp: number[]
    },
    outputPassengersModalShare?: {
        [key: string]: number[]
    },
    outputFreightModalShare?: {
        [key: string]: number[]
    },
    outputSumTotalEnergyAndEmissionsWTW?: {
        [key: string]: {
            co2: number[],
            energy: number[],
        }
    },
    outputSumTotalEnergyAndEmissionsTTW?: {
        [key: string]: {
            co2: number[],
            energy: number[],
        }
    },
    vehicleKilometresTravelledComputed?: {
        [key: string]: number[]
    },
    outputEnergyBalance?: {
        passengers: {
            [key in FuelType]?: number
        },
        freight: {
            [key in FuelType]?: number
        }
    }
}
export type YearlyValues<Type> = Type[]
export type Tj = number & {} // l-kW-kg / 100 km
export type MilTons = number & {} // mton CO2e
export type TotalEnergyAndEmissions = {
    [key: string]: {
        [key in FuelType]?: {
            energy: YearlyValues<Tj>,
            co2: YearlyValues<MilTons>
        }
    }
}
export type Part = number & {} // [0:1]
export type ModalShare = {
    [key: string]: YearlyValues<Part>
}
export enum FuelType {
    "Gasoline" = "Gasoline",
    "Hybrid" = "Hybrid",
    "Diesel" = "Diesel",
    "CNG" = "CNG",
    "LPG" = "LPG",
    "LNG" = "LNG",
    "Electric" = "Electric",
    "Hydrogen" = "Hydrogen",
    "None" = "None"
}

export type InputStep1 = {
    population: string,
    populationRate: string[],
    populationSource: string,
    gdp: string,
    gdpRate: string[],
    gdpSource: string,
    populationGrowthSource: string,
    gdpGrowthSource: string
}

export type InputStep2 = {
    [key: string]: {isActive: boolean, isFreight: boolean}
}

export type InputStep3 = {
    [key: string]: {
        vkt: string,
        vehicleStock: string,
        averageMileage: string,
        vktRate: string[]
    } | string
}

export type InputStep4 = {
    [key: string]: {
        occupancy: string
    } | string
}

export type InputStep5 = {
    [key: string]: {
        [key in FuelType]: boolean
    } | string
}
export type EmissionParams = {
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
export type EmissionsFactors = {
    "WTW": EnergyAndEmissionsDefaultValues,
    "TTW": EnergyAndEmissionsDefaultValues
}

export type InputStep6 = {
    [key: string]: {
        [key in FuelType]: string[]
    }  | string
}

export type InputStep7 = {
    [key: string]: {
        [key in FuelType]: string[]
    } | string
}

export type InputTopDown = {
    passengers: {
        [key in FuelType]: {toe: string, source: string}
    },
    freight: {
        [key in FuelType]: {toe: string, source: string}
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
type NetworksData = {
    road: {
        source: string | undefined,
        value: string
    },
    rail: {
        source: string | undefined,
        value: string
    }
}
export type InputInventoryStep4 = {
    electricity: NetworksData,
    hydrogen: NetworksData,
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

export type Percent = string
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
type NetworksYearlyData = {
    road: {
        source: string | undefined,
        value: string[]
    },
    rail: {
        source: string | undefined,
        value: string[]
    }
}
export type InputBAUStep4 = {
    electricity: NetworksYearlyData,
    hydrogen: NetworksYearlyData,
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
export type OriginModeMatrix = {
    [key: string]: { // vtype goal
        [key: string]: {
            source: string
            value: YearlyValues<Percent> // vtype origin : Yearly vals
        }
    }
}
export type InputClimateWithoutUpstreamStep4 = {
    vtypes: OriginModeMatrix,
    note: string | undefined
}


export type MillKm = number & {}
export type VehicleKilometresTravelledComputed = {
    [key: string]: YearlyValues<MillKm>
}
export type MillUnitKm = number & {} // unit can be passengers or tons
export type TransportPerformance = {
    [key: string]: YearlyValues<MillUnitKm> // mill pkm or mill tkm
}
export type AvoidedMotorisedVkt = {
    [key: string]: YearlyValues<Percent>
}
export type UsersPerVehicle = number & {}
export type VehicleStats = {
    [key: string]: {
        occupancy: UsersPerVehicle // passagers / vehicle ou tonnes / vehicles,
        triplength: number
        network: "road" | "rail",
        type: "freight" | "private transport" | "public transport"
    }
}
export type OccupancyRate = {
    [key: string]: YearlyValues<UsersPerVehicle>
}

export type EmissionsResults = {
    emissions: {"TTW": {[key: string]: {co2: number[], energy: number[]}}, "WTW": {[key: string]: {co2: number[], energy: number[]}}},
    vkt: VehicleKilometresTravelledComputed,
    modalShare: {
        passengers: ModalShare,
        freight: ModalShare
    }
}