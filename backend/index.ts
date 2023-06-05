import {energyAndEmissionsDefaultValues} from './defaults'
import * as types from './types'
import * as models from './models'
import * as dbwrapper from './dbwrapper'
import path from 'path'
import {initKeycloak} from './keycloak-config'
import express, { Express, Request, Response } from 'express'
import cors from 'cors'

const app: Express = express()
app.use(express.json())
app.use(cors())
app.use(express.static(path.join(__dirname, "..", "frontend", "build")));

let keycloak = initKeycloak()

dbwrapper.init()

const port = process.env.PORT || 8081;
app.use('/api/*', keycloak.middleware())

app.post('/api/createProject', keycloak.protect(), (req: Request, res: Response) => {
    let owner = (req as any).kauth.grant.access_token.content.email
    let inputProject : types.Project = req.body.project
    let [errorCode, dbres] = dbwrapper.createProject(inputProject, owner)
    if (dbres !== null) {
        res.status(201).json({
            status: "ok",
            projectId: dbres.lastInsertRowid
        });
    } else {
        if (errorCode === "SQLITE_CONSTRAINT_UNIQUE") {
            res.status(409).json({
                status: "err",
                errorCode: errorCode
            })
        } else {
            res.status(400).json({
                status: "err",
                errorCode: errorCode
            })
        }
    }
});

app.get('/api/myProjects', keycloak.protect(), (req: Request, res: Response) => {
    let owner = (req as any).kauth.grant.access_token.content.email
    let dbres = dbwrapper.getProjectsByOwner(owner)
    res.json({
        status: "ok",
        projects: dbres
    });
});
app.get('/api/projects', keycloak.protect(), (req: Request, res: Response) => {
    const owner = (req as any).kauth.grant.access_token.content.email
    const isAdmin = (req as any).kauth.grant.access_token.content.realm_access.roles.indexOf("app-admin") !== -1
    const dbres = dbwrapper.getPublicProjectsNotOwned(owner, isAdmin)
    res.json({
        status: "ok",
        projects: dbres
    });
});

