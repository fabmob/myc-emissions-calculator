import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useParams, useNavigate } from "react-router-dom"
import { Container, Row, Col } from 'react-bootstrap'
import Footer from "../components/Footer"

import './Project.css'
import CreateProject from './CreateProject'
import { ProjectType } from '../frontendTypes'
import ProjectSummary from './ProjectSummary'
import ProjectCompare from './ProjectCompare'
import ProjectNav from '../components/ProjectNav'

export default function Project({page}:{page:"config" | "edit" | "viz"}){
    const { keycloak, initialized } = useKeycloak()
    const navigate = useNavigate()
    const params = useParams()
    const [project, setProject ] = useState({} as ProjectType)
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
                    <Row className="justify-content-md-center">
                        <Col lg="6">
                            <h1>{project.name || "New Project"}</h1>
                        </Col>
                    </Row>
                    <Row className="justify-content-md-center">
                        <Col lg="6">
                            {project.id && <ProjectNav current={page} project={project} />}
                            {page === "config" && <CreateProject project={project} />}
                            {page === "edit" && <ProjectSummary project={project} />}
                            {page === "viz" && <ProjectCompare project={project} />}
                        </Col>
                    </Row>
                </Container>
            </section>
            <section className="footer">
                <div className="container">
                    <Row className="justify-content-md-center">
                        <Col lg="6">
                            <Footer />
                        </Col>
                    </Row>
                </div>
            </section>
        </>
    )
}
