import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useParams, useNavigate } from "react-router-dom"
import { Table, Container, Row, Col, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { ProjectType} from '../../frontendTypes'

import '../Project.css'
import DescAndNav from '../../components/DescAndNav'


export default function InventoryIntro(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    const [project, setProject ] = useState({} as ProjectType)
    const params = useParams()
    const projectId = params.projectId
    useEffect(() => {
        if (initialized && keycloak.authenticated){
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
                });
            }
    }, [keycloak, initialized, projectId, navigate])
    const vehiclesInUseTooltip = (props:any) => (
        <Tooltip id="button-tooltip" {...props}>
            You can choose the year of reference based on your needs
        </Tooltip>
    )
    const emissionFactorsTooltip = (props:any) => (
        <Tooltip id="button-tooltip" {...props}>
            Default values are available in the tool but you can customize them if you have local factors
        </Tooltip>
    )
    const occupationRateTooltip = (props:any) => (
        <Tooltip id="button-tooltip" {...props}>
            Used to obtain passenger.km (pkm) or ton.km (tkm) data and compare your GHG emissions with your modal share, and it will be used for the Climate Scenario to quantify the “shift measures”
        </Tooltip>
    )
    const productionCO2Tooltip = (props:any) => (
        <Tooltip id="button-tooltip" {...props}>
            Used to calculate GHG emissions through a WTW (well-to-wheel) approach, that considers the CO2 emissions of electricity and hydrogen production
        </Tooltip>
    )
    const energySalesTooltip = (props:any) => (
        <Tooltip id="button-tooltip" {...props}>
            Used to compare your results with the “top-down” approach
        </Tooltip>
    )
    const tripLenTooltip = (props:any) => (
        <Tooltip id="button-tooltip" {...props}>
            It is not useful for the inventory calculation but we encourage you to collect this data during the SUMP/NUMP diagnostic process, as it will be useful for the Climate Scenario
        </Tooltip>
    )
    
    return (
        <Container>
            <Row className="justify-content-md-center align-items-center" style={{minHeight: "calc(100vh - 200px)", marginTop: "20px"}}>
                <Col xs lg="8">
                    <h1>Inventory / Base Year</h1>
                    <DescAndNav 
                        prevNav={{link: '/project/' + project.id + '/edit', content: "cancel", variant: "link"}}
                        nextNav={{link: '/project/' + project.id + '/Inventory/step/1', content: "Start ->", variant: "primary"}}
                    >
                        <p>The emission inventory for the transport sector is calculated using the bottom-up approach - based on transport activity. It relies on the ASIF framework, considering Activity, Structure, Intensity and Fuel.</p>
                    </DescAndNav>
                    <img src='/asif-framework-diagram.png' alt="ASIF Framework Diagram" style={{width: '100%'}}></img>
                    <h3>The calculation of transport related emissions requires information on</h3>
                    <Table>
                        <thead>
                            <tr>
                                <th className="item-sm">Data</th>
                                <th className="item-sm">Unit</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <OverlayTrigger placement="top" delay={{ show: 250, hide: 400 }} overlay={vehiclesInUseTooltip}>
                                        <Badge bg="disabled">🛈 Transport activity - mileage and transport performance for each transport mode</Badge>
                                    </OverlayTrigger>
                                </td>
                                <td className="item">vkt: vehicle-kilometre and tkm: ton-kilometre</td>
                            </tr>
                            <tr>
                                <td>
                                    <OverlayTrigger placement="top" delay={{ show: 250, hide: 400 }} overlay={vehiclesInUseTooltip}>
                                        <Badge bg="disabled">🛈 Share of the transport activity by vehicle category and fuel type</Badge>
                                    </OverlayTrigger>
                                </td>
                                <td className="item">%vkt and %tkm</td>
                            </tr>
                            <tr>
                                <td>
                                    <OverlayTrigger placement="top" delay={{ show: 250, hide: 400 }} overlay={vehiclesInUseTooltip}>
                                        <Badge bg="disabled">🛈 Vehicle fuel consumption according to vehicle category and fuel type</Badge>
                                    </OverlayTrigger>
                                </td>
                                <td className="item">l-kW-kg/100km</td>
                            </tr>
                            <tr>
                                <td>
                                    <OverlayTrigger placement="top" delay={{ show: 250, hide: 400 }} overlay={emissionFactorsTooltip}>
                                        <Badge bg="disabled">🛈 Emissions factors per fuel</Badge>
                                    </OverlayTrigger>
                                </td>
                                <td className="item">gC02/l</td>
                            </tr>
                        </tbody>
                    </Table>
                    <h3>The tool will also offer you to add [optional but recommended]</h3>
                    <Table>
                        <thead>
                            <tr>
                                <th className="item-sm">Data</th>
                                <th className="item-sm">Unit</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <OverlayTrigger placement="top" delay={{ show: 250, hide: 400 }} overlay={occupationRateTooltip}>
                                        <Badge bg="disabled">🛈 Occupation rate per transport category</Badge>
                                    </OverlayTrigger>
                                </td>
                                <td className="item">passengers / load (tons)</td>
                            </tr>
                            <tr>
                                <td>
                                    <OverlayTrigger placement="top" delay={{ show: 250, hide: 400 }} overlay={productionCO2Tooltip}>
                                        <Badge bg="disabled">🛈 CO2 content of electricity and hydrogen production</Badge>
                                    </OverlayTrigger>
                                </td>
                                <td className="item">TODO</td>
                            </tr>
                            <tr>
                                <td>
                                    <OverlayTrigger placement="top" delay={{ show: 250, hide: 400 }} overlay={energySalesTooltip}>
                                        <Badge bg="disabled">🛈 Energy sales in the territory</Badge>
                                    </OverlayTrigger>
                                </td>
                                <td className="item">TOE</td>
                            </tr>
                            <tr>
                                <td>
                                    <OverlayTrigger placement="top" delay={{ show: 250, hide: 400 }} overlay={tripLenTooltip}>
                                        <Badge bg="disabled">🛈 Trip length per transport category</Badge>
                                    </OverlayTrigger>
                                </td>
                                <td className="item">km</td>
                            </tr>
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>

    )
}