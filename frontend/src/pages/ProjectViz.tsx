import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useParams, useNavigate } from "react-router-dom"
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import {ProjectType} from '../frontendTypes'
import Progress from '../components/Progress'

import './Project.css'

export default function ProjectViz(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    let params = useParams();
    let [project, setProject ] = useState({} as ProjectType)
    let projectId = params.projectId
    useEffect(() => {
        if (initialized && keycloak.authenticated){
            const requestOptions = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token }
            };
            fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + "/viz", requestOptions)
                .then(response => response.json())
                .then(data => {
                    setProject(data.project)
                });
            }
    }, [keycloak, initialized, projectId])
    let dates = [2020, 2025, 2030, 2040, 2050]
    const goPreviousStep = () => {
        navigate('/project/' + projectId + '/step/7')
    }

    let outputModalShare = project?.outputModalShare || {}
    let vtypesmodale = Object.keys(outputModalShare)
    let activeVtypesModale = []
    type DataPartModale = {[key : string]: number} & {name: number}
    let dataPartModale : DataPartModale[] = [
        {name: dates[0]},
        {name: dates[1]},
        {name: dates[2]},
        {name: dates[3]},
        {name: dates[4]}
    ]
    for (let i = 0; i < vtypesmodale.length; i++) {
        let vtype = vtypesmodale[i]
        for (let j = 0; j < 5; j++) {
            if (outputModalShare?.[vtype]?.[j]) {
                dataPartModale[j][vtype] = Math.round((outputModalShare?.[vtype]?.[j] || 0) * 100)
                if (activeVtypesModale.indexOf(vtypesmodale[i]) === -1)
                    activeVtypesModale.push(vtypesmodale[i])
            }
        }
    }

    let vehicleKilometresTravelledComputed = project?.vehicleKilometresTravelledComputed || {}
    let vtypesvkt = Object.keys(vehicleKilometresTravelledComputed)
    let activeVtypesVkt = []
    type DataVkt = {[key: string]: number} & {name: number}
    let dataVkt : DataVkt[] = [
        {name: dates[0]},
        {name: dates[1]},
        {name: dates[2]},
        {name: dates[3]},
        {name: dates[4]}
    ]
    for (let i = 0; i < vtypesvkt.length; i++) {
        let vtype = vtypesvkt[i]
        for (let j = 0; j < 5; j++) {
            if (vehicleKilometresTravelledComputed?.[vtype]?.[j]) {
                dataVkt[j][vtype] = Math.round((vehicleKilometresTravelledComputed?.[vtype]?.[j] || 0))
                if (activeVtypesVkt.indexOf(vtypesvkt[i]) === -1)
                    activeVtypesVkt.push(vtypesvkt[i])
            }
        }
    }

    let activeVtypesEnergy = []
    let outputSumTotalEnergyAndEmissions = project?.outputSumTotalEnergyAndEmissions || {}
    let dataEnergy : any[] = [
        {name: dates[0]},
        {name: dates[1]},
        {name: dates[2]},
        {name: dates[3]},
        {name: dates[4]}
    ]
    for (let i = 0; i < vtypesmodale.length; i++) {
        let vtype = vtypesmodale[i]
        for (let j = 0; j < 5; j++) {
            let val = outputSumTotalEnergyAndEmissions?.[vtype]?.co2?.[j]
            if (val) {
                dataEnergy[j][vtype] = Math.round(val * 1000)
                if (activeVtypesEnergy.indexOf(vtype) === -1)
                    activeVtypesEnergy.push(vtype)
            }
        }
    }

    let colors = ["#e07a5f", "#3d405b", "#81b29a", "#f2cc8f", "#5e548e", "#9f86c0", "#be95c4", "#e0b1cb", "#541690", "#FF4949", "#FF8D29", "#FFCD38", "#2E0249", "#570A57", "#A91079", "#F806CC", "#C4DDFF", "#7FB5FF", "#001D6E", "#FEE2C5"]
    return (
        <Container className="projectStepContainer">
            <Progress project={project} currentStep={8} />
            <Row className="justify-content-md-center align-items-center" style={{minHeight: "calc(100vh - 200px)", marginTop: "20px"}}>
                <Col xs lg="8">
                    <h1>Project overview</h1>
                    <h2 style={{marginTop: "-40px", marginBottom: "40px"}}>{project.name}</h2>
                    <Row className="justify-content-md-center align-items-center" style={{"marginBottom": "40px"}}>
                        <h3>Population evolution</h3>
                        <Col lg="6">
                            <ResponsiveContainer width="90%" height={300}>
                                <BarChart margin={{ left: 20 }} data={(project?.outputSocioEconomicDataComputed?.population || []).map((e,i)=>({name:dates[i], population: Math.round(e)}))}>
                                    <XAxis dataKey="name"  />
                                    <YAxis />
                                      <Tooltip formatter={(value:number) => new Intl.NumberFormat('fr').format(value)}/>
                                      <Legend />
                                    <Bar dataKey="population" fill={colors[4]}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </Col>
                        <Col lg="6">
                            Population evolution is computed using current population and expected annual growth<br/><br/>
                            <div className="inputDesc" onClick={() => navigate('/project/' + projectId + '/step/1')}>Inputs are in the Socio economic data step</div>
                        </Col>
                    </Row>

                    <Row className="justify-content-md-center align-items-center" style={{"marginBottom": "40px"}}>
                        <h3>GDP evolution</h3>
                        <Col lg="6">
                            GDP evolution is computed using current GDP and expected annual growth<br/><br/>
                            <div className="inputDesc" onClick={() => navigate('/project/' + projectId + '/step/1')}>Inputs are in the Socio economic data step</div>
                        </Col>
                        <Col lg="6">
                            <ResponsiveContainer width="90%" height={300}>
                                <BarChart style={{margin: "auto"}} data={(project?.outputSocioEconomicDataComputed?.gdp || []).map((e,i)=>({name:dates[i], gdp: Math.round(e)}))}>
                                    <XAxis dataKey="name"  />
                                    <YAxis />
                                      <Tooltip formatter={(value:number) => new Intl.NumberFormat('fr').format(value)}/>
                                      <Legend />
                                    <Bar dataKey="gdp" fill={colors[5]} unit=' Mrd $'/>
                                </BarChart>
                            </ResponsiveContainer>
                        </Col>
                    </Row>

                    <Row className="justify-content-md-center align-items-center" style={{"marginBottom": "40px"}}>
                        <h3>Vkt</h3>
                        <Col lg="6">
                            <ResponsiveContainer width="90%" height={300}>
                                <BarChart style={{margin: "auto"}} data={dataVkt}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                      <Tooltip formatter={(value:number) => new Intl.NumberFormat('fr').format(value)}/>
                                      <Legend />
                                     {activeVtypesVkt.map((e, i) => (<Bar key={i} dataKey={e} fill={colors[i]} stackId="a" unit=' Mil km'/>))}
                                </BarChart>
                            </ResponsiveContainer>
                        </Col>
                        <Col lg="6">
                            Vehicle Kilometers Traveled evolution is computed using current kilometers traveled per vehicle and expected annual growth<br/><br/>
                            <div className="inputDesc" onClick={() => navigate('/project/' + projectId + '/step/3')}>Inputs are in the Transport activity data step</div>
                        </Col>
                    </Row>

                    <Row className="justify-content-md-center align-items-center" style={{"marginBottom": "40px"}}>
                        <h3>Modal split evolution</h3>
                        <Col lg="6">
                            The modal split helps to visualize which transport the population mostly uses for their travels.<br/><br/>
                            It is computed using total vkt and vehicle occupancy.<br/><br/>
                            <div className="inputDesc" onClick={() => navigate('/project/' + projectId + '/step/3')}>Inputs are in the Transport activity data step</div>
                            <div className="inputDesc" onClick={() => navigate('/project/' + projectId + '/step/4')}>as well as the Vehicle occupancy step</div>
                        </Col>
                        <Col lg="6">
                            <ResponsiveContainer width="90%" height={300}>
                                <BarChart style={{margin: "auto", "marginBottom": "40px"}} data={dataPartModale}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                      <Tooltip formatter={(value:number) => new Intl.NumberFormat('fr').format(value)}/>
                                      <Legend />
                                     {activeVtypesModale.map((e, i) => (<Bar key={i} dataKey={e} fill={colors[i]} stackId="a" unit='%'/>))}
                                </BarChart>
                            </ResponsiveContainer>
                        </Col>
                    </Row>


                    <Row className="justify-content-md-center align-items-center" style={{"marginBottom": "40px"}}>
                        <h3>GHG evolution</h3>
                        <Col lg="6">
                            <ResponsiveContainer width="90%" height={300}>
                                <BarChart style={{margin: "auto"}} data={dataEnergy}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                      <Tooltip formatter={(value:number) => new Intl.NumberFormat('fr').format(value)}/>
                                      <Legend />
                                     {activeVtypesEnergy.map((e, i) => (<Bar key={i} dataKey={e} fill={colors[i]} stackId="a" unit=' tons CHG'/>))}
                                </BarChart>
                            </ResponsiveContainer>
                        </Col>
                        <Col lg="6">
                            Estimated tons of greenhouse gases emissions for upcoming years per vehicle type.<br/><br/>
                            It is computed by multiplying for each fuel: vkt, average consumption and default emission factors.<br/><br/>
                            <div className="inputDescNoLink">Inputs are all the previous steps</div>
                        </Col>
                    </Row>

                    <Button variant="secondary" style={{marginRight: "20px", marginBottom: "300px"}} onClick={goPreviousStep}>
                        Previous
                    </Button>
                </Col>
            </Row>
        </Container>

    )
}
