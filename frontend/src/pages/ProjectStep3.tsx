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
    const [inputData, setInputData ] = useState({vktSource: '', vktGrowthSource: ''} as InputStep3)
    const [project, setProject ] = useState({} as ProjectType)
    const [vktInput, setVktInput] = useState(true)
    let projectId = params.projectId
    const [validated, setValidated] = useState(false)
    useEffect(() => {
        if (initialized && keycloak.authenticated){
            const requestOptions = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token }
            };
            fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId, requestOptions)
                .then(response => {
                    if (response.status !== 200) {
                        navigate('/')
                    }
                    return response.json()
                })
                .then(data => {
                    console.log("get projetcs reply", data)
                    setProject(data.project)
                    // If not specified otherwise, SUMPs are using vkt, NUMPs are using the fleet approach
                    let isUsingVkt = data.project.isSump
                    let vtypes = Object.keys(data.project.steps[2])
                    let init:InputStep3 = {
                        vktSource: data.project.steps[3]?.vktSource || '',
                        vktGrowthSource: data.project.steps[3]?.vktGrowthSource || '',
                        vehicleStockSource: data.project.steps[3]?.vehicleStockSource || '',
                        averageMileageSource: data.project.steps[3]?.averageMileageSource || ''
                    }
                    for (let i = 0; i < vtypes.length; i++) {
                        let vtype = vtypes[i]
                        if (data.project.steps[3]?.[vtype]) {
                            init[vtype] = data.project.steps[3][vtype]
                        } else {
                            init[vtype] = {
                                vkt: "0",
                                vehicleStock: "0",
                                averageMileage: "0",
                                vktRate: ["0", "0", "0", "0", "0"]
                            }
                        }
                        let ivt = init[vtype]
                        if (typeof(ivt) !== 'string' && ivt.vehicleStock !== "0") {
                            // We have at least one vtype with vehicleStock specified, thus we are not using vkt inputs
                            isUsingVkt = false
                        }
                    }
                    setInputData(init)
                    setVktInput(isUsingVkt)
                });
            }
    }, [keycloak, initialized, projectId])
    const updateSource = (event: React.BaseSyntheticEvent) => {
        let target = event.target as HTMLInputElement
        let sourceName = target.name
        setInputData((prevInputData: InputStep3) => ({
            ...prevInputData,
            [sourceName]: event.target.value
        }))
    }
    const updateInput = (event: React.BaseSyntheticEvent, field: "vkt" | "vehicleStock" | "averageMileage" | "vktRate", index?: number) => {
        let target = event.target as HTMLInputElement
        let vtype = target.name

        setInputData((prevInputData: InputStep3) => {
            let vtypeobj = prevInputData[vtype]
            if (vtypeobj && typeof(vtypeobj) != 'string') {
                if (field !== "vktRate") {
                    vtypeobj[field] = target.value
                    if (field !== "vkt") {
                        // Edits to computation values should trigger a hidden vkt computation
                        vtypeobj.vkt = ((parseFloat(vtypeobj.vehicleStock) || 0) * (parseFloat(vtypeobj.averageMileage) || 0) * 0.000001).toString()
                    } else {
                        // Edits to vkt should erase computation values
                        vtypeobj.vehicleStock = "0"
                        vtypeobj.averageMileage = "0"
                    }
                } else if (index !== undefined) {
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
                    <p>Please enter the <b> vehicle kilometers travelled (Mio km)</b> in the table delivered by the transport plannig tool for the reference year.</p>

                    <p>For BAU calculations, please enter the expected % of growth or decrease for the corresponding years in the same way. </p>

                    <p><i>Data input for the vehicle kilometers travelled in the reference year is mandatory.</i></p>
                    <Form.Switch
                        style={{margin: "10px", textAlign: "left"}}
                        id="custom-switch-vkt"
                        label="Use pre-computed vehicle kilometers travelled information"
                        checked={vktInput}
                        onChange={() => setVktInput(prev => !prev)}
                    />
                    <Form noValidate validated={validated} onSubmit={saveAndGoNextStep}>
                        <Table className="inputTable">
                            <thead>
                                <tr>
                                    <th>Vehicle type</th>
                                    {vktInput ? 
                                        <th style={{width: "200px"}}>VKT¹ (Mkm/year)</th>
                                        :
                                        <><th>Vehicle stock¹ (nb vehicles)</th>
                                        <th>Average annual mileage² (km/vehicle/year)</th></>
                                    }
                                    <th colSpan={5}>Annual growth of VKT{vktInput ? '²' : '³'} (%)</th>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td className="reqStar" colSpan={vktInput? 1: 2}>{ project.referenceYears?.[0]}</td>
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
                                    let inputVt = inputData[vtype]
                                    if (inputVt && typeof(inputVt) !== 'string')
                                        return (
                                            <tr key={index}>
                                                <td style={{backgroundColor: "#989898"}}>{vtype}</td>
                                                {vktInput ? 
                                                    <td>
                                                        <InputGroup>
                                                            <Form.Control type="number" required min="0" step="any" name={vtype} value={inputVt.vkt} onChange={(e:any) => updateInput(e, "vkt")} placeholder="" />
                                                            <InputGroup.Text>Mkm/y</InputGroup.Text>
                                                            <Form.Control.Feedback type="invalid">Please enter a positive number, avoid white spaces</Form.Control.Feedback>
                                                        </InputGroup>
                                                    </td>
                                                    :
                                                    <>
                                                        <td>
                                                            <InputGroup>
                                                                <Form.Control type="number" required min="0" step="any" name={vtype} value={inputVt.vehicleStock} onChange={(e:any) => updateInput(e, "vehicleStock")} placeholder="" />
                                                                <Form.Control.Feedback type="invalid">Please enter a positive number, avoid white spaces</Form.Control.Feedback>
                                                            </InputGroup>
                                                        </td>
                                                        <td>
                                                            <InputGroup>
                                                                <Form.Control type="number" required min="0" step="any" name={vtype} value={inputVt.averageMileage} onChange={(e:any) => updateInput(e, "averageMileage")} placeholder="" />
                                                                <InputGroup.Text>km/v/y</InputGroup.Text>
                                                                <Form.Control.Feedback type="invalid">Please enter a positive number, avoid white spaces</Form.Control.Feedback>
                                                            </InputGroup>
                                                        </td>
                                                    </>
                                                }
                                                <td>
                                                    <PercentInput name={vtype} value={inputVt.vktRate[0]} onChange={(e:any) => updateInput(e, "vktRate", 0)}/>
                                                </td>
                                                <td>
                                                    <PercentInput name={vtype} value={inputVt.vktRate[1]} onChange={(e:any) => updateInput(e, "vktRate", 1)}/>
                                                </td>
                                                <td>
                                                    <PercentInput name={vtype} value={inputVt.vktRate[2]} onChange={(e:any) => updateInput(e, "vktRate", 2)}/>
                                                </td>
                                                <td>
                                                    <PercentInput name={vtype} value={inputVt.vktRate[3]} onChange={(e:any) => updateInput(e, "vktRate", 3)}/>
                                                </td>
                                                <td>
                                                    <PercentInput name={vtype} value={inputVt.vktRate[4]} onChange={(e:any) => updateInput(e, "vktRate", 4)}/>
                                                </td>
                                            </tr>
                                        )
                                    return <></>
                                })
                                }

                            </tbody>
                        </Table>
                        {inputData && vktInput ?
                            <Form.Group as={Row} style={{"marginBottom": "20px"}}>
                                <Form.Label className="reqStar" column sm={2}>[1] Vkt source</Form.Label>
                                <Col sm={10}>
                                    <Form.Control type="input" name="vktSource" required value={inputData.vktSource as string} onChange={updateSource} placeholder="DGT Spain, 2022"/>
                                    <Form.Control.Feedback type="invalid">A source is required</Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                        :''}
                        {inputData && !vktInput ?
                            <>
                                <Form.Group as={Row} style={{"marginBottom": "20px"}}>
                                    <Form.Label className="reqStar" column sm={2}>[1] Vehicle stock source</Form.Label>
                                    <Col sm={10}>
                                        <Form.Control type="input" name="vehicleStockSource" required value={inputData.vehicleStockSource as string} onChange={updateSource} placeholder="DGT Spain, 2022"/>
                                        <Form.Control.Feedback type="invalid">A source is required</Form.Control.Feedback>
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} style={{"marginBottom": "20px"}}>
                                <Form.Label className="reqStar" column sm={2}>[2] Average mileage source</Form.Label>
                                <Col sm={10}>
                                    <Form.Control type="input" name="averageMileageSource" required value={inputData.averageMileageSource as string} onChange={updateSource} placeholder="DGT Spain, 2022"/>
                                    <Form.Control.Feedback type="invalid">A source is required</Form.Control.Feedback>
                                </Col>
                                </Form.Group>
                            </>
                        :''}
                        {inputData ?
                            <Form.Group as={Row} style={{"marginBottom": "20px"}}>
                                <Form.Label className="reqStar" column sm={2}>[{vktInput ? '2' : '3'}] Vkt growth source</Form.Label>
                                <Col sm={10}>
                                    <Form.Control type="input" name="vktGrowthSource" required value={inputData.vktGrowthSource as string} onChange={updateSource} placeholder="EIA, 2022"/>
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
