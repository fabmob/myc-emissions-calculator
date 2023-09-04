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
import {InputTopDown, ProjectType, FuelType} from '../frontendTypes'
import Progress from '../components/Progress'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import './Project.css'

export default function TopDown(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    const [project, setProject ] = useState({} as ProjectType)
    const [validated, setValidated] = useState(false)
    let [inputData, setInputData ] = useState({
        passengers: {
            "Gasoline": {toe: "0", source: "NA"},
            "Diesel": {toe: "0", source: "NA"},
            "LPG": {toe: "0", source: "NA"},
            "CNG": {toe: "0", source: "NA"},
            "Hybrid": {toe: "0", source: "NA"},
            "Electric": {toe: "0", source: "NA"},
            "Hydrogen": {toe: "0", source: "NA"},
            "None": {toe: "0", source: "NA"}
        },
        freight: {
            "Gasoline": {toe: "0", source: "NA"},
            "Diesel": {toe: "0", source: "NA"},
            "LPG": {toe: "0", source: "NA"},
            "CNG": {toe: "0", source: "NA"},
            "Hybrid": {toe: "0", source: "NA"},
            "Electric": {toe: "0", source: "NA"},
            "Hydrogen": {toe: "0", source: "NA"},
            "None": {toe: "0", source: "NA"}
        }
    } as InputTopDown)
    let params = useParams();
    let projectId = params.projectId
    let ftypes = ["Gasoline", "Diesel", "LPG", "NG", "Hybrid", "Electric", "Hydrogen"]
    useEffect(() => {
        if (initialized && keycloak.authenticated){
            const requestOptions = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token }
            };
            fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + "/viz", requestOptions)
                .then(response => response.json())
                .then(data => {
                    console.log(data.project)
                    setProject(data.project)
                    if (data?.project?.stages?.['Inventory']?.[0]?.steps?.[8]) {
                        // Patch old project with missing fuel types
                        for (let j = 0; j < ftypes.length; j++) {
                            let ftype = ftypes[j] as FuelType
                            if (!data.project.stages['Inventory'][0].steps[8].passengers[ftype]) {
                                data.project.stages['Inventory'][0].steps[8].passengers[ftype] = {toe: "0", source: "NA"}
                            }
                            if (!data.project.stages['Inventory'][0].steps[8].freight[ftype]) {
                                data.project.stages['Inventory'][0].steps[8].freight[ftype] = {toe: "0", source: "NA"}
                            }
                        }
                        
                        setInputData(data.project.stages['Inventory'][0].steps[8] as InputTopDown)
                    }
                });
        }
    }, [keycloak, initialized, projectId])
    const updateInput = (type: "passengers" | "freight", ftype: FuelType, value: string, isSource: boolean) => {
        setInputData((prevInputData: InputTopDown) => {
            let typeobj = prevInputData[type]
            if (typeobj) {
                if (isSource) {
                    typeobj[ftype] = {toe: typeobj[ftype].toe, source: value}
                } else {
                    if (value !== "0" && typeobj[ftype].source === "NA") {
                        typeobj[ftype].source = ""
                    }
                    if (value === "0" && typeobj[ftype].source === "") {
                        typeobj[ftype].source = "NA"
                    }
                    typeobj[ftype] = {toe: value, source: typeobj[ftype].source}
                }
                return {
                    ...prevInputData,
                    [type]: typeobj
                }
            } else {
                return prevInputData
            }
        })
    }

    const goPreviousStep = () => {
        navigate('/project/' + projectId + '/step/7');
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
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/Inventory/0/step/8', requestOptions)
            .then(response => response.json())
            .then(() => navigate('/project/' + projectId + '/viz'));
    }
    return (
        <Container className="projectStepContainer">
            <Progress project={project} currentStep={8} stage='Inventory' />
            <Row className="justify-content-md-center align-items-center" style={{minHeight: "calc(100vh - 200px)", marginTop: "20px"}}>
                <Col xs lg="8">
                    <h1>Top Down validation</h1>
                    <h2 style={{marginTop: "-40px", marginBottom: "40px"}}>Project: {project.name}</h2>
                    <p>
                        A well-known validation approach especially for national GHG inventories is the comparison of the calculated fuel consumption (summed by fuel type and vehicle category) obtained from the present tool (bottom-up approach) with the national energy balance (top-down approach). Differences within a range of +/- 10% are quite common and should not be considered as error but as uncertainty. One reason can be for example, that the energy balance does not include fuels bought in neighboring countries and consumed within the country. The emission inventory report should try explaining gaps and analyze the possibility to minimize the related uncertainties.<br/>
                        Energy balance data are based on the total fuel sales within the country. According to the IPCC guidelines 2006, the final energy consumption for the GHG inventory should be calculated as follow: production + import - export - international bunkers - stock change. The main uncertainties for energy balance data are: <br/>
                        - Wrong allocation of fuels to the sub-transport sectors (e.g. fuel consumption from diesel generators should not be accounted in transport sector) or transport subcategories (i.e. road transportation vs. other transports, domestic use vs. international bunkers)<br/>
                        - Amount of grey imports (illegally sold fuels, tank-tourism in small or transit-countries)
                    </p>
                    <p>
                        The main uncertainties for bottom-up fuel consumption data are: <br/>
                        - Activity data i.e. fleet composition, number of vehicles or vkt, specific fuel consumption <br/>
                        A comparison of different sources can help to identify the range of uncertainties. If identifying the parameter with the highest uncertainties is possible, it makes sense to try adjusting it. For example, the calculated total gasoline consumption for road transport is 30% higher than the value given in the energy balance. Motorcycles consume 50% of motor gasoline and the motorcycle population could not be provided by official statistics but only estimated. In order to minimize the gap for motor gasoline to e.g. 10%, the number of motorcycles could be diminished by 30%. Another common approach is to adjust average vkt in order to match the energy balance results.
                    </p>
                    <Form noValidate validated={validated} onSubmit={saveAndGoNextStep}>

                        {["passengers", "freight"].map(_type => {
                            const type = _type as "passengers" | "freight"
                            return (
                                <Table className="inputTable" key={type}>
                                    <thead>
                                        <tr>
                                            <th style={{textTransform: "capitalize"}}>{type}</th>
                                            {ftypes.map(ftype => <th className="reqStar" key={ftype}>{ftype}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{backgroundColor: "#989898"}}>Energy blance</td>
                                            {ftypes.map(_ftype => {
                                                const ftype = _ftype as FuelType
                                                return (<td key={ftype}>
                                                    <Form.Group>

                                                        <InputGroup>
                                                            <Form.Control type="number" required min="0" step="0.1" value={inputData[type][ftype].toe} onChange={e => updateInput(type, ftype, e.target.value, false)} />
                                                            <InputGroup.Text>TOE</InputGroup.Text>
                                                            <Form.Control.Feedback type="invalid">Please enter a positive number, avoid white spaces</Form.Control.Feedback>
                                                        </InputGroup>
                                                    </Form.Group>
                                                </td>)
                                            })}
                                        </tr>
                                        <tr>
                                            <td style={{backgroundColor: "#989898"}}>Source</td>
                                            {ftypes.map(_ftype => {
                                                const ftype = _ftype as FuelType
                                                return (<td key={ftype}>
                                                    <Form.Group>
                                                        <Form.Control type="text" required value={inputData[type][ftype].source} onChange={e => updateInput(type, ftype, e.target.value, true)} />
                                                        <Form.Control.Feedback type="invalid">Please enter a source</Form.Control.Feedback>
                                                    </Form.Group>
                                                </td>)
                                            })}
                                        </tr>
                                        <tr>
                                            <td style={{backgroundColor: "#989898"}}>Calculated value</td>
                                            {ftypes.map(_ftype => {
                                                const ftype = _ftype as FuelType
                                                return <td key={ftype} style={{backgroundColor: "#989898"}}>{project.outputEnergyBalance?.[type][ftype]?.toFixed(2)}</td>
                                            })}
                                        </tr>
                                        <tr>
                                            <td style={{backgroundColor: "#989898"}}>Gap</td>
                                            {ftypes.map(_ftype => {
                                                const ftype = _ftype as FuelType
                                                const gap = Math.round((project.outputEnergyBalance?.[type][ftype] || 0) * 100 / parseFloat(inputData[type][ftype].toe) - 100)
                                                if (isFinite(gap)) {
                                                    let bgColor = "#748f78"
                                                    if (Math.abs(gap) > 20) {
                                                        bgColor = "#cd8282"
                                                    }
                                                    return <td key={ftype} style={{backgroundColor: bgColor}}>{gap}%</td>
                                                }
                                                return <td key={ftype} style={{backgroundColor: "#989898"}}></td>
                                            })}
                                        </tr>
                                    </tbody>
                                </Table>
                            )
                        })}
                        <h3>Energy consumption for both transport types</h3>
                        <div style={{marginBottom: "20px"}}>
                            <ResponsiveContainer width="100%" height={340}>
                                <BarChart data={ftypes.map(_ftype => {
                                    const ftype = _ftype as FuelType
                                    return {
                                        name: ftype, 
                                        "Calculated value": (project?.outputEnergyBalance?.passengers[ftype] || 0) + (project?.outputEnergyBalance?.freight[ftype] || 0),
                                        "Energy balance": parseFloat(inputData.passengers[ftype].toe) + parseFloat(inputData.freight[ftype].toe)
                                    }
                                })}>
                                    <XAxis dataKey="name" />
                                    <YAxis tickFormatter={(value:number) => new Intl.NumberFormat('fr', { notation: 'compact' }).format(value)} />
                                    <Tooltip formatter={(value:number) => new Intl.NumberFormat('fr', { notation: 'compact' }).format(value)}/>
                                    <Legend />
                                    <Bar barSize={22} dataKey="Calculated value" fill="#50F19E" unit=' TOE'></Bar>
                                    <Bar barSize={22} dataKey="Energy balance" fill="#7CDDFF" unit=' TOE'></Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            </div>
                        <Button variant="secondary" style={{marginRight: "20px"}} onClick={goPreviousStep}>
                            <span className="item"><span>Previous</span></span>
                        </Button>
                        <Button variant="primary" type="submit">
                            <span className="item"><span>Next</span></span>
                        </Button>
                    </Form>
                    
                </Col>
            </Row>
        </Container>

    )
}