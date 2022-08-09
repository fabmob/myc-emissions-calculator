import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { Navigate, useNavigate } from 'react-router-dom'
import {ProjectType} from '../frontendTypes'
import { Container, Button, Row, Col, Stack, Form, Modal, OverlayTrigger, Tooltip, Table, Badge } from 'react-bootstrap'

export default function GetStarted(){
    const { keycloak, initialized } = useKeycloak();
    const [ projects, setProjects ] = useState([] as ProjectType[])
    const [ publicProjects, setPublicProjects ] = useState([] as ProjectType[])
    const [ gotoCreate, setGotoCreate ] = useState(false)

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    useEffect(() => {
        if (initialized && keycloak.authenticated){
            loadProjects()
        }
    }, [initialized, keycloak])
    if (initialized && !keycloak.authenticated){
        return <Navigate to='/'  />
    }
    if (gotoCreate) {
        return <Navigate to='/createProject'  />
    }
    const loadProjects = () => {
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
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/projects', requestOptions)
            .then(response => response.json())
            .then(data => {
                setPublicProjects(data.projects)
            });
    }
    const handleEditProject = (projectBeingEdited: ProjectType, action: 'validate' | 'delete') => {
        if (action === 'validate') {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token }
            };
            fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectBeingEdited.id + '/validate', requestOptions)
                .then(response => response.json())
                .then(loadProjects)
        } else {
            const requestOptions = {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token }
            };
            fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectBeingEdited.id, requestOptions)
                .then(response => response.json())
                .then(loadProjects)
        }
    }
    const referenceYearTooltip = (props:any) => (
        <Tooltip id="button-tooltip" {...props}>
            You can choose the year of reference based on your needs
        </Tooltip>
    );
    return (
        <>
            <Container>
                <Row className="justify-content-md-center align-items-center" style={{height: "calc(100vh - 200px)", paddingTop: "20px"}}>
                    <Col xs lg="8">
                        <h1 style={{marginBottom: "40px"}}>Get Started</h1>
                        <p>
                            To compile an inventory and obtain the BAU scenario, you will require different input data - for the 
                            <OverlayTrigger placement="right" delay={{ show: 250, hide: 400 }} overlay={referenceYearTooltip}>
                                <span style={{whiteSpace: "nowrap"}}> year of reference🛈 </span>
                            </OverlayTrigger> 
                            and its projected evolution until 2050 (if you want to calculate BAU).<br/> 
                            You can find the details <a href='#' onClick={handleShow}>here</a>
                        </p>

                        <p>Cities which can not provide all of the required data can contact the <a href="https://www.mobiliseyourcity.net/about_the_partnership">MobiliseYourCity Secretariat </a> to check if suitable data are available.</p>
                        
                        {initialized ?
                        <Stack gap={2} className="col-md-5 mx-auto">
                            <Button variant="primary" onClick={_ => setGotoCreate(true)}>Create a new project</Button>
                        </Stack>
                        : <div>Loading...</div>
                        }
                    </Col>
                    <Row>
                        {initialized && <Projects ownedProjects={projects} publicProjects={publicProjects} handleEditProject={handleEditProject}/>}
                    </Row>
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

const Projects = ({ownedProjects, publicProjects, handleEditProject}: {ownedProjects: ProjectType[], publicProjects: ProjectType[], handleEditProject: (project: ProjectType, action: 'validate' | 'delete') => void}) => (
    <div style={{textAlign: "left"}}>
        <h2>Your projects</h2>
        <OwnedProjects ownedProjects={ownedProjects} handleEditProject={handleEditProject}/>
        <h2>Public projects</h2>
        <PublicProjects publicProjects={publicProjects} handleEditProject={handleEditProject}/>
    </div>
)
const OwnedProjects = ({ownedProjects, handleEditProject}: {ownedProjects: ProjectType[], handleEditProject: (project: ProjectType, action: 'validate' | 'delete') => void}) => {
    const navigate = useNavigate()
    const { keycloak, initialized } = useKeycloak();
    const [showValidateConfirmModal, setShowValidateConfirmModal] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [projectBeingEdited, setProjectBeingEdited] = useState({} as ProjectType);

    const handleCloseValidateConfirmModal = (shouldValidate: boolean) => {
        setShowValidateConfirmModal(false)
        if (shouldValidate && projectBeingEdited !== undefined) {
            handleEditProject(projectBeingEdited, 'validate')
        }
    }
    const handleShowValidateConfirmModal = (project: ProjectType) => {
        setProjectBeingEdited(project)
        setShowValidateConfirmModal(true)
    }
    const handleCloseDeleteConfirmModal = (shouldDelete: boolean) => {
        setShowDeleteConfirmModal(false)
        if (shouldDelete && projectBeingEdited !== undefined) {
            handleEditProject(projectBeingEdited, 'delete')
        }
    }
    const handleShowDeleteConfirmModal = (project: ProjectType) => {
        setProjectBeingEdited(project)
        setShowDeleteConfirmModal(true)
    }
    const openProject = (p: ProjectType) => {
        let url = "/project/" + p.id + "/step/" + p.step
        if (p.step === 8) {
            url = "/project/" + p.id + "/viz"
        }
        return navigate(url)
    }
    return (
        <div>
            <Table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Progress</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody style={{verticalAlign: "middle"}}>
                    {ownedProjects.map(project => 
                        <tr key={project.id}>
                            <td>{project.id}</td>
                            <td>{project.name}</td>
                            <td>
                                <OverlayTrigger placement="top" delay={{ show: 0, hide: 0 }} overlay={<Tooltip>{project.isSump && project.city + ", "}{project.country}</Tooltip>}>
                                    {project.isSump ? <Badge bg="primary">SUMP</Badge> : <Badge bg="info">NUMP</Badge>}              
                                </OverlayTrigger>
                            </td>
                            <td>{project.status === 'draft' ? <Badge bg="secondary">Draft</Badge> : <Badge bg="success">Validated</Badge>}</td>
                            <td><ProjectProgress step={project.step}/></td>
                            <td style={{whiteSpace: "nowrap"}}>
                                <Button variant="primary" className="btn-sm" style={{marginRight: "2px"}} onClick={() => openProject(project)}>Open</Button>
                                <Button variant="success" className="btn-sm" style={{marginRight: "2px"}} disabled={project.step < 8} onClick={() => handleShowValidateConfirmModal(project)}>Validate</Button>
                                <Button variant="danger" className="btn-sm" onClick={() => handleShowDeleteConfirmModal(project)}>Delete</Button>
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
            <ValidateConfirmModal 
                showValidateConfirmModal={showValidateConfirmModal}
                handleCloseValidateConfirmModal={handleCloseValidateConfirmModal}
                projectBeingEdited={projectBeingEdited}
            />
            <DeleteConfirmModal 
                showDeleteConfirmModal={showDeleteConfirmModal}
                handleCloseDeleteConfirmModal={handleCloseDeleteConfirmModal}
                projectBeingEdited={projectBeingEdited}
            />
        </div>
    )
}
const ValidateConfirmModal = ({showValidateConfirmModal, handleCloseValidateConfirmModal, projectBeingEdited}: 
    {showValidateConfirmModal: boolean, handleCloseValidateConfirmModal: (shouldValidate: boolean) => void, projectBeingEdited: ProjectType}) => (
    <Modal size="lg" centered show={showValidateConfirmModal} onHide={() => handleCloseValidateConfirmModal(false)}>
        <Modal.Header closeButton>
            <Modal.Title>Validate confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <p>Are you sure you want to validate the project {projectBeingEdited.name} ?</p>
            <p>Validated projects are marked as complete, and might later be published to every user</p>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="success" onClick={() => handleCloseValidateConfirmModal(true)}>
                Confirm validate
            </Button>
            <Button variant="secondary" onClick={() => handleCloseValidateConfirmModal(false)}>
                Close
            </Button>
        </Modal.Footer>
    </Modal>
)
const DeleteConfirmModal = ({showDeleteConfirmModal, handleCloseDeleteConfirmModal, projectBeingEdited}: 
    {showDeleteConfirmModal: boolean, handleCloseDeleteConfirmModal: (shouldDelete: boolean) => void, projectBeingEdited: ProjectType}) => (
    <Modal size="lg" centered show={showDeleteConfirmModal} onHide={() => handleCloseDeleteConfirmModal(false)}>
        <Modal.Header closeButton>
            <Modal.Title>Delete confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <p>Are you sure you want to delete the project {projectBeingEdited.name} ?</p>
            <p>This operation is definitive, all data related to this project will be lost.</p>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="danger" onClick={() => handleCloseDeleteConfirmModal(true)}>
                Confirm delete
            </Button>
            <Button variant="secondary" onClick={() => handleCloseDeleteConfirmModal(false)}>
                Close
            </Button>
        </Modal.Footer>
    </Modal>
)
const ProjectProgress = ({step} : {step: number}) => {
    let res = ""
    for (let i = 0; i < step; i++) {
        res += '🟩'
    }
    for (let i = step; i < 8; i++) {
        res += '🟧'
    }
    return <span style={{whiteSpace: "nowrap"}}>{res}</span>
}
const PublicProjects = ({publicProjects, handleEditProject}: {publicProjects: ProjectType[], handleEditProject: (project: ProjectType, action: 'validate' | 'delete') => void}) => {
    const navigate = useNavigate()
    const openProject = (p: ProjectType) => {
        return navigate("/project/" + p.id + "/viz")
    }
    return (
        <Table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Author</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {publicProjects.map(project => 
                    <tr key={project.id}>
                        <td>{project.id}</td>
                        <td>{project.name}</td>
                        <td>
                            <OverlayTrigger placement="top" delay={{ show: 0, hide: 0 }} overlay={<Tooltip>{project.isSump && project.city + ", "}{project.country}</Tooltip>}>
                                {project.isSump ? <Badge bg="primary">SUMP</Badge> : <Badge bg="info">NUMP</Badge>}
                            </OverlayTrigger>
                        </td>
                        <td>{project.owner}</td>
                        <td>
                            <Button variant="primary" className="btn-sm" onClick={() => openProject(project)}>Open</Button>
                        </td>
                    </tr>
                )}
            </tbody>
        </Table>
    )
}