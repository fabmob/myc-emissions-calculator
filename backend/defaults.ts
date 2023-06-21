import {EmissionsFactors} from './types'

export const energyAndEmissionsDefaultValues: EmissionsFactors = {
    "WTW": {
        "Gasoline": {lowerHeatingValue: "43.2", density: "0.745", pci: "32.184", ges: "89400", source: ''},
        "Diesel": {lowerHeatingValue: "43.1", density: "0.832", pci: "35.8592", ges: "90400", source: ''},
        "CNG": {lowerHeatingValue: "45.1", density: "1", pci: "45.1", ges: "68100", source: ''},
        "LPG": {lowerHeatingValue: "46", density: "0.522193211488251", pci: "24.020887728", ges: "75300", source: ''},
        "LNG": {lowerHeatingValue: "45.1", density: "0.39", pci: "17.589", ges: "80270", source: ''},
        "Hybrid": {lowerHeatingValue: "43.2", density: "0.745", pci: "32.184", ges: "89400", source: ''},
        "Electric": {lowerHeatingValue: "3.6", density: "1", pci: "3.6", ges: "0", source: ''},
        "Hydrogen": {lowerHeatingValue: "119.88", density: "1", pci: "119.88", ges: "132900", source: ''},
        "None": {lowerHeatingValue: "0", density: "0", pci: "0", ges: "0", source: ''}
    },
    "TTW": {
        "Gasoline": {lowerHeatingValue: "43.2", density: "0.745", pci: "32.184", ges: "75200", source: ''},
        "Diesel": {lowerHeatingValue: "43.1", density: "0.832", pci: "35.8592", ges: "74500", source: ''},
        "CNG": {lowerHeatingValue: "45.1", density: "1", pci: "45.1", ges: "59400", source: ''},
        "LPG": {lowerHeatingValue: "46", density: "0.522193211488251", pci: "24.020887728", ges: "67300", source: ''},
        "LNG": {lowerHeatingValue: "45.1", density: "0.39", pci: "17.589", ges: "59420", source: ''},
        "Hybrid": {lowerHeatingValue: "43.2", density: "0.745", pci: "32.184", ges: "75200", source: ''},
        "Electric": {lowerHeatingValue: "3.6", density: "1", pci: "3.6", ges: "0", source: ''},
        "Hydrogen": {lowerHeatingValue: "119.88", density: "1", pci: "119.88", ges: "0", source: ''},
        "None": {lowerHeatingValue: "0", density: "0", pci: "0", ges: "0", source: ''}
    }
}