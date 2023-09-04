import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useParams, useNavigate } from "react-router-dom"
import {Table, Button, Badge, Modal, Form, Tabs, Tab, Alert} from 'react-bootstrap'
import {FuelType, InputClimateWithUpstreamStep1, InputInventoryStep2, ProjectType} from '../../frontendTypes'
import ChoiceModal from '../../components/ChoiceModal'

import '../Project.css'
import DescAndNav from '../../components/DescAndNav'
import ValidSource from '../../components/ValidSource'
import TdDiagonalBar from '../../components/TdDiagonalBar'
import PercentInput from '../../components/PercentInput'
import ProjectStepContainerWrapper from '../../components/ProjectStepContainerWrapper'
import ItemWithOverlay from '../../components/ItemWithOverlay'

export default function ClimateWithUpstreamStep1(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    const params = useParams();
    const [inputData, setInputData ] = useState({vtypes: {}, note: undefined} as InputClimateWithUpstreamStep1)
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
                    let init:InputClimateWithUpstreamStep1 = {
                        vtypes: {},
                        note: data.project.stages?.Climate?.[climateScenarioId]?.steps?.[stepNumber]?.note || undefined
                    }
                    const inventoryStep1 = data.project.stages?.Inventory?.[0]?.steps?.[1].vtypes || {}
                    const vtypes = Object.keys(inventoryStep1)
                    for (let i = 0; i < vtypes.length; i++) {
                        const vtype = vtypes[i];
                        if (data.project.stages.Climate[climateScenarioId]?.steps[stepNumber]?.vtypes[vtype]) {
                            init.vtypes[vtype] = data.project.stages.Climate[climateScenarioId]?.steps[stepNumber].vtypes[vtype]
                        } else {
                            init.vtypes[vtype] = {
                                source: "",
                                vkt: data.project.referenceYears.slice(1).map(() => "")
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
    }, [keycloak, initialized, projectId, navigate])
    const updateInput = (vtype: string, yearIndex: number, value: string) => {
        setInputData((prevInputData) => {
            let tmp = {...prevInputData}
            tmp.vtypes[vtype].vkt[yearIndex] = value
            return tmp
        })
        setError("")
    }
    
    const configureSource = (vtype: string, ftype?: string) => {
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
            if (!vehicle.vkt.reduce((p,c) => p && c !== "", true)) {
                setError("Error: at least one climate VKT is not set")
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
            .then(() => navigate('/project/' + projectId + '/Climate/' + climateScenarioId + '/With/step/' + (stepNumber + 1)));
    }
    return (
        <>
            <ProjectStepContainerWrapper project={project} stage="Climate" currentStep={stepNumber} noteValue={inputData.note} setInputData={setInputData} climateScenarioId={climateScenarioId} isWithoutUpstream={false}>
                <h1>Transport activity</h1>
                {error && <Alert variant='danger'>{error}</Alert>}
                {sourceWarning && <Alert variant='warning'>Warning: At least one source is missing. Please add missing sources below or click the Next button again to ignore this warning.</Alert>}
                <DescAndNav 
                    prevNav={{link: '/project/' + project.id + '/Climate/' + climateScenarioId + '/intro', content: "<- Prev.", variant: "secondary"}}
                    nextNav={{trigger: nextTrigger, content: "Next ->", variant: "primary"}}
                    seeMoreCallBack={()=>setShowInfo(true)}
                >
                    <div className="text desc">
                        <p>Mileage is the cornerstorne of the calculation of transport GHG emissions. Please enter VKT computed with your transport planning tool for the current climate scenario.</p>
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
                                    <th className="item-sm"><ItemWithOverlay overlayContent="Remininder of VKT computed for this year during BAU scenario"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>BAU VKT (Mkm/y)</span></span></ItemWithOverlay></th>
                                    <th className="item-sm"><ItemWithOverlay overlayContent="Source of climate VKT, it can be the source used to fill the transport tool. Click the blue + button to add a source"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Src</span></span></ItemWithOverlay></th>
                                    <th className="item-sm"><ItemWithOverlay overlayContent="VKT values extracted from upstream calculation for the current climate scenario"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Climate VKT (Mkm/y)</span></span></ItemWithOverlay></th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(inputData.vtypes).map((vtype, index) => {
                                    const vehicle = inputData.vtypes[vtype]
                                    const source = vehicle.source
                                    const vkt = vehicle.vkt?.[yearIndex] || ""
                                    return (
                                        <tr key={vtype}>
                                            <td style={{verticalAlign: "top"}}><Badge bg="disabled"><span className="item"><span>{vtype}</span></span></Badge></td>
                                            <td>{bAUVkt?.[vtype]?.[yearIndex + 1]}</td>
                                            <td>{source
                                            ? <ValidSource source={source} onClick={(e:any) => configureSource(vtype)}/>
                                            : <Button variant="action" onClick={e => configureSource(vtype)}><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#plus"}/></svg></span></Button>}</td>
                                            <td>
                                                <Form.Control value={vkt} onChange={(e:any) => updateInput(vtype, yearIndex, e.target.value)}></Form.Control>
                                            </td>
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
                    <Modal.Title>Transport activity information</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>The composition of a city-specific vehicle fleet strongly influences local transport emissions. The more private cars are on the road and the larger or older the vehicles are, the higher their fuel consumption is and the higher the related GHG emissions are. In other words, GHG emissions depend on the vehicle fleet and on the distribution of VKT across the fleet's vehicle mix.</p>
                    <p>Data on the vehicle fleet is generally available from vehicle registration statistics for passenger cars, taxis, trucks, and motorcycles (e-bikes are mostly excluded), which includes technical specifications for the different vehicle types. Once the registered fleet is documented for the base year, e.g. 2015, only newly registered (and deregistered) vehicles have to be monitored each year.</p>
                    <p>If there are no big differences in the fleet compositions across different cities in a country, using national averages for urban fleet composition may be considered. Where the fleet is known to be quite specific, however, these local characteristics should be accounted for, e.g. prosperous metropolitan areas may have a larger number of new and larger cars than less prosperous mid-sized cities with a smaller but older fleet.</p>
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
