import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { Navigate, useNavigate } from 'react-router-dom'
import {ProjectType} from '../frontendTypes'
import { Container, Button, Row, Col, Stack, Modal, OverlayTrigger, Tooltip, Table, Badge } from 'react-bootstrap'

export default function Projects(){
    const { keycloak, initialized } = useKeycloak();
    const [ projects, setProjects ] = useState([] as ProjectType[])
    const [ publicProjects, setPublicProjects ] = useState([] as ProjectType[])
    const [ adminProjects, setAdminProjects ] = useState([] as ProjectType[])
    const [ gotoCreate, setGotoCreate ] = useState(false)
    const [ isAdmin, setIsAdmin ] = useState(false)

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    useEffect(() => {
        if (initialized && keycloak.authenticated){
            const roles = keycloak?.tokenParsed?.realm_access?.roles
            let _isAdmin = false
            if (roles && roles.indexOf('app-admin') > -1) {
                setIsAdmin(true)
                _isAdmin = true
            }
            loadProjects(_isAdmin)
        }
    }, [initialized, keycloak])
    if (initialized && !keycloak.authenticated){
        return <Navigate to='/'  />
    }
    if (gotoCreate) {
        return <Navigate to='/createProject'  />
    }
    const loadProjects = (_isAdmin: boolean) => {
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
                setPublicProjects(data.projects.filter((project: ProjectType) => project.status !== "draft"))
                if (_isAdmin) {
                    setAdminProjects(data.projects.filter((project: ProjectType) => project.status === "draft"))
                }
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
                <section>
                    <Row>
                        <Col lg="12">
                            <h1>Projects</h1>
                        </Col>
                        <Col xs lg="6">
                            <div className="text desc">
                                <p>
                                    A project is related to a specific MYC urban mobility plan. 
                                    It can be at a local level for Sustainable Urban Mobility plans (SUMP) or at a national level for National Urban Mobility Plans (NUMP). 
                                    <Button variant="link" onClick={handleShow} style={{padding: "0"}}><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Read more</span></span></Button>
                                </p>
                                <p>
                                    You can start by creating a new project, or checking public projects if available.
                                </p>
                            </div>
                            {initialized ?
                            // <Stack gap={2} className="col-md-5">
                            //     <Button size="lg" variant="primary" onClick={_ => setGotoCreate(true)}>New project</Button>
                            // </Stack>
                            <Button size="lg" variant="primary" onClick={_ => setGotoCreate(true)}><span className="item"><span>New project</span></span></Button>
                            : <div>Loading...</div>
                            }
                        </Col>
                    </Row>
                    <Row>
                        {initialized && <ProjectsList ownedProjects={projects} publicProjects={publicProjects} adminProjects={adminProjects} handleEditProject={handleEditProject} isAdmin={isAdmin}/>}
                    </Row>
                </section>
            </Container>
            <Modal size="lg" centered show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Projects</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Projects are divided in three stages:
                    </p>
                    <ul>
                        <li>An inventory, where transport activity is described for a reference year, and current yearly GHG emissions are computed</li>
                        <li>A business as usual (BAU) scenario, where the transport related emissions are described if nothing changed in the years to come</li>
                        <li>One or more climate scenarios, where the predicted transport related emissions are described when a strategy, policy, programme or project were to be introduced</li>
                    </ul>
                    <p>More information on these stages and which data they require will be detailed during the completion process.</p>
                    <p>Once your project is complete, you can validate it. This will let admins know that it can be consulted and maybe published as inspiration for other community members.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        <span className="item"><span>Close</span></span>
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

const ProjectsList = ({ownedProjects, publicProjects, adminProjects, handleEditProject, isAdmin}: 
    {
        ownedProjects: ProjectType[], 
        publicProjects: ProjectType[], 
        adminProjects: ProjectType[], 
        handleEditProject: (project: ProjectType, action: 'validate' | 'delete') => void,
        isAdmin: boolean
    }) => (
    
        <Col>
            <Row>
                <Col>
                    <DetailedProjects projects={ownedProjects} handleEditProject={handleEditProject} showOwner={false}/>
                </Col>
            </Row>

            {isAdmin ?
            <>  
            <Row>
                <Col>
                    <h3>(Admin) Public projects</h3>
                    <DetailedProjects projects={publicProjects} handleEditProject={handleEditProject} showOwner={true}/>
                </Col>
            </Row>
            <Row>
                <Col>
                    <h3>(Admin) Private projects</h3>
                    <DetailedProjects projects={adminProjects} handleEditProject={handleEditProject} showOwner={true}/>
                </Col>
            </Row>
            </>
                : <>
            <Row>
                <Col>
                    <h3>Public projects</h3>
                    <PublicProjects publicProjects={publicProjects} handleEditProject={handleEditProject}/>
                </Col>
            </Row>
            </>
            }

        </Col>
    
)
const DetailedProjects = ({projects, handleEditProject, showOwner}: 
    {projects: ProjectType[], handleEditProject: (project: ProjectType, action: 'validate' | 'delete') => void, showOwner: boolean}) => {
    const navigate = useNavigate()
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
        let url = "/project/" + p.id + "/edit"
        return navigate(url)
    }
    return (
        <>
            <Table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Type</th>
                        {showOwner && <th>Author</th>}
                        <th>Status</th>
                        <th>Inventory progress</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody style={{verticalAlign: "middle"}}>
                    {projects.map(project => 
                        <tr key={project.id}>
                            <td>{project.id}</td>
                            <td>{project.name}</td>
                            <td>
                                <OverlayTrigger placement="top" delay={{ show: 0, hide: 0 }} overlay={<Tooltip>{project.isSump && project.city + ", "}{project.country}</Tooltip>}>
                                    {project.isSump ? <Badge bg="primary">SUMP</Badge> : <Badge bg="info">NUMP</Badge>}              
                                </OverlayTrigger>
                            </td>
                            {showOwner && <td>{project.owner}</td>}
                            <td>{project.status === 'draft' ? <Badge bg="secondary">Draft</Badge> : <Badge bg="info">Validated</Badge>}</td>
                            <td><ProjectProgress step={project.stages["Inventory"][0]?.step}/></td>
                            <td style={{whiteSpace: "nowrap"}}>
                                <Button variant="primary" className="btn-sm" onClick={() => openProject(project)}><span className="item"><span>Open</span></span></Button>
                                <Button variant="secondary" className="btn-sm" disabled={project.stages["Inventory"][0]?.step < 8 || project.status !== 'draft'} onClick={() => handleShowValidateConfirmModal(project)}><span className="item"><span>Validate</span></span></Button>
                                <Button variant="secondary" className="btn-sm" onClick={() => handleShowDeleteConfirmModal(project)}><span className="item"><span>Delete</span></span></Button>
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
        </>
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
                <span className="item"><span>Confirm validate</span></span>
            </Button>
            <Button variant="secondary" onClick={() => handleCloseValidateConfirmModal(false)}>
                <span className="item"><span>Close</span></span>
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
                <span className="item"><span>Confirm delete</span></span>
            </Button>
            <Button variant="secondary" onClick={() => handleCloseDeleteConfirmModal(false)}>
                <span className="item"><span>Close</span></span>
            </Button>
        </Modal.Footer>
    </Modal>
)
const ProjectProgress = ({step} : {step: number}) => {
    let res = ""
    for (let i = 0; i < step; i++) {
        // res += '🟩'
        res += '—'
    }
    for (let i = step; i < 8; i++) {
        // res += '🟧'
        res += ' '
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
                            <Button variant="primary" className="btn-sm" onClick={() => openProject(project)}>
                                <span className="item"><span>Open</span></span>
                            </Button>
                        </td>
                    </tr>
                )}
            </tbody>
        </Table>
    )
}