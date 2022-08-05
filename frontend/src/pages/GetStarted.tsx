import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { Navigate } from 'react-router-dom'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Stack from 'react-bootstrap/Stack'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import {ProjectType} from '../frontendTypes'

export default function GetStarted(){
    const { keycloak, initialized } = useKeycloak();
    const [ projects, setProjects ] = useState([] as ProjectType[])
    const [ selectedProject, setSelectedProject ] = useState("")
    const [ gotoCreate, setGotoCreate ] = useState(false)

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    useEffect(() => {
        if (initialized && keycloak.authenticated){
            const requestOptions = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token }
            };
            fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/myProjects', requestOptions)
                .then(response => response.json())
                .then(data => {
                    console.log("get projetcs reply", data)
                    setProjects(data.projects)
                });
            }
    }, [initialized, keycloak])
    if (initialized && !keycloak.authenticated){
        return <Navigate to='/'  />
    }
    if (selectedProject !== ""){
        let p = projects.find(project => project.id === parseInt(selectedProject))
        let step = p?.step
        let url = "/project/" + selectedProject + "/step/" + step
        if (step === 8) {
            url = "/project/" + selectedProject + "/viz"
        }
        return <Navigate to={url}  />
    }
    if (gotoCreate) {
        return <Navigate to='/createProject'  />
    }
    let options = []
    for (let i = 0; i < projects.length; i++) {
        let project = projects[i] as ProjectType
        options.push(<option key={i} value={project.id}>{project.name}</option>)
    }
    let projectSelected = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value
        setSelectedProject(value)
    }
    const referenceYearTooltip = (props:any) => (
        <Tooltip id="button-tooltip" {...props}>
            You can choose the year of reference based on your needs
        </Tooltip>
    );
    return (
        <>
            <Container>
                <Row className="justify-content-md-center align-items-center" style={{height: "calc(100vh - 200px)"}}>
                    <Col xs lg="8">
                        <h1 style={{marginBottom: "40px"}}>Get Started</h1>
                        <h2>To compile an inventory and obtain the BAU scenario, you will require different input data - for the <OverlayTrigger placement="right" delay={{ show: 250, hide: 400 }} overlay={referenceYearTooltip}><span>year of reference 🛈</span></OverlayTrigger> and its projected evolution until 2050 (if you want to calculate BAU).<br/> You can find the details <a href='#' onClick={handleShow}>here</a></h2>

                        <h2>Cities which can not provide all of the required data can contact the <a href="https://www.mobiliseyourcity.net/about_the_partnership">MobiliseYourCity Secretariat </a> to check if suitable data are available.</h2>
                        
                        {initialized ?
                        <Stack gap={2} className="col-md-5 mx-auto">
                            <Button variant="primary" onClick={_ => setGotoCreate(true)}>Create a project</Button>
                            <Form.Select aria-label="Select a project" onChange={projectSelected}>
                                <option key="select">Select an existing project</option>
                                {options}
                            </Form.Select>
                        </Stack>
                        : <div>Loading...</div>
                        }
                    </Col>
                </Row>
            </Container>
            <Modal size="lg" centered show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Required input data</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ol>
                        <li><b>Socio-economic data</b></li>
                        <ul>
                        <li>Population (Number of inhabitants) </li>
                        <li>GDP (Gross domestic product)</li>
                        <li><i>Their evolution until 2050</i> </li>
                        </ul>  
                    <li><b>Vehicle kilometers travelled</b></li>
                        <ul>
                        <li>Direct input of the vehicle kilometers travelled for each vehicle category to be assessed for the reference year. This approach can often be applied, when data from a transport model are available. </li>
                            <li><i>The expected growth rate of the total vehicle kilometers travelled (vkt) should be given in order to calculate the Business-as-usual (BAU) scenario</i></li>
                        </ul> 
                    <li><b>Further required transport data</b></li>
                        <ul>
                        <li>Average Load (freight transport) and average occupancy (passenger transport) per vehicle category</li>
                        <li>Distribution of the vkt by fuel type per vehicle category</li>
                        <li>Average fuel/energy consumption by category per vehicle category</li>
                        <li>CO2 content of the grid electricity production</li>
                        <li><i>Their evolution until 2050</i></li>
                        </ul> 
                    </ol>
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
