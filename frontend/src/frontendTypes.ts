export type ProjectType = {
    id: number,
    owner: string,
    name: string,
    location: string,
    partnerLocation: string,
    area: string,
    referenceYear: string,
    step: number,
    inputStep1?: InputStep1,
    inputStep2?: InputStep2,
    inputStep5?: InputStep5,
    outputSocioEconomicDataComputed?: {
        population: number[],
        gdp: number[]
    },
    outputModalShare?: {
        [key: string]: number[]
    },
    outputSumTotalEnergyAndEmissions?: {
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
    [key: string]: boolean
}

export type InputStep3 = {
    [key: string]: {
        vkt: string,
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
