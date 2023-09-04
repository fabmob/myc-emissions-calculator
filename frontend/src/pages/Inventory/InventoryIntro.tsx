import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useParams, useNavigate } from "react-router-dom"
import { Table, Container, Row, Col, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { ProjectType} from '../../frontendTypes'

import '../Project.css'
import DescAndNav from '../../components/DescAndNav'
import ItemWithOverlay from '../../components/ItemWithOverlay'
import Footer from "../../components/Footer"


export default function InventoryIntro(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    const [project, setProject ] = useState({} as ProjectType)
    const params = useParams()
    const projectId = params.projectId
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
                });
            }
    }, [keycloak, initialized, projectId, navigate])
    
    return (
        <>
        <section>
        <Container>
            <Row className="justify-content-md-center align-items-center" style={{minHeight: "calc(100vh - 200px)", marginTop: "20px"}}>
                <Col xs lg="8">
                    <h1>Inventory</h1>
                    <DescAndNav 
                        prevNav={{link: '/project/' + project.id + '/edit', content: "Cancel", variant: "link"}}
                        nextNav={{link: '/project/' + project.id + '/Inventory/step/1', content: "Start →", variant: "primary"}}
                    >
                        <div className="text desc">
                            <p>The emission inventory for the transport sector is calculated using the bottom-up approach - based on transport activity. It relies on the ASIF framework, considering Activity, Structure, Intensity and Fuel.</p>
                        </div>
                    </DescAndNav>
                    <div className="illustration">
                        <img src='/pictures/asif-framework-diagram.png' alt="ASIF Framework Diagram" style={{width: '100%'}}></img>
                    </div>
                    <h3>Required for this calculation</h3>
                    <Table>
                        <thead>
                            <tr>
                                <th className="item-sm"><span className="item"><span>Data</span></span></th>
                                <th className="item-sm"><span className="item"><span>Unit</span></span></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <Badge bg="disabled">
                                        <ItemWithOverlay overlayContent="mileage and transport performance for each transport mode">
                                        <span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Transport activity</span></span>
                                        </ItemWithOverlay>
                                    </Badge>
                                </td>
                                <td className="item-sm">vkt: vehicle-kilometre and tkm: ton-kilometre</td>
                            </tr>
                            <tr>
                                <td>
                                    <Badge bg="disabled"><span className="item"><span>Share of the transport activity by vehicle category and fuel type</span></span></Badge>
                                </td>
                                <td className="item-sm">%vkt and %tkm</td>
                            </tr>
                            <tr>
                                <td>
                                    <Badge bg="disabled"><span className="item"><span>Vehicle fuel consumption according to vehicle category and fuel type</span></span></Badge>
                                </td>
                                <td className="item-sm">l-kW-kg/100km</td>
                            </tr>
                            <tr>
                                <td>
                                    <Badge bg="disabled">
                                        <ItemWithOverlay overlayContent="Default values are available in the tool but you can customize them if you have local factors">
                                            <span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Emissions factors per fuel</span></span>
                                        </ItemWithOverlay>
                                    </Badge>
                                </td>
                                <td className="item-sm">kgC02/TJ</td>
                            </tr>
                        </tbody>
                    </Table>
                    <h3>Required for later calculations</h3>
                    <Table>
                        <thead>
                            <tr>
                                <th className="item-sm"><span className="item"><span>Data</span></span></th>
                                <th className="item-sm"><span className="item"><span>Unit</span></span></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <Badge bg="disabled">
                                        <ItemWithOverlay overlayContent="Used to obtain passenger.km (pkm) or ton.km (tkm) data and compare your GHG emissions with your modal share, and it will be used for the Climate Scenario to quantify the “shift measures”">
                                            <span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Occupation rate per transport category</span></span>
                                        </ItemWithOverlay>
                                    </Badge>
                                </td>
                                <td className="item-sm">passengers / load (tons)</td>
                            </tr>
                            <tr>
                                <td>
                                    <Badge bg="disabled">
                                        <ItemWithOverlay overlayContent="Used to calculate GHG emissions through a WTW (well-to-wheel) approach, that considers the CO2 emissions of electricity and hydrogen production">
                                            <span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>CO2 content of electricity and hydrogen production</span></span>
                                        </ItemWithOverlay>
                                    </Badge>
                                </td>
                                <td className="item-sm">gCO2/kWh or gCO2/kg</td>
                            </tr>
                            <tr>
                                <td>
                                    <Badge bg="disabled">
                                        <ItemWithOverlay overlayContent="Used to compare your results with the “top-down” approach">
                                            <span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Energy sales in the territory</span></span>
                                        </ItemWithOverlay>
                                    </Badge>
                                </td>
                                <td className="item-sm">TOE: tons of oil equivalent</td>
                            </tr>
                            <tr>
                                <td>
                                    <Badge bg="disabled">
                                        <ItemWithOverlay overlayContent="It is not useful for the inventory calculation but we encourage you to collect this data during the SUMP/NUMP diagnostic process, as it will be useful for the Climate Scenario">
                                            <span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Trip length per transport category</span></span>
                                        </ItemWithOverlay>
                                    </Badge>
                                </td>
                                <td className="item-sm">km</td>
                            </tr>
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
        </section>
        <section className="footer">
            <Row className="justify-content-md-center">
                <Col lg="8">
                    <Footer />
                </Col>
            </Row>
        </section>
        </>
    )
}
