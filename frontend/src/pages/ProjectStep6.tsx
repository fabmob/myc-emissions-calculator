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
import {InputStep6, ProjectType, FuelType} from '../frontendTypes'
import {validateStringAsPercent} from '../utils'
import Progress from '../components/Progress'
import Alert from 'react-bootstrap/Alert'

import './Project.css'

export default function ProjectStep6(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    let params = useParams();
    let [inputData, setInputData ] = useState({source: ''} as InputStep6)
    let [project, setProject ] = useState({} as ProjectType)
    let [vtypeWarning, setVtypeWarning] = useState(false)
    let projectId = params.projectId
    useEffect(() => {
        if (initialized && keycloak.authenticated){
            const requestOptions = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token }
            };
            fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId, requestOptions)
                .then(response => response.json())
                .then(data => {
                    console.log("get projetcs reply", data)
                    setProject(data.project)
                    if (data.project.inputStep5) {
                        let vtypes = Object.keys(data.project.inputStep2)
                        setInputData(prevInputData => {
                            for (let i = 0; i < vtypes.length; i++) {
                                let vtype = vtypes[i]
                                if (data.project.inputStep6?.[vtype]) {
                                    prevInputData[vtype] = data.project.inputStep6[vtype]
                                } else {
                                    if (!data.project.inputStep5[vtype]) {
                                        setVtypeWarning(true)
                                        continue
                                    }
                                    let ftypes = Object.keys(data.project.inputStep5[vtype]).filter(ftype => data.project.inputStep5[vtype][ftype])
                                    let tmp = {} as {[key in FuelType]: string[]}
                                    if (ftypes.length === 1) {
                                        // If we only have one fuel type, we can initalize everything at 100%
                                        let ftype = ftypes[0] as FuelType
                                        tmp[ftype] = ["100", "100", "100", "100", "100", "100"]
                                        prevInputData[vtype] = tmp
                                    } else {
                                        for (let j = 0; j < ftypes.length; j++) {
                                            let ftype = ftypes[j] as FuelType
                                            tmp[ftype] = ["0", "0", "0", "0", "0", "0"]
                                        }
                                        prevInputData[vtype] = tmp
                                    }
                                }
                            }
                            return prevInputData
                        })
                    }
                });
            }
    }, [keycloak, initialized, projectId])
    const updateSource = (event: React.BaseSyntheticEvent) => {
        setInputData((prevInputData: InputStep6) => ({
            ...prevInputData,
            source: event.target.value
        }))
    }
    const updateInput = (vtype: string, fueltypestr: string, index: number, event: React.BaseSyntheticEvent) => {
        let ftype = fueltypestr as FuelType
        let value = event.target.value
        setInputData((prevInputData: InputStep6) => {
            let tt = prevInputData[vtype]
            if (tt && typeof(tt) !== 'string') {
                tt[ftype][index] = validateStringAsPercent(value)
                return {
                    ...prevInputData,
                    [vtype]: tt
                }
            } else {
                return prevInputData
            }
        })
    }

    const saveAndGoPreviousStep = () => {
        // TODO: validate content ?
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
            body: JSON.stringify({ inputData: inputData })
        };
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/step/6', requestOptions)
            .then(response => response.json())
            .then(() => navigate('/project/' + projectId + '/step/5'));
    }
    const saveAndGoNextStep = () => {
        // TODO: validate content ?
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
            body: JSON.stringify({ inputData: inputData })
        };
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/step/6', requestOptions)
            .then(response => response.json())
            .then(() => navigate('/project/' + projectId + '/step/7'));
    }
    return (
        <Container className="projectStepContainer">
            <Progress project={project} currentStep={6} />
            <Row className="justify-content-md-center align-items-center" style={{minHeight: "calc(100vh - 200px)", marginTop: "20px"}}>
                <Col xs lg="8">
                    <h1 style={{marginBottom: "40px"}}>Set up VKT breakdown by fuel type</h1>
                    {vtypeWarning? <Alert variant="danger">
                        A fuel is undefined for one of the vehicles types, making it invisible, please go back to the fuel types step.
                    </Alert> : <></>}
                    <h2>Please enter the percentage of Vehicle Kilometers Travelled (vkt) per vehicle category and fuel type for the Reference Year and for future years</h2>
                    <Table className="inputTable">
                        <thead>
                            <tr>
                                <th>Vehicle type</th>
                                <th colSpan={6}>VKT per category (%)</th>
                            </tr>
                            <tr>
                                <td></td>
                                <td>{project.referenceYear} (RY)</td>
                                <td>{project.referenceYear}-2025</td>
                                <td>2025-2030</td>
                                <td>2030-2035</td>
                                <td>2035-2040</td>
                                <td>2040-2050</td>
                            </tr>
                        </thead>
                        <tbody>
                        {Object.keys(project.inputStep2 || []).map((vtype, index) => {
                            if (!project.inputStep2 || project.inputStep2[vtype] === false || !inputData) {
                                return <></>
                            }
                            let inputVt = inputData[vtype] as {[key in FuelType]: string[]}
                            if (inputVt !== undefined && project.inputStep5) {
                                let fuelJsx = Object.keys(project.inputStep5[vtype] || []).map((ft, i) => {
                                    let ftype = ft as FuelType
                                    let inputFt = inputVt?.[ftype]
                                    let tmp = project?.inputStep5?.[vtype]  as {[key in FuelType]: boolean}
                                    if (!tmp || tmp[ftype] === false || !inputData) {
                                        return null
                                    }
                                    if (inputFt !== undefined) {
                                        let inp = inputVt?.[ftype]
                                        if (inp) {
                                            return (
                                                <tr key={i}>
                                                    <td style={{backgroundColor: "#989898"}}>{ftype}</td>
                                                    <td>
                                                        <InputGroup>
                                                            <Form.Control type="input" value={inp[0]} onChange={e => updateInput(vtype, ft, 0, e)} />
                                                            <InputGroup.Text>%</InputGroup.Text>
                                                        </InputGroup>
                                                    </td>
                                                    <td>
                                                        <InputGroup>
                                                            <Form.Control type="input" value={inp[1]} onChange={e => updateInput(vtype, ft, 1, e)} />
                                                            <InputGroup.Text>%</InputGroup.Text>
                                                        </InputGroup>
                                                    </td>
                                                    <td>
                                                        <InputGroup>
                                                            <Form.Control type="input" value={inp[2]} onChange={e => updateInput(vtype, ft, 2, e)} />
                                                            <InputGroup.Text>%</InputGroup.Text>
                                                        </InputGroup>
                                                    </td>
                                                    <td>
                                                        <InputGroup>
                                                            <Form.Control type="input" value={inp[3]} onChange={e => updateInput(vtype, ft, 3, e)} />
                                                            <InputGroup.Text>%</InputGroup.Text>
                                                        </InputGroup>
                                                    </td>
                                                    <td>
                                                        <InputGroup>
                                                            <Form.Control type="input" value={inp[4]} onChange={e => updateInput(vtype, ft, 4, e)} />
                                                            <InputGroup.Text>%</InputGroup.Text>
                                                        </InputGroup>
                                                    </td>
                                                    <td>
                                                        <InputGroup>
                                                            <Form.Control type="input" value={inp[5]} onChange={e => updateInput(vtype, ft, 5, e)} />
                                                            <InputGroup.Text>%</InputGroup.Text>
                                                        </InputGroup>
                                                    </td>
                                                </tr>
                                            )
                                        }
                                    }
                                    return null
                                })
                                let inp = inputData?.[vtype]
                                let sums = [0,0,0,0,0,0]
                                if (inp && typeof(inp) !== 'string') {
                                    let fuels = Object.keys(project.inputStep5[vtype] || [])
                                    for (let i = 0; i < fuels.length; i++) {
                                        let ftype = fuels[i] as FuelType
                                        for (let j = 0; j < sums.length; j++) {
                                            sums[j] += parseFloat(inp?.[ftype]?.[j]) || 0
                                        }
                                    }
                                }
                                if(inp && Object.keys(inp).length === 0) {
                                    sums = [100, 100, 100, 100, 100, 100]
                                }
                                return [
                                    <tr key={index}>
                                        <td style={{backgroundColor: "#989898"}}>{vtype}</td>
                                        <td style={{color: sums[0] !== 100 ? 'orange' : 'green', backgroundColor: "#989898"}}>{sums[0]}%</td>
                                        <td style={{color: sums[1] !== 100 ? 'orange' : 'green', backgroundColor: "#989898"}}>{sums[1]}%</td>
                                        <td style={{color: sums[2] !== 100 ? 'orange' : 'green', backgroundColor: "#989898"}}>{sums[2]}%</td>
                                        <td style={{color: sums[3] !== 100 ? 'orange' : 'green', backgroundColor: "#989898"}}>{sums[3]}%</td>
                                        <td style={{color: sums[4] !== 100 ? 'orange' : 'green', backgroundColor: "#989898"}}>{sums[4]}%</td>
                                        <td style={{color: sums[5] !== 100 ? 'orange' : 'green', backgroundColor: "#989898"}}>{sums[5]}%</td>
                                    </tr>
                                    ,
                                    fuelJsx
                                ]
                            } else {
                                return <></>
                            }
                        })
                        }
                        </tbody>
                    </Table>
                    {inputData?
                        <Form.Group as={Row} style={{"marginBottom": "20px"}}>
                            <Form.Label column sm={2}>Source</Form.Label>
                            <Col sm={10}>
                                <Form.Control type="input" name="vktSource" value={inputData.source as string} onChange={updateSource} placeholder=""/>
                            </Col>
                        </Form.Group>
                    :''}

                    <h2>Need some help to find the data, <a href="mailto:contact@myc.com">click here to send us an email 📧</a></h2>
                    <Button variant="secondary" style={{marginRight: "20px"}} onClick={saveAndGoPreviousStep}>
                        Previous
                    </Button>
                    <Button variant="primary" onClick={saveAndGoNextStep}>
                        Next
                    </Button>
                </Col>
            </Row>
        </Container>

    )
}
