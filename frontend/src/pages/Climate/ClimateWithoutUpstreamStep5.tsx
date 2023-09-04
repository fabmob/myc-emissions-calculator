import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useParams, useNavigate } from "react-router-dom"
import {Table, Button, Badge, Form, Tabs, Tab, Alert} from 'react-bootstrap'
import {FuelType, InputBAUStep2, InputClimateWithoutUpstreamStep1, InputClimateWithoutUpstreamStep2, InputClimateWithoutUpstreamStep3, InputClimateWithoutUpstreamStep4, InputInventoryStep1, InputInventoryStep6, InputInventoryStep8, ProjectType, VehicleStats} from '../../frontendTypes'
import ChoiceModal from '../../components/ChoiceModal'

import '../Project.css'
import DescAndNav from '../../components/DescAndNav'
import ValidSource from '../../components/ValidSource'
import ProjectStepContainerWrapper from '../../components/ProjectStepContainerWrapper'
import TdDiagonalBar from '../../components/TdDiagonalBar'
import PercentInput from '../../components/PercentInput'
import { computeVktAfterASI } from '../../utils/asiComputations'
import ItemWithOverlay from '../../components/ItemWithOverlay'

export default function ClimateWithoutUpstreamStep5(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    const params = useParams();
    const [inputData, setInputData ] = useState({vtypes: {}, note: undefined} as InputBAUStep2) // This page is the same type as bau2
    const [project, setProject ] = useState({} as ProjectType)
    const projectId = params.projectId
    const [error, setError] = useState("")
    const [sourceWarning, setSourceWarning] = useState(false)
    const climateScenarioId = parseInt(params.climateScenarioId || "0")
    const [ showSourceModal, setShowSourceModal ] = useState(false)
    const [bAUVkt, setBAUVkt] = useState({} as {[key: string]: number[]})
    const [ currentVtype, setCurrentVtype ] = useState("")
    const [ currentFtype, setCurrentFtype ] = useState("")
    const stepNumber = 5
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
                    let init:InputBAUStep2 = {
                        vtypes: {},
                        note: data.project.stages?.Climate?.[climateScenarioId]?.steps?.[stepNumber]?.note || undefined
                    }
                    const inventoryStep1 = data.project.stages?.Inventory?.[0]?.steps?.[1].vtypes || {}
                    const bauStep2: InputBAUStep2 = data.project.stages?.BAU?.[0]?.steps?.[2]
                    const vtypes = Object.keys(inventoryStep1)
                    for (let i = 0; i < vtypes.length; i++) {
                        const vtype = vtypes[i];
                        if (data.project.stages?.Climate?.[climateScenarioId]?.steps?.[stepNumber]?.vtypes[vtype]) {
                            init.vtypes[vtype] = data.project.stages?.Climate?.[climateScenarioId]?.steps?.[stepNumber]?.vtypes[vtype]
                        } else {
                            init.vtypes[vtype] = {
                                fuels: {}
                            }
                        }
                        const ftypes = Object.keys(inventoryStep1[vtype].fuels || {})
                        for (let i = 0; i < ftypes.length; i++) {
                            const ftype = ftypes[i] as FuelType;
                            if (!data.project.stages?.Climate?.[climateScenarioId]?.steps?.[stepNumber]?.vtypes?.[vtype]?.fuels[ftype]) {
                                const bAUPercent = bauStep2.vtypes?.[vtype].fuels?.[ftype]?.percent
                                init.vtypes[vtype].fuels[ftype] = {
                                    percent: bAUPercent?.slice() || data.project.referenceYears.slice(1).map(() => ftypes.length === 1 ? "100" : ""),
                                    percentSource: ""
                                }
                            }
                        }
                    }
                    setInputData(init)

                })
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
    const updateInputPercent = (vtype: string, ftype: FuelType, yearIndex: number, percent: string) => {
        setInputData((prevInputData) => {
            let tmp = {...prevInputData}
            tmp.vtypes[vtype].fuels[ftype]!.percent[yearIndex] = percent
            return tmp
        })
        setError("")
    }
    
    const configureSource = (vtype: string, ftype?: string) => {
        setCurrentVtype(vtype)
        setCurrentFtype(ftype || "")
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
        // Add source to proper input (using currentVtype and currentFtype)
        const ftype = currentFtype as FuelType
        setInputData((prevInputData) => {
            let tmp = {...prevInputData}
            tmp.vtypes[currentVtype].fuels[ftype]!.percentSource = source
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
            const ftypes = Object.keys(vehicle.fuels)
            
            let totalPercent : number[] = []
            for (let i = 0; i < ftypes.length; i++) {
                const ftype = ftypes[i] as FuelType
                const value = vehicle?.fuels[ftype]?.percent || ''
                if (!vehicle?.fuels[ftype]?.percentSource) srcMissing = true
                for (let y = 0; y < value.length; y++) {
                    const year = value[y];
                    if (!totalPercent[y]) totalPercent[y] = 0
                    totalPercent[y] += parseFloat(year) || 0
                    
                }
            }
            // Check that all totalPercent are 100
            if (!totalPercent.reduce((p,c) => p && c === 100, true)) {
                setError("Error: the sum of fuel shares (VKT %) for at least one vehicle and year is not 100%")
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
    const inputInventoryStep1 : InputInventoryStep1 = project.stages?.Inventory[0].steps?.[1] || {}
    const isVtypeFreight = (vtype: string) => {
        return inputInventoryStep1.vtypes[vtype].type === "freight"
    }
    const inputClimateWithoutUpstreamStep1 : InputClimateWithoutUpstreamStep1 = project.stages?.Climate[climateScenarioId].steps?.[1]
    const inputClimateWithoutUpstreamStep2 : InputClimateWithoutUpstreamStep2 = project.stages?.Climate[climateScenarioId].steps?.[2]
    const inputClimateWithoutUpstreamStep3 : InputClimateWithoutUpstreamStep3 = project.stages?.Climate[climateScenarioId].steps?.[3]
    const inputClimateWithoutUpstreamStep4 : InputClimateWithoutUpstreamStep4 = project.stages?.Climate[climateScenarioId].steps?.[4]
    const inputInventoryStep8: InputInventoryStep8 = project.stages?.Inventory[0].steps?.[8]
    const inputInventoryStep6: InputInventoryStep6 = project.stages?.Inventory[0].steps?.[6]
    
    let vehicleStats : VehicleStats = {}
    const vtypes = Object.keys(inputInventoryStep1?.vtypes || {})
    for (let i = 0; i < vtypes.length; i++) {
        const vtype = vtypes[i];
        vehicleStats[vtype] = {
            network: inputInventoryStep1.vtypes[vtype]?.network,
            occupancy: parseFloat(inputInventoryStep6.vtypes[vtype]?.value),
            triplength: parseFloat(inputInventoryStep8.vtypes[vtype]?.value) || 1,
            type: inputInventoryStep1.vtypes[vtype]?.type
        }
    }
    const computedASI = (project.referenceYears && vehicleStats) ? computeVktAfterASI(project.referenceYears, inputClimateWithoutUpstreamStep1, bAUVkt, inputClimateWithoutUpstreamStep2, inputClimateWithoutUpstreamStep3, vehicleStats, inputClimateWithoutUpstreamStep4.vtypes) : null
    console.log("computedASI", computedASI)
    return (
        <>
            <ProjectStepContainerWrapper project={project} stage="Climate" currentStep={stepNumber} noteValue={inputData.note} setInputData={setInputData} climateScenarioId={climateScenarioId} isWithoutUpstream={true}>
                <h1>Transport activity fuel breakdown</h1>
                {error && <Alert variant='danger'>{error}</Alert>}
                {sourceWarning && <Alert variant='warning'>Warning: At least one source is missing. Please add missing sources below or click the Next button again to ignore this warning.</Alert>}
                <DescAndNav 
                    prevNav={{link: '/project/' + project.id + '/Climate/' + climateScenarioId + '/Without/step/' + (stepNumber - 1), content: "<- Prev.", variant: "secondary"}}
                    nextNav={{trigger: nextTrigger, content: "Next ->", variant: "primary"}}
                >
                    <div className="text desc">
                        <p>Please also enter the percentage of vehicle kilometers travelled (vkt) per fuel type. The sum of fuel shares in each vehicle category must be 100 %.</p>
                        <p>Values are pre-filled with BAU data if available; this is done to simplify the filling process. Please update values accordingly.</p>
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
                                    <th className="item-sm"><ItemWithOverlay overlayContent="Fuels used by the transport mode, current and expected"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Fuels</span></span></ItemWithOverlay></th>
                                    <th className="item-sm">
                                        <ItemWithOverlay overlayContent={
                                            <div>Vehicle kilometers travelled. Values for each fuel are computed as
                                                <div style={{backgroundColor: "#C5E8F2", padding: "10px", margin: "10px 0px 10px 0px"}}>
                                                    <Badge bg="disabled"><span className="item"><span>Computed VKT after shift (Mkm/y)</span></span></Badge> x <Badge bg="disabled"><span className="item"><span>VKT (%)</span></span></Badge> / 100
                                                </div>
                                            </div>
                                        }><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Computed VKT (Mkm/y)</span></span></ItemWithOverlay>
                                    </th>
                                    <th className="item-sm"><ItemWithOverlay overlayContent="Reminder of share values used during BAU scenario"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>BAU. VKT (%)</span></span></ItemWithOverlay></th>
                                    <th className="item-sm"><ItemWithOverlay overlayContent="Source of VKT share, click the blue + button to add a source"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Src</span></span></ItemWithOverlay></th>
                                    <th className="item-sm"><ItemWithOverlay overlayContent="Share of vehicle vkt per fuel, sum should be 100%"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>VKT (%)</span></span></ItemWithOverlay></th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(inputData.vtypes).map((vtype, index) => {
                                    const vehicle = inputData.vtypes[vtype]
                                    if (!vehicle?.fuels) return <></>
                                    const ftypes = Object.keys(vehicle.fuels)
                                    let fuelJsx = []
                                    let totalPercent = 0
                                    for (let i = 0; i < ftypes.length; i++) {
                                        const ftype = ftypes[i] as FuelType
                                        const value = vehicle?.fuels[ftype]?.percent[yearIndex] || ""
                                        totalPercent += parseFloat(value) || 0
                                    }
                                    for (let i = 0; i < ftypes.length; i++) {
                                        const ftype = ftypes[i] as FuelType
                                        const value = vehicle?.fuels[ftype]?.percent[yearIndex] || ""
                                        const percentSource = vehicle?.fuels[ftype]?.percentSource
                                        const bAUPercent = project.stages.BAU[0].steps?.[2].vtypes?.[vtype].fuels?.[ftype]?.percent[yearIndex] || "?"
                                        fuelJsx.push(<tr key={vtype + ftype}>
                                            <td><Badge bg="disabled"><span className="item"><span>{ftype}</span></span></Badge></td>
                                            <td>{parseFloat((parseFloat(value) / 100 * (computedASI?.baseVkt?.[vtype]?.[yearIndex+1] || 0)).toFixed(10)) || ""}</td>
                                            <td>{bAUPercent}</td>
                                            <td>
                                                {percentSource 
                                                ? <ValidSource source={percentSource} onClick={(e:any) => configureSource(vtype, ftype)}/>
                                                : <Button variant="action" onClick={e => configureSource(vtype, ftype)}><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#plus"}/></svg></span></Button>}
                                            </td>
                                            <td>
                                                <PercentInput value={value} onChange={(e:any) => updateInputPercent(vtype, ftype, yearIndex, e.target.value)} invalid={totalPercent > 100}></PercentInput>
                                            </td>
                                        </tr>)
                                    }
                                    return [
                                        <tr key={vtype}>
                                            <td rowSpan={ftypes.length +1} style={{verticalAlign: "top"}}><Badge bg="disabled"><span className="item"><span>{vtype}</span></span></Badge></td>
                                            <td>All</td>
                                            <td>{computedASI?.baseVkt?.[vtype]?.[yearIndex+1]}</td>
                                            <td>100</td>
                                            <TdDiagonalBar></TdDiagonalBar>
                                            <td className={totalPercent > 100 ? "cellError": ""}>{totalPercent || 0}</td>
                                        </tr>,
                                        fuelJsx
                                    ]
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
        </>
    )
}
