import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useParams, useNavigate } from "react-router-dom"
import {Table, Button, Badge} from 'react-bootstrap'
import {InputInventoryStep1, InputInventoryStep7, FuelType, ProjectType, TotalEnergyAndEmissions, ModalShare, EmissionParams} from '../../frontendTypes'

import '../Project.css'
import DescAndNav from '../../components/DescAndNav'
import ProjectStepContainerWrapper from '../../components/ProjectStepContainerWrapper'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import EditEmissionFactors from '../../components/EditEmissionFactors'
import TdDiagonalBar from '../../components/TdDiagonalBar'
import TTWorWTWSelector from '../../components/TTWorWTWSelector'
import ItemWithOverlay from '../../components/ItemWithOverlay'

export default function InventoryStep7(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    const params = useParams();
    const [project, setProject ] = useState({} as ProjectType)
    const [emissionFactorsInputData, setEmissionFactorsInputData] = useState({} as InputInventoryStep7)
    const projectId = params.projectId
    const [ totalEnergyAndEmissions, setTotalEnergyAndEmissions] = useState({TTW: {} as TotalEnergyAndEmissions, WTW:  {} as TotalEnergyAndEmissions})
    const [ emissionFactorsWTWComputedForElectric, setEmissionFactorsWTWComputedForElectric] = useState({ElectricRail: {} as EmissionParams, ElectricRoad: {} as EmissionParams})
    const [ modalShare, setModalShare] = useState({
        passengers: {} as ModalShare,
        freight: {} as ModalShare
    })
    const [ ttwOrWtw, setTtwOrWtw ] = useState("TTW" as "TTW" | "WTW")
    const defaultColors = ["#2CB1D5", "#A2217C", "#808080", "#67CAE4", "#CE8DBB", "#B3B3B3", "#C5E8F2", "#EBD1E1", "#E6E6E6"]
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
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + "/Inventory/0/results", requestOptions)
            .then(response => {
                return response.json()
            })
            .then(data => {
                console.log("get inv results reply", data)
                setTotalEnergyAndEmissions({
                    WTW: data.totalEnergyAndEmissionsWTW,
                    TTW: data.totalEnergyAndEmissionsTTW
                })
                setEmissionFactorsWTWComputedForElectric(data.emissionFactorsWTWComputedForElectric)
                setModalShare(data.modalShare)
            })
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
    const nextTrigger = () => {
        // Nothing should have to be saved before moving to next step
        navigate('/project/' + projectId + '/Inventory/step/' + (stepNumber + 1))
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
    const emissionsPieData: {name: string, value: number}[] = [].concat.apply([], Object.keys(totalEnergyAndEmissions[ttwOrWtw]).map((vtype, index) => {
        let res = []
        const fuels = totalEnergyAndEmissions[ttwOrWtw][vtype]
        const ftypes = Object.keys(fuels)
        for (let i = 0; i < ftypes.length; i++) {
            const ftype = ftypes[i] as FuelType
            const co2 = fuels[ftype]?.co2[0]
            if (co2)
                res.push({name: vtype + ", " + ftype, value: co2})
        }
        return res
    })as any[])
    return (
        <>
            <ProjectStepContainerWrapper project={project} stage="Inventory" currentStep={stepNumber}>
                <h1>Results</h1>
                <DescAndNav 
                    prevNav={{link: '/project/' + project.id + '/Inventory/step/' + (stepNumber - 1), content: "<- Prev.", variant: "secondary"}}
                    nextNav={{trigger: nextTrigger, content: "Next ->", variant: "primary"}}
                >
                    <div className="text desc">
                        <p>This page displays a short summary of emissions for the reference year. More tables and visualisations are available in the Compare section of the project.</p>
                    </div>
                </DescAndNav>
                <TTWorWTWSelector ttwOrWtw={ttwOrWtw} setTtwOrWtw={setTtwOrWtw}></TTWorWTWSelector>
                <h3>GHG emissions</h3>
                <Table bordered>
                    <thead>
                        <tr>
                            <th className="item-sm"><ItemWithOverlay overlayContent="Transport modes, current and expected"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Vehicle</span></span></ItemWithOverlay></th>
                            <th className="item-sm"><ItemWithOverlay overlayContent="Fuels used by the transport mode, current and expected"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Fuels</span></span></ItemWithOverlay></th>
                            <th className="item-sm"><ItemWithOverlay overlayContent="Emission factors per fuel. This values can be edited using the Edit GHG emission factors link below the pie chart."><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Emission Factor (kg/TJ) ({ttwOrWtw})</span></span></ItemWithOverlay></th>
                            <th className="item-sm">
                                <ItemWithOverlay overlayContent={
                                    <div>
                                        Emissions (1000 tons of greenhouse gases) computed by the tool, using previous steps inputs. Values for each transport mode and fuel are computed as
                                        <div style={{backgroundColor: "#C5E8F2", padding: "10px", margin: "10px 0px 10px 0px"}}>
                                        <Badge bg="disabled"><span className="item"><span>Fuel lower heating value (TJ/1000t)</span></span></Badge> / 10^6 x <Badge bg="disabled"><span className="item"><span>Fuel density (kg/kg or kg/l)</span></span></Badge> x <Badge bg="disabled"><span className="item"><span>Input VKT per fuel (Mkm)</span></span></Badge> x 10^6 x <Badge bg="disabled"><span className="item"><span>Fuel consumption factor (l-kg-kwh/100km)</span></span></Badge> / 100 x <Badge bg="disabled"><span className="item"><span>Fuel emission factor (kg/TJ)</span></span></Badge> / 10^6
                                        </div>
                                        Lower heating value, fuel density and fuel emission factors use default values that can be edited using the Edit GHG emission factors link below the pie chart.
                                    </div>
                                }>
                                    <span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>GHG emissions (1000t GHG) ({ttwOrWtw})</span></span>
                                </ItemWithOverlay>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(totalEnergyAndEmissions[ttwOrWtw]).map((vtype, index) => {
                            const fuels = totalEnergyAndEmissions[ttwOrWtw][vtype]
                            const ftypes = Object.keys(fuels)
                            let fuelJsx = []
                            for (let i = 0; i < ftypes.length; i++) {
                                const ftype = ftypes[i] as FuelType
                                const co2 = fuels[ftype]?.co2 || ''
                                let ges = emissionFactorsInputData.emissionFactors[ttwOrWtw][ftype].ges
                                fuelJsx.push(<tr key={vtype + ftype}>
                                    {i===0 && <td rowSpan={ftypes.length} style={{verticalAlign: "top"}}><Badge bg="disabled"><span className="item"><span>{vtype}</span></span></Badge></td>}
                                    <td><Badge bg="disabled"><span className="item"><span>{ftype}</span></span></Badge></td>
                                    {ftype !== "Electric" && ftype !== "Hydrogen" 
                                        ? <td>{ges}</td>
                                        : <TdDiagonalBar></TdDiagonalBar>
                                    }
                                    <td>{co2}</td>
                                </tr>)
                            }
                            return [
                                fuelJsx
                            ]
                        })}
                    </tbody>
                </Table>
                <>
                    <div className="chart">
                        {/* <div className="chart-header">
                            <!--we should have the download buttons like in the compare tab.-->
                        </div> */}
                        <div className="chart-content">
                            <div>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart width={400} height={300}>
                                        <Pie
                                            dataKey="value"
                                            data={emissionsPieData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            // label={(entry) => entry.name + ": " + Math.round(entry.value) + " 1000t GHG"}
                                        >
                                            {emissionsPieData.map((entry, index) => (<Cell key={index} fill={defaultColors[index]}></Cell>))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
                <EditEmissionFactors 
                    project={project} 
                    stepNumber={stepNumber} 
                    saveSource={saveSource} 
                    saveEmissionsFactors={saveEmissionFactors}
                    inputData={emissionFactorsInputData}
                    setInputData={setEmissionFactorsInputData}
                ></EditEmissionFactors>

                <div className="chart">
                    <div className="chart-header">
                        <h3>Passenger Modal Share</h3>
                        <div className="commands">
                            {/* <!--we should have the download buttons like in the compare tab.--> */}
                        </div>
                    </div>
                    <div className="chart-content">
                        <div>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart width={400} height={300}>
                                    <Pie
                                        dataKey="value"
                                        isAnimationActive={false}
                                        data={Object.keys(modalShare.passengers || {}).map((vtype, index) => ({name: vtype, value: Math.round(modalShare.passengers[vtype][0] * 100)}))}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        // label={(entry) => entry.name + ": " + entry.value + "%"}
                                    >
                                        {Object.keys(modalShare.passengers || {}).map((vtype, index) => (<Cell key={index} fill={defaultColors[index]}></Cell>))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="chart">
                    <div className="chart-header">
                        <h3>Freight Modal Share</h3>
                        <div className="commands">
                            {/* <!--we should have the download buttons like in the compare tab.--> */}
                        </div>
                    </div>
                    <div className="chart-content">
                        <div>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart width={400} height={300}>
                                    <Pie
                                        dataKey="value"
                                        isAnimationActive={false}
                                        data={Object.keys(modalShare.freight || {}).map((vtype, index) => ({name: vtype, value: Math.round(modalShare.freight[vtype][0] * 100)}))}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        // label={(entry) => entry.name + ": " + entry.value + "%"}
                                    >
                                        {Object.keys(modalShare.freight || {}).map((vtype, index) => (<Cell key={index} fill={defaultColors[index]}></Cell>))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

            </ProjectStepContainerWrapper>
            
            
        </>
    )
}
