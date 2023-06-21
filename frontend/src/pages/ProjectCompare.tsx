import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useParams, useNavigate } from "react-router-dom"
import { Button, Container, Row, Col, Card, Table, Badge } from 'react-bootstrap'
import {ProjectStage, ProjectType, TotalEnergyAndEmissions, FuelType, EmissionsResults} from '../frontendTypes'
import ProjectNav from '../components/ProjectNav'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'

import './Project.css'
import EmissionsTable from '../components/viz/EmissionsTable'
import EmissionsCompareBarChart from '../components/viz/EmissionsCompareBarChart'
import VktCompareBarChart from '../components/viz/VktCompareBarChart'
import ModalShareCompareBarChart from '../components/viz/ModalShareCompareBarChart'

export default function ProjectCompare(){
    const { keycloak, initialized } = useKeycloak()
    const navigate = useNavigate()
    const params = useParams()
    const [project, setProject ] = useState({} as ProjectType)
    const [hideParams, setHideParams] = useState({} as {[state: string]: boolean})
    const [inventoryTotalEnergyAndEmissions, setInventoryTotalEnergyAndEmissions] = useState({TTW: {} as TotalEnergyAndEmissions, WTW:  {} as TotalEnergyAndEmissions})
    const [bauResults, setBAUResults] = useState({} as EmissionsResults)
    const [climateResults, setClimateResults] = useState({} as EmissionsResults)
    const projectId = params.projectId
    const defaultColors = ["#2CB1D5", "#A2217C", "#808080", "#67CAE4", "#CE8DBB", "#B3B3B3", "#C5E8F2", "#EBD1E1", "#E6E6E6"]
    
    useEffect(() => {
        if (initialized && keycloak.authenticated && projectId){
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
                    fetchBAUResults()
                    fetchClimateResults(data.project, 0)
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
    const StepCard = (props: {title: string, stage: ProjectStage, children: React.ReactNode, stageId?: number}) => {
        let introUrl = `/project/${project.id}/${props.stage}/intro`
        if (props.stageId !== undefined) {
            introUrl = `/project/${project.id}/${props.stage}/${props.stageId}/intro`
        }
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
                        <Button onClick={e => navigate(introUrl)}>
                        {project.stages?.[props.stage].length ? "Edit": "Create +"}
                        </Button>
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
                if (data.status !== "ok") {
                    console.log(data.status)
                    return
                }
                setInventoryTotalEnergyAndEmissions({
                    WTW: data.totalEnergyAndEmissionsWTW,
                    TTW: data.totalEnergyAndEmissionsTTW
                })
            })
    }
    const fetchBAUResults = () => {
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token }
        };
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + "/BAU/0/results", requestOptions)
            .then(response => {
                return response.json()
            })
            .then(data => {
                console.log("get BAU results reply", data)
                setBAUResults(data)
            })
    }
    const fetchClimateResults = (_project: ProjectType, climateScenarioId : number) => {
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token }
        };
        const method : string = _project?.stages?.Climate?.[climateScenarioId]?.steps?.[0]?.method
        fetch(`${process.env.REACT_APP_BACKEND_API_BASE_URL}/api/project/${projectId}/Climate/${climateScenarioId}/${method}/results`, requestOptions)
            .then(response => {
                return response.json()
            })
            .then(data => {
                console.log("get Climate results reply", data)
                setClimateResults(data)
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
                    <h1>{project.name}</h1>
                    <ProjectNav current="Compare" project={project} />
                    <h2>Graphs</h2>
                    <h3>Emissions</h3>
                    <EmissionsCompareBarChart project={project} bauEmissionsData={bauResults?.emissions?.WTW || {}} climateEmissionsData={climateResults?.emissions?.WTW || {}}></EmissionsCompareBarChart>
                    <h3>Vkt</h3>
                    <VktCompareBarChart project={project} bauVktData={bauResults?.vkt || {}} climateVktData={climateResults?.vkt || {}}></VktCompareBarChart>
                    <h3>Passenger modal share</h3>
                    <ModalShareCompareBarChart project={project} bauModalShareData={bauResults?.modalShare?.passengers || {}} climateModalShareData={climateResults?.modalShare?.passengers || {}}></ModalShareCompareBarChart>
                    <h3>Freight modal share</h3>
                    <ModalShareCompareBarChart project={project} bauModalShareData={bauResults?.modalShare?.freight || {}} climateModalShareData={climateResults?.modalShare?.freight || {}}></ModalShareCompareBarChart>
                    
                    <h2>Datasets</h2>
                    <Table bordered>
                        <thead>
                            <tr>
                                <th className="item-sm">Dataset</th>
                                <th className="item-sm">Sources IDs</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><Badge bg="disabled">Inventory</Badge></td>
                                <td>TODO</td>
                            </tr>
                            <tr>
                                <td><Badge bg="disabled">BAU Scenario</Badge></td>
                                <td>TODO</td>
                            </tr>
                            <tr>
                                <td><Badge bg="disabled">Climate Scenario</Badge></td>
                                <td>TODO</td>
                            </tr>
                        </tbody>
                    </Table>
                    <h2>Sources</h2>
                    <Table bordered>
                        <thead>
                            <tr>
                                <th className="item-sm">Source</th>
                                <th className="item-sm">ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {project?.sources?.map(({value, sourceId}, index) => {
                                return (<tr key={index}>
                                    <td><Badge bg="disabled">{value}</Badge></td>
                                    <td>[{sourceId}]</td>
                                </tr>)
                            })}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>

    )
}
