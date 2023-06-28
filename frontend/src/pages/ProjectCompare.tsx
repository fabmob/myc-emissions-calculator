import React, {useState, useEffect, SetStateAction} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useParams, useNavigate } from "react-router-dom"
import { Button, Container, Row, Col, Card, Table, Badge, Form } from 'react-bootstrap'
import {ProjectType, TotalEnergyAndEmissions, EmissionsResults, InputStep2, InputInventoryStep1} from '../frontendTypes'
import ProjectNav from '../components/ProjectNav'

import './Project.css'
import EmissionsTable from '../components/viz/EmissionsTable'
import EmissionsCompareBarChart from '../components/viz/EmissionsCompareBarChart'
import VktCompareBarChart from '../components/viz/VktCompareBarChart'
import ModalShareCompareBarChart from '../components/viz/ModalShareCompareBarChart'
import TransportPerformanceCompareBarChart from '../components/viz/TransportPerformanceCompareBarChart'
import EmissionsPerUkmCompareBarChart from '../components/viz/EmissionsPerUkmCompareBarChart'

export default function ProjectCompare(){
    const { keycloak, initialized } = useKeycloak()
    const navigate = useNavigate()
    const params = useParams()
    const [project, setProject ] = useState({} as ProjectType)
    const [inventoryTotalEnergyAndEmissions, setInventoryTotalEnergyAndEmissions] = useState({TTW: {} as TotalEnergyAndEmissions, WTW:  {} as TotalEnergyAndEmissions})
    const [bauResults, setBAUResults] = useState({} as EmissionsResults)
    const [climateResults, setClimateResults] = useState({} as EmissionsResults)
    const [displayedVtypes, setDisplayedVtypes] = useState({} as {[key: string]: boolean})
    const [typeOfGHGIsWTW, setTypeOfGHGIsWTW] = useState(true)
    const [showPercents, setShowPercents] = useState(false)
    const [showLabels, setShowLabels] = useState(false)
    const [highContrastColors, setHighContrastColors] = useState(false)
    const projectId = params.projectId
    
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
    
    return (
        <Container>
             <Row className="justify-content-md-center" style={{minHeight: "calc(100vh - 200px)", marginTop: "20px"}}>
                <Col xs lg="8">
                    <h1>{project.name}</h1>
                    <ProjectNav current="Compare" project={project} />
                    <h2>Graphs</h2>
                    <Options 
                        project={project} 
                        setDisplayedVtypes={setDisplayedVtypes} 
                        typeOfGHGIsWTW={typeOfGHGIsWTW} 
                        setTypeOfGHGIsWTW={setTypeOfGHGIsWTW}
                        showPercents={showPercents} 
                        setShowPercents={setShowPercents}
                        showLabels={showLabels} 
                        setShowLabels={setShowLabels}
                        highContrastColors={highContrastColors}
                        setHighContrastColors={setHighContrastColors}
                    />
                    <EmissionsCompareBarChart 
                        project={project} 
                        bauEmissionsData={(typeOfGHGIsWTW ? bauResults?.emissions?.WTW : bauResults?.emissions?.TTW) || {}} 
                        climateEmissionsData={(typeOfGHGIsWTW ? climateResults?.emissions?.WTW : climateResults?.emissions?.TTW) || {}}
                        displayedVtypes={displayedVtypes}
                        showPercents={showPercents}
                        showLabels={showLabels}
                        highContrastColors={highContrastColors}
                    ></EmissionsCompareBarChart>
                    <VktCompareBarChart 
                        project={project} 
                        bauVktData={bauResults?.vkt || {}} 
                        climateVktData={climateResults?.vkt || {}}
                        displayedVtypes={displayedVtypes}
                        showPercents={showPercents}
                        showLabels={showLabels}
                        highContrastColors={highContrastColors}
                    ></VktCompareBarChart>
                    <ModalShareCompareBarChart
                        project={project}
                        title="Passenger modal share"
                        bauModalShareData={bauResults?.modalShare?.passengers || {}}
                        climateModalShareData={climateResults?.modalShare?.passengers || {}}
                        showLabels={showLabels}
                        highContrastColors={highContrastColors}
                    ></ModalShareCompareBarChart>
                    <ModalShareCompareBarChart
                        project={project}
                        title="Freight modal share"
                        bauModalShareData={bauResults?.modalShare?.freight || {}}
                        climateModalShareData={climateResults?.modalShare?.freight || {}}
                        showLabels={showLabels}
                        highContrastColors={highContrastColors}
                    ></ModalShareCompareBarChart>
                    <TransportPerformanceCompareBarChart 
                        title="Passenger transport performance (pkm)"
                        project={project} 
                        bauTransportPerformanceData={bauResults?.transportPerformance?.passengers || {}} 
                        climateTransportPerformanceData={climateResults?.transportPerformance?.passengers|| {}}
                        displayedVtypes={displayedVtypes}
                        showPercents={showPercents}
                        showLabels={showLabels}
                        highContrastColors={highContrastColors}
                    ></TransportPerformanceCompareBarChart>
                    <TransportPerformanceCompareBarChart 
                        title="Freight transport performance (tkm)"
                        project={project} 
                        bauTransportPerformanceData={bauResults?.transportPerformance?.freight || {}} 
                        climateTransportPerformanceData={climateResults?.transportPerformance?.freight|| {}}
                        displayedVtypes={displayedVtypes}
                        showPercents={showPercents}
                        showLabels={showLabels}
                        highContrastColors={highContrastColors}
                    ></TransportPerformanceCompareBarChart>
                    <EmissionsPerUkmCompareBarChart 
                        title="Passenger emissions per transport performance (gCO2/pkm)"
                        project={project} 
                        bauEmissionsData={(typeOfGHGIsWTW ? bauResults?.emissions?.WTW : bauResults?.emissions?.TTW) || {}} 
                        climateEmissionsData={(typeOfGHGIsWTW ? climateResults?.emissions?.WTW : climateResults?.emissions?.TTW) || {}}
                        bauTransportPerformanceData={bauResults?.transportPerformance?.passengers || {}} 
                        climateTransportPerformanceData={climateResults?.transportPerformance?.passengers|| {}}
                        displayedVtypes={displayedVtypes}
                        showPercents={showPercents}
                        showLabels={showLabels}
                        highContrastColors={highContrastColors}
                    ></EmissionsPerUkmCompareBarChart>
                    <EmissionsPerUkmCompareBarChart 
                        title="Freight emissions per transport performance (gCO2/tkm)"
                        project={project} 
                        bauEmissionsData={(typeOfGHGIsWTW ? bauResults?.emissions?.WTW : bauResults?.emissions?.TTW) || {}} 
                        climateEmissionsData={(typeOfGHGIsWTW ? climateResults?.emissions?.WTW : climateResults?.emissions?.TTW) || {}}
                        bauTransportPerformanceData={bauResults?.transportPerformance?.freight || {}} 
                        climateTransportPerformanceData={climateResults?.transportPerformance?.freight|| {}}
                        displayedVtypes={displayedVtypes}
                        showPercents={showPercents}
                        showLabels={showLabels}
                        highContrastColors={highContrastColors}
                    ></EmissionsPerUkmCompareBarChart>
                    <h2 style={{marginTop: "20px"}}>Datasets</h2>
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
type SetBoolean = (key:boolean | ((k:boolean) => boolean)) => void
const Options = (
    {project, setDisplayedVtypes, typeOfGHGIsWTW, setTypeOfGHGIsWTW, showPercents, setShowPercents, showLabels, setShowLabels, highContrastColors, setHighContrastColors}: 
    {project: ProjectType, setDisplayedVtypes: React.Dispatch<SetStateAction<{[key:string]: boolean}>>, typeOfGHGIsWTW: boolean, setTypeOfGHGIsWTW: SetBoolean, showPercents: boolean, setShowPercents: SetBoolean, showLabels: boolean, setShowLabels: SetBoolean, highContrastColors: boolean, setHighContrastColors: SetBoolean}
    ) => {
    const [showBody, setShowBody] = useState(false)
    const [pin, setPin] = useState(false)
    const [selectedVtypes, setSelectedVtypes] = useState({} as {[key:string]: boolean})
    useEffect(() => {
        const inventoryStep1 : InputInventoryStep1 = project.stages?.Inventory?.[0]?.steps?.[1] || {}
        const vtypes = Object.keys(inventoryStep1.vtypes || {})
        const init : {[key:string]:boolean} = {}
        for (let i = 0; i < vtypes.length; i++) {
            const vtype = vtypes[i]
            init[vtype] = true
        }
        setSelectedVtypes(init)
    }, [project])
    useEffect(() => {
        if (selectedVtypes)
            setDisplayedVtypes(selectedVtypes)
    }, [selectedVtypes])
    if (!project?.stages?.['Inventory']?.[0]?.steps?.[2]) {
        return <></>
    }
    const vtypes = Object.keys(selectedVtypes)
    const updateSelectedVtypes = (event: React.BaseSyntheticEvent) => {
        let target = event.target as HTMLInputElement
        let vtype = target.name
        setSelectedVtypes((prevSelectedVtypes) => {
            const newSelectedVtypes = {
                ...prevSelectedVtypes,
                [vtype]: !prevSelectedVtypes[vtype]
            }
            return newSelectedVtypes
        })
    }
    return (
        <>
            <Card className={"d-print-none" + (pin ? " stickyOptions" : "")} style={{textAlign: "left", marginBottom: "20px"}}>
                <Card.Header onClick={() => setShowBody(p=>!p)} style={{cursor: "pointer"}}>
                    Visualisations option (click to display)
                    <span style={{float: "right"}} onClick={(e) => {e.stopPropagation(); setPin(p => !p)}}>📌</span>
                </Card.Header>
                {showBody && <Card.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Displayed categories of transport</Form.Label>
                        <Row>
                        {vtypes.map((vtype, index) => {
                            return (
                                <Col xs="4" key={index}>
                                    <Form.Switch style={{margin: "5px"}} id={"custom-switch-" + vtype} key={index}>
                                        <Form.Switch.Input  name={vtype} checked={selectedVtypes[vtype]} onChange={updateSelectedVtypes}/>
                                        <Form.Switch.Label>{vtype}</Form.Switch.Label>
                                    </Form.Switch>
                                </Col>
                            )
                        })}
                        </Row>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>GHG emission type</Form.Label>
                        <Form.Check
                            id="custom-switch-wtw"
                            type="radio"
                            checked={typeOfGHGIsWTW}
                            onChange={() => setTypeOfGHGIsWTW(true)}
                            label="Well To Wheel (WTW)"
                        />
                        <Form.Check
                            id="custom-switch-ttw"
                            type="radio"
                            checked={!typeOfGHGIsWTW}
                            onChange={() => setTypeOfGHGIsWTW(false)}
                            label="Tank To Wheel (TTW)"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Graph content</Form.Label>
                        <Form.Switch style={{margin: "5px"}} id="custom-switch-percent">
                            <Form.Switch.Input checked={showPercents} onChange={() => setShowPercents((p:boolean)=>!p)}/>
                            <Form.Switch.Label>Display percents increase</Form.Switch.Label>
                        </Form.Switch>
                        <Form.Switch style={{margin: "5px"}} id="custom-switch-labels">
                            <Form.Switch.Input checked={showLabels} onChange={() => setShowLabels((p:boolean)=>!p)}/>
                            <Form.Switch.Label>Display labels</Form.Switch.Label>
                        </Form.Switch>
                        <Form.Switch style={{margin: "5px"}} id="custom-switch-labels">
                            <Form.Switch.Input checked={highContrastColors} onChange={() => setHighContrastColors((p:boolean)=>!p)}/>
                            <Form.Switch.Label>Use high contrast colors</Form.Switch.Label>
                        </Form.Switch>
                    </Form.Group>
                </Card.Body>}
            </Card>
        </>
    );
  }