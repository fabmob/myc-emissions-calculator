import { FuelType, InputBAUStep1, InputBAUStep2, InputBAUStep3, InputBAUStep4, InputClimateWithUpstreamStep1, InputClimateWithUpstreamStep2, InputClimateWithoutUpstreamStep1, InputClimateWithoutUpstreamStep2, InputClimateWithoutUpstreamStep3, InputClimateWithoutUpstreamStep4, InputInventoryStep2, InputInventoryStep3, InputInventoryStep4, InputInventoryStep5, InputInventoryStep6, InputInventoryStep8, ProjectStage, ProjectType } from "../frontendTypes"

export function inputsAsCsv (project: ProjectType, stage: ProjectStage) : string[][]  {
    let csv : string[][] = []
    let vtypes = Object.keys(project?.stages?.Inventory?.[0]?.steps?.[1]?.vtypes || {})
    if (stage === "Inventory" && project?.stages?.Inventory) {
        csv.push(["dataType", "stage", "stepNumber", "stepDescription", "vehicle", "fuel", "network", "value", "source"])
        const inputInventoryStep2: InputInventoryStep2 = project?.stages?.Inventory?.[0]?.steps?.[2]
        if (!inputInventoryStep2) return csv
        for (let i = 0; i < vtypes.length; i++) {
            const vtype = vtypes[i]
            csv.push(["input", "Inventory", "2", "vkt", vtype, "", "", inputInventoryStep2.vtypes[vtype].vkt, inputInventoryStep2.vtypes[vtype].vktSource])
            if (inputInventoryStep2.vtypes[vtype].fleetStock) {
                csv.push(["input", "Inventory", "2", "Fleet Stock", vtype, "", "", inputInventoryStep2.vtypes[vtype].fleetStock, inputInventoryStep2.vtypes[vtype].vktSource])
                csv.push(["input", "Inventory", "2", "Fleet Mileage", vtype, "", "", inputInventoryStep2.vtypes[vtype].fleetMileage, inputInventoryStep2.vtypes[vtype].vktSource])
            }
            const ftypes = Object.keys(inputInventoryStep2.vtypes[vtype].fuels)
            for (let j = 0; j < ftypes.length; j++) {
                const ftype = ftypes[j] as FuelType
                csv.push(["input", "Inventory", "2", "Fuel part", vtype, ftype, "", inputInventoryStep2.vtypes[vtype].fuels[ftype]!.percent, inputInventoryStep2.vtypes[vtype].fuels[ftype]!.percentSource])
            }
        }
        const inputInventoryStep3: InputInventoryStep3 = project?.stages?.Inventory?.[0]?.steps?.[3]
        if (!inputInventoryStep3) return csv
        for (let i = 0; i < vtypes.length; i++) {
            const vtype = vtypes[i]
            const ftypes = Object.keys(inputInventoryStep3.vtypes[vtype].fuels)
            for (let j = 0; j < ftypes.length; j++) {
                const ftype = ftypes[j] as FuelType
                csv.push(["input", "Inventory", "3", "Fuel consumption", vtype, ftype, "", inputInventoryStep3.vtypes[vtype].fuels[ftype]!.cons, inputInventoryStep3.vtypes[vtype].fuels[ftype]!.consSource])
            }
        }
        const inputInventoryStep4: InputInventoryStep4 = project?.stages?.Inventory?.[0]?.steps?.[4]
        if (!inputInventoryStep4) return csv
        csv.push(["input", "Inventory", "4", "Alternative Energy production cost", "", "electricity", "rail", inputInventoryStep4.electricity.rail.value, inputInventoryStep4.electricity.rail.source || ''])
        csv.push(["input", "Inventory", "4", "Alternative Energy production cost", "", "electricity", "road", inputInventoryStep4.electricity.road.value, inputInventoryStep4.electricity.road.source || ''])
        csv.push(["input", "Inventory", "4", "Alternative Energy production cost", "", "hydrogen", "rail", inputInventoryStep4.hydrogen.rail.value, inputInventoryStep4.hydrogen.rail.source || ''])
        csv.push(["input", "Inventory", "4", "Alternative Energy production cost", "", "hydrogen", "road", inputInventoryStep4.hydrogen.road.value, inputInventoryStep4.hydrogen.road.source || ''])
        
        const inputInventoryStep5: InputInventoryStep5 = project?.stages?.Inventory?.[0]?.steps?.[5]
        if (!inputInventoryStep5) return csv
        const networks : ("rail"|"road")[] = ["rail", "road"]
        for (let i = 0; i < networks.length; i++) {
            const network = networks[i]
            const ftypes = Object.keys(inputInventoryStep5.emissions[network].fuels)
            for (let j = 0; j < ftypes.length; j++) {
                const ftype = ftypes[j] as FuelType
                csv.push(["input", "Inventory", "5", "TopDown Emissions (1000t GHG)", "", ftype, network, inputInventoryStep5.emissions[network].fuels[ftype]!.value, inputInventoryStep5.emissions[network].fuels[ftype]!.source])
                csv.push(["input", "Inventory", "5", "TopDown Energy balance (1000 TOE)", "", ftype, network, inputInventoryStep5.energy[network].fuels[ftype]!.value, inputInventoryStep5.energy[network].fuels[ftype]!.source])
            }
        }

        const inputInventoryStep6: InputInventoryStep6 = project?.stages?.Inventory?.[0]?.steps?.[6]
        if (!inputInventoryStep6) return csv
        for (let i = 0; i < vtypes.length; i++) {
            const vtype = vtypes[i]
            csv.push(["input", "Inventory", "6", "load", vtype, "", "", inputInventoryStep6.vtypes[vtype].value, inputInventoryStep6.vtypes[vtype].source])
        }

        const inputInventoryStep8: InputInventoryStep8 = project?.stages?.Inventory?.[0]?.steps?.[8]
        if (!inputInventoryStep8) return csv
        vtypes = Object.keys(inputInventoryStep8?.vtypes || {})
        for (let i = 0; i < vtypes.length; i++) {
            const vtype = vtypes[i]
            csv.push(["input", "Inventory", "8", "trip length", vtype, "", "", inputInventoryStep8.vtypes[vtype].value, inputInventoryStep8.vtypes[vtype].source])
        }
    }
    if (stage === "BAU" && project?.stages?.BAU) {
        csv.push(["dataType", "stage", "stepNumber", "stepDescription", "vehicle", "fuel", "network", "source"].concat(project.referenceYears.slice(1).map(e => e.toString())))
        const inputBAUStep1 : InputBAUStep1 = project?.stages?.BAU?.[0]?.steps?.[1]
        vtypes = Object.keys(inputBAUStep1?.vtypes || {})
        for (let i = 0; i < vtypes.length; i++) {
            const vtype = vtypes[i]
            csv.push(["input", "BAU", "1", "vkt rate", vtype, "", "", inputBAUStep1.vtypes[vtype].source].concat(inputBAUStep1.vtypes[vtype].vktRate))
        }
        const inputBAUStep2 : InputBAUStep2 = project?.stages?.BAU?.[0]?.steps?.[2]
        vtypes = Object.keys(inputBAUStep2?.vtypes || {})
        for (let i = 0; i < vtypes.length; i++) {
            const vtype = vtypes[i]
            const ftypes = Object.keys(inputBAUStep2.vtypes[vtype].fuels)
            for (let j = 0; j < ftypes.length; j++) {
                const ftype = ftypes[j] as FuelType
                csv.push(["input", "BAU", "2", "Fuel part", vtype, ftype, "", inputBAUStep2.vtypes[vtype].fuels[ftype]!.percentSource].concat(inputBAUStep2.vtypes[vtype].fuels[ftype]!.percent))
            }
        }
        const inputBAUStep3 : InputBAUStep3 = project?.stages?.BAU?.[0]?.steps?.[3]
        vtypes = Object.keys(inputBAUStep3?.vtypes || {})
        for (let i = 0; i < vtypes.length; i++) {
            const vtype = vtypes[i]
            const ftypes = Object.keys(inputBAUStep3.vtypes[vtype].fuels)
            for (let j = 0; j < ftypes.length; j++) {
                const ftype = ftypes[j] as FuelType
                csv.push(["input", "BAU", "3", "Fuel consumption", vtype, ftype, "", inputBAUStep3.vtypes[vtype].fuels[ftype]!.consSource].concat(inputBAUStep3.vtypes[vtype].fuels[ftype]!.cons))
            }
        }

        const inputBAUStep4 : InputBAUStep4 = project?.stages?.BAU?.[0]?.steps?.[4]
        if (!inputBAUStep4) return csv
        csv.push(["input", "BAU", "4", "Alternative Energy production cost", "", "electricity", "rail", inputBAUStep4.electricity.rail.source || ''].concat(inputBAUStep4.electricity.rail.value))
        csv.push(["input", "BAU", "4", "Alternative Energy production cost", "", "electricity", "road", inputBAUStep4.electricity.road.source || ''].concat(inputBAUStep4.electricity.road.value))
        csv.push(["input", "BAU", "4", "Alternative Energy production cost", "", "hydrogen", "rail", inputBAUStep4.hydrogen.rail.source || ''].concat(inputBAUStep4.hydrogen.rail.value))
        csv.push(["input", "BAU", "4", "Alternative Energy production cost", "", "hydrogen", "road", inputBAUStep4.hydrogen.road.source || ''].concat(inputBAUStep4.hydrogen.road.value))
    }

    if (stage === "Climate" && project?.stages?.Climate) {
        csv.push(["dataType", "stage", "stageNumber", "stepNumber", "stepDescription", "vehicle", "originvehicle", "fuel", "source"].concat(project.referenceYears.slice(1).map(e => e.toString())))
        for (let i = 0; i < project.stages.Climate.length; i++) {
            const climateScenario = project.stages.Climate[i];
            if (climateScenario.steps[0].method === "Without") {
                // Without upstream
                const inputClimateWithoutUpstreamStep1 : InputClimateWithoutUpstreamStep1 = project.stages.Climate?.[i]?.steps?.[1]
                vtypes = Object.keys(inputClimateWithoutUpstreamStep1?.vtypes || {})
                for (let j = 0; j < vtypes.length; j++) {
                    const vtype = vtypes[j]
                    csv.push(["input", "Climate", i.toString(), "1", "Avoided vkt", vtype, "", "", inputClimateWithoutUpstreamStep1.vtypes[vtype].source].concat(inputClimateWithoutUpstreamStep1.vtypes[vtype].avoidedVkt))
                }
                const inputClimateWithoutUpstreamStep2 : InputClimateWithoutUpstreamStep2 = project.stages.Climate?.[i]?.steps?.[2]
                vtypes = Object.keys(inputClimateWithoutUpstreamStep2?.vtypes || {})
                for (let j = 0; j < vtypes.length; j++) {
                    const vtype = vtypes[j]
                    csv.push(["input", "Climate", i.toString(), "2", "Added vkt", vtype, "", "", inputClimateWithoutUpstreamStep2.vtypes[vtype].source].concat(inputClimateWithoutUpstreamStep2.vtypes[vtype].addedVkt))
                }
                const inputClimateWithoutUpstreamStep3 : InputClimateWithoutUpstreamStep3 = project.stages.Climate?.[i]?.steps?.[3]
                vtypes = Object.keys(inputClimateWithoutUpstreamStep3?.vtypes || {})
                for (let j = 0; j < vtypes.length; j++) {
                    const vtype = vtypes[j]
                    csv.push(["input", "Climate", i.toString(), "3", "Load", vtype, "", "", inputClimateWithoutUpstreamStep3.vtypes[vtype].source].concat(inputClimateWithoutUpstreamStep3.vtypes[vtype].load))
                }
                const inputClimateWithoutUpstreamStep4 : InputClimateWithoutUpstreamStep4 = project.stages.Climate?.[i]?.steps?.[4]
                vtypes = Object.keys(inputClimateWithoutUpstreamStep4?.vtypes || {})
                for (let j = 0; j < vtypes.length; j++) {
                    const vtype = vtypes[j]
                    const originvtypes = Object.keys(inputClimateWithoutUpstreamStep4.vtypes[vtype])
                    for (let k = 0; k < originvtypes.length; k++) {
                        const originvtype = originvtypes[k]
                        csv.push(["input", "Climate", i.toString(), "4", "Vehicle swap", vtype, originvtype, "", inputClimateWithoutUpstreamStep4.vtypes[vtype][originvtype].source].concat(inputClimateWithoutUpstreamStep4.vtypes[vtype][originvtype].value))
                    }
                }
                const inputClimateWithoutUpstreamStep5 : InputBAUStep2 = project.stages.Climate?.[i]?.steps?.[5]
                vtypes = Object.keys(inputClimateWithoutUpstreamStep5?.vtypes || {})
                for (let j = 0; j < vtypes.length; j++) {
                    const vtype = vtypes[j]
                    const ftypes = Object.keys(inputClimateWithoutUpstreamStep5.vtypes[vtype].fuels)
                    for (let k = 0; k < ftypes.length; k++) {
                        const ftype = ftypes[k] as FuelType
                        csv.push(["input", "Climate", i.toString(), "5", "Fuel part", vtype, "", ftype, inputClimateWithoutUpstreamStep5.vtypes[vtype].fuels[ftype]!.percentSource].concat(inputClimateWithoutUpstreamStep5.vtypes[vtype].fuels[ftype]!.percent))
                    }
                }
                const inputClimateWithoutUpstreamStep6 : InputBAUStep3 = project.stages.Climate?.[i]?.steps?.[6]
                vtypes = Object.keys(inputClimateWithoutUpstreamStep6?.vtypes || {})
                for (let j = 0; j < vtypes.length; j++) {
                    const vtype = vtypes[j]
                    const ftypes = Object.keys(inputClimateWithoutUpstreamStep6.vtypes[vtype].fuels)
                    for (let k = 0; k < ftypes.length; k++) {
                        const ftype = ftypes[k] as FuelType
                        csv.push(["input", "Climate", i.toString(), "6", "Fuel consumption", vtype, "", ftype, inputClimateWithoutUpstreamStep6.vtypes[vtype].fuels[ftype]!.consSource].concat(inputClimateWithoutUpstreamStep6.vtypes[vtype].fuels[ftype]!.cons))
                    }
                }
            } else {
                // With upstream
                const inputClimateWithUpstreamStep1 : InputClimateWithUpstreamStep1 = project.stages.Climate?.[i]?.steps?.[1]
                vtypes = Object.keys(inputClimateWithUpstreamStep1?.vtypes || {})
                for (let j = 0; j < vtypes.length; j++) {
                    const vtype = vtypes[j]
                    csv.push(["input", "Climate", i.toString(), "1", "Upstream vkt", vtype, "", "", inputClimateWithUpstreamStep1.vtypes[vtype].source].concat(inputClimateWithUpstreamStep1.vtypes[vtype].vkt))
                }
                const inputClimateWithUpstreamStep2 : InputClimateWithUpstreamStep2 = project.stages.Climate?.[i]?.steps?.[2]
                vtypes = Object.keys(inputClimateWithUpstreamStep2?.vtypes || {})
                for (let j = 0; j < vtypes.length; j++) {
                    const vtype = vtypes[j]
                    csv.push(["input", "Climate", i.toString(), "2", "Upstream pkm/tkm", vtype, "", "", inputClimateWithUpstreamStep2.vtypes[vtype].source].concat(inputClimateWithUpstreamStep2.vtypes[vtype].ukm))
                }
                const inputClimateWithUpstreamStep3 : InputBAUStep2 = project.stages.Climate?.[i]?.steps?.[5]
                vtypes = Object.keys(inputClimateWithUpstreamStep3?.vtypes || {})
                for (let j = 0; j < vtypes.length; j++) {
                    const vtype = vtypes[j]
                    const ftypes = Object.keys(inputClimateWithUpstreamStep3.vtypes[vtype].fuels)
                    for (let k = 0; k < ftypes.length; k++) {
                        const ftype = ftypes[k] as FuelType
                        csv.push(["input", "Climate", i.toString(), "3", "Fuel part", vtype, "", ftype, inputClimateWithUpstreamStep3.vtypes[vtype].fuels[ftype]!.percentSource].concat(inputClimateWithUpstreamStep3.vtypes[vtype].fuels[ftype]!.percent))
                    }
                }
                const inputClimateWithoutUpstreamStep4 : InputBAUStep3 = project.stages.Climate?.[i]?.steps?.[4]
                vtypes = Object.keys(inputClimateWithoutUpstreamStep4?.vtypes || {})
                for (let j = 0; j < vtypes.length; j++) {
                    const vtype = vtypes[j]
                    const ftypes = Object.keys(inputClimateWithoutUpstreamStep4.vtypes[vtype].fuels)
                    for (let k = 0; k < ftypes.length; k++) {
                        const ftype = ftypes[k] as FuelType
                        csv.push(["input", "Climate", i.toString(), "4", "Fuel consumption", vtype, "", ftype, inputClimateWithoutUpstreamStep4.vtypes[vtype].fuels[ftype]!.consSource].concat(inputClimateWithoutUpstreamStep4.vtypes[vtype].fuels[ftype]!.cons))
                    }
                }
            }
        }
    }
    return csv
}
