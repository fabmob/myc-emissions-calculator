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
import {InputStep7, ProjectType, FuelType} from '../frontendTypes'
import Progress from '../components/Progress'
import PercentInput from '../components/PercentInput'

import './Project.css'

export default function ProjectStep7(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    let params = useParams();
    let ftypes = Object.keys(FuelType)
    let [inputData, setInputData ] = useState({energySource: '', energyGrowthSource: ''} as InputStep7)
    let [project, setProject ] = useState({} as ProjectType)
    let projectId = params.projectId
    const [validated, setValidated] = useState(false)
    const unitPerFuelType : {[f in FuelType]: string} = {
        "Gasoline": "l",
        "Diesel": "l",
        "LPG": "l",
        "NG": "kg",
        "Hybrid": "l",
        "Electric": "kWh",
        "None": ""
    }
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
                    let init:InputStep7 = {energySource: data.project.steps[7]?.energySource || '', energyGrowthSource: data.project.steps[7]?.energyGrowthSource || ''}
                    for (let i = 0; i < vtypes.length; i++) {
                        let vtype = vtypes[i]
                        if (data.project.steps[7]?.[vtype]) {
                            init[vtype] = data.project.steps[7][vtype]
                        } else {
                            let tmp = {} as {[key in FuelType]: string[]}
                            for (let j = 0; j < ftypes.length; j++) {
                                let ftype = ftypes[j] as FuelType
                                tmp[ftype] = ["0", "0", "0", "0", "0", "0"]
                            }
                            init[vtype] = tmp
                        }
                    }
                    setInputData(init)
                });
            }
    }, [keycloak, initialized, projectId])
    const updateEnergySource = (event: React.BaseSyntheticEvent) => {
        setInputData((prevInputData: InputStep7) => ({
            ...prevInputData,
            energySource: event.target.value
        }))
    }
    const updateEnergyGrowthSource = (event: React.BaseSyntheticEvent) => {
        setInputData((prevInputData: InputStep7) => ({
            ...prevInputData,
            energyGrowthSource: event.target.value
        }))
    }
    const updateInput = (vtype: string, fueltypestr: string, index: number, event: React.BaseSyntheticEvent) => {
        let ftype = fueltypestr as FuelType
        let value = event.target.value
        setInputData((prevInputData: InputStep7) => {
            let tt = prevInputData[vtype]
            if (tt && typeof(tt) !== 'string') {
                tt[ftype][index] = value
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
        navigate('/project/' + projectId + '/step/6');
    }
    const saveAndGoNextStep = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        setValidated(true);
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
            return
        }
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
            body: JSON.stringify({ inputData: inputData })
        };
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/step/7', requestOptions)
            .then(response => response.json())
            .then(() => navigate('/project/' + projectId + '/step/8'));
    }
    return (
        <Container className="projectStepContainer">
            <Progress project={project} currentStep={7} />
            <Row className="justify-content-md-center align-items-center" style={{minHeight: "calc(100vh - 200px)", marginTop: "20px"}}>
                <Col xs lg="8">
                    <h1>Set up average fuel consumption</h1>
                    <h2 style={{marginTop: "-40px", marginBottom: "40px"}}>Project: {project.name}</h2>
                    <p>Please enter <b>the average fuel/energy consumption</b> - for each vehicle category and per fuel type- for the reference year (average fuel/energy consumption per vehicle per 100 km) as well as the annual change rate for each time period.</p>

                    <p>Remark 1: Negative numbers for the annual change rate means a decrease of fuel/energy consumption. Positive numbers means an increase. </p>
                    <p>Need some help to find the data, <a href="mailto:contact@myc.com">click here to send us an email</a></p>
                    <Form noValidate validated={validated} onSubmit={saveAndGoNextStep}>
                        <Table className="inputTable">
                            <thead>
                                <tr>
                                    <th>Vehicle type</th>
                                    <th style={{width: "180px"}}>Avg energy consumption¹ (l-kW-kg/100km)</th>
                                    <th colSpan={5}>Annual growth of energy² (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                            {Object.keys(project.steps?.[2] || []).map((vtype, index) => {
                                if (!project.steps?.[2] || project.steps[2][vtype] === false || !inputData) {
                                    return null
                                }
                                let inputVt = inputData[vtype] as {[key in FuelType]: string[]}
                                if (inputVt !== undefined && project.steps?.[5]) {
                                    let fuelJsx = Object.keys(project.steps[5][vtype] || []).map((ft, i) => {
                                        let ftype = ft as FuelType
                                        let inputFt = inputVt?.[ftype]
                                        let tmp = project?.steps[5]?.[vtype] as {[key in FuelType]: boolean}
                                        if (!tmp || tmp[ftype] === false || !inputData) {
                                            return  null
                                        }
                                        if (inputFt !== undefined) {
                                            let inp = inputVt?.[ftype]
                                            if (inp) {
                                                if (ftype === "None") {
                                                    return <tr key={i}>
                                                        <td style={{backgroundColor: "#989898", textAlign: "right"}}>{ftype}</td>
                                                        <td>N/A</td>
                                                        <td>N/A</td>
                                                        <td>N/A</td>
                                                        <td>N/A</td>
                                                        <td>N/A</td>
                                                        <td>N/A</td>
                                                    </tr>
                                                }
                                                return (
                                                    <tr key={i}>
                                                        <td style={{backgroundColor: "#989898", textAlign: "right"}}>{ftype}</td>
                                                        <td>
                                                            <InputGroup>
                                                                <Form.Control type="number" required min="0" step="0.1" value={inp[0]} onChange={e => updateInput(vtype, ft, 0, e)} />
                                                                <InputGroup.Text>{unitPerFuelType[ftype]}/100km</InputGroup.Text>
                                                                <Form.Control.Feedback type="invalid">Please enter a positive number, avoid white spaces</Form.Control.Feedback>
                                                            </InputGroup>
                                                        </td>
                                                        <td>
                                                            <PercentInput value={inp[1]} onChange={(e: any) => updateInput(vtype, ft, 1, e)} />
                                                        </td>
                                                        <td>
                                                            <PercentInput value={inp[2]} onChange={(e: any) => updateInput(vtype, ft, 2, e)} />
                                                        </td>
                                                        <td>
                                                            <PercentInput value={inp[3]} onChange={(e: any) => updateInput(vtype, ft, 3, e)} />
                                                        </td>
                                                        <td>
                                                            <PercentInput value={inp[4]} onChange={(e: any) => updateInput(vtype, ft, 4, e)} />
                                                        </td>
                                                        <td>
                                                            <PercentInput value={inp[5]} onChange={(e: any) => updateInput(vtype, ft, 5, e)} />
                                                        </td>
                                                    </tr>
                                                )
                                            }
                                            return null
                                        }
                                        return  null
                                    })
                                    return [
                                        <tr key={index}>
                                            <td style={{backgroundColor: "#989898"}}>{vtype}</td>
                                            <td style={{backgroundColor: "#989898"}} className="reqStar">{ project.referenceYears?.[0]}</td>
                                            <td style={{backgroundColor: "#989898"}} className="reqStar">{ project.referenceYears?.[0]}-{ project.referenceYears?.[1]}</td>
                                            <td style={{backgroundColor: "#989898"}} className="reqStar">{ project.referenceYears?.[1]}-{ project.referenceYears?.[2]}</td>
                                            <td style={{backgroundColor: "#989898"}} className="reqStar">{ project.referenceYears?.[2]}-{ project.referenceYears?.[3]}</td>
                                            <td style={{backgroundColor: "#989898"}} className="reqStar">{ project.referenceYears?.[3]}-{ project.referenceYears?.[4]}</td>
                                            <td style={{backgroundColor: "#989898"}} className="reqStar">{ project.referenceYears?.[4]}-{ project.referenceYears?.[5]}</td>
                                        </tr>
                                        ,
                                        fuelJsx,
                                        <tr key={index + "_spacer"} style={{height: "10px"}}></tr>
                                    ]
                                }
                                return null
                            })
                            }
                            </tbody>
                        </Table>
                        {inputData?
                            <Form.Group as={Row} style={{"marginBottom": "20px"}}>
                                <Form.Label className="reqStar" column sm={2}>[1] Energy consumption source</Form.Label>
                                <Col sm={10}>
                                    <Form.Control type="input" required name="energySource" value={inputData.energySource as string} onChange={updateEnergySource} placeholder=""/>
                                    <Form.Control.Feedback type="invalid">A source is required</Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                        :''}
                        {inputData?
                            <Form.Group as={Row} style={{"marginBottom": "20px"}}>
                                <Form.Label className="reqStar" column sm={2}>[2] Energy growth source</Form.Label>
                                <Col sm={10}>
                                    <Form.Control type="input" required name="energyGrowthSource" value={inputData.energyGrowthSource as string} onChange={updateEnergyGrowthSource} placeholder=""/>
                                    <Form.Control.Feedback type="invalid">A source is required</Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                        :''}
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