app.get('/api/project/:projectId', keycloak.protect(), (req: Request, res: Response) => {
    const owner = (req as any).kauth.grant.access_token.content.email
    const isAdmin = (req as any).kauth.grant.access_token.content.realm_access.roles.indexOf("app-admin") !== -1
    const dbres = dbwrapper.getProject(owner, parseInt(req.params.projectId), isAdmin)
    if (!dbres) {
        return res.status(404).json({
            status: "not found",
            project: null
        })
    }
    res.json({
        status: "ok",
        project: dbres
    });
});
app.put('/api/project/:projectId', keycloak.protect(), (req: Request, res: Response) => {
    const owner = (req as any).kauth.grant.access_token.content.email
    const isAdmin = (req as any).kauth.grant.access_token.content.realm_access.roles.indexOf("app-admin") !== -1
    const inputProject : types.Project = req.body.project
    const [errorCode, dbres] = dbwrapper.updateProject(parseInt(req.params.projectId), owner, inputProject, isAdmin)
    if (dbres !== null) {
        res.json({
            status: "ok"
        });
    } else {
        if (errorCode === "SQLITE_CONSTRAINT_UNIQUE") {
            res.status(409).json({
                status: "err",
                errorCode: errorCode
            })
        } else {
            res.status(400).json({
                status: "err",
                errorCode: errorCode
            })
        }
    }
});
app.delete('/api/project/:projectId', keycloak.protect(), (req: Request, res: Response) => {
    const owner = (req as any).kauth.grant.access_token.content.email
    const isAdmin = (req as any).kauth.grant.access_token.content.realm_access.roles.indexOf("app-admin") !== -1
    const dbres = dbwrapper.deleteProject(parseInt(req.params.projectId), owner, isAdmin)
    res.json({
        status: "ok"
    });
});
app.get('/api/project/:projectId/viz', keycloak.protect(), (req: Request, res: Response) => {
    const owner = (req as any).kauth.grant.access_token.content.email
    const isAdmin = (req as any).kauth.grant.access_token.content.realm_access.roles.indexOf("app-admin") !== -1
    const dbProject = dbwrapper.getProject(owner, parseInt(req.params.projectId), isAdmin)
    if (!dbProject) {
        return res.status(404).json({
            status: "not found",
            project: null
        })
    }
    let project = dbProject as typeof dbProject & {
        outputSocioEconomicDataComputed: types.SocioEconomicDataComputed,
        vehicleKilometresTravelledComputed: types.VehicleKilometresTravelledComputed,
        outputVktPerFuelComputed: types.VktPerFuelComputed,
        outputTransportPerformance: types.TransportPerformance,
        outputPassengersModalShare: types.ModalShare,
        outputFreightModalShare: types.ModalShare,
        outputAverageEnergyConsumptionComputed: types.AverageEnergyConsumptionComputed,
        outputComputeTotalEnergyAndEmissionsWTW: types.TotalEnergyAndEmissions,
        outputComputeTotalEnergyAndEmissionsTTW: types.TotalEnergyAndEmissions,
        outputSumTotalEnergyAndEmissionsTTW: types.SumTotalEnergyAndEmissions,
        outputSumTotalEnergyAndEmissionsWTW: types.SumTotalEnergyAndEmissions,
        outputEnergyBalance: types.EnergyBalance
    }
    if (!project.stages['Inventory'][0].steps[7]) {
        return res.json({
            status: "missing steps",
            project: null
        })
    }
    let inputSocioEconomicData : types.SocioEconomicData = project.stages['Inventory'][0].steps[1]
    project.outputSocioEconomicDataComputed = models.computeSocioEconomicData(inputSocioEconomicData, project.referenceYears)

    let sources = [project.stages['Inventory'][0].steps[3].vktSource, project.stages['Inventory'][0].steps[3].vktGrowthSource, project.stages['Inventory'][0].steps[3].vehicleStockSource, project.stages['Inventory'][0].steps[3].averageMileageSource]
    delete project.stages['Inventory'][0].steps[3].vktSource
    delete project.stages['Inventory'][0].steps[3].vktGrowthSource
    delete project.stages['Inventory'][0].steps[3].vehicleStockSource
    delete project.stages['Inventory'][0].steps[3].averageMileageSource
    let inputVehicleKilometresTravelled : types.VehicleKilometresTravelled = project.stages['Inventory'][0].steps[3]
    project.vehicleKilometresTravelledComputed = models.computeVehicleKilometresTravelled(inputVehicleKilometresTravelled, project.referenceYears)
    project.stages['Inventory'][0].steps[3].vktSource = sources[0]
    project.stages['Inventory'][0].steps[3].vktGrowthSource = sources[1]
    project.stages['Inventory'][0].steps[3].vehicleStockSource = sources[2]
    project.stages['Inventory'][0].steps[3].averageMileageSource = sources[3]

    sources = [project.stages['Inventory'][0].steps[6].source]
    delete project.stages['Inventory'][0].steps[6].source
    let inputVktPerFuel : types.VktPerFuel = project.stages['Inventory'][0].steps[6]
    project.outputVktPerFuelComputed = models.computeVktPerFuel(inputVktPerFuel, project.vehicleKilometresTravelledComputed)
    project.stages['Inventory'][0].steps[6].source = sources[0]

    sources = [project.stages['Inventory'][0].steps[4].source]
    delete project.stages['Inventory'][0].steps[4].source
    let inputVehicleStats : types.VehicleStats = project.stages['Inventory'][0].steps[4]
    project.outputTransportPerformance = models.computeTransportPerformance(project.vehicleKilometresTravelledComputed, inputVehicleStats)
    project.outputPassengersModalShare = models.computeModalShare(Object.fromEntries(Object.entries(project.outputTransportPerformance).filter(([k,v]) => !project.stages['Inventory'][0].steps[2][k].isFreight)))
    project.outputFreightModalShare = models.computeModalShare(Object.fromEntries(Object.entries(project.outputTransportPerformance).filter(([k,v]) => project.stages['Inventory'][0].steps[2][k].isFreight)))
    project.stages['Inventory'][0].steps[4].source = sources[0]

    sources = [project.stages['Inventory'][0].steps[7].energySource, project.stages['Inventory'][0].steps[7].energyGrowthSource]
    delete project.stages['Inventory'][0].steps[7].energySource
    delete project.stages['Inventory'][0].steps[7].energyGrowthSource
    let inputAverageEnergyConsumption : types.AverageEnergyConsumption = project.stages['Inventory'][0].steps[7]
    project.outputAverageEnergyConsumptionComputed = models.computeAverageEnergyConsumption(inputAverageEnergyConsumption, project.referenceYears)
    project.stages['Inventory'][0].steps[7].energySource = sources[0]
    project.stages['Inventory'][0].steps[7].energyGrowthSource = sources[1]

    let vehicleStats : types.VehicleStats = {}    
    if (project.stages['Inventory'][0].steps[5].emissionFactors?.WTW) {
        project.outputComputeTotalEnergyAndEmissionsWTW = models.computeTotalEnergyAndEmissions(project.outputAverageEnergyConsumptionComputed, project.stages['Inventory'][0].steps[5].emissionFactors.WTW, project.outputVktPerFuelComputed, vehicleStats, project.referenceYears)
        project.outputComputeTotalEnergyAndEmissionsTTW = models.computeTotalEnergyAndEmissions(project.outputAverageEnergyConsumptionComputed, project.stages['Inventory'][0].steps[5].emissionFactors.TTW, project.outputVktPerFuelComputed, vehicleStats, project.referenceYears)
        project.outputSumTotalEnergyAndEmissionsTTW = models.sumTotalEnergyAndEmissions(project.outputComputeTotalEnergyAndEmissionsTTW, project.referenceYears)
    } else {
        project.outputComputeTotalEnergyAndEmissionsWTW = models.computeTotalEnergyAndEmissions(project.outputAverageEnergyConsumptionComputed, energyAndEmissionsDefaultValues.WTW, project.outputVktPerFuelComputed, vehicleStats, project.referenceYears)
    }

    project.outputSumTotalEnergyAndEmissionsWTW = models.sumTotalEnergyAndEmissions(project.outputComputeTotalEnergyAndEmissionsWTW, project.referenceYears)

    project.outputEnergyBalance = models.computeEnergyBalance(project.outputComputeTotalEnergyAndEmissionsWTW, project.stages['Inventory'][0].steps[2])

    res.json({
        status: "ok",
        project: project
    });
});

