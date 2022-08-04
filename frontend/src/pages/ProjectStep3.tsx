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
import Progress from '../components/Progress'
import PercentInput from '../components/PercentInput'

import './Project.css'


export default function ProjectStep3(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    let params = useParams();
    let [inputData, setInputData ] = useState({vktSource: '', vktGrowthSource: ''} as InputStep3)
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
                    let init:InputStep3 = {vktSource: data.project.steps[3]?.vktSource || '', vktGrowthSource: data.project.steps[3]?.vktGrowthSource || ''}
                    for (let i = 0; i < vtypes.length; i++) {
                        let vtype = vtypes[i]
                        if (data.project.steps[3]?.[vtype]) {
                            init[vtype] = data.project.steps[3][vtype]
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
    const updateGrowthSource = (event: React.BaseSyntheticEvent) => {
        setInputData((prevInputData: InputStep3) => ({
            ...prevInputData,
            vktGrowthSource: event.target.value
        }))
    }
    const updateInput = (event: React.BaseSyntheticEvent, index?: number) => {
        let target = event.target as HTMLInputElement
        let vtype = target.name

        setInputData((prevInputData: InputStep3) => {
            let vtypeobj = prevInputData[vtype]
            if (vtypeobj && typeof(vtypeobj) != 'string') {
                if (index === undefined) {
                    vtypeobj.vkt = target.value
                } else {
                    vtypeobj.vktRate[index] = target.value
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
    const goPreviousStep = () => {
        navigate('/project/' + projectId + '/step/2');
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
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/step/3', requestOptions)
            .then(response => response.json())
            .then(() => navigate('/project/' + projectId + '/step/4'));
    }
    return (
        <Container className="projectStepContainer">
            <Progress project={project} currentStep={3} />
            <Row className="justify-content-md-center align-items-center" style={{minHeight: "calc(100vh - 200px)", marginTop: "20px"}}>
                <Col xs lg="8">
                    <h1>Set up transport activity data</h1>
                    <h2 style={{marginTop: "-40px", marginBottom: "40px"}}>Project: {project.name}</h2>
                    <h2>Please enter the <b> vehicle kilometers travelled (Mio km)</b> in the table delivered by the transport plannig tool for the reference year.</h2>

                    <h2>For BAU calculations, please enter the expected % of growth or decrease for the corresponding years in the same way. </h2>

                    <h2><i>Data input for the vehicle kilometers travelled in the reference year is mandatory.</i></h2>
                    <Form noValidate validated={validated} onSubmit={saveAndGoNextStep}>
                        <Table className="inputTable">
                            <thead>
                                <tr>
                                    <th>Vehicle type</th>
                                    <th style={{width: "200px"}}>VKT¹ (Mkm/year)</th>
                                    <th colSpan={5}>Annual growth of VKT² (%)</th>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td className="reqStar">{project.referenceYear} (RY)</td>
                                    <td className="reqStar">{project.referenceYear}-2025</td>
                                    <td className="reqStar">2025-2030</td>
                                    <td className="reqStar">2030-2035</td>
                                    <td className="reqStar">2035-2040</td>
                                    <td className="reqStar">2040-2050</td>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(project.steps?.[2] || []).map((vtype, index) => {
                                    if (!project.steps?.[2] || project.steps[2][vtype] === false || !inputData) {
                                        return <></>
                                    }
                                    let inputVt = inputData[vtype]
                                    if (inputVt && typeof(inputVt) !== 'string')
                                        return (
                                            <tr key={index}>
                                                <td style={{backgroundColor: "#989898"}}>{vtype}</td>
                                                <td>
                                                    <InputGroup>
                                                        <Form.Control type="number" required min="0" step="any" name={vtype} value={inputVt.vkt} onChange={updateInput} placeholder="" />
                                                        <InputGroup.Text>Mkm/y</InputGroup.Text>
                                                        <Form.Control.Feedback type="invalid">Please enter a positive number, avoid white spaces</Form.Control.Feedback>
                                                    </InputGroup>

                                                </td>
                                                <td>
                                                    <PercentInput name={vtype} value={inputVt.vktRate[0]} onChange={(e:any) => updateInput(e, 0)}/>
                                                </td>
                                                <td>
                                                    <PercentInput name={vtype} value={inputVt.vktRate[1]} onChange={(e:any) => updateInput(e, 1)}/>
                                                </td>
                                                <td>
                                                    <PercentInput name={vtype} value={inputVt.vktRate[2]} onChange={(e:any) => updateInput(e, 2)}/>
                                                </td>
                                                <td>
                                                    <PercentInput name={vtype} value={inputVt.vktRate[3]} onChange={(e:any) => updateInput(e, 3)}/>
                                                </td>
                                                <td>
                                                    <PercentInput name={vtype} value={inputVt.vktRate[4]} onChange={(e:any) => updateInput(e, 4)}/>
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
                                <Form.Label className="reqStar" column sm={2}>[1] Vkt source</Form.Label>
                                <Col sm={10}>
                                    <Form.Control type="input" name="vktSource" required value={inputData.vktSource as string} onChange={updateSource} placeholder="DGT Spain, 2022"/>
                                    <Form.Control.Feedback type="invalid">A source is required</Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                        :''}
                        {inputData ?
                            <Form.Group as={Row} style={{"marginBottom": "20px"}}>
                                <Form.Label className="reqStar" column sm={2}>[2] Vkt growth source</Form.Label>
                                <Col sm={10}>
                                    <Form.Control type="input" name="vktGrowthSource" required value={inputData.vktGrowthSource as string} onChange={updateGrowthSource} placeholder="EIA, 2022"/>
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
