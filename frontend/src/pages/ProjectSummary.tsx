import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useParams, useNavigate } from "react-router-dom"
import { Button, Container, Row, Col, Card, Table, Badge } from 'react-bootstrap'
import {ProjectStage, ProjectType, TotalEnergyAndEmissions, FuelType} from '../frontendTypes'
import ProjectNav from '../components/ProjectNav'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'

import './Project.css'

export default function ProjectSummary(){
    const { keycloak, initialized } = useKeycloak()
    const navigate = useNavigate()
    const params = useParams()
    const [project, setProject ] = useState({} as ProjectType)
    const [hideParams, setHideParams] = useState({} as {[state: string]: boolean})
    const [inventoryTotalEnergyAndEmissions, setInventoryTotalEnergyAndEmissions] = useState({TTW: {} as TotalEnergyAndEmissions, WTW:  {} as TotalEnergyAndEmissions})
    const projectId = params.projectId
    const defaultColors = ["#2CB1D5", "#A2217C", "#808080", "#67CAE4", "#CE8DBB", "#B3B3B3", "#C5E8F2", "#EBD1E1", "#E6E6E6"]
    
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
                    fetchInventoryResults()
                });
            }
    }, [keycloak, initialized, projectId, navigate])
    
    const hide = (state: string) => {
        setHideParams(prevHideParams => {
            return {
                ...prevHideParams,
                [state]: true
            }
        })
    }
    const show = (state: string) => {
        setHideParams(prevHideParams => {
            return {
                ...prevHideParams,
                [state]: false
            }
        })
    }
    const StepCard = (props: {title: string, stage: ProjectStage, children: React.ReactNode}) => {
        return (<Card className="mb-5">
            <Card.Header>
                <Row className='align-items-center'>
                    <Col xs="8"><h2>{props.title}</h2></Col>
                    <Col xs="2">
                        {!hideParams[props.title] 
                            ? <Button variant="link" onClick={_=>hide(props.title)}>See less</Button>
                            : <Button variant="link" onClick={_=>show(props.title)}>See more</Button>
                        }
                    </Col>
                    <Col xs="2">
                        {project.stages?.[props.stage].length 
                        ? <Button onClick={e => navigate('/project/' + project.id + '/' + props.stage + '/intro')}>Edit</Button> 
                        : <Button>Create +</Button>
                        }
                    </Col>
                </Row>
            </Card.Header>
            {!hideParams[props.title] && <Card.Body>
                {props.children}
            </Card.Body>}
        </Card>)
    }
    const fetchInventoryResults = () => {
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token }
        };
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + "/Inventory/0/results", requestOptions)
            .then(response => {
                return response.json()
            })
            .then(data => {
                setInventoryTotalEnergyAndEmissions({
                    WTW: data.totalEnergyAndEmissionsWTW,
                    TTW: data.totalEnergyAndEmissionsTTW
                })
            })
    }
    const inventoryEmissionsPieData = [].concat.apply([], Object.keys(inventoryTotalEnergyAndEmissions["WTW"]).map((vtype, index) => {
        let res = []
        const fuels = inventoryTotalEnergyAndEmissions["WTW"][vtype]
        const ftypes = Object.keys(fuels)
        for (let i = 0; i < ftypes.length; i++) {
            const ftype = ftypes[i] as FuelType
            const co2 = fuels[ftype]?.co2[0] || ''
            if (co2)
                res.push({name: vtype + ", " + ftype, value: co2})
        }
        return res
    })as any[])
    return (
        <Container>
             <Row className="justify-content-md-center" style={{minHeight: "calc(100vh - 200px)", marginTop: "20px"}}>
                <Col xs lg="8">
                    <ProjectNav current="Edition" project={project} />
                    <h1>{project.name}</h1>
                    <StepCard title='1. Inventory / Base Year ' stage="Inventory">
                        <span>Indexing - The GHG emission inventory for urban transport is the sum of all transport-related activities emissions that can be attributed to the city or country for a given year (base year).</span>
                        {project.stages?.Inventory?.[0]?.step >= 7 && <Row className="align-items-center">
                            <Col sm="8">
                                <Table bordered>
                                    <thead>
                                        <tr>
                                            <th className="item-sm">🛈 Vehicle</th>
                                            <th className="item-sm">🛈 Fuel</th>
                                            <th className="item-sm">🛈 GHG emissions (1000t GHG) ({"WTW"})</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.keys(inventoryTotalEnergyAndEmissions["WTW"]).map((vtype, index) => {
                                            const fuels = inventoryTotalEnergyAndEmissions["WTW"][vtype]
                                            const ftypes = Object.keys(fuels)
                                            let fuelJsx = []
                                            for (let i = 0; i < ftypes.length; i++) {
                                                const ftype = ftypes[i] as FuelType
                                                const co2 = fuels[ftype]?.co2 || ''
                                                fuelJsx.push(<tr key={vtype + ftype}>
                                                    {i===0 && <td rowSpan={ftypes.length} style={{verticalAlign: "top"}}><Badge bg="disabled">{vtype}</Badge></td>}
                                                    <td><Badge bg="disabled">{ftype}</Badge></td>
                                                    <td>{co2}</td>
                                                </tr>)
                                            }
                                            return [
                                                fuelJsx
                                            ]
                                        })}
                                    </tbody>
                                </Table>
                            </Col>
                            <Col sm="4">
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart width={200} height={200}>
                                    <Pie
                                        dataKey="value"
                                        data={inventoryEmissionsPieData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={70}
                                        innerRadius={40}
                                    >
                                        {inventoryEmissionsPieData.map((entry, index) => (<Cell key={index} fill={defaultColors[index]}></Cell>))}
                                    </Pie>
                                    <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Col>
                        </Row>
                    }
                    </StepCard>
                    <StepCard title='2. Business As Usual (BAU) Scenario' stage="BAU">
                        Projecting - The Business-as-usual scenario aims to describe the transport related emissions if nothing changed in the years to come from the current status quo.
                    </StepCard>
                    <StepCard title='3. Climate Scenario' stage="Scenario">
                        Comparing - The Climate Scenario aims to describe the predicted transport related emissions when a strategy, policy, programme or project were to be introduced.
                    </StepCard>
                </Col>
            </Row>
        </Container>

    )
}
