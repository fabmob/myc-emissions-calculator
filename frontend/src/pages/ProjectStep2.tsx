import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useParams, useNavigate } from "react-router-dom"
import Form from 'react-bootstrap/Form'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import {InputStep2, ProjectType} from '../frontendTypes'
import Progress from '../components/Progress'

import './Project.css'

const defaultVehicles = [
    "Non motorized vehicle",
    "Private car",
    "Individual taxi",
    "Motorcycle",
    "Motorcycle taxi",
    "Minibus",
    "Bus",
    "Bus rapid transit",
    "Very light commercial vehicle",
    "Light commercial vehicle",
    "Solo truck",
    "Articulated truck",
    "Long distance train",
    "Urban train",
    "Metro",
    "Freight train",
]
export default function ProjectStep2(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    let params = useParams();
    let init:InputStep2 = {}
    for (let i = 0; i < defaultVehicles.length; i++) {
        let vtype = defaultVehicles[i]
        init[vtype] = false
    }
    let [inputData, setInputData ] = useState(init)
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
                    setProject(data.project)
                    if (data.project.inputStep2 !== null){
                        setInputData(data.project.inputStep2)
                    }
                });
            }
    }, [keycloak, initialized, projectId])
    const updateInput = (event: React.BaseSyntheticEvent) => {
        let target = event.target as HTMLInputElement
        let vtype = target.name
        setInputData((prevInputData) => ({
            ...prevInputData,
            [vtype]: !prevInputData[vtype]
        }))
    }
    // Only send selected vtypes to backend
    const filterData = (inp: InputStep2): InputStep2 => {
        let output: InputStep2 = {}
        let keys = Object.keys(inp)
        for (let i = 0; i < keys.length; i++) {
            if (inp[keys[i]]) {
                output[keys[i]] = true
            }
        }
        return output
    }
    const saveAndGoPreviousStep = () => {
        // TODO: validate content ?
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
            body: JSON.stringify({ inputData: filterData(inputData) })
        };
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/step/2', requestOptions)
            .then(response => response.json())
            .then(() => navigate('/project/' + projectId + '/step/1'));
    }
    const saveAndGoNextStep = () => {
        // TODO: validate content ?
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
            body: JSON.stringify({ inputData: filterData(inputData) })
        };
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/step/2', requestOptions)
            .then(response => response.json())
            .then(() => navigate('/project/' + projectId + '/step/3'));
    }
    return (
        <Container className="projectStepContainer">
            <Progress project={project} currentStep={2} />
            <Row className="justify-content-md-center align-items-center" style={{minHeight: "calc(100vh - 200px)", marginTop: "20px"}}>
                <Col xs lg="8">
                    <h1 style={{marginBottom: "40px"}}>Select category of transport</h1>
                    <h2>Existing or expected means of transport. <a href="#">Find related transport by clicking here 🛈</a></h2>
                    <Form style={{"marginBottom": "20px"}}>
                        <Row style={{textAlign: "left"}}>
                        {Object.keys(inputData).map((vtype, index) => {
                            return (
                                <Col lg="4" key={index}>
                                    <Form.Switch
                                        style={{margin: "10px"}}
                                        id="custom-switch"
                                        label={vtype}
                                        key={index}
                                        name={vtype}
                                        checked={inputData[vtype]}
                                        onChange={updateInput}
                                    />
                                </Col>
                            )
                        })}
                        </Row>
                    </Form>
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
