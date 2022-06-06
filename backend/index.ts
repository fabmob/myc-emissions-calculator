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
    let dbres = dbwrapper.createProject(inputProject, owner)
    res.json({
        status: "ok",
        projectId: dbres.lastInsertRowid
    });
});

app.get('/api/myProjects', keycloak.protect(), (req: Request, res: Response) => {
    let owner = (req as any).kauth.grant.access_token.content.email
    let dbres = dbwrapper.getProjectsByOwner(owner)
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

app.get('/api/project/:projectId/viz', keycloak.protect(), (req: Request, res: Response) => {
    let owner = (req as any).kauth.grant.access_token.content.email
    let project = dbwrapper.getProject(owner, parseInt(req.params.projectId))
    if (!project.inputStep7) {
        return res.json({
            status: "missing steps",
            project: null
        })
    }
    let inputSocioEconomicData : types.SocioEconomicData = project.inputStep1
    project.outputSocioEconomicDataComputed = models.computeSocioEconomicData(inputSocioEconomicData)

    delete project.inputStep3.vktSource
    let inputVehicleKilometresTravelled : types.VehicleKilometresTravelled = project.inputStep3
    project.vehicleKilometresTravelledComputed = models.computeVehicleKilometresTravelled(inputVehicleKilometresTravelled)

    delete project.inputStep6.source
    let inputVktPerFuel : types.VktPerFuel = project.inputStep6
    project.outputVktPerFuelComputed = models.computeVktPerFuel(inputVktPerFuel, project.vehicleKilometresTravelledComputed)

    delete project.inputStep4.source
    let inputVehicleStats : types.VehicleStats = project.inputStep4
    project.outputTransportPerformance = models.computeTransportPerformance(project.vehicleKilometresTravelledComputed, inputVehicleStats)
    project.outputModalShare = models.computeModalShare(project.outputTransportPerformance)
    
    delete project.inputStep7.source
    let inputAverageEnergyConsumption : types.AverageEnergyConsumption = project.inputStep7
    project.outputAverageEnergyConsumptionComputed = models.computeAverageEnergyConsumption(inputAverageEnergyConsumption)

    project.outputComputeTotalEnergyAndEmissions = models.computeTotalEnergyAndEmissions(project.outputAverageEnergyConsumptionComputed, energyAndEmissionsDefaultValues, project.outputVktPerFuelComputed)

    project.outputSumTotalEnergyAndEmissions = models.sumTotalEnergyAndEmissions(project.outputComputeTotalEnergyAndEmissions)

    res.json({
        status: "ok",
        project: project
    });
});

app.put('/api/project/:projectId/step/:stepNumber', keycloak.protect(), (req: Request, res: Response) => {
    let owner = (req as any).kauth.grant.access_token.content.email
    let inputDataString = JSON.stringify(req.body.inputData)
    let dbres = dbwrapper.updateProject(owner, parseInt(req.params.projectId), parseInt(req.params.stepNumber), inputDataString)
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