// emissions and energy computed for top down checking
app.get('/api/project/:projectId/Inventory/0/emissions', keycloak.protect(), (req: Request, res: Response) => {
    const owner = (req as any).kauth.grant.access_token.content.email
    const isAdmin = (req as any).kauth.grant.access_token.content.realm_access.roles.indexOf("app-admin") !== -1
    const dbProject = dbwrapper.getProject(owner, parseInt(req.params.projectId), isAdmin)
    if (!dbProject) {
        return res.status(404).json({
            status: "not found",
            project: null
        })
    }
    const project = dbProject as typeof dbProject & {energyAndEmissions: types.SumTotalEnergyAndEmissions}
    let inputInventoryStep1 : types.InputInventoryStep1 = project.stages['Inventory'][0].steps[1] // vtype and ftypes
    let inputInventoryStep2 : types.InputInventoryStep2 = project.stages['Inventory'][0].steps[2] // vkt and % per fuel
    let inputInventoryStep3 : types.InputInventoryStep3 = project.stages['Inventory'][0].steps[3] // l/100km per fuel
    //let inputInventoryStep4 : types.InputInventoryStep4 = project.stages['Inventory'][0].steps[4] // gCO2/kWh (conso of elec)
    // TODO: this should be used
    let inputVktPerFuel = {...inputInventoryStep2.vtypes} as types.VktPerFuel
    let vehicleKilometresTravelledComputed : types.VehicleKilometresTravelledComputed = {}
    let inputAverageEnergyConsumption : types.AverageEnergyConsumption = {}
    let vehicleStats : types.VehicleStats = {}
    const vtypes = Object.keys(inputInventoryStep2.vtypes)
    for (let i = 0; i < vtypes.length; i++) {
        const vtype = vtypes[i];
        const vehicle = inputInventoryStep2.vtypes[vtype]
        inputAverageEnergyConsumption[vtype] = {}
        const ftypes = Object.keys(vehicle.fuels)
        for (let j = 0; j < ftypes.length; j++) {
            const ftype = ftypes[j] as types.FuelType
            const value = vehicle.fuels[ftype]?.percent
            if (value)
                inputVktPerFuel[vtype][ftype] = [parseFloat(value)]
            const avgEnergyConsumption = inputInventoryStep3.vtypes[vtype].fuels[ftype]?.cons
            if (avgEnergyConsumption)
                inputAverageEnergyConsumption[vtype][ftype] = [parseFloat(avgEnergyConsumption)]
        }
        vehicleKilometresTravelledComputed[vtype] = [parseFloat(vehicle.vkt)]
        vehicleStats[vtype] = {
            network: inputInventoryStep1.vtypes[vtype].network,
            occupancy: 0,
            triplength: 0,
            type: inputInventoryStep1.vtypes[vtype].type
        }
    }
    
    const vktPerFuelComputed = models.computeVktPerFuel(inputVktPerFuel, vehicleKilometresTravelledComputed)
    const totalEnergyAndEmissions = models.computeTotalEnergyAndEmissions(inputAverageEnergyConsumption, energyAndEmissionsDefaultValues.WTW, vktPerFuelComputed, vehicleStats, [project.referenceYears[0]])
    
    let energyAndEmissions : types.InputInventoryStep5 = {emissions: {road: {fuels:{}}, rail: {fuels:{}}}, energy: {road: {fuels:{}}, rail: {fuels:{}}}, note: undefined}
    for (let i = 0; i < vtypes.length; i++) {
        const vtype = vtypes[i]
        const network = inputInventoryStep1.vtypes[vtype].network
        const ftypes = Object.keys(inputInventoryStep1.vtypes[vtype].fuels)
        for (let j = 0; j < ftypes.length; j++) {
            const ftype = ftypes[j] as types.FuelType
            const co2 = totalEnergyAndEmissions[vtype][ftype]?.co2[0]
            const energy = totalEnergyAndEmissions[vtype][ftype]?.energy[0]
            if (!energyAndEmissions.energy[network].fuels[ftype]) {
                energyAndEmissions.energy[network].fuels[ftype] = {value: '0', source: ''}
            }
            energyAndEmissions.energy[network].fuels[ftype]!.value = (parseFloat(energyAndEmissions.energy[network].fuels[ftype]!.value) + (energy || 0)).toString()
            if (!energyAndEmissions.emissions[network].fuels[ftype]) {
                energyAndEmissions.emissions[network].fuels[ftype] = {value: '0', source: ''}
            }
            energyAndEmissions.emissions[network].fuels[ftype]!.value = (parseFloat(energyAndEmissions.emissions[network].fuels[ftype]!.value) + (co2 || 0)).toString()
        }
    }
    res.json({
        status: "ok",
        energyAndEmissions: energyAndEmissions
    });
});

