import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useParams, useNavigate } from "react-router-dom"
import {Table, Button, Badge, Form} from 'react-bootstrap'
import {InputInventoryStep6, ProjectType} from '../../frontendTypes'
import ChoiceModal from '../../components/ChoiceModal'

import '../Project.css'
import DescAndNav from '../../components/DescAndNav'
import ValidSource from '../../components/ValidSource'
import ProjectStepContainerWrapper from '../../components/ProjectStepContainerWrapper'
import ItemWithOverlay from '../../components/ItemWithOverlay'

export default function InventoryStep6(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    const params = useParams();
    const [inputData, setInputData ] = useState({} as InputInventoryStep6)
    const [project, setProject ] = useState({} as ProjectType)
    const projectId = params.projectId
    const [ showSourceModal, setShowSourceModal ] = useState(false)
    const [ currentVType, setCurrentVType ] = useState("")
    const stepNumber = 6
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
                    let init:InputInventoryStep6 = {vtypes: {}, note: data.project.stages?.Inventory?.[0]?.steps?.[stepNumber]?.note || undefined}
                    const inventoryStep1 = data.project.stages?.Inventory?.[0]?.steps?.[1].vtypes || {}
                    const vtypes = Object.keys(inventoryStep1)
                    for (let i = 0; i < vtypes.length; i++) {
                        const vtype = vtypes[i];
                        if (data.project.stages['Inventory'][0]?.steps[stepNumber]?.vtypes[vtype]) {
                            init.vtypes[vtype] = data.project.stages['Inventory'][0]?.steps[stepNumber].vtypes[vtype]
                        } else {
                            init.vtypes[vtype] = {
                                source: '',
                                value: ''
                            }
                        }
                    }
                    setInputData(init)
                })
            }
            if (initialized && !keycloak.authenticated){
                navigate('/')
            }
    }, [keycloak, initialized, projectId, navigate])
    const updateInput = (vtype: string, value: string) => {
        setInputData((prevInputData) => {
            let tmp = {...prevInputData}
            tmp.vtypes[vtype].value = value
            return tmp
        })
    }
    const configureSource = (vtype: string) => {
        setCurrentVType(vtype)
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
        // Add source to proper input
        setInputData((prevInputData) => {
            let tmp = {...prevInputData}
            tmp.vtypes[currentVType].source = source
            return tmp
        })
    }

    const nextTrigger = () => {
        // Error detection

        // save data and nav to next step
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
            body: JSON.stringify({ inputData: inputData})
        };
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/Inventory/0/step/' + stepNumber, requestOptions)
            .then(response => response.json())
            .then(() => navigate('/project/' + projectId + '/Inventory/step/' + (stepNumber + 1)));
    }
    return (
        <>
            <ProjectStepContainerWrapper project={project} stage="Inventory" currentStep={stepNumber} noteValue={inputData.note} setInputData={setInputData}>
                <h1>Vehicles load</h1>
                <DescAndNav 
                    prevNav={{link: '/project/' + project.id + '/Inventory/step/' + (stepNumber - 1), content: "<- Prev.", variant: "secondary"}}
                    nextNav={{trigger: nextTrigger, content: "Next ->", variant: "primary"}}
                >
                    <div className="text desc">
                        <p>
                            The vehicles load isn’t involved in the GHG emissions calculation but is useful to obtain passenger.km out of vehicle.km. It will allow you to compare your GHG emissions with the modal share in your territory on that step of the calculation process. That way you can understand how much GHG emissions represents one transport mode, but also how many passengers or tons it actually represents. It will be used in the Climate Scenario as well.
                        </p>
                        <p>
                            Conventionally drivers of public transport are not included as there are not passengers (incl. taxi), but for private transport drivers should be included if they travel for their own sake.
                        </p>
                        <p>
                            Local city data can be used if available and robust. Otherwise for cities it is recommended to use national data and for countries to use regional specific data.
                        </p>
                    </div>
                </DescAndNav>
                <Table bordered>
                    <thead>
                        <tr>
                            <th className="item-sm"><ItemWithOverlay overlayContent="Transport modes, current and expected"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Vehicle</span></span></ItemWithOverlay></th>
                            <th className="item-sm"><ItemWithOverlay overlayContent="Source of load value, click the blue + button to add a source"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Src</span></span></ItemWithOverlay></th>
                            <th className="item-sm"><ItemWithOverlay overlayContent="Occupancy for passenger vehicles (average number of passengers per vehicle) or load for freight vehicles (average load per vehicle in tons)"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Load (pass. or tons per vehicle)</span></span></ItemWithOverlay></th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(inputData?.vtypes || {}).map((vtype, index) => {
                            const vehicle = inputData.vtypes[vtype]
                            
                            return (<tr key={index}>
                                <td><Badge bg="disabled"><span className="item"><span>{vtype}</span></span></Badge></td>
                                <td>
                                    {vehicle.source 
                                    ? <ValidSource source={vehicle.source} onClick={(e:any) => configureSource(vtype)}/>
                                    : <Button variant="action" onClick={e => configureSource(vtype)}><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#plus"}/></svg></span></Button>}
                                </td>
                                <td>
                                    <Form.Control value={vehicle.value} onChange={e => updateInput(vtype, e.target.value)}></Form.Control>
                                </td>
                            </tr>)
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
