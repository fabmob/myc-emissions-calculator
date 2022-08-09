export type ProjectType = {
    id: number,
    owner: string,
    name: string,
    isSump: boolean,
    city: string,
    country: string,
    partnerLocation: string,
    area: string,
    referenceYears: [number, number, number, number, number, number],
    step: number,
    steps: any[],
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
    }
}

export enum FuelType {
    "Gasoline" = "Gasoline",
    "Diesel" = "Diesel",
    "LPG" = "LPG",
    "NG" = "NG",
    "Hybrid" = "Hybrid",
    "Electric" = "Electric",
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

export type EmissionsFactors = {
    "WTW": {
        [key in FuelType]: {
            lowerHeatingValue: string,
            density: string,
            pci: string,
            ges: string[]
        }
    },
    "TTW": {
        [key in FuelType]: {
            lowerHeatingValue: string,
            density: string,
            pci: string,
            ges: string[]
        }
    }
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
