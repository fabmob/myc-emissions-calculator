import React, {useState, useEffect, SetStateAction} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useParams, useNavigate } from "react-router-dom"
import { Button, Row, Col, Table, Badge, Form, Modal } from 'react-bootstrap'
import {ProjectType, EmissionsResults, InputInventoryStep1} from '../frontendTypes'

import './Project.css'
import EmissionsCompareBarChart from '../components/viz/EmissionsCompareBarChart'
import VktCompareBarChart from '../components/viz/VktCompareBarChart'
import ModalShareCompareBarChart from '../components/viz/ModalShareCompareBarChart'
import TransportPerformanceCompareBarChart from '../components/viz/TransportPerformanceCompareBarChart'
import EmissionsPerUkmCompareBarChart from '../components/viz/EmissionsPerUkmCompareBarChart'
import { inputsAsCsv } from '../utils/inputsAsCsv'
import { CSVLink } from 'react-csv'

export default function ProjectCompare(props: {project: ProjectType}){
    const { keycloak, initialized } = useKeycloak()
    const navigate = useNavigate()
    const params = useParams()
    const [project, setProject ] = useState({} as ProjectType)
    const [bauResults, setBAUResults] = useState({} as EmissionsResults)
    const [climateResults, setClimateResults] = useState<EmissionsResults[]>([])
    const [displayedVtypes, setDisplayedVtypes] = useState({} as {[key: string]: boolean})
    const [displayedClimateScenarios, setDisplayedClimateScenarios] = useState<boolean[]>([])
    const [typeOfGHGIsWTW, setTypeOfGHGIsWTW] = useState(true)
    const [showPercents, setShowPercents] = useState(false)
    const [showLabels, setShowLabels] = useState(false)
    const [highContrastColors, setHighContrastColors] = useState(false)
    const [showOptionsModal, setShowOptionsModal] = useState(false)
    const projectId = params.projectId
    
    useEffect(() => {
        if (initialized && keycloak.authenticated && props.project.id){
            setProject(props.project)
            fetchInventoryResults()
            fetchBAUResults()
            for (let i = 0; i < props.project.stages.Climate.length; i++) {
                fetchClimateResults(props.project, i)
            }
            setDisplayedClimateScenarios(props.project.stages.Climate.map((e:any)=>true))
        }
    }, [keycloak, initialized, props.project, navigate])
    
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
                setClimateResults(prev => {
                    const tmp = prev.slice()
                    tmp[climateScenarioId] = data
                    return tmp
                })
            })
    }
    const csvs = {
        Inventory: inputsAsCsv(project, "Inventory"),
        BAU: inputsAsCsv(project, "BAU"),
        Climate: inputsAsCsv(project, "Climate"),
    }
    let sourcesSets = {
        Inventory: new Set(),
        BAU: new Set(),
        Climate: new Set(),
    }
    for (let i = 1; i < csvs.Inventory.length; i++) {
        const source = csvs.Inventory[i][8]
        sourcesSets.Inventory.add(source)
    }
    for (let i = 1; i < csvs.BAU.length; i++) {
        const source = csvs.BAU[i][7]
        sourcesSets.BAU.add(source)
    }
    for (let i = 1; i < csvs.Climate.length; i++) {
        const source = csvs.Climate[i][8]
        sourcesSets.Climate.add(source)
    }
    let sourcesUsed = {
        Inventory: Array.from(sourcesSets.Inventory).map(source => project.sources.find(e => e.value === source)?.sourceId).sort(),
        BAU: Array.from(sourcesSets.BAU).map(source => project.sources.find(e => e.value === source)?.sourceId).sort(),
        Climate: Array.from(sourcesSets.Climate).map(source => project.sources.find(e => e.value === source)?.sourceId).sort(),
    }
    return (
        <>
            <div className="chart-header">
                <h2>Graphs</h2>
                <div className="commands">                   
                    <Button variant="link" onClick={() => setShowOptionsModal(true)} style={{width: "100%", padding: "4px 4px"}}>
                        <span className="item"><span>Settings</span></span>
                    </Button>
                </div>
            </div>
            <EmissionsCompareBarChart 
                project={project} 
                bauEmissionsData={(typeOfGHGIsWTW ? bauResults?.emissions?.WTW : bauResults?.emissions?.TTW) || {}} 
                climateEmissionsData={climateResults.map((e => typeOfGHGIsWTW ? e.emissions.WTW : e.emissions.TTW)) || []}
                displayedVtypes={displayedVtypes}
                displayedClimateScenarios={displayedClimateScenarios}
                showPercents={showPercents}
                showLabels={showLabels}
                highContrastColors={highContrastColors}
            ></EmissionsCompareBarChart>
            <VktCompareBarChart 
                project={project} 
                bauVktData={bauResults?.vkt || {}} 
                climateVktData={climateResults.map(e => e?.vkt) || []}
                displayedVtypes={displayedVtypes}
                displayedClimateScenarios={displayedClimateScenarios}
                showPercents={showPercents}
                showLabels={showLabels}
                highContrastColors={highContrastColors}
            ></VktCompareBarChart>
            <ModalShareCompareBarChart
                project={project}
                title="Passenger modal share"
                bauModalShareData={bauResults?.modalShare?.passengers || {}}
                climateModalShareData={climateResults.map(e=>e?.modalShare?.passengers) || []}
                displayedClimateScenarios={displayedClimateScenarios}
                showLabels={showLabels}
                highContrastColors={highContrastColors}
            ></ModalShareCompareBarChart>
            <ModalShareCompareBarChart
                project={project}
                title="Freight modal share"
                bauModalShareData={bauResults?.modalShare?.freight || {}}
                climateModalShareData={climateResults.map(e => e?.modalShare?.freight) || []}
                displayedClimateScenarios={displayedClimateScenarios}
                showLabels={showLabels}
                highContrastColors={highContrastColors}
            ></ModalShareCompareBarChart>
            <TransportPerformanceCompareBarChart 
                title="Passenger transport performance (pkm)"
                project={project} 
                bauTransportPerformanceData={bauResults?.transportPerformance?.passengers || {}} 
                climateTransportPerformanceData={climateResults.map(e => e?.transportPerformance?.passengers) || []}
                displayedVtypes={displayedVtypes}
                displayedClimateScenarios={displayedClimateScenarios}
                showPercents={showPercents}
                showLabels={showLabels}
                highContrastColors={highContrastColors}
            ></TransportPerformanceCompareBarChart>
            <TransportPerformanceCompareBarChart 
                title="Freight transport performance (tkm)"
                project={project} 
                bauTransportPerformanceData={bauResults?.transportPerformance?.freight || {}} 
                climateTransportPerformanceData={climateResults.map(e => e?.transportPerformance?.freight) || []}
                displayedVtypes={displayedVtypes}
                displayedClimateScenarios={displayedClimateScenarios}
                showPercents={showPercents}
                showLabels={showLabels}
                highContrastColors={highContrastColors}
            ></TransportPerformanceCompareBarChart>
            <EmissionsPerUkmCompareBarChart 
                title="Passenger emissions per transport performance (gCO2/pkm)"
                project={project} 
                bauEmissionsData={(typeOfGHGIsWTW ? bauResults?.emissions?.WTW : bauResults?.emissions?.TTW) || {}} 
                climateEmissionsData={climateResults.map((e => typeOfGHGIsWTW ? e.emissions.WTW : e.emissions.TTW)) || []}
                bauTransportPerformanceData={bauResults?.transportPerformance?.passengers || {}} 
                climateTransportPerformanceData={climateResults.map(e => e?.transportPerformance?.passengers) || []}
                displayedVtypes={displayedVtypes}
                displayedClimateScenarios={displayedClimateScenarios}
                showPercents={showPercents}
                showLabels={showLabels}
                highContrastColors={highContrastColors}
            ></EmissionsPerUkmCompareBarChart>
            <EmissionsPerUkmCompareBarChart 
                title="Freight emissions per transport performance (gCO2/tkm)"
                project={project} 
                bauEmissionsData={(typeOfGHGIsWTW ? bauResults?.emissions?.WTW : bauResults?.emissions?.TTW) || {}} 
                climateEmissionsData={climateResults.map((e => typeOfGHGIsWTW ? e.emissions.WTW : e.emissions.TTW)) || []}
                bauTransportPerformanceData={bauResults?.transportPerformance?.freight || {}} 
                climateTransportPerformanceData={climateResults.map(e => e?.transportPerformance?.freight) || []}
                displayedVtypes={displayedVtypes}
                displayedClimateScenarios={displayedClimateScenarios}
                showPercents={showPercents}
                showLabels={showLabels}
                highContrastColors={highContrastColors}
            ></EmissionsPerUkmCompareBarChart>
            <h2>Datasets</h2>
            <Table bordered>
                <colgroup>
                    <col className="tablecol4" />{/* Dataset */}
                    <col className="tablecol3" />{/* Action */}
                    <col className="tablecolfluid" />{/* Sources */}
                </colgroup>
                <thead>
                    <tr>
                        <th><span className="item"><span>Dataset</span></span></th>
                        <th><span className="item"><span>Action</span></span></th>
                        <th><span className="item"><span>Sources</span></span></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><Badge className="badge-read-only"><span className="item"><span>Inventory</span></span></Badge></td>
                        <td>{project.name && <CSVLink data={csvs.Inventory} filename={project.name.replace(" ", "_") + "_Inventory_Inputs.csv"} className="btn btn-primary btn-sm">
                            <span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#download"}/></svg><span>CSV</span></span>
                        </CSVLink>}</td>
                        <td>{sourcesUsed.Inventory.map(e => e ? "[" + e + "] ": "")}</td>
                    </tr>
                    <tr>
                        <td><Badge className="badge-read-only"><span className="item"><span>BAU Scenario</span></span></Badge></td>
                        <td>{project.name && <CSVLink data={csvs.BAU} filename={project.name.replace(" ", "_") + "_BAU_Inputs.csv"} className="btn btn-primary btn-sm">
                            <span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#download"}/></svg><span>CSV</span></span>
                        </CSVLink>}</td>
                        <td>{sourcesUsed.BAU.map(e => e ? "[" + e + "] ": "")}</td>
                    </tr>
                    <tr>
                        <td><Badge className="badge-read-only"><span className="item"><span>Climate Scenarios</span></span></Badge></td>
                        <td>{project.name && <CSVLink data={csvs.Climate} filename={project.name.replace(" ", "_") + "_Climate_Inputs.csv"} className="btn btn-primary btn-sm">
                            <span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#download"}/></svg><span>CSV</span></span>
                        </CSVLink>}</td>
                        <td>{sourcesUsed.Climate.map(e => e ? "[" + e + "] ": "")}</td>
                    </tr>
                </tbody>
            </Table>
            <h2>Sources</h2>
            <Table bordered>
                <colgroup>
                    <col className="tablecol4" />{/* Source */}
                    <col className="tablecolfluid" />{/* ID */}
                </colgroup>
                <thead>
                    <tr>
                        <th><span className="item"><span>Source</span></span></th>
                        <th><span className="item"><span>ID</span></span></th>
                    </tr>
                </thead>
                <tbody>
                    {project?.sources?.map(({value, sourceId}, index) => {
                        return (<tr key={index}>
                            <td><Badge className="badge-read-only"><span className="item"><span>{value}</span></span></Badge></td>
                            <td>[{sourceId}]</td>
                        </tr>)
                    })}
                </tbody>
            </Table>
            <OptionsModal
                show={showOptionsModal} 
                onHide={() => setShowOptionsModal(false)}
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
                displayedClimateScenarios={displayedClimateScenarios}
                setDisplayedClimateScenarios={setDisplayedClimateScenarios}
            />
        </>
    )
}
type SetBoolean = (key:boolean | ((k:boolean) => boolean)) => void
const OptionsModal = (
    {project, show, onHide, setDisplayedVtypes, typeOfGHGIsWTW, setTypeOfGHGIsWTW, showPercents, setShowPercents, showLabels, setShowLabels, highContrastColors, setHighContrastColors, displayedClimateScenarios, setDisplayedClimateScenarios}: 
    {project: ProjectType, show: boolean, onHide: () => void, setDisplayedVtypes: React.Dispatch<SetStateAction<{[key:string]: boolean}>>, typeOfGHGIsWTW: boolean, setTypeOfGHGIsWTW: SetBoolean, showPercents: boolean, setShowPercents: SetBoolean, showLabels: boolean, setShowLabels: SetBoolean, highContrastColors: boolean, setHighContrastColors: SetBoolean, displayedClimateScenarios: boolean[], setDisplayedClimateScenarios: React.Dispatch<SetStateAction<boolean[]>>}
    ) => {
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
    const updateSelectedScenario = (event: React.BaseSyntheticEvent) => {
        let target = event.target as HTMLInputElement
        let scenarioId = parseInt(target.name)
        setDisplayedClimateScenarios((prev) => {
            let tmp = prev.slice()
            tmp[scenarioId] = !tmp[scenarioId]
            return tmp
        })
    }
    return (
        <Modal size="xl" centered show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Settings</Modal.Title>
            </Modal.Header>
            <Modal.Body className="masked-overflow-y" style={{"overflowX": "hidden"}}>
                <Form.Group className="mb-3">
                    <Form.Label>Displayed categories of transport</Form.Label>
                    <div style={{display: 'flex', flexWrap: 'wrap'}}>
                    {vtypes.map((vtype, index) => {
                        return (
                            <Col lg="6" key={index}>
                                <Form.Switch style={{margin: "5px"}} id={"custom-switch-" + vtype} key={index}>
                                    <Form.Switch.Input  name={vtype} checked={selectedVtypes[vtype]} onChange={updateSelectedVtypes}/>
                                    <Form.Switch.Label>{vtype}</Form.Switch.Label>
                                </Form.Switch>
                            </Col>
                        )
                    })}
                    </div>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Displayed Climate Scenarios</Form.Label>
                    <Row>
                    {displayedClimateScenarios.map((displayed, index) => {
                        return (
                            <Col lg="4" key={index}>
                                <Form.Switch style={{margin: "5px"}} key={index}>
                                    <Form.Switch.Input  name={index.toString()} checked={displayed} onChange={updateSelectedScenario}/>
                                    <Form.Switch.Label>{index+1}</Form.Switch.Label>
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
                        <Form.Switch.Label>Display percents changes compared to BAU</Form.Switch.Label>
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
            </Modal.Body>
        </Modal>
    );
  }