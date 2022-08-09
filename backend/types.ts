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
export type MilTons = number & {} // l-kW-kg / 100 km

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

export type VehicleKilometresTravelledComputed = {
    [key: string]: YearlyValues<MillKm>
}

export type VehicleStats = {
    [key: string]: {
        occupancy: UsersPerVehicle // passagers / vehicle ou tonnes / vehicles
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
export type EnergyAndEmissionsDefaultValues = {
    [key in FuelType]?: {
        pci: number,
        ges: YearlyValues<number>
    }
}

export type Project = {
    projectName: string,
    isSump: boolean,
    projectCountry: string,
    projectCity: string,
    partnerLocation: string,
    projectArea: string,
    projectReferenceYears: [number, number, number, number, number, number]
}
