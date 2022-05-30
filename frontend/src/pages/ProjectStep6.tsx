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
import {InputStep6, ProjectType, VehiculeType, FuelType} from '../frontendTypes'

import './Project.css'

export default function ProjectStep6(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    let params = useParams();
    let init:InputStep6 = {source: ''}
    let vtypes = Object.keys(VehiculeType)
    let ftypes = Object.keys(FuelType)
    for (let i = 0; i < vtypes.length; i++) {
        let vtype = vtypes[i] as VehiculeType
        let tmp = {} as {[key in FuelType]: number[]}
        for (let j = 0; j < ftypes.length; j++) {
            let ftype = ftypes[j] as FuelType
            tmp[ftype] = [0, 0, 0, 0, 0, 0]
        }
        init[vtype] = tmp
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
            fetch('http://localhost:8081/api/project/' + projectId, requestOptions)
                .then(response => response.json())
                .then(data => {
                    console.log("get projetcs reply", data)
                    setProject(data.project)
                    if (data.project.inputStep6){
                        setInputData(data.project.inputStep6)
                    } else {
                        if (data.project.inputStep5) {
                            setInputData(prevInputData => {
                                for (let i = 0; i < vtypes.length; i++) {
                                    let vtype = vtypes[i] as VehiculeType
                                    let ftypes = Object.keys(data.project.inputStep5[vtype]).filter(ftype => data.project.inputStep5[vtype][ftype])
                                    let tmp = {} as {[key in FuelType]: number[]}
                                    if (ftypes.length === 1) {
                                        // If we only have one fuel type, we can initalize everything at 100%
                                        let ftype = ftypes[0] as FuelType
                                        tmp[ftype] = [100, 100, 100, 100, 100, 100]
                                        prevInputData[vtype] = tmp
                                    }
                                }
                                return prevInputData
                            })
                        }
                    }
                });
            }
    }, [keycloak, initialized, projectId, vtypes])
    const updateSource = (event: React.BaseSyntheticEvent) => {
        setInputData((prevInputData: InputStep6) => ({
            ...prevInputData,
            source: event.target.value
        }))
    }
    const updateInput = (vtypestr: string, fueltypestr: string, index: number, event: React.BaseSyntheticEvent) => {
        let vtype = vtypestr as VehiculeType
        let ftype = fueltypestr as FuelType
        let value = event.target.value
        setInputData((prevInputData: InputStep6) => {
            let tt = prevInputData[vtype]
            if (tt) {
                tt[ftype][index] = parseInt(value) || 0
                return {
                    ...prevInputData,
                    [vtypestr]: tt
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
        fetch('http://localhost:8081/api/project/' + projectId + '/step/6', requestOptions)
            .then(response => response.json())
            .then(data => navigate('/project/' + projectId + '/step/5'));
    }
    const saveAndGoNextStep = () => {
        // TODO: validate content ?
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
            body: JSON.stringify({ inputData: inputData })
        };
        fetch('http://localhost:8081/api/project/' + projectId + '/step/6', requestOptions)
            .then(response => response.json())
            .then(data => navigate('/project/' + projectId + '/step/7'));
    }
    return (
        <Container className="projectStepContainer">
            <Row className="justify-content-md-center align-items-center" style={{height: "calc(100vh - 200px)"}}>
                <Col xs lg="8">
                    <h1 style={{marginBottom: "40px"}}>Set up VKT breakdown by fuel type</h1>
                    <h2>Please enter the percentage of Vehicle Kilometers Travelled (vkt) per vehicle category and fuel type for the Reference Year and for future years</h2>
                    <Table className="inputTable">
                        <thead>
                            <tr>
                                <th>Vehicle type</th>
                                <th colSpan={6}>VKT per category (%)</th>
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
                            let vt = vtype as VehiculeType
                            if (!project.inputStep2 || project.inputStep2[vt] === false || !inputData) {
                                return <></>
                            }
                            let inputVt = inputData[vt]
                            if (inputVt !== undefined && project.inputStep5) {
                                let fuelJsx = Object.keys(project.inputStep5[vt] || []).map((ft, i) => {
                                    let ftype = ft as FuelType
                                    let inputFt = inputVt?.[ftype]
                                    let tmp = project?.inputStep5?.[vt]
                                    if (!tmp || tmp[ftype] === false || !inputData) {
                                        return <></>
                                    }
                                    if (inputFt !== undefined) {
                                        let inp = inputData?.[vt]?.[ftype]
                                        if (inp) {
                                            return (
                                                <tr key={i}>
                                                    <td style={{backgroundColor: "#989898"}}>{ftype}</td>
                                                    <td>
                                                        <InputGroup>
                                                            <Form.Control type="input" value={inp[0]} onChange={e => updateInput(vtype, ft, 0, e)} />
                                                            <InputGroup.Text>%</InputGroup.Text>
                                                        </InputGroup>
                                                    </td>
                                                    <td>
                                                        <InputGroup>
                                                            <Form.Control type="input" value={inp[1]} onChange={e => updateInput(vtype, ft, 1, e)} />
                                                            <InputGroup.Text>%</InputGroup.Text>
                                                        </InputGroup>
                                                    </td>
                                                    <td>
                                                        <InputGroup>
                                                            <Form.Control type="input" value={inp[2]} onChange={e => updateInput(vtype, ft, 2, e)} />
                                                            <InputGroup.Text>%</InputGroup.Text>
                                                        </InputGroup>
                                                    </td>
                                                    <td>
                                                        <InputGroup>
                                                            <Form.Control type="input" value={inp[3]} onChange={e => updateInput(vtype, ft, 3, e)} />
                                                            <InputGroup.Text>%</InputGroup.Text>
                                                        </InputGroup>
                                                    </td>
                                                    <td>
                                                        <InputGroup>
                                                            <Form.Control type="input" value={inp[4]} onChange={e => updateInput(vtype, ft, 4, e)} />
                                                            <InputGroup.Text>%</InputGroup.Text>
                                                        </InputGroup>
                                                    </td>
                                                    <td>
                                                        <InputGroup>
                                                            <Form.Control type="input" value={inp[5]} onChange={e => updateInput(vtype, ft, 5, e)} />
                                                            <InputGroup.Text>%</InputGroup.Text>
                                                        </InputGroup>
                                                    </td>
                                                </tr>
                                            )
                                        }
                                    }
                                    return <></>
                                })
                                let inp = inputData?.[vt]
                                let sums = [0,0,0,0,0,0]
                                if (inp) {
                                    let fuels = Object.keys(project.inputStep5[vt] || [])
                                    for (let i = 0; i < fuels.length; i++) {
                                        let ftype = fuels[i] as FuelType
                                        for (let j = 0; j < sums.length; j++) {
                                            sums[j] += inp?.[ftype]?.[j] || 0
                                        }
                                    }
                                }
                                if (vt === "Non motorized vehicle") {
                                    sums = [100, 100, 100, 100, 100, 100]
                                }
                                return [
                                    <tr key={index}>
                                        <td style={{backgroundColor: "#989898"}}>{vtype}</td>
                                        <td style={{color: sums[0] !== 100 ? 'orange' : 'green', backgroundColor: "#989898"}}>{sums[0]}%</td>
                                        <td style={{color: sums[1] !== 100 ? 'orange' : 'green', backgroundColor: "#989898"}}>{sums[1]}%</td>
                                        <td style={{color: sums[2] !== 100 ? 'orange' : 'green', backgroundColor: "#989898"}}>{sums[2]}%</td>
                                        <td style={{color: sums[3] !== 100 ? 'orange' : 'green', backgroundColor: "#989898"}}>{sums[3]}%</td>
                                        <td style={{color: sums[4] !== 100 ? 'orange' : 'green', backgroundColor: "#989898"}}>{sums[4]}%</td>
                                        <td style={{color: sums[5] !== 100 ? 'orange' : 'green', backgroundColor: "#989898"}}>{sums[5]}%</td>
                                    </tr>
                                    ,
                                    fuelJsx
                                ]
                            } else {
                                return <></>
                            }
                        })
                        }
                        </tbody>
                    </Table>
                    {inputData?
                        <Form.Group as={Row} style={{"marginBottom": "20px"}}>
                            <Form.Label column sm={2}>Source</Form.Label>
                            <Col sm={10}>
                                <Form.Control type="input" name="vktSource" value={inputData.source} onChange={updateSource} placeholder=""/>
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
