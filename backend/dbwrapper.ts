import * as types from './types'
import Database from 'better-sqlite3'
const db = new Database('data.db', {verbose: console.log})

export function init() {
    try {
        db.exec("CREATE Table Projects (id INTEGER PRIMARY KEY, owner STRING, name STRING, country STRING, city STRING, partnerLocation STRING, area STRING, referenceYear STRING, inputStep1 STRING, inputStep2 STRING, inputStep3 STRING, inputStep4 STRING, inputStep5 STRING, inputStep6 STRING, inputStep7 STRING, emissionFactors STRING, UNIQUE(name))")
    } catch (err) {
        console.log("Table alredy exists")
    }
}

export function createProject(project: types.Project, owner: string) {
    const createProjectStmt = db.prepare("INSERT INTO Projects (id, owner, name, country, city, partnerLocation, area, referenceYear) values (NULL, ?, ?, ?, ?, ?, ?, ?)")
    let res = createProjectStmt.run([
        owner,
        project.projectName,
        project.projectCountry,
        project.projectCity,
        project.partnerLocation,
        project.projectArea,
        project.projectReferenceYear
    ])
    console.log(res)
    return res
}

function parseProject(project: any) {
    project.step = 1
    if (project.inputStep1) {
        project.inputStep1 = JSON.parse(project.inputStep1)
        project.step = 2
    }
    if (project.inputStep2) {
        project.inputStep2 = JSON.parse(project.inputStep2)
        project.step = 3
    }
    if (project.inputStep3) {
        project.inputStep3 = JSON.parse(project.inputStep3)
        project.step = 4
    }
    if (project.inputStep4) {
        project.inputStep4 = JSON.parse(project.inputStep4)
        project.step = 5
    }
    if (project.inputStep5) {
        project.inputStep5 = JSON.parse(project.inputStep5)
        project.step = 6
    }
    if (project.inputStep6) {
        project.inputStep6 = JSON.parse(project.inputStep6)
        project.step = 7
    }
    if (project.inputStep7) {
        project.inputStep7 = JSON.parse(project.inputStep7)
        project.step = 100 // All done
    }
    if (project.emissionFactors) {
        project.emissionFactors = JSON.parse(project.emissionFactors)
    }
    return project
}
export function getProjectsByOwner(owner: string) {
    const getProjectsByOwnerStmt = db.prepare("SELECT * FROM Projects WHERE owner = ?")
    let res = getProjectsByOwnerStmt.all(owner)
    return res.map(parseProject)
}

export function getProject(owner: string, id: number) {
    const getProjectStmt = db.prepare("SELECT * FROM Projects WHERE id = ? AND owner = ?")
    let res = getProjectStmt.get([id, owner])
    return parseProject(res)
}

export function updateProject(owner: string, id: number, stepNumber: number, inputData: string) {
    const updateProjectStep1Stmt = db.prepare("UPDATE Projects set inputStep1 = ? WHERE id = ? AND owner = ?")
    const updateProjectStep2Stmt = db.prepare("UPDATE Projects set inputStep2 = ? WHERE id = ? AND owner = ?")
    const updateProjectStep3Stmt = db.prepare("UPDATE Projects set inputStep3 = ? WHERE id = ? AND owner = ?")
    const updateProjectStep4Stmt = db.prepare("UPDATE Projects set inputStep4 = ? WHERE id = ? AND owner = ?")
    const updateProjectStep5Stmt = db.prepare("UPDATE Projects set inputStep5 = ? WHERE id = ? AND owner = ?")
    const updateProjectStep6Stmt = db.prepare("UPDATE Projects set inputStep6 = ? WHERE id = ? AND owner = ?")
    const updateProjectStep7Stmt = db.prepare("UPDATE Projects set inputStep7 = ? WHERE id = ? AND owner = ?")
    let res
    switch (stepNumber) {
        case 1:
            res = updateProjectStep1Stmt.run([inputData, id, owner])
            break;
        case 2:
            res = updateProjectStep2Stmt.run([inputData, id, owner])
            break;
        case 3:
            res = updateProjectStep3Stmt.run([inputData, id, owner])
            break;
        case 4:
            res = updateProjectStep4Stmt.run([inputData, id, owner])
            break;
        case 5:
            res = updateProjectStep5Stmt.run([inputData, id, owner])
            break;
        case 6:
            res = updateProjectStep6Stmt.run([inputData, id, owner])
            break;
        case 7:
            res = updateProjectStep7Stmt.run([inputData, id, owner])
            break;
        default:
            break;
    }
    return res
}

export function updateProjectEmissionFactors(owner: string, id: number, emissionFactorsString: string) {
    const updateProjectEmissionFactorStmt = db.prepare("UPDATE Projects set emissionFactors = ? WHERE id = ? AND owner = ?")
    let res = updateProjectEmissionFactorStmt.run([emissionFactorsString, id, owner])
    return res
}