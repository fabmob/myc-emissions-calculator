import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useParams, useNavigate } from "react-router-dom"
import { Table, Container, Row, Col, Badge, OverlayTrigger, Tooltip, Modal, Button, Dropdown } from 'react-bootstrap'
import { ProjectType} from '../../frontendTypes'

import '../Project.css'
import DescAndNav from '../../components/DescAndNav'
import ChoiceModal from '../../components/ChoiceModal'
import Footer from "../../components/Footer"


export default function ClimateIntro(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    const [project, setProject ] = useState({} as ProjectType)
    const [showInfo, setShowInfo] = useState(false)
    const handleCloseInfo = () => setShowInfo(false)
    const [method, setMethod] = useState("With upstream calculation" as "With upstream calculation" | "Without upstream calculation")
    const params = useParams()
    const projectId = params.projectId
    const climateScenarioId = params.climateScenarioId
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
                    if (climateScenarioId !== undefined) {
                        const _method : string = data.project?.stages?.Climate?.[parseInt(climateScenarioId)]?.steps?.[0]?.method
                        console.log(_method)
                        if (_method) {
                            if (_method === "With") {
                                setMethod("With upstream calculation")
                            } else {
                                setMethod("Without upstream calculation")
                            }
                        }
                    }
                });
            }
    }, [keycloak, initialized, projectId, climateScenarioId, navigate])
    const nextTrigger = () => {
        // Error detection

        // save data and nav to next step
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
            body: JSON.stringify({ inputData: {method: method.split(" ")[0]}})
        };
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/Climate/' + climateScenarioId + '/step/0', requestOptions)
            .then(response => response.json())
            .then(() => navigate('/project/' + project.id + '/Climate/' + climateScenarioId + '/' + method.split(" ")[0] + '/step/1'));
    }
    const MethodSelector = () => {
        return (
            <div style={{display: "flex", marginBottom: "10px"}}>
                <Dropdown onSelect={(key:any) => method === "With upstream calculation" ? setMethod("Without upstream calculation") : setMethod("With upstream calculation")}>
                    <Dropdown.Toggle as={Badge} bg="info" style={{margin: "0 10px 0 10px"}}>
                        {method === "With upstream calculation" ? "With upstream calculation" : "Without upstream calculation"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu style={{padding: "10px"}}>
                        <Dropdown.Item as={Badge} bg="info">
                            {method === "Without upstream calculation" ? "With upstream calculation" : "Without upstream calculation"}
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        )
    }
    return (
        <>
        <section>
        <Container>
            <Row className="justify-content-md-center align-items-center" style={{minHeight: "calc(100vh - 200px)", marginTop: "20px"}}>
                <Col xs lg="8">
                    <h1>Climate Scenario</h1>
                    <DescAndNav 
                        prevNav={{link: '/project/' + project.id + '/edit', content: "Cancel", variant: "link"}}
                        nextNav={{trigger: nextTrigger, content: "Start ->", variant: "primary"}}
                    >
                        <div className="text desc">
                            <p>This step enables calculating a climate scenario, based on mitigations actions. Calculating the impact of NUMP/SUMP measures in the MYC Calculator requires bundling measures based on the ASI : Avoid-Shift-Improve.</p>
                            <p>In order to derive transport demand data for the calculations two different data input approaches are possible : <Button variant="link" onClick={e => setShowInfo(true)} style={{padding: "0"}}><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>with upstream calculations or without</span></span></Button>. This will depend on if you count with a transport model. In order to avoid wrong results please choose and apply just one approach.</p>
                        </div>
                    </DescAndNav>
                    <div className="illustration">
                        <img src='/pictures/asi-approach-diagram.png' alt="Avoid-Shift-Improve Approach (Transport NAMA Handbook, GIZ, 2015 based on Dalkmann and Brannigan 2007)" style={{width: '100%'}}></img>
                    </div>
                    <h3>Calculation method</h3>
                    <div style={{display: "flex", marginBottom: "20px", padding: "5px"}}>
                        <div className="item">Method</div>
                        <MethodSelector></MethodSelector>
                    </div>
                    {/* <h3>{method}, the calculation of transport related emissions requires information on</h3> */}
                    <h3>Required for this calculation</h3>
                    <Table>
                        <thead>
                            <tr>
                                <th className="item-sm"><span className="item"><span>Data</span></span></th>
                                <th className="item-sm"><span className="item"><span>Unit</span></span></th>
                            </tr>
                        </thead>
                        {method === "With upstream calculation" 
                        ? <tbody>
                            <tr>
                                <td>
                                    <Badge bg="disabled"><span className="item"><span>Projected transport activity - mileage for each transport mode per year</span></span></Badge>
                                </td>
                                <td className="item-sm">vkt: vehicle-kilometre</td>
                            </tr>
                            <tr>
                                <td>
                                    <Badge bg="disabled"><span className="item"><span>Projected transport performance for each transport mode per year</span></span></Badge>
                                </td>
                                <td className="item-sm">pkm: passenger-km or tkm: tons-km</td>
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
                        : <tbody>
                            <tr>
                                <td>
                                    <Badge bg="disabled"><span className="item"><span>Projected avoided transport activity</span></span></Badge>
                                </td>
                                <td className="item-sm">vkt: vehicle-kilometre</td>
                            </tr>
                            <tr>
                                <td>
                                    <Badge bg="disabled"><span className="item"><span>Projected added transport activity</span></span></Badge>
                                </td>
                                <td className="item-sm">vkt: vehicle-kilometre</td>
                            </tr>
                            <tr>
                                <td>
                                    <Badge bg="disabled"><span className="item"><span>Projected vehicle load</span></span></Badge>
                                </td>
                                <td className="item-sm">passengers or tons</td>
                            </tr>
                            <tr>
                                <td>
                                    <Badge bg="disabled"><span className="item"><span>Projected vehicle shift - orgin of shifted trips</span></span></Badge>
                                </td>
                                <td className="item-sm">% of trips</td>
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
                        }
                    </Table>
                </Col>
            </Row>
        </Container>
        <Modal size="lg" centered show={showInfo} onHide={handleCloseInfo}>
            <Modal.Header closeButton>
                <Modal.Title>With or without upstream calculation</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>The first approach “WITH UPSTREAM CALCULATIONS - INPUT FROM EXTERNAL TRANSPORT PLANNING TOOL” the user can directly enter transport performance (pkm/tkm) and the vehicle kilometers travelled (vkt) provided by an external transport planning tool.</p>
                <p>If no data from a transport planning tool are available, the second approach “WITHOUT UPSTREAM CALCULATIONS - CALCULATIONS WITHIN THIS TOOL” can be applied. For calculating potential GHG savings from mitigation measures within this approach the “ASI” (Avoid/Shift/Improve) approach is applied. Users have to estimate the effect of transport related actions on the transport demand for each mitigation action type (Avoid, Shift or Improve). E.g. Parking area management may lead to 5% avoided passenger car vehicle kilometers travelled (vkt).</p>
                <ul>
                    <li>Avoid: Avoided vehicle kilometers travelled (vkt)</li>
                    <li>Shift: Shift of transport from the current to another transport modes</li>
                </ul>
                <p>Once the transport demand is defined through the two approaches mentioned above the user has to enter data for the two last steps concerning energy type and energy consumption:</p>
                <ul>
                    <li>3) Improve: Penetration of alternative energies</li>
                    <li>4) Improve: Adjustment of fuel/energy consumption</li>
                </ul>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseInfo}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
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
