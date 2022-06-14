import React, {useState} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useNavigate } from 'react-router-dom'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Stack from 'react-bootstrap/Stack'
import Modal from 'react-bootstrap/Modal'

export default function WelcomePage(){
    const { keycloak, initialized } = useKeycloak()
    const navigate = useNavigate()
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    return (
        <>
            <Container>
                <Row className="justify-content-md-center align-items-center" style={{height: "calc(100vh - 200px)"}}>
                    <Col xs lg="8">
                        <h1 style={{marginBottom: "40px"}}>Calculate and monitor transport related GHG emissions with MobiliseYourCity</h1>
                        <h2><a href='#' onClick={handleShow}>Learn more about the purpose of this tool 🛈</a></h2>
                        <Stack gap={2} className="col-md-5 mx-auto">
                            {keycloak.authenticated ?
                            <Button variant="primary" onClick={() => navigate('/getStarted')}>Get Started</Button>
                            : <Button variant="primary" onClick={() => keycloak.login()}>Login</Button>
                            }
                        </Stack>
                        <div style={{marginTop: "50px"}}>
                            <img style={{height: "50px", marginRight: "20px"}}src="/mobiliseyourcity.png" alt="Moblise Your City" />
                            <img style={{height: "50px", marginRight: "20px"}}src="/fabmob.png" alt="Fabmob" />
                            <img style={{height: "50px", marginRight: "20px"}}src="/ifeu.gif" alt="ifeu" />
                            <img style={{height: "50px", marginRight: "20px"}}src="/afd.png" alt="afd" />
                            <img style={{height: "50px", marginRight: "20px"}}src="/giz.svg" alt="giz" />
                        </div>
                    </Col>
                </Row>
            </Container>
            <Modal size="lg" centered show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Purpose of this tool</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        This tool is a bottom-up spreadsheet model for greenhouse gas emission (GHG) calculations in the transport sector at the national and local level. It enables calculating GHG inventories of cities and countries as well as BAU "business as usual" scenarios and climate scenarios. The tool enables governments to calculate potential effects of national and urban transport policies on total GHG emissions, e.g. extension of public transport, subsidies for electric vehicles. The scope of the emission that should be taken into account is based on a territorial principle (see for more details <a href="http://mobiliseyourcity.net/wp-content/uploads/sites/2/2017/09/MobiliseYourCity_MRV_Approach.pdf">http://mobiliseyourcity.net/wp-content/uploads/sites/2/2017/09/MobiliseYourCity_MRV_Approach.pdf</a>).
                    </p>
                    <br/>
                    <p>Basically all traffic within the city/country must be taken into account WITHIN the defined territory (traffic of inhabitants, incoming and outgoing traffic such as commuters, tourists, freight deliveries and so on)</p>
                    <br/><br/>
                    <p>The inventory is mandatory, the calculation of a BAU is not compulsory but necessary if a climate scenario is calculated. The climate scenario is optional. Please provide all input to the corresponding assessment (only for base year for inventory, for future years in the BAU sheet and eventually for the climate scenario in the climate sheets if wanted).</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                    Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
