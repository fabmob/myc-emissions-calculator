import * as types from './types'
import Database from 'better-sqlite3'
const db = new Database('data.db', {verbose: console.log})

export function init() {
    try {
        db.exec("CREATE Table Projects (id INTEGER PRIMARY KEY, createdDate STRING, modifiedDate STRING, owner STRING, name STRING, isSump INTEGER, country STRING, city STRING, partnerLocation STRING, area STRING, referenceYears INTEGER, status STRING, UNIQUE(owner, name))")
        db.exec("CREATE Table ProjectSteps (projectId INTEGER, stage STRING, stageId INTEGER, stepNumber INTEGER, value STRING, FOREIGN KEY(projectId) REFERENCES Projects(id),  UNIQUE(projectId, stage, stageId, stepNumber) ON CONFLICT REPLACE)")
        db.exec("CREATE Table ProjectSources (sourceId INTEGER PRIMARY KEY AUTOINCREMENT, projectId INTEGER, value STRING, FOREIGN KEY(projectId) REFERENCES Projects(id))")
    } catch (err) {
        console.log("Table alredy exists")
    }
}

export function createProject(project: types.Project, owner: string): [string | null, Database.RunResult | null] {
    const createProjectStmt = db.prepare("INSERT INTO Projects (id, createdDate, modifiedDate, owner, name, isSump, country, city, partnerLocation, area, referenceYears, status) values (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    try {
        let res = createProjectStmt.run([
            new Date().toString(),
            new Date().toString(),
            owner,
            project.projectName,
            project.isSump ? 1 : 0,
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

function parseProject(projectEntry: types.ProjectsDbEntry, projectSteps?: types.ProjectStepsDbEntry[], projectSources?: types.ProjectSourcesDbEntry[]) {
    let project : types.FullProject = {
        id: projectEntry.id,
        createdDate: new Date(projectEntry.createdDate),
        modifiedDate: new Date(projectEntry.modifiedDate),
        owner: projectEntry.owner, 
        name: projectEntry.name,
        isSump: projectEntry.isSump === 1,
        country: projectEntry.country, 
        city: projectEntry.city, 
        partnerLocation: projectEntry.partnerLocation, 
        area: projectEntry.area, 
        status: projectEntry.status, 
        referenceYears: projectEntry.referenceYears.split(',').map(s => parseInt(s)),
        stages: projectEntry.stages || {
            "BAU": [],
            "Inventory": [],
            "Climate": []
        },
        sources: projectSources || []
    }
    if (projectSteps) {
        for (let i = 0; i < projectSteps.length; i++) {
            const step = projectSteps[i]
            if (!project.stages[step.stage][step.stageId]) {
                project.stages[step.stage][step.stageId] = {
                    // Skipping index 0 to match stepNumber with index in array
                    step: 1,
                    steps: []
                }
            }
            project.stages[step.stage][step.stageId || 0].step += 1
            project.stages[step.stage][step.stageId || 0].steps[step.stepNumber] = JSON.parse(step.value)
        }
    }
    return project
}
function concatProjects(res: types.ProjectsDbEntry[]) : types.ProjectsDbEntry[] {
    let concatRes: types.ProjectsDbEntry[] = []
    for (let i = 0; i < res.length; i++) {
        const project = res[i]
        if (project.stage && project.stageId >= 0) {
            const index = concatRes.findIndex((p) => p.id === project.id)
            
            if (index < 0) {
                project.stages = {
                    "BAU": [],
                    "Inventory": [],
                    "Climate": []
                }
                project.stages[project.stage][project.stageId] = {
                    step: project.step,
                    steps: []
                }
                concatRes.push(project)
            } else {
                concatRes[index].stages[project.stage][project.stageId] = {
                    step: project.step,
                    steps: []
                }
            }
        } else {
            project.stages = {
                "BAU": [],
                "Inventory": [],
                "Climate": []
            }
            concatRes.push(project)
        }
    }
    return concatRes
}
export function getProjectsByOwner(owner: string) {
    const getProjectsByOwnerStmt = db.prepare("SELECT Projects.*, stage, stageId, max(stepNumber) as step FROM Projects LEFT JOIN ProjectSteps on projectId = id WHERE owner = ? group by id, stage, stageId")
    let res: types.ProjectsDbEntry[] = getProjectsByOwnerStmt.all(owner) as types.ProjectsDbEntry[]
    const concatRes: types.ProjectsDbEntry[] = concatProjects(res)
    return concatRes.map(projectEntry => parseProject(projectEntry))
}
export function getPublicProjectsNotOwned(owner: string, isAdmin: boolean) {
    let getProjectsByOwnerStmt
    if (isAdmin) {
        getProjectsByOwnerStmt = db.prepare("SELECT Projects.*, stage, stageId, max(stepNumber) as step FROM Projects LEFT JOIN ProjectSteps on projectId = id WHERE owner != ? group by id, stage, stageId")
    } else {
        getProjectsByOwnerStmt = db.prepare("SELECT Projects.*, stage, stageId, max(stepNumber) as step FROM Projects LEFT JOIN ProjectSteps on projectId = id WHERE owner != ? AND status = 'validated' group by id, stage, stageId")
    }
    let res: types.ProjectsDbEntry[] = getProjectsByOwnerStmt.all(owner) as types.ProjectsDbEntry[]
    const concatRes: types.ProjectsDbEntry[] = concatProjects(res)
    return concatRes.map(projectEntry => parseProject(projectEntry))
}
export function getProject(owner: string, id: number, isAdmin: boolean) {
    let getProjectStmt
    let resProject: types.ProjectsDbEntry
    if (isAdmin) {
        getProjectStmt = db.prepare("SELECT * FROM Projects WHERE id = ?")
        resProject = getProjectStmt.get([id]) as types.ProjectsDbEntry
    } else {
        getProjectStmt = db.prepare("SELECT * FROM Projects WHERE id = ? AND (owner = ? OR status = 'validated')")
        resProject = getProjectStmt.get([id, owner]) as types.ProjectsDbEntry
    }
    if (!resProject) {
        return null
    }
    const getProjectStepsStmt = db.prepare("SELECT * FROM ProjectSteps WHERE projectId = ?")
    let resProjectSteps: types.ProjectStepsDbEntry[] = getProjectStepsStmt.all([id]) as types.ProjectStepsDbEntry[]
    const getProjectSourcesStmt = db.prepare("SELECT * FROM ProjectSources WHERE projectId = ?")
    let resProjectSources: types.ProjectSourcesDbEntry[] = getProjectSourcesStmt.all([id]) as types.ProjectSourcesDbEntry[]
    return parseProject(resProject, resProjectSteps, resProjectSources)
}

export function addProjectStep(id: number, stage: types.ProjectStage, stageId: number, stepNumber: number, inputData: string) {
    const addProjectStepStmt = db.prepare("INSERT INTO ProjectSteps (projectId, stage, stageId, stepNumber, value) values (?, ?, ?, ?, ?)")
    let res = addProjectStepStmt.run([id, stage, stageId, stepNumber, inputData])
    const updateProjectDateStmt = db.prepare("UPDATE Projects set modifiedDate = ? where id = ?")
    updateProjectDateStmt.run([new Date().toString(), id])
    return res
}

export function addProjectSource(projectId: number, value: string) {
    const addProjectSourceStmt = db.prepare("INSERT INTO ProjectSources (sourceId, projectId, value) values (?, ?, ?)")
    let res = addProjectSourceStmt.run([null, projectId, value])
    const updateProjectDateStmt = db.prepare("UPDATE Projects set modifiedDate = ? where id = ?")
    updateProjectDateStmt.run([new Date().toString(), projectId])
    return res
}

export function updateProjectStatus(id: number, owner: string, status: string, isAdmin: boolean) {
    let updateProjectStatusStmt
    let res
    if (isAdmin) {
        updateProjectStatusStmt = db.prepare("UPDATE Projects set status = ?, modifiedDate = ? where id = ?")
        res = updateProjectStatusStmt.run([status, new Date().toString(), id])
    } else {
        updateProjectStatusStmt = db.prepare("UPDATE Projects set status = ?, modifiedDate = ? where id = ? and owner = ?")
        res = updateProjectStatusStmt.run([status, new Date().toString(), id, owner])
    }
    return res
}
export function updateProject(id: number, owner: string, project: types.Project, isAdmin: boolean) {
    let updateProjectStatusStmt
    let res
    try {
        if (isAdmin) {
            updateProjectStatusStmt = db.prepare("UPDATE Projects set name = ?, isSump = ?, country = ?, city = ?, partnerLocation = ?, area = ?, referenceYears = ?, modifiedDate = ? where id = ?")
            res = updateProjectStatusStmt.run([
                project.projectName,
                project.isSump ? 1 : 0,
                project.projectCountry,
                project.projectCity,
                project.partnerLocation,
                project.projectArea,
                project.projectReferenceYears.join(","),
                new Date().toString(),
                id
            ])
        } else {
            updateProjectStatusStmt = db.prepare("UPDATE Projects set name = ?, isSump = ?, country = ?, city = ?, partnerLocation = ?, area = ?, referenceYears = ?, modifiedDate = ? where id = ? and owner = ?")
            res = updateProjectStatusStmt.run([
                project.projectName,
                project.isSump ? 1 : 0,
                project.projectCountry,
                project.projectCity,
                project.partnerLocation,
                project.projectArea,
                project.projectReferenceYears.join(","),
                new Date().toString(),
                id, 
                owner
            ])
        }
        return [null, res]
    } catch (error: any) {
        return [error?.code, null]
    }
}
export function deleteProject(id: number, owner: string, isAdmin: boolean) {
    let deleteProjectStmt
    let res
    if (isAdmin) {
        deleteProjectStmt = db.prepare("DELETE FROM ProjectSteps where projectId = ?")
        res = deleteProjectStmt.run([id])
        deleteProjectStmt = db.prepare("DELETE FROM ProjectSources where projectId = ?")
        res = deleteProjectStmt.run([id])
        deleteProjectStmt = db.prepare("DELETE FROM Projects where id = ?")
        res = deleteProjectStmt.run([id])
    } else {
        deleteProjectStmt = db.prepare("DELETE FROM ProjectSteps where projectId = ? and owner = ?")
        res = deleteProjectStmt.run([id, owner])
        deleteProjectStmt = db.prepare("DELETE FROM ProjectSources where projectId = ? and owner = ?")
        res = deleteProjectStmt.run([id, owner])
        deleteProjectStmt = db.prepare("DELETE FROM Projects where id = ? and owner = ?")
        res = deleteProjectStmt.run([id, owner])
    }
    return res
}

export function duplicateClimateScenario(projectId: number, oldStageId: number, newStageId: number, done: Function) {
    const getProjectStepsStmt = db.prepare("SELECT * FROM ProjectSteps WHERE projectId = ? and stage = 'Climate' and stageId = ?")
    let resProjectSteps: types.ProjectStepsDbEntry[] = getProjectStepsStmt.all([projectId, oldStageId]) as types.ProjectStepsDbEntry[]
    const addProjectStepStmt = db.prepare("INSERT INTO ProjectSteps (projectId, stage, stageId, stepNumber, value) values (?, ?, ?, ?, ?)")
    const inserts = db.transaction((steps) => {
        for (let i = 0; i < steps.length; i++) {
            const projectStep = steps[i];
            addProjectStepStmt.run([projectId, "Climate", newStageId, projectStep.stepNumber, projectStep.value])
        }
        done()
    })
    inserts(resProjectSteps)
}

export function updateAllProjectSteps(project: types.FullProject) {
    const addProjectStepStmt = db.prepare("INSERT INTO ProjectSteps (projectId, stage, stageId, stepNumber, value) values (?, ?, ?, ?, ?)")
    let dataToInsert = []
    for (let i = 1; i < project.stages.Inventory[0].steps.length; i++) {
        const stepData = project.stages.Inventory[0].steps[i]
        dataToInsert.push([project.id, "Inventory", 0, i, JSON.stringify(stepData)])
    }
    if (project.stages.BAU[0]) {
        for (let i = 1; i < project.stages.BAU[0].steps.length; i++) {
            const stepData = project.stages.BAU[0].steps[i]
            dataToInsert.push([project.id, "BAU", 0, i, JSON.stringify(stepData)])
        }
    }
    for (let k = 0; k < project.stages.Climate.length; k++) {
        for (let i = 1; i < project.stages.Climate[k].steps.length; i++) {
            const stepData = project.stages.Climate[k].steps[i]
            dataToInsert.push([project.id, "Climate", k, i, JSON.stringify(stepData)])
        }
    }
    const insertFn = db.transaction(dataToInsert => {
        for (const step of dataToInsert) {
            addProjectStepStmt.run(step)
        }
    })
    insertFn(dataToInsert)
    const updateProjectDateStmt = db.prepare("UPDATE Projects set modifiedDate = ? where id = ?")
    const res = updateProjectDateStmt.run([new Date().toString(), project.id])
    return res
}