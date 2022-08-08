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
    let owner = (req as any).kauth.grant.access_token.content.email
    let dbres = dbwrapper.getPublicProjectsNotOwned(owner)
    res.json({
        status: "ok",
        projects: dbres
    });
});

app.get('/api/project/:projectId', keycloak.protect(), (req: Request, res: Response) => {
    let owner = (req as any).kauth.grant.access_token.content.email
    let dbres = dbwrapper.getProject(owner, parseInt(req.params.projectId))
    res.json({
        status: "ok",
        project: dbres
    });
});
app.put('/api/project/:projectId', keycloak.protect(), (req: Request, res: Response) => {
    let owner = (req as any).kauth.grant.access_token.content.email
    let inputProject : types.Project = req.body.project
    let [errorCode, dbres] = dbwrapper.updateProject(parseInt(req.params.projectId), owner, inputProject)
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
    let owner = (req as any).kauth.grant.access_token.content.email
    let dbres = dbwrapper.deleteProject(parseInt(req.params.projectId), owner)
    console.log(dbres)
    res.json({
        status: "ok"
    });
});
app.get('/api/project/:projectId/viz', keycloak.protect(), (req: Request, res: Response) => {
    let owner = (req as any).kauth.grant.access_token.content.email
    let dbProject = dbwrapper.getProject(owner, parseInt(req.params.projectId))
    let project = dbProject as typeof dbProject & {
        outputSocioEconomicDataComputed: types.SocioEconomicDataComputed,
        vehicleKilometresTravelledComputed: types.VehicleKilometresTravelledComputed,
        outputVktPerFuelComputed: types.VktPerFuelComputed,
        outputTransportPerformance: types.TransportPerformance,
        outputModalShare: types.ModalShare,
        outputAverageEnergyConsumptionComputed: types.AverageEnergyConsumptionComputed,
        outputComputeTotalEnergyAndEmissionsWTW: types.TotalEnergyAndEmissions,
        outputComputeTotalEnergyAndEmissionsTTW: types.TotalEnergyAndEmissions,
        outputSumTotalEnergyAndEmissionsTTW: types.SumTotalEnergyAndEmissions,
        outputSumTotalEnergyAndEmissionsWTW: types.SumTotalEnergyAndEmissions
    }
    if (!project.steps[7]) {
        return res.json({
            status: "missing steps",
            project: null
        })
    }
    let inputSocioEconomicData : types.SocioEconomicData = project.steps[1]
    project.outputSocioEconomicDataComputed = models.computeSocioEconomicData(inputSocioEconomicData, project.referenceYears)

    delete project.steps[3].vktSource
    delete project.steps[3].vktGrowthSource
    let inputVehicleKilometresTravelled : types.VehicleKilometresTravelled = project.steps[3]
    project.vehicleKilometresTravelledComputed = models.computeVehicleKilometresTravelled(inputVehicleKilometresTravelled, project.referenceYears)

    delete project.steps[6].source
    let inputVktPerFuel : types.VktPerFuel = project.steps[6]
    project.outputVktPerFuelComputed = models.computeVktPerFuel(inputVktPerFuel, project.vehicleKilometresTravelledComputed)

    delete project.steps[4].source
    let inputVehicleStats : types.VehicleStats = project.steps[4]
    project.outputTransportPerformance = models.computeTransportPerformance(project.vehicleKilometresTravelledComputed, inputVehicleStats)
    project.outputModalShare = models.computeModalShare(project.outputTransportPerformance)

    delete project.steps[7].energySource
    delete project.steps[7].energyGrowthSource
    let inputAverageEnergyConsumption : types.AverageEnergyConsumption = project.steps[7]
    project.outputAverageEnergyConsumptionComputed = models.computeAverageEnergyConsumption(inputAverageEnergyConsumption, project.referenceYears)

    if (project.steps[5].emissionFactors?.WTW) {
        project.outputComputeTotalEnergyAndEmissionsWTW = models.computeTotalEnergyAndEmissions(project.outputAverageEnergyConsumptionComputed, project.steps[5].emissionFactors.WTW, project.outputVktPerFuelComputed)
        console.log(project.outputComputeTotalEnergyAndEmissionsWTW)
        project.outputComputeTotalEnergyAndEmissionsTTW = models.computeTotalEnergyAndEmissions(project.outputAverageEnergyConsumptionComputed, project.steps[5].emissionFactors.TTW, project.outputVktPerFuelComputed)
        project.outputSumTotalEnergyAndEmissionsTTW = models.sumTotalEnergyAndEmissions(project.outputComputeTotalEnergyAndEmissionsTTW)
    } else {
        project.outputComputeTotalEnergyAndEmissionsWTW = models.computeTotalEnergyAndEmissions(project.outputAverageEnergyConsumptionComputed, energyAndEmissionsDefaultValues, project.outputVktPerFuelComputed)
    }

    project.outputSumTotalEnergyAndEmissionsWTW = models.sumTotalEnergyAndEmissions(project.outputComputeTotalEnergyAndEmissionsWTW)

    res.json({
        status: "ok",
        project: project
    });
});

app.put('/api/project/:projectId/step/:stepNumber', keycloak.protect(), (req: Request, res: Response) => {
    let inputDataString = JSON.stringify(req.body.inputData)

    // Check ownership before making an edit
    let owner = (req as any).kauth.grant.access_token.content.email
    let projectdbres = dbwrapper.getProject(owner, parseInt(req.params.projectId))
    
    if (projectdbres?.owner === owner) {
        let dbres = dbwrapper.addProjectStep(parseInt(req.params.projectId), parseInt(req.params.stepNumber), inputDataString)
        console.log(dbres)
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
    let owner = (req as any).kauth.grant.access_token.content.email
    let dbres = dbwrapper.updateProjectStatus(parseInt(req.params.projectId), owner, "validated")
    console.log(dbres)
    res.json({
        status: "ok"
    });
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
