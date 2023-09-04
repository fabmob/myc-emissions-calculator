import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useParams, useNavigate } from "react-router-dom"
import {Badge, Button, Dropdown} from 'react-bootstrap'
import {EmissionsResults, InputInventoryStep7, ProjectType} from '../../frontendTypes'

import '../Project.css'
import DescAndNav from '../../components/DescAndNav'
import ProjectStepContainerWrapper from '../../components/ProjectStepContainerWrapper'
import EmissionsTable from '../../components/viz/EmissionsTable'
import EmissionsBarChart from '../../components/viz/EmissionsBarChart'
import EditEmissionFactors from '../../components/EditEmissionFactors'
import ChoiceModal from '../../components/ChoiceModal'
import TTWorWTWSelector from '../../components/TTWorWTWSelector'

export default function ClimateWithUpstreamStep7(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    const params = useParams();
    const [emissionFactorsInputData, setEmissionFactorsInputData] = useState({} as InputInventoryStep7)
    const [project, setProject ] = useState({} as ProjectType)
    const projectId = params.projectId
    const climateScenarioId = parseInt(params.climateScenarioId || "0")
    const [ results, setResults] = useState({} as EmissionsResults)
    const [ ttwOrWtw, setTtwOrWtw ] = useState("TTW" as "TTW" | "WTW")
    const stepNumber = 7
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
                })
                fetchResults()
            }
            if (initialized && !keycloak.authenticated){
                navigate('/')
            }
    }, [keycloak, initialized, projectId, navigate])
    const fetchResults = () => {
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token }
        };
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + "/Climate/" + climateScenarioId + "/Without/results", requestOptions)
            .then(response => {
                return response.json()
            })
            .then(data => {
                console.log("get climate results reply", data)
                setResults(data)
            })
    }
    const nextTrigger = () => {
        // Nothing should have to be saved before moving to next step
        navigate('/project/' + projectId + '/edit')
    }
    const saveSource = (source: string) => {
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
    }
    const saveEmissionFactors = (emissionsInputData: InputInventoryStep7) => {
        // Error detection

        // save data and nav to next step
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
            body: JSON.stringify({ inputData: emissionsInputData})
        };
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/Inventory/0/step/' + stepNumber, requestOptions)
            .then(response => response.json())
            .then(() => {
                // some err handling ?
                fetchResults()
            });
    }
    const emissions = ttwOrWtw === "TTW" ? (results?.emissions?.TTW || {}) : (results?.emissions?.WTW || {})
    return (
        <>
            <ProjectStepContainerWrapper project={project} stage="Climate" currentStep={stepNumber} climateScenarioId={climateScenarioId} isWithoutUpstream={true}>
                <h1>Results</h1>
                <DescAndNav 
                    prevNav={{link: '/project/' + project.id + '/Climate/' + climateScenarioId + '/Without/step/' + (stepNumber - 1), content: "<- Prev.", variant: "secondary"}}
                    nextNav={{trigger: nextTrigger, content: "To the project", variant: "primary"}}
                >
                    <div className="text desc">
                        <p>This page displays a short summary of emissions for this climate scenario. More tables and visualisations are available in the Compare section of the project.</p>    
                    </div>
                </DescAndNav>
                <TTWorWTWSelector ttwOrWtw={ttwOrWtw} setTtwOrWtw={setTtwOrWtw}></TTWorWTWSelector>
                <h3>Emissions</h3>
                <EditEmissionFactors 
                    project={project} 
                    stepNumber={stepNumber} 
                    saveSource={saveSource} 
                    saveEmissionsFactors={saveEmissionFactors}
                    inputData={emissionFactorsInputData}
                    setInputData={setEmissionFactorsInputData}
                ></EditEmissionFactors>

                <EmissionsTable emissionsData={emissions} project={project}></EmissionsTable>

                <>
                    <div className="chart">
                        {/* <div className="chart-header">
                            <h3>Passenger Modal Share</h3>
                            <div className="commands">
                                <!--we should have the download buttons like in the compare tab.-->
                            </div>
                        </div> */}
                        <div className="chart-content">
                            <div>
                                <EmissionsBarChart emissionsData={emissions} project={project}></EmissionsBarChart>
                            </div>
                        </div>
                    </div>
                </>
                
            </ProjectStepContainerWrapper>
        </>
    )
}

