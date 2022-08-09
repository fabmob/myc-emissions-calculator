import * as types from './types'
import Database from 'better-sqlite3'
const db = new Database('data.db', {verbose: console.log})

export function init() {
    try {
        db.exec("CREATE Table Projects (id INTEGER PRIMARY KEY, owner STRING, name STRING, isSump INTEGER, country STRING, city STRING, partnerLocation STRING, area STRING, referenceYears INTEGER, status STRING, UNIQUE(owner, name))")
        db.exec("CREATE Table ProjectSteps (projectId INTEGER, stepNumber INTEGER, value STRING, FOREIGN KEY(projectId) REFERENCES Projects(id),  UNIQUE(projectId, stepNumber) ON CONFLICT REPLACE)")
    } catch (err) {
        console.log("Table alredy exists")
    }
}

type ProjectsDbEntry = {
    id: number,
    owner: string,
    name: string,
    isSump: number,
    country: string,
    city: string,
    partnerLocation: string,
    area: string,
    referenceYears: string,
    status: string,
    step?: number
}
type ProjectStepsDbEntry = {
    projectId: number,
    stepNumber: number,
    value: string
}
type Project = {
    id: number,
    owner: string,
    name: string,
    isSump: boolean,
    country: string,
    city: string,
    partnerLocation: string,
    area: string,
    status: string
    referenceYears: number[],
    steps: any[],
    step: number
}
export function createProject(project: types.Project, owner: string): [string | null, Database.RunResult | null] {
    const createProjectStmt = db.prepare("INSERT INTO Projects (id, owner, name, isSump, country, city, partnerLocation, area, referenceYears, status) values (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    try {
        let res = createProjectStmt.run([
            owner,
            project.projectName,
            project.isSump,
            project.projectCountry,
            project.projectCity,
            project.partnerLocation,
            project.projectArea,
            project.projectReferenceYears.join(','),
            "draft"
        ])
        return [null, res]
    } catch (error: any) {
        return [error?.code, null]
    }
}

function parseProject(projectEntry: ProjectsDbEntry, projectSteps?: ProjectStepsDbEntry[]) {
    let project : Project = {
        id: projectEntry.id,
        owner: projectEntry.owner, 
        name: projectEntry.name,
        isSump: projectEntry.isSump === 1,
        country: projectEntry.country, 
        city: projectEntry.city, 
        partnerLocation: projectEntry.partnerLocation, 
        area: projectEntry.area, 
        status: projectEntry.status, 
        referenceYears: projectEntry.referenceYears.split(',').map(s => parseInt(s)),
        // Skipping index 0 to match stepNumber with index in array
        steps: [null],
        step: ((projectEntry.step || 0) + 1) || 1
    }

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
    const getProjectsByOwnerStmt = db.prepare("SELECT Projects.*, max(stepNumber) as step FROM Projects LEFT JOIN ProjectSteps on projectId = id WHERE owner = ? group by id")
    let res: ProjectsDbEntry[] = getProjectsByOwnerStmt.all(owner)
    return res.map(projectEntry => parseProject(projectEntry))
}
export function getPublicProjectsNotOwned(owner: string) {
    const getProjectsByOwnerStmt = db.prepare("SELECT Projects.*, max(stepNumber) as step FROM Projects LEFT JOIN ProjectSteps on projectId = id WHERE owner != ? AND status = 'validated' group by id")
    let res: ProjectsDbEntry[] = getProjectsByOwnerStmt.all(owner)
    return res.map(projectEntry => parseProject(projectEntry))
}
export function getProject(owner: string, id: number) {
    const getProjectStmt = db.prepare("SELECT * FROM Projects WHERE id = ? AND (owner = ? OR status = 'validated')")
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

export function updateProjectStatus(id: number, owner: string, status: string) {
    const updateProjectStatusStmt = db.prepare("UPDATE Projects set status = ? where id = ? and owner = ?")
    let res = updateProjectStatusStmt.run([status, id, owner])
    return res
}
export function updateProject(id: number, owner: string, project: types.Project) {
    const updateProjectStatusStmt = db.prepare("UPDATE Projects set name = ?, isSump = ?, country = ?, city = ?, partnerLocation = ?, area = ?, referenceYears = ? where id = ? and owner = ?")
    try {
        let res = updateProjectStatusStmt.run([
            project.projectName,
            project.isSump ? 1 : 0,
            project.projectCountry,
            project.projectCity,
            project.partnerLocation,
            project.projectArea,
            project.projectReferenceYears.join(","),
            id, 
            owner
        ])
        return [null, res]
    } catch (error: any) {
        return [error?.code, null]
    }
}
export function deleteProject(id: number, owner: string) {
    const updateProjectStatusStmt = db.prepare("DELETE FROM Projects where id = ? and owner = ?")
    let res = updateProjectStatusStmt.run([id, owner])
    return res
}
