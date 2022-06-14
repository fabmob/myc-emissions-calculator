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
import Progress from '../components/Progress'

import './Project.css'


export default function ProjectStep1(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    let params = useParams();
    let [inputData, setInputData ] = useState({
        population: "0",
        populationRate: ["0", "0", "0", "0", "0"],
        populationSource: "",
        populationGrowthSource: "",
        gdp: "0",
        gdpRate: ["0", "0", "0", "0", "0"],
        gdpSource: "",
        gdpGrowthSource: ""
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
                rateToChange[index] = target.value
                return {
                    ...prevInputData,
                    [name]: rateToChange
                }
            })
        }
    }
    const saveAndGoNextStep = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
            body: JSON.stringify({ inputData: inputData })
        };
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/step/1', requestOptions)
            .then(response => response.json())
            .then(() => navigate('/project/' + projectId + '/step/2'));
    }
    return (
        <Container className="projectStepContainer">
            <Progress project={project} currentStep={1} />
            <Row className="justify-content-md-center align-items-center" style={{minHeight: "calc(100vh - 200px)", marginTop: "20px"}}>
                <Col xs lg="8">
                    <h1>Set up socio economic data</h1>
                    <h2 style={{marginTop: "-40px", marginBottom: "40px"}}>Project: {project.name}</h2>
                    <h2>Please enter the <b>population</b> and the <b>gross domestic product (GDP)</b>  of your city for the reference year in the table below. For BAU scenario calculations please also enter corresponding annual growth rates.  </h2>

                    <h2><i>Data input for the population in the reference year is mandatory, data input for the GDP is optional. Provide the sources of the data if possible.</i></h2>
                    
                    <h2>Need some help to find the data, <a href="mailto:contact@myc.com">click here to send us an email</a></h2>
                    <Form onSubmit={saveAndGoNextStep}>
                        <Table className="inputTable">
                            <thead>
                                <tr>
                                    <th>Population¹ (number of inhabitants)</th>
                                    <th colSpan={5}>Annual growth of population² (%)</th>
                                </tr>
                                <tr>
                                    <td>{project.referenceYear} (RY)</td>
                                    <td>{project.referenceYear}-2025</td>
                                    <td>2025-2030</td>
                                    <td>2030-2035</td>
                                    <td>2030-2040</td>
                                    <td>2040-2050</td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><Form.Control type="number" required name="population" min="1" value={inputData.population} onChange={updateInput} placeholder="" /></td>
                                    <td>
                                        <InputGroup>
                                            <Form.Control type="number" required name="populationRate" min="-100" max="100" step="0.01" value={inputData.populationRate[0]} onChange={e => updateInput(e, 0)} placeholder="" />
                                            <InputGroup.Text>%</InputGroup.Text>
                                        </InputGroup>
                                    </td>
                                    <td>
                                        <InputGroup>
                                            <Form.Control type="number" required name="populationRate" min="-100" max="100" step="0.01" value={inputData.populationRate[1]} onChange={e => updateInput(e, 1)} placeholder="" />
                                            <InputGroup.Text>%</InputGroup.Text>
                                        </InputGroup>
                                    </td>
                                    <td>
                                        <InputGroup>
                                            <Form.Control type="number" required name="populationRate" min="-100" max="100" step="0.01" value={inputData.populationRate[2]} onChange={e => updateInput(e, 2)} placeholder="" />
                                            <InputGroup.Text>%</InputGroup.Text>
                                        </InputGroup>
                                    </td>
                                    <td>
                                        <InputGroup>
                                            <Form.Control type="number" required name="populationRate" min="-100" max="100" step="0.01" value={inputData.populationRate[3]} onChange={e => updateInput(e, 3)} placeholder="" />
                                            <InputGroup.Text>%</InputGroup.Text>
                                        </InputGroup>
                                    </td>
                                    <td>
                                        <InputGroup>
                                            <Form.Control type="number" required name="populationRate" min="-100" max="100" step="0.01" value={inputData.populationRate[4]} onChange={e => updateInput(e, 4)} placeholder="" />
                                            <InputGroup.Text>%</InputGroup.Text>
                                        </InputGroup>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                        <Form.Group as={Row} style={{"marginBottom": "20px"}}>
                            <Form.Label column sm={3}>[1] RY population source</Form.Label>
                            <Col sm={9}>
                                <Form.Control type="input" name="populationSource" value={inputData.populationSource} onChange={updateInput} placeholder=""/>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} style={{"marginBottom": "20px"}}>
                            <Form.Label column sm={3}>[2] Population growth source</Form.Label>
                            <Col sm={9}>
                                <Form.Control type="input" name="populationGrowthSource" value={inputData.populationGrowthSource} onChange={updateInput} placeholder=""/>
                            </Col>
                        </Form.Group>
                        <Table className="inputTable">
                            <thead>
                                <tr>
                                    <th>GDP¹ (Billion $)</th>
                                    <th colSpan={5}>Annual growth of GDP² (%)</th>
                                </tr>
                                <tr>
                                    <td>{project.referenceYear} (RY)</td>
                                    <td>{project.referenceYear}-2025</td>
                                    <td>2025-2030</td>
                                    <td>2030-2035</td>
                                    <td>2035-2040</td>
                                    <td>2040-2050</td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <InputGroup>
                                            <Form.Control type="number" required min="1" name="gdp" value={inputData.gdp} onChange={e => updateInput(e)} placeholder="" />
                                            <InputGroup.Text>B$</InputGroup.Text>
                                        </InputGroup>
                                    </td>
                                    <td>
                                        <InputGroup>
                                            <Form.Control type="number" required name="gdpRate" min="-100" max="100" step="0.01" value={inputData.gdpRate[0]} onChange={e => updateInput(e, 0)} placeholder="" />
                                            <InputGroup.Text>%</InputGroup.Text>
                                        </InputGroup>
                                    </td>
                                    <td>
                                        <InputGroup>
                                            <Form.Control type="number" required name="gdpRate" min="-100" max="100" step="0.01" value={inputData.gdpRate[1]} onChange={e => updateInput(e, 1)} placeholder="" />
                                            <InputGroup.Text>%</InputGroup.Text>
                                        </InputGroup>
                                    </td>
                                    <td>
                                        <InputGroup>
                                            <Form.Control type="number" required name="gdpRate" min="-100" max="100" step="0.01" value={inputData.gdpRate[2]} onChange={e => updateInput(e, 2)} placeholder="" />
                                            <InputGroup.Text>%</InputGroup.Text>
                                        </InputGroup>
                                    </td>
                                    <td>
                                        <InputGroup>
                                            <Form.Control type="number" required name="gdpRate" min="-100" max="100" step="0.01" value={inputData.gdpRate[3]} onChange={e => updateInput(e, 3)} placeholder="" />
                                            <InputGroup.Text>%</InputGroup.Text>
                                        </InputGroup>
                                    </td>
                                    <td>
                                        <InputGroup>
                                            <Form.Control type="number" required name="gdpRate" min="-100" max="100" step="0.01" value={inputData.gdpRate[4]} onChange={e => updateInput(e, 4)} placeholder="" />
                                            <InputGroup.Text>%</InputGroup.Text>
                                        </InputGroup>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                        <Form.Group as={Row} style={{"marginBottom": "20px"}}>
                            <Form.Label column sm={3}>[1] RY gdp source</Form.Label>
                            <Col sm={9}>
                                <Form.Control type="input" name="gdpSource" value={inputData.gdpSource} onChange={updateInput}  placeholder=""/>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} style={{"marginBottom": "20px"}}>
                            <Form.Label column sm={3}>[2] Gdp growth source</Form.Label>
                            <Col sm={9}>
                                <Form.Control type="input" name="gdpGrowthSource" value={inputData.gdpGrowthSource} onChange={updateInput}  placeholder=""/>
                            </Col>
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Next
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>

    )
}
