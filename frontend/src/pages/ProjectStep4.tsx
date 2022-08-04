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
import {InputStep4, ProjectType} from '../frontendTypes'
import Progress from '../components/Progress'


import './Project.css'


export default function ProjectStep4(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    let params = useParams();
    let [inputData, setInputData ] = useState({source: ''} as InputStep4)
    let [project, setProject ] = useState({} as ProjectType)
    let projectId = params.projectId
    const [validated, setValidated] = useState(false)
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
                    let vtypes = Object.keys(data.project.steps[2])
                    let init:InputStep4 = {source: data.project.steps[4]?.source || ''}
                    for (let i = 0; i < vtypes.length; i++) {
                        let vtype = vtypes[i]
                        if (data.project.steps[4]?.[vtype]){
                            init[vtype] = data.project.steps[4][vtype]
                        } else {
                            if (vtype.includes("alking")) {
                                init[vtype] = {
                                    occupancy: "1"
                                }
                            } else {
                                init[vtype] = {
                                    occupancy: "0"
                                }
                            }
                        }
                    }
                    setInputData(init)
                });
            }
    }, [keycloak, initialized, projectId])
    const updateSource = (event: React.BaseSyntheticEvent) => {
        setInputData((prevInputData: InputStep4) => ({
            ...prevInputData,
            source: event.target.value
        }))
    }
    const updateInput = (vtype: string, param: "occupancy", value: string) => {
        setInputData((prevInputData: InputStep4) => {
            let vtypeobj = prevInputData[vtype]
            if (vtypeobj && typeof(vtypeobj) !== 'string') {
                vtypeobj[param] = value
                return {
                    ...prevInputData,
                    [vtype]: vtypeobj
                }
            } else {
                return prevInputData
            }
        })
    }
    const updateOccupancy = (event: React.BaseSyntheticEvent) => {
        let target = event.target as HTMLInputElement
        let vtype = target.name
        let value = target.value
        updateInput(vtype, "occupancy", value)
    }
    const goPreviousStep = () => {
        navigate('/project/' + projectId + '/step/3');
    }
    const saveAndGoNextStep = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        setValidated(true);
        if (form.checkValidity() === false) {
            event.stopPropagation();
            return
        }
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
            body: JSON.stringify({ inputData: inputData })
        };
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/step/4', requestOptions)
            .then(response => response.json())
            .then(() => navigate('/project/' + projectId + '/step/5'));
    }
    return (
        <Container className="projectStepContainer">
            <Progress project={project} currentStep={4} />
            <Row className="justify-content-md-center align-items-center" style={{minHeight: "calc(100vh - 200px)", marginTop: "20px"}}>
                <Col xs lg="8">
                    <h1>Set up occupancy</h1>
                    <h2 style={{marginTop: "-40px", marginBottom: "40px"}}>Project: {project.name}</h2>
                    <h2>Please enter <b>the occupancy for passenger vehicles</b> (average number of passengers per vehicle).</h2>

                    <h2>Remark 1: These values are used both for inventory and BAU purposes. <br/>
                        Remark 2: Conventionally drivers of public transport are not included as there are not passengers (incl. taxi), but for private transport drivers should be included if they travel for their own sake. </h2>

                    <h2><i>Local city data can be used if available and robust.<br/>
                    Otherwise for cities it is recommended to use national data and for countries to use regional specific data. If you do not have data available please get in touch with MYC secretariat to check if data are available for your city.<br/>

                     
                    </i></h2>
                    <Form noValidate validated={validated} onSubmit={saveAndGoNextStep}>
                        <Table className="inputTable">
                            <thead>
                                <tr>
                                    <th>Vehicle type</th>
                                    <th className="reqStar">Average occupancy (number of passengers)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(project.steps?.[2] || []).map((vtype, index) => {
                                    let vt = vtype
                                    if (!project.steps?.[2] || project.steps[2][vt] === false || !inputData) {
                                        return <></>
                                    }
                                    let inputVt = inputData[vt]
                                    if (inputVt && typeof(inputVt) !== 'string')
                                        return (
                                            <tr key={index}>
                                                <td style={{backgroundColor: "#989898"}}>{vtype}</td>
                                                <td>
                                                    <Form.Group>
                                                        <Form.Control type="number" required min="0" step="0.1" name={vtype} value={inputVt.occupancy} onChange={updateOccupancy} placeholder="" />
                                                        <Form.Control.Feedback type="invalid">Please enter a positive number, avoid white spaces</Form.Control.Feedback>
                                                    </Form.Group>
                                                </td>
                                            </tr>
                                        )
                                    return <></>
                                })
                                }

                            </tbody>
                        </Table>
                        {inputData?
                            <Form.Group as={Row} style={{"marginBottom": "20px"}}>
                                <Form.Label className="reqStar" column sm={2}>Source</Form.Label>
                                <Col sm={10}>
                                    <Form.Control type="input" name="vktSource" required value={inputData.source as string} onChange={updateSource} placeholder="IEA, 2022"/>
                                    <Form.Control.Feedback type="invalid">A source is required</Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                        :''}

                        <h2>Need some help to find the data, <a href="mailto:contact@myc.com">click here to send us an email</a></h2>
                        <Button variant="secondary" style={{marginRight: "20px"}} onClick={goPreviousStep}>
                            Previous
                        </Button>
                        <Button variant="primary" type="submit">
                            Next
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>

    )
}
