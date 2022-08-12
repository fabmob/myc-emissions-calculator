import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useParams, useNavigate } from "react-router-dom"
import Table from 'react-bootstrap/Table'
import Form from 'react-bootstrap/Form'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import Modal from 'react-bootstrap/Modal'
import {InputStep5, ProjectType, FuelType, EmissionsFactors} from '../frontendTypes'
import Progress from '../components/Progress'

import './Project.css'

export default function ProjectStep5(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    let params = useParams();
    let ftypes = Object.keys(FuelType)
    let [inputData, setInputData ] = useState({source: ''} as InputStep5)
    let [project, setProject ] = useState({} as ProjectType)
    let projectId = params.projectId
    const [showEmissionsFactors, setShowEmissionsFactors] = useState(false);
    const handleCloseEmissionsFactors = () => setShowEmissionsFactors(false);
    let [emissionFactors, setEmissionFactors] = useState({
        "WTW": {
            "Gasoline": {lowerHeatingValue: "44", density: "0.740740740740741", pci: "32.8", ges: ["86241", "86241", "86241", "86241", "86241", "86241"]},
            "Diesel": {lowerHeatingValue: "43", density: "0.843881856540084", pci: "36.3", ges: ["91369", "91369", "91369", "91369", "91369", "91369"]},
            "LPG": {lowerHeatingValue: "47", density: "0.522193211488251", pci: "24.7", ges: ["72692", "72692", "72692", "72692", "72692", "72692"]},
            "NG": {lowerHeatingValue: "48", density: "1", pci: "48.0", ges: ["67772", "67772", "67772", "67772", "67772", "67772"]},
            "Hybrid": {lowerHeatingValue: "44", density: "0.740740740740741", pci: "32.8", ges: ["85192", "85192", "85192", "85192", "85192", "85192"]},
            "Electric": {lowerHeatingValue: "4", density: "1", pci: "3.6", ges: ["20556", "20556", "20556", "20556", "20556", "20556"]},
            "None": {lowerHeatingValue: "0", density: "0", pci: "0", ges: ["0","0","0","0","0","0"]}
        },
        "TTW": {
            "Gasoline": {lowerHeatingValue: "44", density: "0.740740740740741", pci: "32.8", ges: ["72120", "72120", "72120", "72120", "72120", "72120"]},
            "Diesel": {lowerHeatingValue: "43", density: "0.843881856540084", pci: "36.3", ges: ["75360", "75360", "75360", "75360", "75360", "75360"]},
            "LPG": {lowerHeatingValue: "47", density: "0.522193211488251", pci: "24.7", ges: ["64710", "64710", "64710", "64710", "64710", "64710"]},
            "NG": {lowerHeatingValue: "48", density: "1", pci: "48.0", ges: ["59292", "59292", "59292", "59292", "59292", "59292"]},
            "Hybrid": {lowerHeatingValue: "44", density: "0.740740740740741", pci: "32.8", ges: ["71072", "71072", "71072", "71072", "71072", "71072"]},
            "Electric": {lowerHeatingValue: "4", density: "1", pci: "3.6", ges: ["0", "0", "0", "0", "0", "0"]},
            "None": {lowerHeatingValue: "0", density: "0", pci: "0", ges: ["0","0","0","0","0","0"]}
        }
    } as EmissionsFactors)
    let [electricityProductionEmissions, setElectricityProductionEmissions] = useState(["74","74","74","74","74","74"])
    useEffect(() => {
        if (initialized && keycloak.authenticated){
            const requestOptions = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token }
            };
            fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId, requestOptions)
                .then(response => {
                    if (response.status != 200) {
                        navigate('/')
                    }
                    return response.json()
                })
                .then(data => {
                    console.log("get projetcs reply", data)
                    setProject(data.project)
                    let vtypes = Object.keys(data.project.steps[2])
                    let init:InputStep5 = {source: data.project.steps[5]?.source || ''}
                    for (let i = 0; i < vtypes.length; i++) {
                        let vtype = vtypes[i]
                        if (data.project.steps[5]?.[vtype]){
                            init[vtype] = data.project.steps[5][vtype]
                        } else {
                            let tmp = {} as {[key in FuelType]: boolean}
                            for (let j = 0; j < ftypes.length; j++) {
                                let ftype = ftypes[j] as FuelType
                                if (vtype.includes("alking") && ftype === "None") {
                                    tmp[ftype] = true
                                } else {
                                    tmp[ftype] = false
                                }
                            }
                            init[vtype] = tmp
                        }
                    }
                    setInputData(init)
                    if (data.project?.steps?.[5]?.emissionFactors) {
                        setEmissionFactors(data.project.steps[5].emissionFactors)
                    }
                });
            }
    }, [keycloak, initialized, projectId])
    const updateEmissionFactors = (format: "WTW"|"TTW", value: string, fuel: FuelType, key: "lowerHeatingValue" | "density" | "ges", index?: number) => {
        setEmissionFactors((prevEmissionFactors: EmissionsFactors) => {
            let pfuel = prevEmissionFactors[format][fuel]
            if (pfuel) {
                if (key === "ges") {
                    if (index !== undefined) {
                        pfuel[key][index] = value
                    }
                } else {
                    pfuel[key] = value
                    pfuel.pci = ((parseFloat(pfuel.density) || 0) * (parseFloat(pfuel.lowerHeatingValue) || 0)).toString()
                }
            }
            prevEmissionFactors[format][fuel] = pfuel
            return {...prevEmissionFactors}
        })
    }
    const updateElectricityProductionEmissions = (value: string, index: number) => {
        setElectricityProductionEmissions(prevElectricityProductionEmissions => {
            prevElectricityProductionEmissions[index] = value
            return prevElectricityProductionEmissions
        })
        setEmissionFactors((prevEmissionFactors: EmissionsFactors) => {
            let pfuel = prevEmissionFactors["WTW"]["Electric"]
            if (pfuel) {
                pfuel.ges[index] = Math.round(parseInt(value)/3.6*1000).toString()
            }
            prevEmissionFactors["WTW"]["Electric"] = pfuel
            return {...prevEmissionFactors}
        })
    }
    const updateInput = (vtype: string, fueltypestr: string) => {
        let ftype = fueltypestr as FuelType
        setInputData((prevInputData: InputStep5) => {
            let tt = prevInputData[vtype]
            if (tt && typeof(tt) !== 'string') {
                tt[ftype] = !tt[ftype]
                return {
                    ...prevInputData,
                    [vtype]: tt
                }
            } else {
                return prevInputData
            }
        })
    }

    const goPreviousStep = () => {
        // TODO: validate content ?
        navigate('/project/' + projectId + '/step/4');
    }
    // const saveEmissionFactors = () => {
    //     const requestOptions = {
    //         method: 'PUT',
    //         headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
    //         body: JSON.stringify({ emissionFactors: emissionFactors })
    //     };
    //     return fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/emissionFactors', requestOptions)
    //         .then(response => response.json())
    // }
    const saveAndGoNextStep = () => {
        // TODO: validate content ?
        let saveData = inputData as any
        saveData.emissionFactors = emissionFactors
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
            body: JSON.stringify({ inputData: saveData })
        };
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/step/5', requestOptions)
            .then(response => response.json())
            .then(() => navigate('/project/' + projectId + '/step/6'));
    }
    return (
        <Container className="projectStepContainer">
            <Progress project={project} currentStep={5} />
            <Row className="justify-content-md-center align-items-center" style={{minHeight: "calc(100vh - 200px)", marginTop: "20px"}}>
                <Col xs lg="8">
                    <h1>Select the fuel types of the means of transport</h1>
                    <h2 style={{marginTop: "-40px", marginBottom: "40px"}}>Project: {project.name}</h2>
                    <p><a href="#" onClick={()=>setShowEmissionsFactors(true)}>Show and configure emissions factors</a></p>
                    <p>Please select the fuel types of the means of transport existing or expected on your territory.</p>
                    <Table className="inputTable">
                        <thead>
                            <tr>
                                <th>Vehicle type</th>
                                <th colSpan={Object.keys(FuelType).length}>Fuel type</th>
                            </tr>
                            <tr>
                                <td></td>
                                {Object.keys(FuelType).map((ft, i) => (
                                    <td key={i}>{ft}</td>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(project.steps?.[2] || []).map((vtype, index) => {
                                let vt = vtype
                                if (!project.steps?.[2] || project.steps[2][vt] === false || !inputData) {
                                    return null
                                }
                                let inputVt = inputData[vt] as {[key in FuelType]: boolean}
                                if (inputVt)
                                    return (
                                        <tr key={index}>
                                            <td style={{backgroundColor: "#989898"}}>{vtype}</td>
                                            {Object.keys(FuelType).map((ft, i) => {
                                                let ftype = ft as FuelType
                                                let inputFt = inputVt?.[ftype]
                                                if (inputFt !== undefined) {
                                                    return (
                                                        <td key={i}>
                                                            <Form.Check
                                                            className="fuelCheck"
                                                            key={i}
                                                            checked={inputFt}
                                                            onChange={() => updateInput(vtype, ftype)}
                                                            />
                                                        </td>
                                                    )
                                                }
                                                return null
                                            })}
                                        </tr>
                                    )
                                return null
                            })
                            }

                        </tbody>
                    </Table>

                    <Button variant="secondary" style={{marginRight: "20px"}} onClick={goPreviousStep}>
                        Previous
                    </Button>
                    <Button variant="primary" onClick={saveAndGoNextStep}>
                        Next
                    </Button>
                </Col>
            </Row>
            <Modal size="xl" centered show={showEmissionsFactors} onHide={handleCloseEmissionsFactors}>
                <Modal.Header closeButton>
                    <Modal.Title>Emission factors</Modal.Title>
                </Modal.Header>
                <Modal.Body className="projectStepContainer" style={{textAlign: "center"}}>
                    <Table className="inputTable">
                        <thead>
                            <tr>
                                <th colSpan={6}>Cost of electricity production</th>
                            </tr>
                            <tr>
                                <td>{ project.referenceYears?.[0]} (RY)</td>
                                <td>{ project.referenceYears?.[0]}-{ project.referenceYears?.[1]}</td>
                                <td>{ project.referenceYears?.[1]}-{ project.referenceYears?.[2]}</td>
                                <td>{ project.referenceYears?.[2]}-{ project.referenceYears?.[3]}</td>
                                <td>{ project.referenceYears?.[3]}-{ project.referenceYears?.[4]}</td>
                                <td>{ project.referenceYears?.[4]}-{ project.referenceYears?.[5]}</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                {electricityProductionEmissions.map((v, i) => (
                                    <td key={i}>
                                        <Form.Group>
                                            <InputGroup>
                                                <Form.Control type="text" value={v} onChange={e => updateElectricityProductionEmissions(e.target.value, i)} />
                                                <InputGroup.Text>gCO2/kWh</InputGroup.Text>
                                                <Form.Control.Feedback type="invalid">Please enter a positive number, avoid white spaces</Form.Control.Feedback>
                                            </InputGroup>
                                        </Form.Group>
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </Table>
                    <Table className="inputTable">
                        <thead>
                            <tr>
                                <th>Fuel Type</th>
                                <th colSpan={8}>Well to Wheel (WTW) Emissions factors</th>
                            </tr>
                            <tr>
                                <td></td>
                                <td>Lower heating value</td>
                                <td>Density</td>
                                <td>{ project.referenceYears?.[0]} (RY)</td>
                                <td>{ project.referenceYears?.[0]}-{ project.referenceYears?.[1]}</td>
                                <td>{ project.referenceYears?.[1]}-{ project.referenceYears?.[2]}</td>
                                <td>{ project.referenceYears?.[2]}-{ project.referenceYears?.[3]}</td>
                                <td>{ project.referenceYears?.[3]}-{ project.referenceYears?.[4]}</td>
                                <td>{ project.referenceYears?.[4]}-{ project.referenceYears?.[5]}</td>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(FuelType).map((ft, i) => {
                                let ftype = ft as FuelType
                                if (ftype === "None") {
                                    return null
                                }
                                return (
                                    <tr key={i}>
                                        <td>{ftype} {(ftype === 'Electric') ? "(computed)" : ""}</td>
                                        <td>
                                            <Form.Group>
                                                <InputGroup>
                                                    <Form.Control type="text" value={emissionFactors.WTW[ftype].lowerHeatingValue} onChange={e => updateEmissionFactors("WTW", e.target.value, ftype, "lowerHeatingValue")}/>
                                                    <InputGroup.Text>{(ftype !== 'Electric') ? "TJ/1000t" : "MJ/kWh"}</InputGroup.Text>
                                                    <Form.Control.Feedback type="invalid">Please enter a positive number, avoid white spaces</Form.Control.Feedback>
                                                </InputGroup>
                                            </Form.Group>
                                        </td>
                                        <td>
                                            <Form.Group>
                                                <InputGroup>
                                                    <Form.Control type="text" value={emissionFactors.WTW[ftype].density}  onChange={e => updateEmissionFactors("WTW", e.target.value, ftype, "density")}/>
                                                    <InputGroup.Text>{(ftype === "NG") ? "kg/kg" : "kg/l"}</InputGroup.Text>
                                                    <Form.Control.Feedback type="invalid">Please enter a positive number, avoid white spaces</Form.Control.Feedback>
                                                </InputGroup>
                                            </Form.Group>
                                        </td>
                                        {emissionFactors.WTW[ftype].ges.map((v, j) => {
                                                if (ftype === 'Electric') {
                                                    return <td key={j}>
                                                        {v} kg/J
                                                    </td>
                                                }
                                                return <td key={j}>
                                                    <Form.Group>
                                                        <InputGroup>
                                                            <Form.Control type="text" value={v} onChange={e => updateEmissionFactors("WTW", e.target.value, ftype, "ges", j)} />
                                                            <InputGroup.Text>kg/J</InputGroup.Text>
                                                            <Form.Control.Feedback type="invalid">Please enter a positive number, avoid white spaces</Form.Control.Feedback>
                                                        </InputGroup>
                                                    </Form.Group>
                                                </td>
                                            })
                                        }
                                    </tr>
                                )
                            })}
                        </tbody>
                    </Table>
                    <Table className="inputTable">
                        <thead>
                            <tr>
                                <th>Fuel Type</th>
                                <th colSpan={8}>Tank To Wheel (TTW) Emissions factors</th>
                            </tr>
                            <tr>
                                <td></td>
                                <td>Lower heating value</td>
                                <td>Density</td>
                                <td>{ project.referenceYears?.[0]} (RY)</td>
                                <td>{ project.referenceYears?.[0]}-{ project.referenceYears?.[1]}</td>
                                <td>{ project.referenceYears?.[1]}-{ project.referenceYears?.[2]}</td>
                                <td>{ project.referenceYears?.[2]}-{ project.referenceYears?.[3]}</td>
                                <td>{ project.referenceYears?.[3]}-{ project.referenceYears?.[4]}</td>
                                <td>{ project.referenceYears?.[4]}-{ project.referenceYears?.[5]}</td>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(FuelType).map((ft, i) => {
                                let ftype = ft as FuelType
                                if (ftype === "None") {
                                    return null
                                }
                                return (
                                    <tr key={i}>
                                        <td>{ftype}</td>
                                        <td>
                                            <Form.Group>
                                                <InputGroup>
                                                    <Form.Control type="text" value={emissionFactors.TTW[ftype].lowerHeatingValue} onChange={e => updateEmissionFactors("TTW", e.target.value, ftype, "lowerHeatingValue")}/>
                                                    <InputGroup.Text>{(ftype !== 'Electric') ? "TJ/1000t" : "MJ/kWh"}</InputGroup.Text>
                                                    <Form.Control.Feedback type="invalid">Please enter a positive number, avoid white spaces</Form.Control.Feedback>
                                                </InputGroup>
                                            </Form.Group>
                                        </td>
                                        <td>
                                            <Form.Group>
                                                <InputGroup>
                                                    <Form.Control type="text" value={emissionFactors.TTW[ftype].density}  onChange={e => updateEmissionFactors("TTW", e.target.value, ftype, "density")}/>
                                                    <InputGroup.Text>{(ftype === "NG") ? "kg/kg" : "kg/l"}</InputGroup.Text>
                                                    <Form.Control.Feedback type="invalid">Please enter a positive number, avoid white spaces</Form.Control.Feedback>
                                                </InputGroup>
                                            </Form.Group>
                                        </td>
                                        {emissionFactors.TTW[ftype].ges.map((v, j) => (
                                            <td key={j}>
                                                <Form.Group>
                                                    <InputGroup>
                                                        <Form.Control type="text" value={v} onChange={e => updateEmissionFactors("TTW", e.target.value, ftype, "ges", j)} />
                                                        <InputGroup.Text>kg/J</InputGroup.Text>
                                                        <Form.Control.Feedback type="invalid">Please enter a positive number, avoid white spaces</Form.Control.Feedback>
                                                    </InputGroup>
                                                </Form.Group>
                                            </td>
                                        ))}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseEmissionsFactors}>
                    Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>

    )
}
