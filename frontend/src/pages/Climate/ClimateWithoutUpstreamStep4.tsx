import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useParams, useNavigate } from "react-router-dom"
import {Table, Button, Badge, Form, Tabs, Tab, Alert} from 'react-bootstrap'
import {InputClimateWithoutUpstreamStep1, InputClimateWithoutUpstreamStep2, InputClimateWithoutUpstreamStep3, InputClimateWithoutUpstreamStep4, InputInventoryStep1, InputInventoryStep6, InputInventoryStep8, ProjectType, VehicleStats} from '../../frontendTypes'
import ChoiceModal from '../../components/ChoiceModal'

import '../Project.css'
import DescAndNav from '../../components/DescAndNav'
import ValidSource from '../../components/ValidSource'
import ProjectStepContainerWrapper from '../../components/ProjectStepContainerWrapper'
import { computeVktAfterASI } from '../../utils/asiComputations'
import TdDiagonalBar from '../../components/TdDiagonalBar'
import ItemWithOverlay from '../../components/ItemWithOverlay'

export default function ClimateWithoutUpstreamStep4(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    const params = useParams();
    const [inputData, setInputData ] = useState({vtypes: {}, note: undefined} as InputClimateWithoutUpstreamStep4)
    const [project, setProject ] = useState({} as ProjectType)
    const projectId = params.projectId
    const [error, setError] = useState("")
    const [sourceWarning, setSourceWarning] = useState(false)
    const climateScenarioId = parseInt(params.climateScenarioId || "0")
    const [ showSourceModal, setShowSourceModal ] = useState(false)
    const [ currentGoalVtype, setCurrentGoalVtype ] = useState("")
    const [ currentOriginVtype, setCurrentOriginVtype ] = useState("")
    const [bAUVkt, setBAUVkt] = useState({} as {[key: string]: number[]})
    const stepNumber = 4
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
                    let init:InputClimateWithoutUpstreamStep4 = {
                        vtypes: {},
                        note: data.project?.stages?.Climate?.[climateScenarioId]?.steps?.[stepNumber]?.note || undefined
                    }
                    const inventoryStep1 = data.project.stages?.Inventory?.[0]?.steps?.[1].vtypes || {}
                    const vtypes = Object.keys(inventoryStep1)
                    for (let i = 0; i < vtypes.length; i++) {
                        const goalvtype = vtypes[i];
                        const oldValue = data.project.stages.Climate[climateScenarioId]?.steps[stepNumber]?.vtypes[goalvtype]
                        // Use previous value if avaible, unless it was filled with upstream (fuels param is present)
                        if (oldValue && !oldValue.fuels) { 
                            init.vtypes[goalvtype] = oldValue
                        } else {
                            init.vtypes[goalvtype] = {}
                        }
                        for (let j = 0; j < vtypes.length; j++) {
                            const originvtype = vtypes[j];
                            if(!init.vtypes[goalvtype][originvtype]?.value) {
                                init.vtypes[goalvtype][originvtype] = {
                                    source: "",
                                    value: data.project.referenceYears.slice(1).map(() => "0")
                                }
                            }
                        }
                        if(!init.vtypes[goalvtype]["Induced Traffic"]?.value) {
                            init.vtypes[goalvtype]["Induced Traffic"] = {
                                source: "",
                                value: data.project.referenceYears.slice(1).map(() => "0")
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
    const updateInput = (goalvtype: string, originvtype: string, yearIndex: number, value: string) => {
        setInputData((prevInputData) => {
            let tmp = {...prevInputData}
            tmp.vtypes[goalvtype][originvtype].value[yearIndex] = value
            return tmp
        })
        setError("")
    }
    
    const configureSource = (goalvtype: string, originvtype: string) => {
        setCurrentGoalVtype(goalvtype)
        setCurrentOriginVtype(originvtype)
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
            tmp.vtypes[currentGoalVtype][currentOriginVtype].source = source
            return tmp
        })
        setSourceWarning(false)
    }

    const nextTrigger = () => {
        // Error detection
        const goalvtypes = Object.keys(inputData.vtypes)
        let srcMissing = false
        for (let i = 0; i < goalvtypes.length; i++) {
            const goalvtype = goalvtypes[i]
            const originvtypes = Object.keys(inputData.vtypes[goalvtype])
            let totalPerYear : number[] = []
            for (let j = 0; j < originvtypes.length; j++) {
                const originvtype = originvtypes[j]
                if (goalvtype === originvtype) {
                    continue
                }
                let yearlyValues = inputData.vtypes[goalvtype][originvtype].value
                for (let y = 0; y < yearlyValues.length; y++) {
                    const val = yearlyValues[y]
                    // console.log(`${project.referenceYears[y]}, ${goalvtype}, ${originvtype}, val: ${val}`)
                    if (computedASI && computedASI.pkmsEndOfYear[y+1][goalvtype] < 0) {
                        setError(`Error: at least one goal vehicle has a negative pkm at the end of the year (${project.referenceYears[y+1]}, ${goalvtype}). This can be related to an invalid trip distribution at this step, or invalid inputs at the previous steps (Trip length, avoided or added vkt, changes in occupancy rate)`)
                        return
                    }
                    if (!computedASI || computedASI.pkmsAdded?.[y+1]?.[goalvtype] === 0 || isVtypeFreight(goalvtype) !== isVtypeFreight(originvtype)) {
                        // No need to check for errors, no value is expected here.
                        continue
                    }
                    if (inputData.vtypes[goalvtype][originvtype].source === "") {
                        srcMissing = true
                    } 
                    if (val === "") {
                        setError(`Error: at least one part of trips to shift value is not set (${project.referenceYears[y]}, ${goalvtype}, ${originvtype})`)
                        return
                    }
                    if (!totalPerYear[y]) totalPerYear[y] = 0
                    totalPerYear[y] += parseFloat(val)
                }
            }
            for (let y = 0; y < totalPerYear.length; y++) {
                const total = totalPerYear[y]
                if (!computedASI || computedASI.pkmsAdded?.[y+1]?.[goalvtype] <= 0) {
                    // No need to check for errors, no value is expected here.
                    continue
                }
                if (total === 0) {
                    setError(`Error: At least one sum of trips parts is zero (${project.referenceYears[y+1]}, ${goalvtype})`)
                    return
                }
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
        return vehicleStats[vtype].type === "freight"
    }
    const inputClimateWithoutUpstreamStep1 : InputClimateWithoutUpstreamStep1 = project.stages?.Climate[climateScenarioId].steps?.[1]
    const inputClimateWithoutUpstreamStep2 : InputClimateWithoutUpstreamStep2 = project.stages?.Climate[climateScenarioId].steps?.[2]
    const inputClimateWithoutUpstreamStep3 : InputClimateWithoutUpstreamStep3 = project.stages?.Climate[climateScenarioId].steps?.[3]
    const inputInventoryStep8: InputInventoryStep8 = project.stages?.Inventory[0].steps?.[8]
    const inputInventoryStep6: InputInventoryStep6 = project.stages?.Inventory[0].steps?.[6]
    
    let vehicleStats : VehicleStats = {
        "Induced Traffic": {
            network: "road", // does not matter
            occupancy: 0, // does not matter
            triplength: 1, // has to be 1
            type: "private transport" // anything but freight
        }
    }
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
    const computedASI = (project.referenceYears && vehicleStats) ? computeVktAfterASI(project.referenceYears, inputClimateWithoutUpstreamStep1, bAUVkt, inputClimateWithoutUpstreamStep2, inputClimateWithoutUpstreamStep3, vehicleStats, inputData.vtypes) : null
    console.log("computedASI", computedASI)
    return (
        <>
            <ProjectStepContainerWrapper project={project} stage="Climate" currentStep={stepNumber} noteValue={inputData.note} setInputData={setInputData} climateScenarioId={climateScenarioId} isWithoutUpstream={true}>
                <h1>Vehicles swap</h1>
                {error && <Alert variant='danger'>{error}</Alert>}
                {sourceWarning && <Alert variant='warning'>Warning: At least one source is missing. Please add missing sources below or click the Next button again to ignore this warning.</Alert>}
                <DescAndNav 
                    prevNav={{link: '/project/' + project.id + '/Climate/' + climateScenarioId + '/Without/step/' + (stepNumber - 1), content: "<- Prev.", variant: "secondary"}}
                    nextNav={{trigger: nextTrigger, content: "Next ->", variant: "primary"}}
                >
                    <div className="text desc">
                        <p>If one of the two previous parameters (vehicle kilometer or load) is impacted it is mandatory to specify the transport mode that is the source of these new trips in the table.</p>
                        <p>Example: The goal transport modes categories are buses and train. Concerning the extensions of the train planned for 2020 the new users are expected to be for 50% of them previous bus users, 25% car users and 25% motorcycle users. And the users of a new bus line opening in 2025 are expected to be for 50% of them previous car users, 30% NMT users and 20% of trips will be induced.</p>
                        <p>Remark: Only enter the effect for the first year it occurs. The tool automatically takes it into account for subsequent years.</p>
                        <p>You might remember having to fill out the average trip length of each transport mode in the Base Year step. It will now be considered as a “proxy” in the calculation - meaning you use this data to estimate an other data that can’t get. The average trip length of transport modes helps the calculator understanding the weight of each transport modes in modal share</p>
                    </div>
                </DescAndNav>
                <Tabs
                    defaultActiveKey={project.referenceYears?.[1]}
                    className="mb-3"
                    fill
                >
                    {project.referenceYears && project.referenceYears.slice(1).map((y, yearIndex) => (<Tab eventKey={y} title={y} key={yearIndex}>
                        <h3>Passengers</h3>
                        <Table bordered>
                            <thead>
                                <tr>
                                    <th className="item-sm" style={{whiteSpace: "initial"}}><ItemWithOverlay overlayContent="Users shifted to this transport mode, generating additional passenger.kilometers"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Goal vehicle</span></span></ItemWithOverlay></th>
                                    {/* <th className="item-sm" style={{whiteSpace: "initial"}}><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg> Vkt {project.referenceYears[yearIndex]} (Mkm)</th>
                                    <th className="item-sm" style={{whiteSpace: "initial"}}><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg> Vkt {y} (Mkm)</th> */}
                                    <th className="item-sm" style={{whiteSpace: "initial"}}><ItemWithOverlay overlayContent="Passenger.kilometers at the end of previous year"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Pkm {project.referenceYears[yearIndex]} (Mkm)</span></span></ItemWithOverlay></th>
                                    <th className="item-sm" style={{whiteSpace: "initial"}}><ItemWithOverlay overlayContent="Passenger.kilometers at the end of this year"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Pkm {y} (Mkm)</span></span></ItemWithOverlay></th>
                                    <th className="item-sm" style={{whiteSpace: "initial"}}><ItemWithOverlay overlayContent="Additional passenger.kilometers generated by user shift. This can be due to additional vkt or a change in vehicle occupancy"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Added Pkm to distribute (Mpkm)</span></span></ItemWithOverlay></th>
                                    <th className="item-sm" style={{whiteSpace: "initial"}}><ItemWithOverlay overlayContent="Users shifted from this transprt mode"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Origin vehicle</span></span></ItemWithOverlay></th>
                                    <th className="item-sm" style={{whiteSpace: "initial"}}><ItemWithOverlay overlayContent="Reminder of trip length set in inventory, this value is used to convert passager.kilometers to trips"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Inventory trip len (km)</span></span></ItemWithOverlay></th>
                                    <th className="item-sm" style={{whiteSpace: "initial"}}><ItemWithOverlay overlayContent="Source of trip share, click the blue + button to add a source"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Src</span></span></ItemWithOverlay></th>
                                    <th className="item-sm" style={{whiteSpace: "initial"}}><ItemWithOverlay overlayContent="Coefficient of trips that shifted from origin vehicle to goal vehicle. The sum should be 100% per goal vehicle, but the tool deduces missing values."><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Part of trips to shift (%)</span></span></ItemWithOverlay></th>
                                    <th className="item-sm" style={{whiteSpace: "initial"}}><ItemWithOverlay overlayContent={
                                        <div>
                                            Computed pkm shifted from origin vehicle to goal vehicle
                                            <div style={{backgroundColor: "#C5E8F2", padding: "10px", margin: "10px 0px 10px 0px"}}>
                                                <Badge bg="disabled"><span className="item"><span>Added Pkm to distribute (Mpkm)</span></span></Badge> x <Badge bg="disabled"><span className="item"><span>Part of trips to shift (%)</span></span></Badge> x <Badge bg="disabled"><span className="item"><span>Inventory trip len</span></span></Badge> / SUM(<Badge bg="disabled"><span className="item"><span>Inventory Trips lengths (km)</span></span></Badge> x <Badge bg="disabled"><span className="item"><span>Parts of trips to shift (%)</span></span></Badge>)
                                            </div>
                                            Sums are done over goal vehicle
                                        </div>
                                    }><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg> pkm shifted to goal</ItemWithOverlay></th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(inputData.vtypes).filter(vtype => !isVtypeFreight(vtype)).map((goalvtype) => {
                                    const goalvehicle = inputData.vtypes[goalvtype]
                                    return Object.keys(goalvehicle).filter(vtype => vtype !== goalvtype && !isVtypeFreight(vtype)).map((originvtype, index) => {
                                        const originvehicle = goalvehicle[originvtype]
                                        const source = originvehicle.source
                                        const value = originvehicle.value?.[yearIndex] || ""
                                        const invTripLen = vehicleStats[originvtype].triplength
                                        const pkmStartOfYear = Math.round((computedASI && computedASI.pkmsStartOfYear?.[yearIndex+1]?.[goalvtype]) || 0)
                                        const pkmEndOfYear = Math.round((computedASI && computedASI.pkmsEndOfYear?.[yearIndex+1]?.[goalvtype]) || 0)
                                        return (
                                            <tr key={goalvtype + originvtype}>
                                                {index === 0 && <td style={{verticalAlign: "top"}} rowSpan={Object.keys(inputData.vtypes).filter(vtype => !isVtypeFreight(vtype)).length}><Badge bg="disabled"><span className="item"><span>{goalvtype}</span></span></Badge></td>}
                                                {/* {index === 0 && <td style={{verticalAlign: "top"}} rowSpan={Object.keys(inputData.vtypes).filter(vtype => !isVtypeFreight(vtype)).length}>{computedASI && computedASI.baseVkt?.[goalvtype]?.[yearIndex].toFixed(0)}</td>}
                                                {index === 0 && <td style={{verticalAlign: "top"}} rowSpan={Object.keys(inputData.vtypes).filter(vtype => !isVtypeFreight(vtype)).length}>{computedASI && computedASI.baseVkt?.[goalvtype]?.[yearIndex+1].toFixed(0)}</td>} */}
                                                {index === 0 && <td style={{verticalAlign: "top"}} rowSpan={Object.keys(inputData.vtypes).filter(vtype => !isVtypeFreight(vtype)).length} className={pkmStartOfYear < 0 ? "cellError": ""}>{pkmStartOfYear}</td>}
                                                {index === 0 && <td style={{verticalAlign: "top"}} rowSpan={Object.keys(inputData.vtypes).filter(vtype => !isVtypeFreight(vtype)).length} className={pkmEndOfYear < 0 ? "cellError": ""}>{pkmEndOfYear}</td>}
                                                {index === 0 && <td style={{verticalAlign: "top"}} rowSpan={Object.keys(inputData.vtypes).filter(vtype => !isVtypeFreight(vtype)).length}>{computedASI && computedASI.pkmsAdded?.[yearIndex+1]?.[goalvtype]?.toFixed(0)}</td>}
                                                <td>{originvtype === "Induced Traffic" 
                                                    ? <ItemWithOverlay overlayContent="Part of additional trips that were induced. These trips are new, not shifted from another transport type."><Badge bg="disabled"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Induced traffic</span></span></Badge></ItemWithOverlay>
                                                    : <Badge bg="disabled"><span className="item"><span>{originvtype}</span></span></Badge>
                                                }</td>
                                                <td>{invTripLen}</td>
                                                {computedASI && computedASI.pkmsAdded?.[yearIndex+1]?.[goalvtype] > 0 
                                                    ? <td>{source
                                                        ? <ValidSource source={source} onClick={(e:any) => configureSource(goalvtype, originvtype)}/>
                                                        : <Button variant="action" onClick={e => configureSource(goalvtype, originvtype)}><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#plus"}/></svg></span></Button>}</td>
                                                    : <TdDiagonalBar></TdDiagonalBar>
                                                }
                                                {computedASI && computedASI.pkmsAdded?.[yearIndex+1]?.[goalvtype] > 0 
                                                    ? <td>
                                                        <Form.Control value={value} onChange={(e:any) => updateInput(goalvtype, originvtype, yearIndex, e.target.value)}></Form.Control>
                                                    </td>
                                                    : <TdDiagonalBar></TdDiagonalBar>
                                                }
                                                <td>
                                                    {computedASI && computedASI.reductionDistribution?.[yearIndex+1]?.[goalvtype]?.[originvtype].toFixed(0)}
                                                </td>
                                            </tr>
                                        )
                                    })
                                })}
                                
                            </tbody>
                        </Table>
                        <h3>Freight</h3>
                        <Table bordered>
                            <thead>
                                <tr>
                                    <th className="item-sm" style={{whiteSpace: "initial"}}><ItemWithOverlay overlayContent="Users shifted to this transport mode, generating additional tons.kilometers"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Goal vehicle</span></span></ItemWithOverlay></th>
                                    {/* <th className="item-sm" style={{whiteSpace: "initial"}}><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg> Vkt {project.referenceYears[yearIndex]} (Mkm)</th>
                                    <th className="item-sm" style={{whiteSpace: "initial"}}><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg> Vkt {y} (Mkm)</th> */}
                                    <th className="item-sm" style={{whiteSpace: "initial"}}><ItemWithOverlay overlayContent="Tons.kilometers at the end of previous year"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Tkm {project.referenceYears[yearIndex]} (Mkm)</span></span></ItemWithOverlay></th>
                                    <th className="item-sm" style={{whiteSpace: "initial"}}><ItemWithOverlay overlayContent="Tons.kilometers at the end of this year"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Tkm {y} (Mkm)</span></span></ItemWithOverlay></th>
                                    <th className="item-sm" style={{whiteSpace: "initial"}}><ItemWithOverlay overlayContent="Additional Tons.kilometers generated by user shift. This can be due to additional vkt or a change in vehicle load"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Added Tkm to distribute (Mtkm)</span></span></ItemWithOverlay></th>
                                    <th className="item-sm" style={{whiteSpace: "initial"}}><ItemWithOverlay overlayContent="Users shifted from this transprt mode"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Origin vehicle</span></span></ItemWithOverlay></th>
                                    <th className="item-sm" style={{whiteSpace: "initial"}}><ItemWithOverlay overlayContent="Source of tkm share, click the blue + button to add a source"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Src</span></span></ItemWithOverlay></th>
                                    <th className="item-sm" style={{whiteSpace: "initial"}}><ItemWithOverlay overlayContent="Percent of tkm that shifted from origin vehicle to goal vehicle. The sum should be 100% per goal vehicle, but the tool deduces missing values."><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Part of tkm to shift (%)</span></span></ItemWithOverlay></th>
                                    <th className="item-sm" style={{whiteSpace: "initial"}}><ItemWithOverlay overlayContent={
                                        <div>
                                            Computed tkm shifted from origin vehicle to goal vehicle
                                            <div style={{backgroundColor: "#C5E8F2", padding: "10px", margin: "10px 0px 10px 0px"}}>
                                                <Badge bg="disabled"><span className="item"><span>Added Tkm to distribute (Mtkm)</span></span></Badge> x <Badge bg="disabled"><span className="item"><span>Part of tkm to shift (%)</span></span></Badge> / <Badge bg="disabled"><span className="item"><span>SUM of parts of tkm to shift for goal vehicle (%)</span></span></Badge>
                                            </div>
                                        </div>
                                    }><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>tkm shifted to goal</span></span></ItemWithOverlay></th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(inputData.vtypes).filter(vtype => isVtypeFreight(vtype)).map((goalvtype) => {
                                    const goalvehicle = inputData.vtypes[goalvtype]
                                    return Object.keys(inputData.vtypes).filter(vtype => vtype !== goalvtype && isVtypeFreight(vtype)).map((originvtype, index) => {
                                        const originvehicle = goalvehicle[originvtype]
                                        const source = originvehicle.source
                                        const value = originvehicle.value?.[yearIndex] || ""
                                        return (
                                            <tr key={goalvtype + originvtype}>
                                                {index === 0 && <td style={{verticalAlign: "top"}} rowSpan={Object.keys(inputData.vtypes).filter(vtype => isVtypeFreight(vtype)).length -1}><Badge bg="disabled"><span className="item"><span>{goalvtype}</span></span></Badge></td>}
                                                {/* {index === 0 && <td style={{verticalAlign: "top"}} rowSpan={Object.keys(inputData.vtypes).filter(vtype => isVtypeFreight(vtype)).length -1}>{computedASI && computedASI.baseVkt?.[goalvtype]?.[yearIndex].toFixed(0)}</td>}
                                                {index === 0 && <td style={{verticalAlign: "top"}} rowSpan={Object.keys(inputData.vtypes).filter(vtype => isVtypeFreight(vtype)).length -1}>{computedASI && computedASI.baseVkt?.[goalvtype]?.[yearIndex+1].toFixed(0)}</td>} */}
                                                {index === 0 && <td style={{verticalAlign: "top"}} rowSpan={Object.keys(inputData.vtypes).filter(vtype => isVtypeFreight(vtype)).length -1}>{computedASI && computedASI.pkmsStartOfYear?.[yearIndex+1]?.[goalvtype].toFixed(0)}</td>}
                                                {index === 0 && <td style={{verticalAlign: "top"}} rowSpan={Object.keys(inputData.vtypes).filter(vtype => isVtypeFreight(vtype)).length -1}>{computedASI && computedASI.pkmsEndOfYear?.[yearIndex+1]?.[goalvtype].toFixed(0)}</td>}
                                                {index === 0 && <td style={{verticalAlign: "top"}} rowSpan={Object.keys(inputData.vtypes).filter(vtype => isVtypeFreight(vtype)).length -1}>{computedASI && computedASI.pkmsAdded?.[yearIndex+1]?.[goalvtype]?.toFixed(0)}</td>}
                                                <td><Badge bg="disabled"><span className="item"><span>{originvtype}</span></span></Badge></td>
                                                {computedASI && computedASI.pkmsAdded?.[yearIndex+1]?.[goalvtype] > 0 
                                                    ? <td>{source
                                                        ? <ValidSource source={source} onClick={(e:any) => configureSource(goalvtype, originvtype)}/>
                                                        : <Button variant="action" onClick={e => configureSource(goalvtype, originvtype)}><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#plus"}/></svg></span></Button>}</td>
                                                    : <TdDiagonalBar></TdDiagonalBar>
                                                }
                                                {computedASI && computedASI.pkmsAdded?.[yearIndex+1]?.[goalvtype] > 0 
                                                    ? <td>
                                                        <Form.Control value={value} onChange={(e:any) => updateInput(goalvtype, originvtype, yearIndex, e.target.value)}></Form.Control>
                                                    </td>
                                                    : <TdDiagonalBar></TdDiagonalBar>
                                                }
                                                <td>
                                                    {computedASI && computedASI.reductionDistribution?.[yearIndex+1]?.[goalvtype]?.[originvtype].toFixed(0)}
                                                </td>
                                            </tr>
                                        )
                                    })
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
