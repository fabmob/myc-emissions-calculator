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
import {InputStep3, ProjectType} from '../frontendTypes'
import {validateStringAsFloat, validateStringAsPercent} from '../utils'
import Progress from '../components/Progress'

import './Project.css'


export default function ProjectStep3(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    let params = useParams();
    let [inputData, setInputData ] = useState({vktSource: ''} as InputStep3)
    let [project, setProject ] = useState({} as ProjectType)
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
                    let vtypes = Object.keys(data.project.inputStep2)
                    let init:InputStep3 = {vktSource: ''}
                    for (let i = 0; i < vtypes.length; i++) {
                        let vtype = vtypes[i]
                        if (data.project.inputStep3[vtype]) {
                            init[vtype] = data.project.inputStep3[vtype]
                        } else {
                            init[vtype] = {
                                vkt: "0",
                                vktRate: ["0", "0", "0", "0", "0"]
                            }
                        }
                    }
                    setInputData(init)
                });
            }
    }, [keycloak, initialized, projectId])
    const updateSource = (event: React.BaseSyntheticEvent) => {
        setInputData((prevInputData: InputStep3) => ({
            ...prevInputData,
            vktSource: event.target.value
        }))
    }
    const updateInput = (event: React.BaseSyntheticEvent, index?: number) => {
        let target = event.target as HTMLInputElement
        let vtype = target.name

        setInputData((prevInputData: InputStep3) => {
            let vtypeobj = prevInputData[vtype]
            if (vtypeobj && typeof(vtypeobj) != 'string') {
                if (index === undefined) {
                    vtypeobj.vkt = validateStringAsFloat(target.value)
                } else {
                    vtypeobj.vktRate[index] = validateStringAsPercent(target.value)
                }
                return {
                    ...prevInputData,
                    [vtype]: vtypeobj
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
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/step/3', requestOptions)
            .then(response => response.json())
            .then(() => navigate('/project/' + projectId + '/step/2'));
    }
    const saveAndGoNextStep = () => {
        // TODO: validate content ?
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
            body: JSON.stringify({ inputData: inputData })
        };
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/step/3', requestOptions)
            .then(response => response.json())
            .then(() => navigate('/project/' + projectId + '/step/4'));
    }
    return (
        <Container className="projectStepContainer">
            <Progress project={project} currentStep={3} />
            <Row className="justify-content-md-center align-items-center" style={{minHeight: "calc(100vh - 200px)", marginTop: "20px"}}>
                <Col xs lg="8">
                    <h1 style={{marginBottom: "40px"}}>Set up transport activity data</h1>
                    <h2>Fill the Vehicle Kilometer Travelled, then fill the estimated percentage of growth milleage</h2>
                    <Table className="inputTable">
                        <thead>
                            <tr>
                                <th>Vehicle type</th>
                                <th style={{width: "200px"}}>VKT (mio km/year)</th>
                                <th colSpan={5}>Annual growth of VKT (%)</th>
                            </tr>
                            <tr>
                                <td></td>
                                <td>{project.referenceYear} (RY)</td>
                                <td>2018-2020</td>
                                <td>2020-2025</td>
                                <td>2025-2030</td>
                                <td>2030-2040</td>
                                <td>2040-2050</td>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(project.inputStep2 || []).map((vtype, index) => {
                                if (!project.inputStep2 || project.inputStep2[vtype] === false || !inputData) {
                                    return <></>
                                }
                                let inputVt = inputData[vtype]
                                if (inputVt && typeof(inputVt) !== 'string')
                                    return (
                                        <tr key={index}>
                                            <td style={{backgroundColor: "#989898"}}>{vtype}</td>
                                            <td>
                                                <InputGroup>
                                                    <Form.Control type="input" name={vtype} value={inputVt.vkt} onChange={updateInput} placeholder="" />
                                                    <InputGroup.Text>Mkm/y</InputGroup.Text>
                                                </InputGroup>

                                            </td>
                                            <td>
                                                <InputGroup>
                                                    <Form.Control type="input" name={vtype} value={inputVt.vktRate[0]} onChange={e => updateInput(e, 0)} placeholder="" />
                                                    <InputGroup.Text>%</InputGroup.Text>
                                                </InputGroup>
                                            </td>
                                            <td>
                                                <InputGroup>
                                                    <Form.Control type="input" name={vtype} value={inputVt.vktRate[1]} onChange={e => updateInput(e, 1)} placeholder="" />
                                                    <InputGroup.Text>%</InputGroup.Text>
                                                </InputGroup>
                                            </td>
                                            <td>
                                                <InputGroup>
                                                    <Form.Control type="input" name={vtype} value={inputVt.vktRate[2]} onChange={e => updateInput(e, 2)} placeholder="" />
                                                    <InputGroup.Text>%</InputGroup.Text>
                                                </InputGroup>
                                            </td>
                                            <td>
                                                <InputGroup>
                                                    <Form.Control type="input" name={vtype} value={inputVt.vktRate[3]} onChange={e => updateInput(e, 3)} placeholder="" />
                                                    <InputGroup.Text>%</InputGroup.Text>
                                                </InputGroup>
                                            </td>
                                            <td>
                                                <InputGroup>
                                                    <Form.Control type="input" name={vtype} value={inputVt.vktRate[4]} onChange={e => updateInput(e, 4)} placeholder="" />
                                                    <InputGroup.Text>%</InputGroup.Text>
                                                </InputGroup>
                                            </td>
                                        </tr>
                                    )
                                return <></>
                            })
                            }

                        </tbody>
                    </Table>
                    {inputData ?
                        <Form.Group as={Row} style={{"marginBottom": "20px"}}>
                            <Form.Label column sm={2}>Source</Form.Label>
                            <Col sm={10}>
                                <Form.Control type="input" name="vktSource" value={inputData.vktSource as string} onChange={updateSource} placeholder=""/>
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