app.get('/api/project/:projectId/Inventory/0/results', keycloak.protect(), (req: Request, res: Response) => {
    const owner = (req as any).kauth.grant.access_token.content.email
    const isAdmin = (req as any).kauth.grant.access_token.content.realm_access.roles.indexOf("app-admin") !== -1
    const dbProject = dbwrapper.getProject(owner, parseInt(req.params.projectId), isAdmin)
    if (!dbProject) {
        return res.status(404).json({
            status: "not found",
            project: null
        })
    }
    const project = dbProject as typeof dbProject & {energyAndEmissions: types.SumTotalEnergyAndEmissions}
    const inputInventoryStep1 : types.InputInventoryStep1 = project.stages['Inventory'][0].steps[1] // vtype and ftypes
    const inputInventoryStep2 : types.InputInventoryStep2 = project.stages['Inventory'][0].steps[2] // vkt and % per fuel
    const inputInventoryStep3 : types.InputInventoryStep3 = project.stages['Inventory'][0].steps[3] // l/100km per fuel
    const inputInventoryStep4 : types.InputInventoryStep4 = project.stages['Inventory'][0].steps[4] // gCO2/kWh (conso of elec)
    // const inputInventoryStep5 : types.InputInventoryStep5 = project.stages['Inventory'][0].steps[5] // topdown input (unused)
    const inputInventoryStep6 : types.InputInventoryStep6 = project.stages['Inventory'][0].steps[6] // vehicles load
    // TODO: step7 should also be used if available, it contains updated emissionfactors
    const inputInventoryStep7 : types.InputInventoryStep7 = project.stages['Inventory'][0].steps[7] // updated emissionfactors (or nothing)

    let inputVktPerFuel = {...inputInventoryStep2.vtypes} as types.VktPerFuel
    let vehicleKilometresTravelledComputed : types.VehicleKilometresTravelledComputed = {}
    let inputAverageEnergyConsumption : types.AverageEnergyConsumption = {}
    let vehicleStats : types.VehicleStats = {}
    const vtypes = Object.keys(inputInventoryStep2.vtypes)
    for (let i = 0; i < vtypes.length; i++) {
        const vtype = vtypes[i];
        const vehicle = inputInventoryStep2.vtypes[vtype]
        inputAverageEnergyConsumption[vtype] = {}
        const ftypes = Object.keys(vehicle.fuels)
        for (let j = 0; j < ftypes.length; j++) {
            const ftype = ftypes[j] as types.FuelType
            const value = vehicle.fuels[ftype]?.percent
            if (value !== undefined)
                inputVktPerFuel[vtype][ftype] = [parseFloat(value)]
            const avgEnergyConsumption = inputInventoryStep3.vtypes[vtype].fuels[ftype]?.cons
            if (avgEnergyConsumption !== undefined)
                inputAverageEnergyConsumption[vtype][ftype] = [parseFloat(avgEnergyConsumption)]
        }
        vehicleKilometresTravelledComputed[vtype] = [parseFloat(vehicle.vkt)]
        vehicleStats[vtype] = {
            network: inputInventoryStep1.vtypes[vtype].network,
            occupancy: parseFloat(inputInventoryStep6.vtypes[vtype].value),
            triplength: 0,
            type: inputInventoryStep1.vtypes[vtype].type
        }
    }
    const vktPerFuelComputed = models.computeVktPerFuel(inputVktPerFuel, vehicleKilometresTravelledComputed)
    const transportPerformance = models.computeTransportPerformance(vehicleKilometresTravelledComputed, vehicleStats)
    const modalShare = models.computeModalShare(transportPerformance)

    let emissionFactorsWTW = inputInventoryStep7.emissionFactors.WTW || energyAndEmissionsDefaultValues.WTW
    emissionFactorsWTW.ElectricRail = {...emissionFactorsWTW.Electric}
    emissionFactorsWTW.ElectricRoad = {...emissionFactorsWTW.Electric}
    emissionFactorsWTW.ElectricRail.ges = Math.round(parseFloat(inputInventoryStep4.rail.value)/parseFloat(emissionFactorsWTW.Electric.pci)*1000).toString()
    emissionFactorsWTW.ElectricRoad.ges = Math.round(parseFloat(inputInventoryStep4.road.value)/parseFloat(emissionFactorsWTW.Electric.pci)*1000).toString()
    const totalEnergyAndEmissionsWTW = models.computeTotalEnergyAndEmissions(inputAverageEnergyConsumption, emissionFactorsWTW, vktPerFuelComputed, vehicleStats, [project.referenceYears[0]])
    const emissionFactorsTTW = inputInventoryStep7.emissionFactors.TTW || energyAndEmissionsDefaultValues.TTW
    const totalEnergyAndEmissionsTTW = models.computeTotalEnergyAndEmissions(inputAverageEnergyConsumption, emissionFactorsTTW, vktPerFuelComputed, vehicleStats, [project.referenceYears[0]])
    
    res.json({
        status: "ok",
        totalEnergyAndEmissionsWTW: totalEnergyAndEmissionsWTW,
        totalEnergyAndEmissionsTTW: totalEnergyAndEmissionsTTW,
        emissionFactorsWTWComputedForElectric: {ElectricRail: emissionFactorsWTW.ElectricRail, ElectricRoad: emissionFactorsWTW.ElectricRoad},
        modalShare: modalShare
    });
});

