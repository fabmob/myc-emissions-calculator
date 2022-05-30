export type ProjectType = {
    id: number,
    owner: string,
    name: string,
    location: string,
    partnerLocation: string,
    area: string,
    referenceYear: string,
    inputStep1?: InputStep1,
    inputStep2?: InputStep2,
    inputStep5?: InputStep5,
    outputSocioEconomicDataComputed?: {
        population: number[],
        gdp: number[]
    },
    outputModalShare?: {
        [key in VehiculeType]?: number[]
    },
    outputSumTotalEnergyAndEmissions?: {
        [key in VehiculeType]?: {
            co2: number[],
            energie: number[],
        }
    },
    vehiculeKilometresTravelledComputed?: {
        [key in VehiculeType]?: number[]
    }
}

export enum VehiculeType {
    "Non motorized vehicle" = "Non motorized vehicle",
    "Private car" = "Private car",
    "Individual taxi" = "Individual taxi",
    "Motorcycle" = "Motorcycle",
    "Motorcycle taxi" = "Motorcycle taxi",
    "Minibus" = "Minibus",
    "Bus" = "Bus",
    "Bus rapid transit" = "Bus rapid transit",
    "Very light commercial vehicle" = "Very light commercial vehicle",
    "Light commercial vehicle" = "Light commercial vehicle",
    "Solo truck" = "Solo truck",
    "Articulated truck" = "Articulated truck",
    "Long distance train" = "Long distance train",
    "Urban train" = "Urban train",
    "Metro" = "Metro",
    "Freight train" = "Freight train"
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
    population: number,
    populationRate: number[],
    populationSource: string,
    gdp: number,
    gdpRate: number[],
    gdpSource: string
}

export type InputStep2 = {
    [key in VehiculeType]?: boolean
}

export type InputStep3 = {
    [key in VehiculeType]?: {
        vkt: number,
        vktRate: number[]
    }
} & {vktSource: string}


export type InputStep4 = {
    [key in VehiculeType]?: {
        occupancy: number,
        tripLength: number
    }
} & {source: string}

export type InputStep5 = {
    [key in VehiculeType]?: {
        [key in FuelType]: boolean
    }
} & {source: string}

export type InputStep6 = {
    [key in VehiculeType]?: {
        [key in FuelType]: number[]
    }
} & {source: string}

export type InputStep7 = {
    [key in VehiculeType]?: {
        [key in FuelType]: number[]
    }
} & {source: string}
