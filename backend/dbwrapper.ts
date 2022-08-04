import * as types from './types'
import Database from 'better-sqlite3'
const db = new Database('data.db', {verbose: console.log})

export function init() {
    try {
        db.exec("CREATE Table Projects (id INTEGER PRIMARY KEY, owner STRING, name STRING, country STRING, city STRING, partnerLocation STRING, area STRING, referenceYear INTEGER, UNIQUE(name))")
        db.exec("CREATE Table ProjectSteps (projectId INTEGER, stepNumber INTEGER, value STRING, FOREIGN KEY(projectId) REFERENCES Projects(id),  UNIQUE(projectId, stepNumber) ON CONFLICT REPLACE)")
    } catch (err) {
        console.log("Table alredy exists")
    }
}

type ProjectsDbEntry = {
    id: number,
    owner: string,
    name: string,
    country: string,
    city: string,
    partnerLocation: string,
    area: string,
    referenceYear: number
}
type ProjectStepsDbEntry = {
    projectId: number,
    stepNumber: number,
    value: string
}
type Project = ProjectsDbEntry & {
    steps: any[],
    step: number
}
export function createProject(project: types.Project, owner: string): [string | null, Database.RunResult | null] {
    const createProjectStmt = db.prepare("INSERT INTO Projects (id, owner, name, country, city, partnerLocation, area, referenceYear) values (NULL, ?, ?, ?, ?, ?, ?, ?)")
    try {
        let res = createProjectStmt.run([
            owner,
            project.projectName,
            project.projectCountry,
            project.projectCity,
            project.partnerLocation,
            project.projectArea,
            project.projectReferenceYear
        ])
        return [null, res]
    } catch (error: any) {
        return [error?.code, null]
    }
}

function parseProject(projectEntry: ProjectsDbEntry, projectSteps?: ProjectStepsDbEntry[]) {
    let project = projectEntry as Project
    // Skipping index 0 to match stepNumber with index in array
    project.steps = [null]
    project.step = 1
    if (projectSteps) {
        project.step = projectSteps.length + 1
        for (let i = 0; i < projectSteps.length; i++) {
            const step = projectSteps[i];
            project.steps[step.stepNumber] = JSON.parse(step.value)
        }
    }
    return project
}
export function getProjectsByOwner(owner: string) {
    const getProjectsByOwnerStmt = db.prepare("SELECT * FROM Projects WHERE owner = ?")
    let res: ProjectsDbEntry[] = getProjectsByOwnerStmt.all(owner)
    return res.map(projectEntry => parseProject(projectEntry))
}

export function getProject(owner: string, id: number) {
    const getProjectStmt = db.prepare("SELECT * FROM Projects WHERE id = ? AND owner = ?")
    let resProject: ProjectsDbEntry = getProjectStmt.get([id, owner])
    const getProjectStepsStmt = db.prepare("SELECT * FROM ProjectSteps WHERE projectId = ?")
    let resProjectSteps: ProjectStepsDbEntry[] = getProjectStepsStmt.all([id])
    return parseProject(resProject, resProjectSteps)
}

export function addProjectStep(id: number, stepNumber: number, inputData: string) {
    const addProjectStepStmt = db.prepare("INSERT INTO ProjectSteps (projectId, stepNumber, value) values (?, ?, ?)")
    let res = addProjectStepStmt.run([id, stepNumber, inputData])
    return res
}

// export function updateProjectEmissionFactors(owner: string, id: number, emissionFactorsString: string) {
//     const updateProjectEmissionFactorStmt = db.prepare("UPDATE Projects set emissionFactors = ? WHERE id = ? AND owner = ?")
//     let res = updateProjectEmissionFactorStmt.run([emissionFactorsString, id, owner])
//     return res
// }