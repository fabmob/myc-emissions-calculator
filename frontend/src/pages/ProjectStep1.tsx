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
import {InputStep1, ProjectType} from '../frontendTypes'

import './Project.css'


export default function ProjectStep1(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    let params = useParams();
    let [inputData, setInputData ] = useState({
        population: 0,
        populationRate: [0, 0, 0, 0, 0],
        populationSource: "",
        gdp: 0,
        gdpRate: [0, 0, 0, 0, 0],
        gdpSource: ""
    } as InputStep1)
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
                    if (data.project.inputStep1 !== null){
                        setInputData(data.project.inputStep1)
                    }
                });
            }
    }, [keycloak, initialized, projectId])
    const updateInput = (event: React.BaseSyntheticEvent, index?: number) => {
        let target = event.target as HTMLInputElement
        if (index === undefined) {
            setInputData((prevInputData) => ({
                ...prevInputData,
                [target.name]: target.value
            }))
        } else {
            let name = target.name as "populationRate" | "gdpRate"
            setInputData((prevInputData) => {
                let rateToChange = prevInputData[name]
                let percent = parseInt(target.value) || 0
                percent = Math.min(100, percent)
                rateToChange[index] = percent
                return {
                    ...prevInputData,
                    [name]: rateToChange
                }
            })
        }
    }
    const saveAndGoNextStep = () => {
        // TODO: validate content ?
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
            body: JSON.stringify({ inputData: inputData })
        };
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/step/1', requestOptions)
            .then(response => response.json())
            .then(data => navigate('/project/' + projectId + '/step/2'));
    }
    return (
        <Container className="projectStepContainer">
            <Row className="justify-content-md-center align-items-center" style={{minHeight: "calc(100vh - 200px)"}}>
                <Col xs lg="8">
                    <h1>Set up socio economic data</h1>
                    <h2>Need some help to find the data, <a href="">click here to send us an email 📧</a></h2>
                    <Table className="inputTable">
                        <thead>
                            <tr>
                                <th>Population (number of inhabitants)</th>
                                <th colSpan={5}>Annual growth of population (%)</th>
                            </tr>
                            <tr>
                                <td>{project.referenceYear} (RY)</td>
                                <td>2018-2020</td>
                                <td>2020-2025</td>
                                <td>2025-2030</td>
                                <td>2030-2040</td>
                                <td>2040-2050</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><Form.Control type="input" name="population" value={inputData.population} onChange={updateInput} placeholder="" /></td>
                                <td>
                                    <InputGroup>
                                        <Form.Control type="input" name="populationRate" value={inputData.populationRate[0]} onChange={e => updateInput(e, 0)} placeholder="" />
                                        <InputGroup.Text>%</InputGroup.Text>
                                    </InputGroup>
                                </td>
                                <td>
                                    <InputGroup>
                                        <Form.Control type="input" name="populationRate" value={inputData.populationRate[1]} onChange={e => updateInput(e, 1)} placeholder="" />
                                        <InputGroup.Text>%</InputGroup.Text>
                                    </InputGroup>
                                </td>
                                <td>
                                    <InputGroup>
                                        <Form.Control type="input" name="populationRate" value={inputData.populationRate[2]} onChange={e => updateInput(e, 2)} placeholder="" />
                                        <InputGroup.Text>%</InputGroup.Text>
                                    </InputGroup>
                                </td>
                                <td>
                                    <InputGroup>
                                        <Form.Control type="input" name="populationRate" value={inputData.populationRate[3]} onChange={e => updateInput(e, 3)} placeholder="" />
                                        <InputGroup.Text>%</InputGroup.Text>
                                    </InputGroup>
                                </td>
                                <td>
                                    <InputGroup>
                                        <Form.Control type="input" name="populationRate" value={inputData.populationRate[4]} onChange={e => updateInput(e, 4)} placeholder="" />
                                        <InputGroup.Text>%</InputGroup.Text>
                                    </InputGroup>
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                    <Form.Group as={Row} style={{"marginBottom": "20px"}}>
                        <Form.Label column sm={2}>Source</Form.Label>
                        <Col sm={10}>
                            <Form.Control type="input" name="populationSource" value={inputData.populationSource} onChange={updateInput} placeholder=""/>
                        </Col>
                    </Form.Group>
                    <Table className="inputTable">
                        <thead>
                            <tr>
                                <th>GDP (Billion $)</th>
                                <th colSpan={5}>Annual growth of GDP (%)</th>
                            </tr>
                            <tr>
                                <td>{project.referenceYear} (RY)</td>
                                <td>2018-2020</td>
                                <td>2020-2025</td>
                                <td>2025-2030</td>
                                <td>2030-2040</td>
                                <td>2040-2050</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><Form.Control type="input" name="gdp" value={inputData.gdp} onChange={e => updateInput(e)} placeholder="" /></td>
                                <td>
                                    <InputGroup>
                                        <Form.Control type="input" name="gdpRate" value={inputData.gdpRate[0]} onChange={e => updateInput(e, 0)} placeholder="" />
                                        <InputGroup.Text>%</InputGroup.Text>
                                    </InputGroup>
                                </td>
                                <td>
                                    <InputGroup>
                                        <Form.Control type="input" name="gdpRate" value={inputData.gdpRate[1]} onChange={e => updateInput(e, 1)} placeholder="" />
                                        <InputGroup.Text>%</InputGroup.Text>
                                    </InputGroup>
                                </td>
                                <td>
                                    <InputGroup>
                                        <Form.Control type="input" name="gdpRate" value={inputData.gdpRate[2]} onChange={e => updateInput(e, 2)} placeholder="" />
                                        <InputGroup.Text>%</InputGroup.Text>
                                    </InputGroup>
                                </td>
                                <td>
                                    <InputGroup>
                                        <Form.Control type="input" name="gdpRate" value={inputData.gdpRate[3]} onChange={e => updateInput(e, 3)} placeholder="" />
                                        <InputGroup.Text>%</InputGroup.Text>
                                    </InputGroup>
                                </td>
                                <td>
                                    <InputGroup>
                                        <Form.Control type="input" name="gdpRate" value={inputData.gdpRate[4]} onChange={e => updateInput(e, 4)} placeholder="" />
                                        <InputGroup.Text>%</InputGroup.Text>
                                    </InputGroup>
                                </td>
                            </tr>
                        </tbody>
                    </Table>
                    <Form.Group as={Row} style={{"marginBottom": "20px"}}>
                        <Form.Label column sm={2}>Source</Form.Label>
                        <Col sm={10}>
                            <Form.Control type="input" name="gdpSource" value={inputData.gdpSource} onChange={updateInput}  placeholder=""/>
                        </Col>
                    </Form.Group>
                    <Button variant="primary" onClick={saveAndGoNextStep}>
                        Next
                    </Button>
                </Col>
            </Row>
        </Container>

    )
}
