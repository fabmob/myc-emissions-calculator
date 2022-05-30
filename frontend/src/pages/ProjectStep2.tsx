import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useParams, useNavigate } from "react-router-dom"
import Form from 'react-bootstrap/Form'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import {InputStep2, VehiculeType} from '../frontendTypes'

import './Project.css'

export default function ProjectStep2(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    let params = useParams();
    let init:InputStep2 = {}
    let vtypes = Object.keys(VehiculeType)
    for (let i = 0; i < vtypes.length; i++) {
        let vtype = vtypes[i] as VehiculeType
        init[vtype] = false
    }
    let [inputData, setInputData ] = useState(init)
    let projectId = params.projectId
    useEffect(() => {
        if (initialized && keycloak.authenticated){
            const requestOptions = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token }
            };
            fetch('http://localhost:8081/api/project/' + projectId, requestOptions)
                .then(response => response.json())
                .then(data => {
                    if (data.project.inputStep2 !== null){
                        setInputData(data.project.inputStep2)
                    }
                });
            }
    }, [keycloak, initialized, projectId])
    const updateInput = (event: React.BaseSyntheticEvent) => {
        let target = event.target as HTMLInputElement
        let vtype = target.name as VehiculeType
        setInputData((prevInputData) => ({
            ...prevInputData,
            [vtype]: !prevInputData[vtype]
        }))
    }
    const saveAndGoPreviousStep = () => {
        // TODO: validate content ?
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
            body: JSON.stringify({ inputData: inputData })
        };
        fetch('http://localhost:8081/api/project/' + projectId + '/step/2', requestOptions)
            .then(response => response.json())
            .then(data => navigate('/project/' + projectId + '/step/1'));
    }
    const saveAndGoNextStep = () => {
        // TODO: validate content ?
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
            body: JSON.stringify({ inputData: inputData })
        };
        fetch('http://localhost:8081/api/project/' + projectId + '/step/2', requestOptions)
            .then(response => response.json())
            .then(data => navigate('/project/' + projectId + '/step/3'));
    }
    return (
        <Container className="projectStepContainer">
            <Row className="justify-content-md-center align-items-center" style={{minHeight: "calc(100vh - 200px)"}}>
                <Col xs lg="8">
                    <h1 style={{marginBottom: "40px"}}>Select category of transport</h1>
                    <h2>Existing or expected means of transport. <a href="#">Find related transport by clicking here 🛈</a></h2>
                    <Form style={{"marginBottom": "20px"}}>
                        <Row style={{textAlign: "left"}}>
                        {Object.keys(inputData).map((vtype, index) => {
                            let vt = vtype as VehiculeType
                            return (
                                <Col lg="4" key={index}>
                                    <Form.Switch
                                        style={{margin: "10px"}}
                                        id="custom-switch"
                                        label={vt}
                                        key={index}
                                        name={vt}
                                        checked={inputData[vt]}
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
