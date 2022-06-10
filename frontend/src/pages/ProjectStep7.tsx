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

import './Project.css'

export default function ProjectStep7(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    let params = useParams();
    let ftypes = Object.keys(FuelType)
    let [inputData, setInputData ] = useState({energySource: '', energyGrowthSource: ''} as InputStep7)
    let [project, setProject ] = useState({} as ProjectType)
    let projectId = params.projectId
    const unitPerFuelType : {[f in FuelType]: string} = {
        "Gasoline": "l",
        "Diesel": "l",
        "LPG": "l",
        "NG": "kg",
        "Hybrid": "l",
        "Electric": "kWh"
    }
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
                    let init:InputStep7 = {energySource: data.project.inputStep7?.energySource || '', energyGrowthSource: data.project.inputStep7?.energyGrowthSource || ''}
                    for (let i = 0; i < vtypes.length; i++) {
                        let vtype = vtypes[i]
                        if (data.project.inputStep7?.[vtype]) {
                            init[vtype] = data.project.inputStep7[vtype]
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
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
            body: JSON.stringify({ inputData: inputData })
        };
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/step/7', requestOptions)
            .then(response => response.json())
            .then(() => navigate('/project/' + projectId + '/viz'));
    }
    return (
        <Container className="projectStepContainer">
            <Progress project={project} currentStep={7} />
            <Row className="justify-content-md-center align-items-center" style={{minHeight: "calc(100vh - 200px)", marginTop: "20px"}}>
                <Col xs lg="8">
                    <h1 style={{marginBottom: "40px"}}>Set up average fuel consumption</h1>
                    <h2>Please enter the average fuel consumption for each vehicle category and per fuel type for the reference year (average fuel consumption per vehicle per 100 km) as well as the annual change rate for each time period</h2>
                    <h2>Need some help to find the data, <a href="">click here to send us an email 📧</a></h2>
                    <Form onSubmit={saveAndGoNextStep}>
                        <Table className="inputTable">
                            <thead>
                                <tr>
                                    <th>Vehicle type</th>
                                    <th style={{width: "180px"}}>Avg energy consumption¹ (l-kW-kg/100km)</th>
                                    <th colSpan={5}>Annual growth of energy² (%)</th>
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
                                        let tmp = project?.inputStep5?.[vtype] as {[key in FuelType]: boolean}
                                        if (!tmp || tmp[ftype] === false || !inputData) {
                                            return  <></>
                                        }
                                        if (inputFt !== undefined) {
                                            let inp = inputVt?.[ftype]
                                            if (inp) {
                                                return (
                                                    <tr key={i}>
                                                        <td style={{backgroundColor: "#989898"}}>{ftype}</td>
                                                        <td>
                                                            <InputGroup>
                                                                <Form.Control type="number" required min="0" step="0.1" value={inp[0]} onChange={e => updateInput(vtype, ft, 0, e)} />
                                                                <InputGroup.Text>{unitPerFuelType[ftype]}/100km</InputGroup.Text>
                                                            </InputGroup>
                                                        </td>
                                                        <td>
                                                            <InputGroup>
                                                                <Form.Control type="number" required min="-100" max="100" step="0.01" value={inp[1]} onChange={e => updateInput(vtype, ft, 1, e)} />
                                                                <InputGroup.Text>%</InputGroup.Text>
                                                            </InputGroup>
                                                        </td>
                                                        <td>
                                                            <InputGroup>
                                                                <Form.Control type="number" required min="-100" max="100" step="0.01" value={inp[2]} onChange={e => updateInput(vtype, ft, 2, e)} />
                                                                <InputGroup.Text>%</InputGroup.Text>
                                                            </InputGroup>
                                                        </td>
                                                        <td>
                                                            <InputGroup>
                                                                <Form.Control type="number" required min="-100" max="100" step="0.01" value={inp[3]} onChange={e => updateInput(vtype, ft, 3, e)} />
                                                                <InputGroup.Text>%</InputGroup.Text>
                                                            </InputGroup>
                                                        </td>
                                                        <td>
                                                            <InputGroup>
                                                                <Form.Control type="number" required min="-100" max="100" step="0.01" value={inp[4]} onChange={e => updateInput(vtype, ft, 4, e)} />
                                                                <InputGroup.Text>%</InputGroup.Text>
                                                            </InputGroup>
                                                        </td>
                                                        <td>
                                                            <InputGroup>
                                                                <Form.Control type="number" required min="-100" max="100" step="0.01" value={inp[5]} onChange={e => updateInput(vtype, ft, 5, e)} />
                                                                <InputGroup.Text>%</InputGroup.Text>
                                                            </InputGroup>
                                                        </td>
                                                    </tr>
                                                )
                                            }
                                            return <></>
                                        }
                                        return  <></>
                                    })
                                    let inp = inputData?.[vtype]
                                    let sums = [0,0,0,0,0,0]
                                    if (inp && typeof(inp) !== 'string') {
                                        let fuels = Object.keys(project.inputStep5[vtype] || [])
                                        for (let i = 0; i < fuels.length; i++) {
                                            let ftype = fuels[i] as FuelType
                                            for (let j = 0; j < sums.length; j++) {
                                                sums[j] += parseFloat(inp[ftype][j]) || 0
                                            }
                                        }
                                    }
                                    return [
                                        <tr key={index}>
                                            <td style={{backgroundColor: "#989898"}}>{vtype}</td>
                                            <td style={{backgroundColor: "#989898"}}>{sums[0]}</td>
                                            <td style={{backgroundColor: "#989898"}}>{sums[1]}%</td>
                                            <td style={{backgroundColor: "#989898"}}>{sums[2]}%</td>
                                            <td style={{backgroundColor: "#989898"}}>{sums[3]}%</td>
                                            <td style={{backgroundColor: "#989898"}}>{sums[4]}%</td>
                                            <td style={{backgroundColor: "#989898"}}>{sums[5]}%</td>
                                        </tr>
                                        ,
                                        fuelJsx
                                    ]
                                }
                                return <></>
                            })
                            }
                            </tbody>
                        </Table>
                        {inputData?
                            <Form.Group as={Row} style={{"marginBottom": "20px"}}>
                                <Form.Label column sm={2}>[1] Energy consumption source</Form.Label>
                                <Col sm={10}>
                                    <Form.Control type="input" name="energySource" value={inputData.energySource as string} onChange={updateEnergySource} placeholder=""/>
                                </Col>
                            </Form.Group>
                        :''}
                        {inputData?
                            <Form.Group as={Row} style={{"marginBottom": "20px"}}>
                                <Form.Label column sm={2}>[2] Energy growth source</Form.Label>
                                <Col sm={10}>
                                    <Form.Control type="input" name="energyGrowthSource" value={inputData.energyGrowthSource as string} onChange={updateEnergyGrowthSource} placeholder=""/>
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
