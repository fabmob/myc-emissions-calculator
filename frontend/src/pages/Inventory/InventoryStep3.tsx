import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useParams, useNavigate } from "react-router-dom"
import {Table, Button, Badge, Form, Alert} from 'react-bootstrap'
import {FuelType, InputInventoryStep3, ProjectType} from '../../frontendTypes'
import ChoiceModal from '../../components/ChoiceModal'

import '../Project.css'
import DescAndNav from '../../components/DescAndNav'
import ValidSource from '../../components/ValidSource'
import ProjectStepContainerWrapper from '../../components/ProjectStepContainerWrapper'
import ItemWithOverlay from '../../components/ItemWithOverlay'

export default function InventoryStep3(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    const params = useParams();
    const [inputData, setInputData ] = useState({vtypes: {}, note: undefined} as InputInventoryStep3)
    const [project, setProject ] = useState({} as ProjectType)
    const projectId = params.projectId
    const [error, setError] = useState("")
    const [sourceWarning, setSourceWarning] = useState(false)
    const [ showSourceModal, setShowSourceModal ] = useState(false)
    const [ currentVtype, setCurrentVtype ] = useState("")
    const [ currentFtype, setCurrentFtype ] = useState("")
    const stepNumber = 3
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
                    let init:InputInventoryStep3 = {
                        vtypes: {}, 
                        note: data.project.stages?.Inventory?.[0]?.steps?.[stepNumber]?.note || undefined
                    }
                    const inventoryStep1 = data.project.stages?.Inventory?.[0]?.steps?.[1].vtypes || {}
                    const vtypes = Object.keys(inventoryStep1)
                    for (let i = 0; i < vtypes.length; i++) {
                        const vtype = vtypes[i];
                        if (data.project.stages['Inventory'][0]?.steps[stepNumber]?.vtypes[vtype]) {
                            init.vtypes[vtype] = data.project.stages['Inventory'][0]?.steps[stepNumber].vtypes[vtype]
                        } else {
                            init.vtypes[vtype] = {
                                fuels: {}
                            }
                        }
                        const ftypes = Object.keys(inventoryStep1[vtype].fuels || {})
                        for (let i = 0; i < ftypes.length; i++) {
                            const ftype = ftypes[i] as FuelType;
                            if (!data.project.stages['Inventory'][0]?.steps[stepNumber]?.vtypes?.[vtype]?.fuels[ftype]) {
                                init.vtypes[vtype].fuels[ftype] = {
                                    cons: ftype === "None" ? "0" : "",
                                    consSource: ""
                                }
                            }
                        }
                    }
                    setInputData(init)
                });
            }
    }, [keycloak, initialized, projectId, navigate])
    const updateInputCons = (vtype: string, ftype: FuelType, cons: string) => {
        setInputData((prevInputData) => {
            let tmp = {...prevInputData}
            tmp.vtypes[vtype].fuels[ftype]!.cons = cons
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
        // Add source to proper input (using currentVtype and currentFtype if any)
        if (currentFtype) {
            const ftype = currentFtype as FuelType
            setInputData((prevInputData) => {
                let tmp = {...prevInputData}
                tmp.vtypes[currentVtype].fuels[ftype]!.consSource = source
                return tmp
            })
        }
        setSourceWarning(false)
    }

    const nextTrigger = () => {
        // Error detection
        const vtypes = Object.keys(inputData.vtypes)
        let srcMissing = false
        for (let i = 0; i < vtypes.length; i++) {
            const vtype = vtypes[i]
            const vehicle = inputData.vtypes[vtype]
            const ftypes = Object.keys(vehicle.fuels).filter(ftype => ftype != "None")
            
            for (let i = 0; i < ftypes.length; i++) {
                const ftype = ftypes[i] as FuelType
                if (!vehicle?.fuels[ftype]?.cons) {
                    return setError("Error: At least one fuel consumption isn't set")
                }
                if (!vehicle?.fuels[ftype]?.consSource) srcMissing = true
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
            body: JSON.stringify({ inputData: inputData })
        };
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/Inventory/0/step/' + stepNumber, requestOptions)
            .then(response => response.json())
            .then(() => navigate('/project/' + projectId + '/Inventory/step/' + (stepNumber + 1)));
    }
    return (
        <>
            <ProjectStepContainerWrapper project={project} stage="Inventory" currentStep={stepNumber} noteValue={inputData.note} setInputData={setInputData}>
                <h1>Fuel consumption factors</h1>
                {error && <Alert variant='danger'>{error}</Alert>}
                {sourceWarning && <Alert variant='warning'>Warning: At least one source is missing. Please add missing sources below or click the Next button again to ignore this warning.</Alert>}
                <DescAndNav 
                    prevNav={{link: '/project/' + project.id + '/Inventory/step/' + (stepNumber - 1), content: "<- Prev.", variant: "secondary"}}
                    nextNav={{trigger: nextTrigger, content: "Next ->", variant: "primary"}}
                >
                    <div className="text desc">
                        <p>
                            Once transport activity i.e. mileage by mode and fuel is known, it needs to be multiplied with adequate fuel consumption factors.
                        </p>
                        <p>
                            Please enter the expected average fuel/energy consumption changes for each vehicle category and per fuel type (average fuel/energy consumption per vehicle per 100 km).
                        </p>
                        <p>
                            If there are no big differences in the fleet compositions across different cities within the country, using national averages for urban fleet composition is a possible approach.
                        </p>
                    </div>
                </DescAndNav>
                <Table bordered>
                    <thead>
                        <tr>
                            <th className="item-sm"><ItemWithOverlay overlayContent="Transport modes, current and expected"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Vehicle</span></span></ItemWithOverlay></th>
                            <th className="item-sm"><ItemWithOverlay overlayContent="Fuels used by the transport mode, current and expected"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Fuels</span></span></ItemWithOverlay></th>
                            <th className="item-sm"><ItemWithOverlay overlayContent="Source of consumption value, click the blue + button to add a source"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Src</span></span></ItemWithOverlay></th>
                            <th className="item-sm"><ItemWithOverlay overlayContent="Fuel consumption. Set to zero for vehicles not used in reference year"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Cons (l-kg-kwh/100km)</span></span></ItemWithOverlay></th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(inputData.vtypes).map((vtype, index) => {
                            const vehicle = inputData.vtypes[vtype]
                            if (!vehicle?.fuels) return <></>
                            const ftypes = Object.keys(vehicle.fuels).filter(ftype => ftype != "None")
                            let fuelJsx = []
                            for (let i = 0; i < ftypes.length; i++) {
                                const ftype = ftypes[i] as FuelType
                                const cons = vehicle.fuels[ftype]?.cons || ''
                                const consSource = vehicle.fuels[ftype]?.consSource
                                fuelJsx.push(<tr key={vtype + ftype}>
                                    {i===0 && <td rowSpan={ftypes.length} style={{verticalAlign: "top"}}><Badge bg="disabled"><span className="item"><span>{vtype}</span></span></Badge></td>}
                                    <td><Badge bg="disabled"><span className="item"><span>{ftype}</span></span></Badge></td>
                                    <td>
                                        {consSource 
                                        ? <ValidSource source={consSource} onClick={(e:any) => configureSource(vtype, ftype)}/>
                                        : <Button variant="action" onClick={e => configureSource(vtype, ftype)}><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#plus"}/></svg></span></Button>}
                                    </td>
                                    <td>
                                        <Form.Control value={cons} onChange={e => updateInputCons(vtype, ftype, e.target.value)}></Form.Control>
                                    </td>
                                </tr>)
                            }
                            return [
                                fuelJsx
                            ]
                        })}
                        
                    </tbody>
                </Table>
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
