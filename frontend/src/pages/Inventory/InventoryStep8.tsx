import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useParams, useNavigate } from "react-router-dom"
import {Table, Button, Badge, Form} from 'react-bootstrap'
import {FuelType, InputInventoryStep8, ProjectType} from '../../frontendTypes'
import ChoiceModal from '../../components/ChoiceModal'

import '../Project.css'
import DescAndNav from '../../components/DescAndNav'
import ValidSource from '../../components/ValidSource'
import ProjectStepContainerWrapper from '../../components/ProjectStepContainerWrapper'
import ItemWithOverlay from '../../components/ItemWithOverlay'

export default function InventoryStep8(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    const params = useParams();
    const [inputData, setInputData ] = useState({vtypes: {}, note: undefined} as InputInventoryStep8)
    const [project, setProject ] = useState({} as ProjectType)
    const projectId = params.projectId
    const [ showSourceModal, setShowSourceModal ] = useState(false)
    const [ currentVtype, setCurrentVtype ] = useState("")
    const stepNumber = 8
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
                    let init:InputInventoryStep8 = {
                        vtypes: {}, 
                        note: data.project.stages?.Inventory?.[0]?.steps?.[stepNumber]?.note || undefined
                    }
                    const inventoryStep1 = data.project.stages?.Inventory?.[0]?.steps?.[1].vtypes || {}
                    const vtypes = Object.keys(inventoryStep1)
                    for (let i = 0; i < vtypes.length; i++) {
                        const vtype = vtypes[i];
                        if (inventoryStep1[vtype].type !== "freight") {
                            // We only care about passenger transport here
                            if (data.project.stages['Inventory'][0]?.steps[stepNumber]?.vtypes[vtype]) {
                                init.vtypes[vtype] = data.project.stages['Inventory'][0]?.steps[stepNumber].vtypes[vtype]
                            } else {
                                init.vtypes[vtype] = {source: "", value: ""}
                            }
                        }
                        // Should I handle the case where a transport was saved and later changed to freight transport ?
                    }
                    setInputData(init)
                });
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
    }

    const nextTrigger = () => {
        // Error detection

        // save data and nav to next step
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
            body: JSON.stringify({ inputData: inputData })
        };
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/Inventory/0/step/' + stepNumber, requestOptions)
            .then(response => response.json())
            .then(() => navigate('/project/' + projectId + '/edit'))
    }
    return (
        <>
            <ProjectStepContainerWrapper project={project} stage="Inventory" currentStep={stepNumber} noteValue={inputData.note} setInputData={setInputData}>
                <h1>Vehicle trip length</h1>
                <DescAndNav 
                    prevNav={{link: '/project/' + project.id + '/Inventory/step/' + (stepNumber - 1), content: "<- Prev.", variant: "secondary"}}
                    nextNav={{trigger: nextTrigger, content: "To the project", variant: "primary"}}
                >
                    <div className="text desc">
                        <p>
                        The average trip length isn’t involved in GHG emissions for the base year. 
                        It is used to weight the modal shift effect of public transport in the Climate Scenario and it will then be considered constant
                        during the whole MobiliseYourCity emissions calculation process. Go to modal shift in the Climate Scenario to learn more about it.
                        </p>
                        <p>
                            It is asked to fill it here because the data should be collected during the diagnostic process of collecting data.
                        </p>
                    </div>
                </DescAndNav>
                <Table bordered>
                    <thead>
                        <tr>
                            <th className="item-sm"><ItemWithOverlay overlayContent="Passenger transport modes, current and expected"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Passenger transport</span></span></ItemWithOverlay></th>
                            <th className="item-sm"><ItemWithOverlay overlayContent="Source of average trip length, click the blue + button to add a source"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Src</span></span></ItemWithOverlay></th>
                            <th className="item-sm"><span className="item"><span>Average trip length (km)</span></span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(inputData.vtypes).map((vtype, index) => {
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
