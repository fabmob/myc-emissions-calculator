import * as types from './types'
import Database from 'better-sqlite3'
const db = new Database('data.db', {verbose: console.log})

export function init() {
    try {
        db.exec("CREATE Table Projects (id INTEGER PRIMARY KEY, owner STRING, name STRING, location STRING, partnerLocation STRING, area STRING, referenceYear STRING, inputStep1 STRING, inputStep2 STRING, inputStep3 STRING, inputStep4 STRING, inputStep5 STRING, inputStep6 STRING, inputStep7 STRING, UNIQUE(name))")
    } catch (err) {
        console.log("Table alredy exists")
    }
}

export function createProject(project: types.Project, owner: string) {
    const createProjectStmt = db.prepare("INSERT INTO Projects (id, owner, name, location, partnerLocation, area, referenceYear) values (NULL, ?, ?, ?, ?, ?, ?)")
    let res = createProjectStmt.run([
        owner,
        project.projectName,
        project.projectLocation,
        project.partnerLocation,
        project.projectArea,
        project.projectReferenceYear
    ])
    console.log(res)
    return res
}

export function getProjectsByOwner(owner: string) {
    const getProjectsByOwnerStmt = db.prepare("SELECT * FROM Projects WHERE owner = ?")
    let res = getProjectsByOwnerStmt.all(owner)
    return res
}

export function getProject(owner: string, id: number) {
    const getProjectStmt = db.prepare("SELECT * FROM Projects WHERE id = ? AND owner = ?")
    let res = getProjectStmt.get([id, owner])
    if (res.inputStep1) {
        res.inputStep1 = JSON.parse(res.inputStep1)
    }
    if (res.inputStep2) {
        res.inputStep2 = JSON.parse(res.inputStep2)
    }
    if (res.inputStep3) {
        res.inputStep3 = JSON.parse(res.inputStep3)
    }
    if (res.inputStep4) {
        res.inputStep4 = JSON.parse(res.inputStep4)
    }
    if (res.inputStep5) {
        res.inputStep5 = JSON.parse(res.inputStep5)
    }
    if (res.inputStep6) {
        res.inputStep6 = JSON.parse(res.inputStep6)
    }
    if (res.inputStep7) {
        res.inputStep7 = JSON.parse(res.inputStep7)
    }
    return res
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
