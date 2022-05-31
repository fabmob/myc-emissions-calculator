import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { Navigate, useNavigate } from 'react-router-dom'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'

export default function CreateProject(){
    const navigate = useNavigate();
    const { keycloak, initialized } = useKeycloak();
    const [ projectName, setProjectName ] = useState("")
    const [ projectLocation, setProjectLocation ] = useState("")
    const [ partnerLocation, setPartnerLocation ] = useState("")
    const [ projectArea, setProjectArea ] = useState("")
    const [ projectReferenceYear, setProjectReferenceYear ] = useState("2020")
    if (initialized && !keycloak.authenticated){
        return <Navigate to='/'  />
    }

    const createProject = (event: React.FormEvent<HTMLFormElement>) => {
        console.log("created")
        let projectDict = {
            projectName: keycloak?.tokenParsed?.preferred_username + ":" + projectName,
            projectLocation: projectLocation,
            partnerLocation: partnerLocation,
            projectArea: projectArea,
            projectReferenceYear: projectReferenceYear
        }
        console.log(projectDict)
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
            body: JSON.stringify({ project: projectDict })
        };
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/createProject', requestOptions)
            .then(response => response.json())
            .then(data => navigate('/project/' + data.projectId + '/step/1'));
        event.preventDefault();
    }
    return (
        <Container>
            <Row className="justify-content-md-center align-items-center" style={{height: "calc(100vh - 200px)"}}>
                <Col xs lg="8">
                    <h1 style={{marginBottom: "40px"}}>Project Information</h1>
                    <Form style={{textAlign: "left"}} onSubmit={createProject}>
                        <Form.Group className="mb-3">
                            <Form.Label>Project name</Form.Label>
                            <Form.Control type="input" placeholder="" value={projectName} onChange={e => setProjectName(e.target.value)}/>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Select country/city</Form.Label>
                            <Form.Control type="input" placeholder="" value={projectLocation} onChange={e => setProjectLocation(e.target.value)}/>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Partner country/city</Form.Label>
                            <Form.Control type="input" placeholder="" value={partnerLocation} onChange={e => setPartnerLocation(e.target.value)}/>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Territory area (m²)</Form.Label>
                            <InputGroup>
                                <Form.Control type="input" placeholder="" value={projectArea} onChange={e => setProjectArea(e.target.value)}/>
                                <InputGroup.Text>m²</InputGroup.Text>
                            </InputGroup>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Reference year (RY)</Form.Label>
                            <Form.Control type="input" placeholder="2020" value={projectReferenceYear} onChange={e => setProjectReferenceYear(e.target.value)}/>
                        </Form.Group>

                        <Button variant="primary" type="submit">
                            Next
                        </Button>
                    </Form>

                </Col>
            </Row>
        </Container>
    )
}
