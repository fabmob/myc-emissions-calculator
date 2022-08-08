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
import {InputStep6, ProjectType, FuelType} from '../frontendTypes'
import Progress from '../components/Progress'
import PercentInput from '../components/PercentInput'
import Alert from 'react-bootstrap/Alert'

import './Project.css'

export default function ProjectStep6(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    let params = useParams();
    let [inputData, setInputData ] = useState({source: ''} as InputStep6)
    let [project, setProject ] = useState({} as ProjectType)
    let [vtypeWarning, setVtypeWarning] = useState(false)
    let [sumWarning, setSumWarning] = useState(false)
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
                    if (data.project.steps[5]) {
                        let vtypes = Object.keys(data.project.steps[2])
                        setInputData(prevInputData => {
                            prevInputData.source = data.project.steps[6]?.source || ''
                            for (let i = 0; i < vtypes.length; i++) {
                                let vtype = vtypes[i]
                                if (!data.project.steps[5][vtype]) {
                                    setVtypeWarning(true)
                                    continue
                                }
                                let ftypes = Object.keys(data.project.steps[5][vtype]).filter(ftype => data.project.steps[5][vtype][ftype])
                                let tmp = {} as {[key in FuelType]: string[]}
                                if (ftypes.length === 1) {
                                    // If we only have one fuel type, we can initalize everything at 100%
                                    let ftype = ftypes[0] as FuelType
                                    tmp[ftype] = ["100", "100", "100", "100", "100", "100"]
                                    prevInputData[vtype] = tmp
                                } else {
                                    for (let j = 0; j < ftypes.length; j++) {
                                        let ftype = ftypes[j] as FuelType
                                        tmp[ftype] = data.project.steps[6]?.[vtype]?.[ftype] || ["0", "0", "0", "0", "0", "0"]
                                    }
                                    prevInputData[vtype] = tmp
                                }
                            }
                            return prevInputData
                        })
                    }
                });
            }
    }, [keycloak, initialized, projectId])
    const updateSource = (event: React.BaseSyntheticEvent) => {
        setInputData((prevInputData: InputStep6) => ({
            ...prevInputData,
            source: event.target.value
        }))
    }
    const updateInput = (vtype: string, fueltypestr: string, index: number, event: React.BaseSyntheticEvent) => {
        let ftype = fueltypestr as FuelType
        let value = event.target.value
        setInputData((prevInputData: InputStep6) => {
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

    const areSumsOk = (input: InputStep6) => {
        let vtypes = Object.keys(input)
        for (let i = 0; i < vtypes.length; i++) {
            const vtype = vtypes[i];
            let inputVal = input[vtype]
            if (typeof(inputVal) !== 'string') {
                let sums = [0,0,0,0,0,0]
                let ftypes = Object.keys(inputVal)
                for (let j = 0; j < ftypes.length; j++) {
                    const ftype = ftypes[j] as FuelType;
                    for (let k = 0; k < sums.length; k++) {
                        sums[k] += parseFloat(inputVal[ftype][k]) || 0
                    }
                }
                for (let k = 0; k < sums.length; k++) {
                    if (sums[k] != 100) {
                        return false
                    }
                }
            }
        }
        return true
    }
    const goPreviousStep = () => {
        navigate('/project/' + projectId + '/step/5');
    }
    const saveAndGoNextStep = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        setValidated(true);
        if (form.checkValidity() === false) {
            event.stopPropagation();
            return
        }
        if (!areSumsOk(inputData)) {
            setSumWarning(true)
            return
        }
        setSumWarning(false)
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
            body: JSON.stringify({ inputData: inputData })
        };
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/step/6', requestOptions)
            .then(response => response.json())
            .then(() => navigate('/project/' + projectId + '/step/7'));
    }
    return (
        <Container className="projectStepContainer">
            <Progress project={project} currentStep={6} />
            <Row className="justify-content-md-center align-items-center" style={{minHeight: "calc(100vh - 200px)", marginTop: "20px"}}>
                <Col xs lg="8">
                    <h1>Fuel breakdown</h1>
                    <h2 style={{marginTop: "-40px", marginBottom: "40px"}}>Project: {project.name}</h2>
                    {vtypeWarning? <Alert variant="danger">
                        A fuel is undefined for one of the vehicles types, making it invisible, please go back to the fuel types step.
                    </Alert> : <></>}
                    {sumWarning? <Alert variant="danger">
                        Error: At least one of the sums of share is not 100%.
                    </Alert> : <></>}
                    <p>Please enter <b>the percentage of vehicle kilometers travelled (vkt)</b>  per vehicle category and fuel type for the reference year and for future years. </p>

                    <p>Remark 1: The sum of shares in each vehicle category must be 100 %.</p>

                    <Form noValidate validated={validated} onSubmit={saveAndGoNextStep}>
                        <Table className="inputTable">
                            <thead>
                                <tr>
                                    <th>Vehicle type</th>
                                    <th colSpan={6}>VKT per category (%)</th>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td className="reqStar">{ project.referenceYears?.[0]}</td>
                                    <td className="reqStar">{ project.referenceYears?.[0]}-{ project.referenceYears?.[1]}</td>
                                    <td className="reqStar">{ project.referenceYears?.[1]}-{ project.referenceYears?.[2]}</td>
                                    <td className="reqStar">{ project.referenceYears?.[2]}-{ project.referenceYears?.[3]}</td>
                                    <td className="reqStar">{ project.referenceYears?.[3]}-{ project.referenceYears?.[4]}</td>
                                    <td className="reqStar">{ project.referenceYears?.[4]}-{ project.referenceYears?.[5]}</td>
                                </tr>
                            </thead>
                            <tbody>
                            {Object.keys(project.steps?.[2] || []).map((vtype, index) => {
                                if (!project.steps?.[2] || project.steps[2][vtype] === false || !inputData) {
                                    return <></>
                                }
                                let inputVt = inputData[vtype] as {[key in FuelType]: string[]}
                                if (inputVt !== undefined && project.steps?.[5]) {
                                    let fuelJsx: any = Object.keys(project.steps[5][vtype] || []).map((ft, i) => {
                                        let ftype = ft as FuelType
                                        let inputFt = inputVt?.[ftype]
                                        let tmp = project?.steps[5]?.[vtype]  as {[key in FuelType]: boolean}
                                        if (!tmp || tmp[ftype] === false || !inputData) {
                                            return null
                                        }
                                        if (inputFt !== undefined) {
                                            let inp = inputVt?.[ftype]
                                            if (inp) {
                                                return (
                                                    <tr key={i}>
                                                        <td style={{backgroundColor: "#989898"}}>{ftype}</td>
                                                        <td>
                                                            <PercentInput value={inp[0]} onChange={(e: any) => updateInput(vtype, ft, 0, e)} />
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
                                        }
                                        return null
                                    })
                                    let inp = inputData?.[vtype]
                                    let sums = [0,0,0,0,0,0]
                                    if (inp && typeof(inp) !== 'string') {
                                        let fuels = Object.keys(project.steps?.[5][vtype] || [])
                                        for (let i = 0; i < fuels.length; i++) {
                                            let ftype = fuels[i] as FuelType
                                            for (let j = 0; j < sums.length; j++) {
                                                sums[j] += parseFloat(inp?.[ftype]?.[j]) || 0
                                            }
                                        }
                                    }
                                    if(inp && Object.keys(inp).length === 0) {
                                        sums = [100, 100, 100, 100, 100, 100]
                                    }
                                    return [
                                        <tr key={index}>
                                            <td style={{backgroundColor: "#989898"}}>{vtype}</td>
                                            <td style={{color: sums[0] !== 100 ? 'red' : 'green', backgroundColor: "#989898"}}>{sums[0]}%</td>
                                            <td style={{color: sums[1] !== 100 ? 'red' : 'green', backgroundColor: "#989898"}}>{sums[1]}%</td>
                                            <td style={{color: sums[2] !== 100 ? 'red' : 'green', backgroundColor: "#989898"}}>{sums[2]}%</td>
                                            <td style={{color: sums[3] !== 100 ? 'red' : 'green', backgroundColor: "#989898"}}>{sums[3]}%</td>
                                            <td style={{color: sums[4] !== 100 ? 'red' : 'green', backgroundColor: "#989898"}}>{sums[4]}%</td>
                                            <td style={{color: sums[5] !== 100 ? 'red' : 'green', backgroundColor: "#989898"}}>{sums[5]}%</td>
                                        </tr>
                                        ,
                                        fuelJsx
                                    ]
                                } else {
                                    return null
                                }
                            })
                            }
                            </tbody>
                        </Table>
                        {inputData?
                            <Form.Group as={Row} style={{"marginBottom": "20px"}}>
                                <Form.Label className="reqStar" column sm={2}>Source</Form.Label>
                                <Col sm={10}>
                                    <Form.Control required type="input" name="vktSource" value={inputData.source as string} onChange={updateSource} placeholder="IEA, 2022"/>
                                    <Form.Control.Feedback type="invalid">A source is required</Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                        :''}

                        <p>Need some help to find the data, <a href="mailto:contact@myc.com">click here to send us an email</a></p>
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
