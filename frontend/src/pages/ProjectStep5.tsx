import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useParams, useNavigate } from "react-router-dom"
import Table from 'react-bootstrap/Table'
import Form from 'react-bootstrap/Form'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import {InputStep5, ProjectType, FuelType} from '../frontendTypes'

import './Project.css'

export default function ProjectStep5(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    let params = useParams();
    let ftypes = Object.keys(FuelType)
    let [inputData, setInputData ] = useState({source: ''} as InputStep5)
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
                    if (data.project.inputStep5){
                        setInputData(data.project.inputStep5)
                    } else {
                        let vtypes = Object.keys(data.project.inputStep2)
                        let init:InputStep5 = {source: ''}
                        for (let i = 0; i < vtypes.length; i++) {
                            let tmp = {} as {[key in FuelType]: boolean}
                            for (let j = 0; j < ftypes.length; j++) {
                                let ftype = ftypes[j] as FuelType
                                tmp[ftype] = false
                            }
                            init[vtypes[i]] = tmp
                        }
                        setInputData(init)
                    }
                });
            }
    }, [keycloak, initialized, projectId])
    const updateSource = (event: React.BaseSyntheticEvent) => {
        setInputData((prevInputData: InputStep5) => ({
            ...prevInputData,
            source: event.target.value
        }))
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

    const saveAndGoPreviousStep = () => {
        // TODO: validate content ?
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
            body: JSON.stringify({ inputData: inputData })
        };
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/step/5', requestOptions)
            .then(response => response.json())
            .then(() => navigate('/project/' + projectId + '/step/4'));
    }
    const saveAndGoNextStep = () => {
        // TODO: validate content ?
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
            body: JSON.stringify({ inputData: inputData })
        };
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/step/5', requestOptions)
            .then(response => response.json())
            .then(() => navigate('/project/' + projectId + '/step/6'));
    }
    return (
        <Container className="projectStepContainer">
            <Row className="justify-content-md-center align-items-center" style={{height: "calc(100vh - 200px)"}}>
                <Col xs lg="8">
                    <h1 style={{marginBottom: "40px"}}>Select fuel type per transport</h1>
                    <h2>Existing or expected means of transport</h2>
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
                            {Object.keys(project.inputStep2 || []).map((vtype, index) => {
                                let vt = vtype
                                if (!project.inputStep2 || project.inputStep2[vt] === false || !inputData) {
                                    return <></>
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
                                                return <></>
                                            })}
                                        </tr>
                                    )
                                return <></>
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
