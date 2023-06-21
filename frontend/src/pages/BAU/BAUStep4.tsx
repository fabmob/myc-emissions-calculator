import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useParams, useNavigate } from "react-router-dom"
import {Table, Button, Badge, Form, Tabs, Tab} from 'react-bootstrap'
import {InputBAUStep4, ProjectType} from '../../frontendTypes'
import ChoiceModal from '../../components/ChoiceModal'

import '../Project.css'
import DescAndNav from '../../components/DescAndNav'
import ValidSource from '../../components/ValidSource'
import ProjectStepContainerWrapper from '../../components/ProjectStepContainerWrapper'

export default function BAUStep4(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    const params = useParams();
    const [inputData, setInputData ] = useState({road: {value: [], source: ''}, rail: {value: [], source: ''}, note: undefined} as InputBAUStep4)
    const [project, setProject ] = useState({} as ProjectType)
    const projectId = params.projectId
    const [ showSourceModal, setShowSourceModal ] = useState(false)
    const [ currentNetwork, setCurrentNetwork ] = useState("" as "road" | "rail")
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
                    if (data.project.stages['BAU'][0]?.steps[stepNumber]) {
                        setInputData(data.project.stages['BAU'][0]?.steps[stepNumber])
                    } else {
                        let init: InputBAUStep4 = {road: {value: [], source: ''}, rail: {value: [], source: ''}, note: undefined}
                        init.road.value = data.project.referenceYears.slice(1).map(() => data.project.stages.Inventory[0].steps[4].road.value || 0)
                        init.rail.value = data.project.referenceYears.slice(1).map(() => data.project.stages.Inventory[0].steps[4].rail.value || 0)
                        setInputData(init)
                    }
                });
            }
    }, [keycloak, initialized, projectId, navigate])
    const updateInput = (network: "road" | "rail", yearIndex: number, value: string) => {
        setInputData((prevInputData) => {
            let tmp = {...prevInputData}
            tmp[network].value[yearIndex] = value
            return tmp
        })
    }
    const configureSource = (network: "road" | "rail") => {
        setCurrentNetwork(network)
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
            tmp[currentNetwork].source = source
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
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/BAU/0/step/' + stepNumber, requestOptions)
            .then(response => response.json())
            .then(() => navigate('/project/' + projectId + '/BAU/step/' + (stepNumber + 1)));
    }
    return (
        <>
            <ProjectStepContainerWrapper project={project} stage="BAU" currentStep={stepNumber} noteValue={inputData.note} setInputData={setInputData}>
                <h1>Consumption of electricity</h1>
                <DescAndNav 
                    prevNav={{link: '/project/' + project.id + '/BAU/step/' + (stepNumber - 1), content: "<- Prev", variant: "secondary"}}
                    nextNav={{trigger: nextTrigger, content: "Next ->", variant: "primary"}}
                >
                     <p>
                        In MobiliseYourCity methodology, transport related GHG emissions can integrate or not the CO2 content of the production of electricity (based on national/local energy mix).
                    </p>
                </DescAndNav>
                <p>
                    If you have this information, it will allow you to choose later between a TTW and a WTW approach for emissions calculation.
                </p>
                <p>
                    Please enter the CO2 content of electricity production.
                </p>
                <Tabs
                    defaultActiveKey={project.referenceYears?.[1]}
                    className="mb-3"
                    fill
                >
                    {project.referenceYears && project.referenceYears.slice(1).map((y, yearIndex) => (<Tab eventKey={y} title={y} key={yearIndex}>
                        <Table bordered>
                            <thead>
                                <tr>
                                    <th className="item-sm">🛈 Network</th>
                                    <th className="item-sm">Src</th>
                                    <th className="item-sm">🛈 Inv. Emissions</th>
                                    <th className="item-sm">🛈 Emissions (gCO2/kWh)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {["road", "rail"].map((networkString) => {
                                    const network = networkString as "road" | "rail"
                                    const source = inputData[network].source
                                    const value = inputData[network].value[yearIndex]
                                    const inventoryValue = project.stages.Inventory[0].steps[4][network].value
                                    return (<tr key={network}>
                                    <td><Badge bg="disabled" style={{textTransform: "capitalize"}}>{network} (electric)</Badge></td>
                                    <td>
                                        {source
                                        ? <ValidSource source={source} onClick={(e:any) => configureSource(network)}/>
                                        : <Button variant="action" onClick={e => configureSource(network)}>+</Button>}
                                    </td>
                                    <td>
                                        {inventoryValue}
                                    </td>
                                    <td>
                                        <Form.Control value={value} onChange={e => updateInput(network, yearIndex, e.target.value)}></Form.Control>
                                    </td>
                                </tr>)})}
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
