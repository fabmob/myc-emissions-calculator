import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { Navigate, useNavigate } from 'react-router-dom'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'


export default function CreateProject(){
    const navigate = useNavigate();
    const { keycloak, initialized } = useKeycloak();
    const [ projectName, setProjectName ] = useState("")
    const [ projectLocation, setProjectLocation ] = useState("")
    const [ partnerLocation, setPartnerLocation ] = useState("")
    const [ projectArea, setProjectArea ] = useState("")
    const [ projectReferenceYear, setProjectReferenceYear ] = useState("2020")
    const [validated, setValidated] = useState(false);
    if (initialized && !keycloak.authenticated){
        return <Navigate to='/'  />
    }

    const createProject = (event: React.FormEvent<HTMLFormElement>) => {
        const form = event.currentTarget;
        setValidated(true);
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
            return
        }
        let projectDict = {
            projectName: keycloak?.tokenParsed?.preferred_username + ":" + projectName,
            projectLocation: projectLocation,
            partnerLocation: partnerLocation,
            projectArea: projectArea,
            projectReferenceYear: projectReferenceYear
        }
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
    const referenceYearTooltip = (props:any) => (
        <Tooltip id="button-tooltip" {...props}>
            Base year. Earliest transport data should be dated this year.
        </Tooltip>
    );
    return (
        <Container>
            <Row className="justify-content-md-center align-items-center" style={{height: "calc(100vh - 200px)"}}>
                <Col xs lg="5">
                    <h1 style={{marginBottom: "40px"}}>Project Information</h1>
                    <Form noValidate validated={validated} style={{textAlign: "left"}} onSubmit={createProject}>
                        <Form.Group className="mb-3">
                            <Form.Label>Project name</Form.Label>
                            <Form.Control type="input" required placeholder="" value={projectName} onChange={e => setProjectName(e.target.value)}/>
                            <Form.Control.Feedback type="invalid">Please specify a project name</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Select country/city</Form.Label>
                            <Form.Control type="input" required placeholder="" value={projectLocation} onChange={e => setProjectLocation(e.target.value)}/>
                            <Form.Control.Feedback type="invalid">Please specify a country</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Partner country/city</Form.Label>
                            <Form.Control type="input" placeholder="" value={partnerLocation} onChange={e => setPartnerLocation(e.target.value)}/>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Territory area (km²)</Form.Label>
                            <InputGroup>
                                <Form.Control type="input" placeholder="" value={projectArea} onChange={e => setProjectArea(e.target.value)}/>
                                <InputGroup.Text>km²</InputGroup.Text>
                            </InputGroup>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <OverlayTrigger placement="right" delay={{ show: 250, hide: 400 }} overlay={referenceYearTooltip}>
                                <Form.Label>
                                    Reference year (RY) 🛈
                                </Form.Label>
                            </OverlayTrigger>
                            <Form.Control type="input" required placeholder="2020" value={projectReferenceYear} onChange={e => setProjectReferenceYear(e.target.value)}/>
                            <Form.Control.Feedback type="invalid">Please specify the reference year</Form.Control.Feedback>
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
