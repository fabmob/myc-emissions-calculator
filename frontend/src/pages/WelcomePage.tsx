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
                    <p>This online tool allows <b> greenhouse gas emission (GHG) calculations in the transport sector at the local level </b>. </p>
                    <br/>
                    <p>It enables calculating GHG inventories of cities as well as BAU (business as usual) scenarios. <b>Governments can therefore calculate the environmental effects of local urban mobility activity and foresee the evolution if no actions is taken.</b></p>
                    <br/>
                    <p><i>Methodology</i></p>
                    <p>It relies on a <b>bottom-up model</b> : calculations are based on distance travelled (whereas the top-down model bases the calculations on fuel/energy consumption). </p>
                    <p>The scope of the emission that should be taken into account is <b>based on a territorial principle</b> : basically all traffic within the city must taken into account. (For more details, go to chapter 3.2 of <a href="https://www.mobiliseyourcity.net/sites/default/files/2022-04/MRV%20GHG%20Guidelines_ENG_2020_final.pdf">MYC-GHG Guidelines</a>). </p>
                    <br/>
                    <hr/>
                    <p>The developers are not responsible for the accuracy of the results. Any modification of the tool is the responsibility of the user.</p>
                    <br/>
                    <p>The tool was developed by <a href="https://lafabriquedesmobilites.fr/">Fabrique des Mobilités </a> based on the excel model created by the <a href="http://www.ifeu.de">Institute for Energy and Environmental Research</a> in cooperation with the German and French development agencies GIZ and AFD. It is not allowed to use the tool for commercial purposes.</p>
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
