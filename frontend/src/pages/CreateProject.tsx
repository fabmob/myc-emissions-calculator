import React, {useState, useMemo} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { Navigate, useNavigate } from 'react-router-dom'
import countryList from 'react-select-country-list'
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
    const [ projectCity, setProjectCity ] = useState("")
    const [ projectCountry, setProjectCountry ] = useState("")
    const [ partnerLocation, setPartnerLocation ] = useState("")
    const [ projectArea, setProjectArea ] = useState("")
    const [ projectReferenceYear, setProjectReferenceYear ] = useState("2020")
    const [validated, setValidated] = useState(false)
    const [ createWarning, setCreateWarning ] = useState(false)
    const countryOptions = useMemo(() => countryList().getData(), [])
    if (initialized && !keycloak.authenticated){
        return <Navigate to='/'  />
    }

    const createProject = (event: React.FormEvent<HTMLFormElement>) => {
        const form = event.currentTarget;
        setValidated(true)
        setCreateWarning(false)
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
            return
        }
        let projectDict = {
            projectName: projectName,
            projectCountry: projectCountry,
            projectCity: projectCity,
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
            .then(response => {
                if (response.status === 409) {
                    // Unique constraint failed, project name already exists
                    setCreateWarning(true)
                    setValidated(false)
                }
                return response.json()
            })
            .then(data => {
                if (data.status !== "err") {
                    navigate('/project/' + data.projectId + '/step/1')
                }
            });
        event.preventDefault();
    }
    const referenceYearTooltip = (props:any) => (
        <Tooltip id="button-tooltip" {...props}>
            The year you started the SUMP implementation
        </Tooltip>
    );
    return (
        <Container>
            <Row className="justify-content-md-center align-items-center" style={{height: "calc(100vh - 200px)"}}>
                <Col xs lg="5">
                    <h1 style={{marginBottom: "40px"}}>Project Information</h1>
                    <Form noValidate validated={validated} style={{textAlign: "left"}} onSubmit={createProject}>
                        <Form.Group className="mb-3">
                            <Form.Label className="reqStar">Project name</Form.Label>
                            <Form.Control type="input" required placeholder="SUMP City" value={projectName} onChange={e => setProjectName(e.target.value)} isInvalid={createWarning}/>
                            <Form.Control.Feedback type="invalid">{createWarning ? "This project name already exists" : "Please specify a project name"}</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="reqStar">Select country</Form.Label>
                            <Form.Select aria-label="Select a country" value={projectCountry} onChange={e => setProjectCountry(e.target.value)}>
                                {countryOptions.map(e => (<option value={e.label} key={e.label}>{e.label}</option>))}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid">Please specify a country</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="reqStar">City</Form.Label>
                            <Form.Control type="input" required placeholder="" value={projectCity} onChange={e => setProjectCity(e.target.value)}/>
                            <Form.Control.Feedback type="invalid">Please specify a city</Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-3">   
                            <Form.Label>Partner name in city</Form.Label>
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
                                <Form.Label className="reqStar">
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
