import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useParams, useNavigate } from "react-router-dom"
import { Button, Row, Col, Card, Table, Badge, Alert } from 'react-bootstrap'
import {ProjectStage, ProjectType, TotalEnergyAndEmissions, FuelType, EmissionsResults} from '../frontendTypes'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

import './Project.css'
import EmissionsBarChart from '../components/viz/EmissionsBarChart'
import OutputNumberTd from '../components/OutputNumberTd'

export default function ProjectSummary(props : {project: ProjectType}){
    const { keycloak, initialized } = useKeycloak()
    const navigate = useNavigate()
    const params = useParams()
    const [project, setProject ] = useState({} as ProjectType)
    const [hideParams, setHideParams] = useState({} as {[state: string]: boolean})
    const [inventoryTotalEnergyAndEmissions, setInventoryTotalEnergyAndEmissions] = useState({TTW: {} as TotalEnergyAndEmissions, WTW:  {} as TotalEnergyAndEmissions})
    const [bauResults, setBAUResults] = useState({} as EmissionsResults)
    const [climateResults, setClimateResults] = useState<EmissionsResults[]>([])
    const [inventoryResultsError, setInventoryResultsError] = useState(false)
    const [bauResultsError, setBauResultsError] = useState(false)
    const [climateResultsError, setClimateResultsError] = useState<boolean[]>([])
    const projectId = params.projectId
    const defaultColors = ["#2CB1D5", "#A2217C", "#808080", "#67CAE4", "#CE8DBB", "#B3B3B3", "#C5E8F2", "#EBD1E1", "#E6E6E6"]
    
    useEffect(() => {
        if (initialized && keycloak.authenticated && props.project.id){
            setProject(props.project)
            if (props.project?.stages?.Inventory?.length > 0)
                fetchInventoryResults()
            if (props.project?.stages?.BAU?.length > 0)
                fetchBAUResults()
            for (let i = 0; i < props.project?.stages?.Climate?.length; i++) {
                fetchClimateResults(props.project, i)
            }
        }
    }, [keycloak, initialized, props.project, navigate])
    
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
    const duplicateClimateScenario = (stageId: number) => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
            body: JSON.stringify({newScenarioId: project.stages.Climate.length})
        };
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + "/Climate/" + stageId + "/duplicate", requestOptions)
            .then(response => {
                return response.json()
            })
            .then(data => {
                if (data.status !== "ok") {
                    console.log(data.status)
                    return
                }
                setProject(data.project)
                fetchClimateResults(data.project, data.project.stages.Climate.length-1)
            })
    }
    const StepCard = (props: {title: string, stage: ProjectStage, children: React.ReactNode, stageId?: number}) => {
        let introUrl = `/project/${project.id}/${props.stage}/intro`
        if (props.stageId !== undefined) {
            introUrl = `/project/${project.id}/${props.stage}/${props.stageId}/intro`
        }
        return (<Card className="mb-5">
            <Card.Header>
                    <div className="title"><h3>{props.title}</h3></div>
                    <div className="nav">
                        {!hideParams[props.title] 
                            ? <Button variant="link" style={{whiteSpace: "nowrap"}} onClick={_=>hide(props.title)}><span className="item"><span>See less</span></span></Button>
                            : <Button variant="link" style={{whiteSpace: "nowrap"}} onClick={_=>show(props.title)}><span className="item"><span>See more</span></span></Button>
                        }
                        {(props.stage === "Climate" && props.stageId != undefined && project.stages?.Climate.length && <Button variant="link" onClick={_=>duplicateClimateScenario(props.stageId!)} title='Duplicate Scenario'><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#copy"}/></svg></span></Button>) || ""}
                    
                        <Button onClick={e => navigate(introUrl)}>
                        {project.stages?.[props.stage].length ? 
                            <span className="item"><span>Edit</span></span> :
                            <span className="item"><span>Create</span><svg className="icon icon-size-m" viewBox="0 0 22 22"><use href={"/icons.svg#plus"}/></svg></span>
                        }
                        </Button>
                </div>
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
            .catch(error => {
                console.log(error)
                setInventoryResultsError(true)
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
                if (data.status != "ok") {
                    setBauResultsError(true)
                } else {
                    setBAUResults(data)
                }
            })
            .catch(error => {
                console.log(error)
                setBauResultsError(true)
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
                setClimateResults((prevClimateResults) => {
                    const newClimateResults = prevClimateResults.slice()
                    newClimateResults[climateScenarioId] = data
                    return newClimateResults
                })
            })
            .catch(error => {
                console.log(error)
                setClimateResultsError((prev) => {
                    const tmp = prev.slice()
                    tmp[climateScenarioId] = true
                    return tmp
                })
            })
    }
    const inventoryEmissionsPieData = [].concat.apply([], Object.keys(inventoryTotalEnergyAndEmissions["WTW"]).map((vtype, index) => {
        let res: any[] = []
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
        <>
            <StepCard title='1. Inventory' stage="Inventory">
                <span>The GHG emission inventory for urban transport is the sum of all transport-related activities emissions that can be attributed to the city or country for a given year (base year).</span>
                {inventoryResultsError && <Alert variant='warning'>Failed to compute inventory results. This is often due to a vehicle or fuel being added after the first edits. Please go through the inventory steps again and fill missing data.</Alert>}
                {project.stages?.Inventory?.[0]?.step >= 7 && !inventoryResultsError && <Row className="results-preview align-items-center">
                    <Col lg="4" className="chart-content" style={{background: "white", padding: "20px"}}>
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
                            <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Col>
                    <Col lg="8" className="table">
                        <Table bordered>
                            <colgroup>
                                <col className="tablecol4" />{/* Vehicle */}
                                <col className="tablecol3" />{/* Fuel */}
                                <col className="tablecolfluid" />{/* GHG emissions */}
                            </colgroup>
                            <thead>
                                <tr>
                                    <th><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Vehicle</span></span></th>
                                    <th><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Fuel</span></span></th>
                                    <th><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>GHG em. (1000t GHG - {"WTW"})</span></span></th>
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
                                            {i===0 && <td rowSpan={ftypes.length}><Badge className="badge-read-only"><span className="item"><span>{vtype}</span></span></Badge></td>}
                                            <td><Badge className="badge-read-only"><span className="item"><span>{ftype}</span></span></Badge></td>
                                            <OutputNumberTd value={co2[0]}></OutputNumberTd>
                                        </tr>)
                                    }
                                    return [
                                        fuelJsx
                                    ]
                                })}
                                <tr>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </Table>
                    </Col>
                </Row>
                }
            </StepCard>
            <StepCard title='2. BAU Scenario' stage="BAU">
                <span>The Business-as-usual scenario aims to describe the transport related emissions if nothing changed in the years to come from the current status quo.</span>
                {bauResultsError && <Alert variant='warning'>Failed to compute BAU results. This is often due to a vehicle or fuel being added after the first edits. Please go through the inventory and BAU steps again and fill missing data.</Alert>}
                {bauResults?.emissions && <Row className="results-preview align-items-center">
                    <Col lg="8" className="chart-content" style={{background: "white", padding: "20px"}}>
                        <EmissionsBarChart emissionsData={bauResults?.emissions?.WTW || {}} project={project}></EmissionsBarChart>
                    </Col>
                    <Col lg="4">
                    </Col>
                </Row>
                }
            </StepCard>
            <StepCard title='3. Climate Scenario' stage="Climate" stageId={0}>
                <span>The Climate Scenario aims to describe the predicted transport related emissions when a strategy, policy, programme or project were to be introduced.</span>
                {climateResultsError[0] && <Alert variant='warning'>Failed to compute Climate results. This is often due to missing steps. Please go through the steps again and fill missing data.</Alert>}
                {climateResults?.[0]?.emissions && <Row className="results-preview align-items-center">
                    <Col lg="8" className="chart-content" style={{background: "white", padding: "20px"}}>
                        <EmissionsBarChart emissionsData={climateResults?.[0]?.emissions?.WTW || {}} project={project}></EmissionsBarChart>
                    </Col>
                    <Col lg="4">
                    </Col>
                </Row>
                }
            </StepCard>
            {project?.stages?.Climate.map((scenario, index) => {
                if (index === 0) {
                    return <div key={0}></div>
                }
                return (
                    <StepCard title={`3. Climate Scenario (${index + 1})`} stage="Climate" stageId={index} key={index}>
                        <span>The Climate Scenario aims to describe the predicted transport related emissions when a strategy, policy, programme or project were to be introduced.</span>
                        {climateResultsError[index] && <Alert variant='warning'>Failed to compute Climate results. This is often due to a vehicle or fuel being added after the first edits. Please go through the inventory and scenarios steps again and fill missing data.</Alert>}
                        {climateResults?.[index]?.emissions && <Row className="results-preview align-items-center">
                            <Col lg="8" className="chart-content" style={{background: "white", padding: "20px"}}>
                                <EmissionsBarChart emissionsData={climateResults?.[index]?.emissions?.WTW || {}} project={project}></EmissionsBarChart>
                            </Col>
                            <Col lg="4">
                            </Col>
                        </Row>
                        }
                    </StepCard>
                )
            })}
            {project?.stages?.Climate?.length > 0 &&
                <div style={{marginBottom: "30px"}}><Button variant="link" onClick={_=>navigate(`/project/${project.id}/Climate/${project.stages.Climate.length}/intro`)}><span className="item"><svg className="icon icon-size-m" viewBox="0 0 22 22"><use href={"/icons.svg#plus"}/></svg><span>Add another climate scenario</span></span></Button></div>
            }
        </>             
    )
}