app.put('/api/project/:projectId/:stage/:stageId/step/:stepNumber', keycloak.protect(), (req: Request, res: Response) => {
    const inputDataString = JSON.stringify(req.body.inputData)

    // Check ownership before making an edit
    const owner = (req as any).kauth.grant.access_token.content.email
    const isAdmin = (req as any).kauth.grant.access_token.content.realm_access.roles.indexOf("app-admin") !== -1
    const projectdbres = dbwrapper.getProject(owner, parseInt(req.params.projectId), isAdmin)
    
    if (projectdbres?.owner === owner || isAdmin) {
        // TODO: err handling
        dbwrapper.addProjectStep(
            parseInt(req.params.projectId),
            req.params.stage as types.ProjectStage,
            parseInt(req.params.stageId),
            parseInt(req.params.stepNumber),
            inputDataString
        )
        res.json({
            status: "ok"
        });
    } else {
        res.status(403).json({
            status: "not allowed to edit this project"
        });
    }
});

app.post('/api/project/:projectId/validate', keycloak.protect(), (req: Request, res: Response) => {
    const owner = (req as any).kauth.grant.access_token.content.email
    const isAdmin = (req as any).kauth.grant.access_token.content.realm_access.roles.indexOf("app-admin") !== -1
    // TODO: err handling
    dbwrapper.updateProjectStatus(parseInt(req.params.projectId), owner, "validated", isAdmin)
    res.json({
        status: "ok"
    });
});

app.post('/api/project/:projectId/source', keycloak.protect(), (req: Request, res: Response) => {
    const owner = (req as any).kauth.grant.access_token.content.email
    const isAdmin = (req as any).kauth.grant.access_token.content.realm_access.roles.indexOf("app-admin") !== -1
    const projectdbres = dbwrapper.getProject(owner, parseInt(req.params.projectId), isAdmin)
    if (projectdbres?.owner === owner || isAdmin) {
        // TODO: err handling
        dbwrapper.addProjectSource(parseInt(req.params.projectId), req.body.source)
        res.json({
            status: "ok"
        });
    } else {
        res.status(403).json({
            status: "not allowed to edit this project"
        });
    }
});

app.all('/api/*', function(_, res) {
    res.status(404).json({
        status: "Not found"
    })
});

app.all('*', (_, res) => {
    res.sendFile(path.resolve(path.join(__dirname, "..", "frontend", "build", "index.html")));
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
