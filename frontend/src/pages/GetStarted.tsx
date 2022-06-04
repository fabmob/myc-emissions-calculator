import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { Navigate } from 'react-router-dom'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Stack from 'react-bootstrap/Stack'
import Form from 'react-bootstrap/Form'
import {ProjectType} from '../frontendTypes'

export default function GetStarted(){
    const { keycloak, initialized } = useKeycloak();
    const [ projects, setProjects ] = useState([] as ProjectType[])
    const [ selectedProject, setSelectedProject ] = useState("")
    const [ gotoCreate, setGotoCreate ] = useState(false)
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
        if (step === 100) {
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
    return (
        <Container>
            <Row className="justify-content-md-center align-items-center" style={{height: "calc(100vh - 200px)"}}>
                <Col xs lg="8">
                    <h1 style={{marginBottom: "40px"}}>Get Started</h1>
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
    )
}
