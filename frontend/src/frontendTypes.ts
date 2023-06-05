export type ProjectStage = "Inventory" | "BAU" | "Scenario"
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