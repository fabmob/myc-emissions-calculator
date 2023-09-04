import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useParams, useNavigate } from "react-router-dom"
import { Table, Container, Row, Col, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { ProjectType} from '../../frontendTypes'

import '../Project.css'
import DescAndNav from '../../components/DescAndNav'
import ItemWithOverlay from '../../components/ItemWithOverlay'
import Footer from "../../components/Footer"


export default function BAUIntro(){
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
                    <h1>BAU Scenario</h1>
                    <DescAndNav 
                        prevNav={{link: '/project/' + project.id + '/edit', content: "Cancel", variant: "link"}}
                        nextNav={{link: '/project/' + project.id + '/BAU/step/1', content: "Start →", variant: "primary"}}
                    >
                        <div className="text desc">
                            <p>After defining the initial situation in your city/country, it is necessary to project transport emissions into the future on a business-as-usual basis.</p>
                            <p>The intention is to show the difference compared to the situation when a strategy, policy, programme or project were to be introduced. The BAU scenario serves as a reference scenario (baseline emissions), which illustrates the results of current trends often in contrast to alternative scenarios that take into account specific interventions</p>
                            <p>You will need to project evolutions of transport activity on your territory.</p>
                        </div>
                    </DescAndNav>
                    <img src='/pictures/asif-framework-diagram.png' alt="ASIF Framework Diagram" style={{width: '100%'}}></img>
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
                                        <ItemWithOverlay overlayContent="mileage and transport performance for each transport mode per year">
                                            <span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Projected transport activity</span></span>
                                        </ItemWithOverlay>
                                    </Badge>
                                </td>
                                <td className="item-sm">vkt: vehicle-kilometre and tkm: ton-kilometre</td>
                            </tr>
                            <tr>
                                <td>
                                    <Badge bg="disabled"><span className="item"><span>Projected share of the transport activity by vehicle category and fuel type</span></span></Badge>
                                </td>
                                <td className="item-sm">%vkt and %tkm</td>
                            </tr>
                            <tr>
                                <td>
                                    <Badge bg="disabled"><span className="item"><span>Projected vehicle fuel consumption according to vehicle category and fuel type</span></span></Badge>
                                </td>
                                <td className="item-sm">l-kW-kg/100km</td>
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
                                            <span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Projected occupation rate per transport category</span></span>
                                        </ItemWithOverlay>
                                    </Badge>
                                </td>
                                <td className="item-sm">passengers / load (tons)</td>
                            </tr>
                            <tr>
                                <td>
                                    <Badge bg="disabled">
                                        <ItemWithOverlay overlayContent="Used to calculate GHG emissions through a WTW (well-to-wheel) approach, that considers the CO2 emissions of electricity and hydrogen production">
                                            <span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Projected CO2 content of electricity and hydrogen production</span></span>
                                        </ItemWithOverlay>
                                    </Badge>
                                </td>
                                <td className="item-sm">gCO2/kWh or gCO2/kg</td>
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
