export type NbPop = number & {}  // Population number
export type MrdUsd = number & {}
export type Percent = number & {}
export type MillPersonKm = number & {}
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

export type date = 2020 | 2025 | 2030 | 2040 | 2050

export enum VehicleType {
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
export const VehicleTypeArray = Object.keys(VehicleType)

// valeur: mil km / year
export type VehicleKilometresTravelled = {
    [key in VehicleType]?: {vkt: MillKmPerYear, vktRate: YearlyGrowth}
}

export type VehicleKilometresTravelledComputed = {
    [key in VehicleType]: YearlyValues<MillKm>
}

export type VehicleStats = {
    [key in VehicleType]?: {
        occupancy: UsersPerVehicle, // passagers / vehicle ou tonnes / vehicles
        tripLength: Km // km
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

export type VktPerFuel = {
    [key in VehicleType]?: {
        [key in FuelType]?: YearlyValues<Percent> // %
    }
}

export type VktPerFuelComputed = {
    [key in VehicleType]?: {
        [key in FuelType]?: YearlyValues<MillKm> // km
    }
}

export type TransportPerformance = {
    [key in VehicleType]?: {
        [key in FuelType]?: YearlyValues<MillPersonKm> // mill pkm
    }
}

export type ModalShare = {
    [key in VehicleType]?: YearlyValues<Part>
}
export type SumsPerVehicleType = {
    [key in VehicleType]?: YearlyValues<MillPersonKm>
}

export type AverageEnergyConsumption = {
    [key in VehicleType]?: {
        [key in FuelType]?: YearlyValues<UnitPerHundredKm>
    }
}

export type AnnualChange = {
    [key in VehicleType]?: {
        [key in FuelType]?: YearlyValues<Percent> // %
    }
}

export type AverageEnergyConsumptionComputed = {
    [key in VehicleType]?: {
        [key in FuelType]?: YearlyValues<UnitPerHundredKm>
    }
}

export type TotalEnergyAndEmissions = {
    [key in VehicleType]: {
        [key in FuelType]?: {
            energie: YearlyValues<Tj>,
            co2: YearlyValues<MilTons>
        }
    }
}
export type SumTotalEnergyAndEmissions = {
    [key in VehicleType]: {
        energie: YearlyValues<Tj>,
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
    projectLocation: string,
    partnerLocation: string,
    projectArea: string,
    projectReferenceYear: string
}
