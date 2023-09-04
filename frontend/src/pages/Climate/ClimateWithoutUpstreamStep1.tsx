import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useParams, useNavigate } from "react-router-dom"
import {Table, Button, Badge, Modal, Form, Tabs, Tab, Alert} from 'react-bootstrap'
import {InputClimateWithoutUpstreamStep1, ProjectType} from '../../frontendTypes'
import ChoiceModal from '../../components/ChoiceModal'

import '../Project.css'
import DescAndNav from '../../components/DescAndNav'
import ValidSource from '../../components/ValidSource'
import ProjectStepContainerWrapper from '../../components/ProjectStepContainerWrapper'
import { computeVktAfterASI } from '../../utils/asiComputations'
import ItemWithOverlay from '../../components/ItemWithOverlay'

export default function ClimateWithoutUpstreamStep1(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    const params = useParams();
    const [inputData, setInputData ] = useState({vtypes: {}, note: undefined} as InputClimateWithoutUpstreamStep1)
    const [project, setProject ] = useState({} as ProjectType)
    const projectId = params.projectId
    const [error, setError] = useState("")
    const [sourceWarning, setSourceWarning] = useState(false)
    const climateScenarioId = parseInt(params.climateScenarioId || "0")
    const [ showSourceModal, setShowSourceModal ] = useState(false)
    const [ currentVtype, setCurrentVtype ] = useState("")
    const [bAUVkt, setBAUVkt] = useState({} as {[key: string]: number[]})
    const [showInfo, setShowInfo] = useState(false);
    const handleCloseInfo = () => setShowInfo(false);
    const stepNumber = 1
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
                    let init:InputClimateWithoutUpstreamStep1 = {
                        vtypes: {},
                        note: data.project.stages?.Climate?.[climateScenarioId]?.steps?.[stepNumber]?.note || undefined
                    }
                    const inventoryStep1 = data.project.stages?.Inventory?.[0]?.steps?.[1].vtypes || {}
                    const vtypes = Object.keys(inventoryStep1)
                    for (let i = 0; i < vtypes.length; i++) {
                        const vtype = vtypes[i];
                        if (data.project.stages.Climate[climateScenarioId]?.steps[stepNumber]?.vtypes[vtype]?.avoidedVkt) {
                            init.vtypes[vtype] = data.project.stages.Climate[climateScenarioId]?.steps[stepNumber].vtypes[vtype]
                        } else {
                            init.vtypes[vtype] = {
                                source: "",
                                avoidedVkt: data.project.referenceYears.slice(1).map(() => "0")
                            }
                        }
                    }
                    setInputData(init)

                });
            fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + "/BAU/0/vehicleKilometresTravelledComputed", requestOptions)
                .then(response => {
                    return response.json()
                })
                .then(data => {
                    console.log("get inv results reply", data)
                    setBAUVkt(data.vehicleKilometresTravelledComputed)
                })
            }
    }, [keycloak, initialized, projectId, climateScenarioId, navigate])
    const updateInput = (vtype: string, yearIndex: number, value: string) => {
        setInputData((prevInputData) => {
            let tmp = {...prevInputData}
            tmp.vtypes[vtype].avoidedVkt[yearIndex] = value
            return tmp
        })
        setError("")
    }
    
    const configureSource = (vtype: string) => {
        setCurrentVtype(vtype)
        setShowSourceModal(true)
    }
    const addSourceModalCallback = (source: string) => {
        // Check if it's a new source
        if (!project.sources.find(s => s.value === source)) {
            // Call api point if it's the case
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
                body: JSON.stringify({ source: source })
            };
            // TODO: error handling ?
            fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/source', requestOptions)
                .then(response => response.json())
            setProject(prevProject => {
                return {
                    ...prevProject,
                    sources: [{value: source, projectId: 0, sourceId: 0}].concat(prevProject.sources)
                }
            })
        }
        // Add source to proper input (using currentVtype)
        setInputData((prevInputData) => {
            let tmp = {...prevInputData}
            tmp.vtypes[currentVtype].source = source
            return tmp
        })
        setSourceWarning(false)
    }

    const nextTrigger = () => {
        // Error detection
        const vtypes = Object.keys(inputData.vtypes)
        let srcMissing = false
        for (let i = 0; i < vtypes.length; i++) {
            const vtype = vtypes[i]
            const vehicle = inputData.vtypes[vtype]
            if (vehicle.source === "") srcMissing = true
            if (!vehicle.avoidedVkt.reduce((p,c) => p && c !== "", true)) {
                setError("Error: at least one avoided vkt value is not set")
                return
            }
        }
        if (srcMissing && !sourceWarning) {
            setSourceWarning(true)
            return
        }
        // save data and nav to next step
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
            body: JSON.stringify({ inputData: inputData})
        };
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/Climate/' + climateScenarioId + '/step/' + stepNumber, requestOptions)
            .then(response => response.json())
            .then(() => navigate('/project/' + projectId + '/Climate/' + climateScenarioId + '/Without/step/' + (stepNumber + 1)));
    }
    let climateVkt = project.referenceYears ? computeVktAfterASI(project.referenceYears, inputData, bAUVkt).baseVkt : {}
    return (
        <>
            <ProjectStepContainerWrapper project={project} stage="Climate" currentStep={stepNumber} noteValue={inputData.note} setInputData={setInputData} climateScenarioId={climateScenarioId} isWithoutUpstream={true}>
                <h1>Use of vehicles : avoided</h1>
                {error && <Alert variant='danger'>{error}</Alert>}
                {sourceWarning && <Alert variant='warning'>Warning: At least one source is missing. Please add missing sources below or click the Next button again to ignore this warning.</Alert>}
                <DescAndNav 
                    prevNav={{link: '/project/' + project.id + '/Climate/' + climateScenarioId + '/intro', content: "<- Prev.", variant: "secondary"}}
                    nextNav={{trigger: nextTrigger, content: "Next ->", variant: "primary"}}
                    seeMoreCallBack={()=>setShowInfo(true)}
                >
                    <div className="text desc">
                    <p>Please enter the percentage of vehicle kilometers travelled (vkt) that will be avoided with the planned mitigation measures.</p>
                    </div>                
                </DescAndNav>
                <Tabs
                    defaultActiveKey={project.referenceYears?.[1]}
                    className="mb-3"
                    fill
                >
                    {project.referenceYears && project.referenceYears.slice(1).map((y, yearIndex) => (<Tab eventKey={y} title={y} key={yearIndex}>
                        <Table bordered>
                            <thead>
                                <tr>                                
                                    <th className="item-sm"><ItemWithOverlay overlayContent="Transport modes, current and expected"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Vehicle</span></span></ItemWithOverlay></th>
                                    <th className="item-sm"><ItemWithOverlay overlayContent="Remininder of VKT computed for this year during BAU scenario"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>BAU VKT (Mkm)</span></span></ItemWithOverlay></th>
                                    <th className="item-sm"><ItemWithOverlay overlayContent="Source of avoided VKT value. Click the blue + button to add a source"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Src</span></span></ItemWithOverlay></th>
                                    <th className="item-sm"><ItemWithOverlay overlayContent="Percent of vehicle kilometer travelled avoided per time period"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Avoided VKT (%)</span></span></ItemWithOverlay></th>
                                    <th className="item-sm">
                                        <ItemWithOverlay overlayContent={
                                            <div>Computed Climate VKT as
                                                <div style={{backgroundColor: "#C5E8F2", padding: "10px", margin: "10px 0px 10px 0px"}}>
                                                    (<Badge bg="disabled"><span className="item"><span>VKT at the end of previous year (Mkm)</span></span></Badge> + <Badge bg="disabled"><span className="item"><span>BAU VKT added between years (Mkm)</span></span></Badge>) x <Badge bg="disabled"><span className="item"><span>Avoided VKT (%)</span></span></Badge> / 100
                                                </div>
                                                First VKT values come from reference year data (inventory).
                                            </div>
                                        }><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Climate VKT (Mkm)</span></span></ItemWithOverlay>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(inputData.vtypes).map((vtype, index) => {
                                    const vehicle = inputData.vtypes[vtype]
                                    const source = vehicle.source
                                    const avoidedVkt = vehicle.avoidedVkt?.[yearIndex] || ""
                                    return (
                                        <tr key={vtype}>
                                            <td style={{verticalAlign: "top"}}><Badge bg="disabled"><span className="item"><span>{vtype}</span></span></Badge></td>
                                            <td>{bAUVkt?.[vtype]?.[yearIndex+1]}</td>
                                            <td>{source
                                            ? <ValidSource source={source} onClick={(e:any) => configureSource(vtype)}/>
                                            : <Button variant="action" onClick={e => configureSource(vtype)}><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#plus"}/></svg></span></Button>}</td>
                                            <td>
                                                <Form.Control value={avoidedVkt} onChange={(e:any) => updateInput(vtype, yearIndex, e.target.value)}></Form.Control>
                                            </td>
                                            <td>{climateVkt[vtype]?.[yearIndex+1] || 0}</td>
                                        </tr>
                                    )
                                })}
                                
                            </tbody>
                        </Table>
                    </Tab>))}
                </Tabs>
                
            </ProjectStepContainerWrapper>
            <ChoiceModal 
                showModal={showSourceModal} 
                setShowModal={setShowSourceModal} 
                availableChoices={(project?.sources || []).map(source => source.value)}
                callback={addSourceModalCallback}
            ></ChoiceModal>
            <Modal size="lg" centered show={showInfo} onHide={handleCloseInfo}>
                <Modal.Header closeButton>
                    <Modal.Title>Avoided vkt information</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Example of measure: Parking space reduction</p>
                    <p>Remark 1: "Avoid" means that the trip does not take place at all. If the trip is just replaced by a trip with a different mode of transport, it has to be entered in section "Shift".</p>
                    <p>Remark 2: Only enter the effect for the first year it occurs. The tool automatically takes it into account for subsequent years.</p>
                    <p>Remark 3: Please note that the percentage of vkt avoided should not exceed a value of 30%. For comparison, strict measures during the Covid lockdown in Germany in 2020 led to 15% avoided vkt of passenger cars, 4% avoided vkt of buses, 78% avoided vkt of coaches and 2% avoided vkt of long distance trains compared to 2019 (source: ifeu). Planned climate measure are likely to have a  lower impact, especially for passenger transport by road. </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseInfo}>
                        <span className="item"><span>Close</span></span>
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
