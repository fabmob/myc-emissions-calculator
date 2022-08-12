import React, {useState, useMemo, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import countryList from 'react-select-country-list'
import { Button, Container, Row, Col, Form, InputGroup, OverlayTrigger, Tooltip, Table } from 'react-bootstrap'
import { Typeahead } from 'react-bootstrap-typeahead'
import 'react-bootstrap-typeahead/css/Typeahead.css'
import Progress from '../components/Progress'
import { ProjectType } from '../frontendTypes'

export default function CreateProject() {
    const navigate = useNavigate();
    let params = useParams();
    const { keycloak, initialized } = useKeycloak();
    const [ projectName, setProjectName ] = useState("")
    const [ projectCity, setProjectCity ] = useState([] as any[])
    const [ projectCountry, setProjectCountry ] = useState([] as any[])
    const [ partnerLocation, setPartnerLocation ] = useState("")
    const [ projectArea, setProjectArea ] = useState("")
    const [ projectReferenceYears, setProjectReferenceYears ] = useState(["2020","2025","2030","2035","2040","2050"])
    const [ isSump, setIsSump ] = useState(true)
    const [validated, setValidated] = useState(false)
    const [ createWarning, setCreateWarning ] = useState(false)
    let [project, setProject ] = useState({} as ProjectType)
    const blacklistCountries: {[key:string]:boolean} = {
        "Guadeloupe": true,
        "Martinique": true,
        "French Guiana": true,
        "Réunion": true,
        "Saint Pierre and Miquelon": true,
        "Mayotte": true,
        "Saint Barthélemy": true,
        "Saint Martin (French part)": true,
        "Wallis and Futuna": true,
        "French Polynesia": true,
        "New Caledonia": true,
        "French Southern Territories": true
    }
    const cityOptions: {[key:string]:string[]}= {
        "Mexico": ["Guadalajara"],
        "Cuba": ["La Havana"],
        "Dominican Republic": ["Santo Domingo"],
        "Colombia": ["Ibagué"],
        "Ecuador": ["Ambato", "Cuenca", "Loja", "Quito"],
        "Peru": ["Arequipa", "Trujillo"],
        "Chile": ["Antofagasta"],
        "Brazil": ["Bajada Santista", "Belo Horizonte", "Brasilia", "Curitiba", "Fortaleza", "Recife", "Teresina"],
        "Argentina": ["Córdoba"],
        "Morocco": ["Agadir", "Beni Mellal", "Casablanca", "El Jadida", "Fes", "Kenitra", "Khemisset", "Khouribga", "Marrakesh", "Oujda", "Rabat", "Sefi", "Settat"],
        "Tunisia": ["Sfax"],
        "Senegal": ["Dakar"],
        "Burkina Faso": ["Bobo Dioulasso", "Ougadougou"],
        "Côte d'Ivoire": ["Abidjan", "Bouaké"],
        "Ghana": ["Kumasi"],
        "Niger": ["Niamey"],
        "Togo": ["Lomé"],
        "Cameroon": ["Douala", "Yaoundé"],
        "Namibia": ["Windhoek"],
        "Ethiopia": ["Dire Dawa", "Hawassa"],
        "Tanzania, United Republic of": ["Dodoma"],
        "Mozambique": ["Maputo"],
        "Madagascar": ["Antananarivo", "Mahajanga"],
        "Ukraine": ["Chernivtsi", "Lviv", "Poltava", "Vinnitsa", "Zhytomyr"],
        "Georgia": ["Tbilisi"],
        "Pakistan": ["Peshawar"],
        "India": ["Ahmedabad", "Kochi", "Nagpur"],
        "Sri Lanka": ["Kurunegala"]
    }
    const countryOptions = useMemo(() => countryList().getData().filter(c => !blacklistCountries[c.label]), [])
    const projectId = params.projectId
    useEffect(() => {
        if (initialized && keycloak.authenticated && projectId){ 
            // We are not creating a new project, but editing one
            const requestOptions = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token }
            };
            fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId, requestOptions)
                .then(response => {
                    if (response.status != 200) {
                        navigate('/')
                    }
                    return response.json()
                })
                .then(data => {
                    console.log("get projetcs reply", data)
                    let loadedProject = data.project as ProjectType
                    setProject(loadedProject)
                    setProjectName(loadedProject.name)
                    setProjectCity([loadedProject.city])
                    setProjectCountry([loadedProject.country])
                    setPartnerLocation(loadedProject.partnerLocation)
                    setProjectArea(loadedProject.area)
                    setProjectReferenceYears(loadedProject.referenceYears.map(e => e.toString()))
                    setIsSump(loadedProject.isSump)
                });
            }
    }, [keycloak, initialized])
    if (initialized && !keycloak.authenticated){
        return <Navigate to='/'  />
    }


    const createProject = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        setValidated(true)
        setCreateWarning(false)
        if (form.checkValidity() === false) {
            event.stopPropagation();
            return
        }
        let projectDict = {
            projectName: projectName,
            projectCountry: projectCountry[0],
            projectCity: (projectCity[0]?.label ? projectCity[0]?.label : projectCity[0]) || '',
            partnerLocation: partnerLocation,
            projectArea: projectArea,
            projectReferenceYears: projectReferenceYears.map(year => parseInt(year))
        }
        if (!projectId) {
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
        } else {
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
                body: JSON.stringify({ project: projectDict })
            };
            fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId, requestOptions)
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
                        navigate('/project/' + projectId + '/step/1')
                    }
                });
        }
    }
    const referenceYearTooltip = (props:any) => (
        <Tooltip id="button-tooltip" {...props}>
            You can choose the year of reference based on your needs
        </Tooltip>
    );
    const setProjectReferenceYear = (index: number, year: string) => {
        setProjectReferenceYears((prevProjectReferenceYears) => {
            return prevProjectReferenceYears.map((e,i) => i === index ? year : e)
        })
    }
    return (
        <Container style={{paddingTop: "30px"}}>
            <Progress project={project} currentStep={0} />
            <Row className="justify-content-md-center align-items-center" style={{height: "calc(100vh - 200px)"}}>
                <Col xs xl="8" lg="12">
                    <h1 style={{marginBottom: "40px"}}>Project Information</h1>
                    <Form noValidate validated={validated} style={{textAlign: "left"}} onSubmit={createProject}>
                        <Form.Group className="mb-3">
                            <Form.Label className="reqStar">Project name</Form.Label>
                            <Form.Control type="input" required placeholder={(isSump ? "SUMP City" : "NUMP Country") + " - " + projectReferenceYears[0]} value={projectName} onChange={e => setProjectName(e.target.value)} isInvalid={createWarning}/>
                            <Form.Control.Feedback type="invalid">{createWarning ? "This project name already exists" : "Please specify a project name"}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="reqStar">Project type</Form.Label>
                            <Form.Check
                                id="custom-switch-sump"
                                type="radio"
                                checked={isSump}
                                onChange={() => setIsSump(true)}
                                label="Sustainable Urban Mobility Plan (SUMP)"
                            />
                            <Form.Check
                                id="custom-switch-nump"
                                type="radio"
                                checked={!isSump}
                                onChange={() => setIsSump(false)}
                                label="National Urban Mobility Plan (NUMP)"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="reqStar">Select country</Form.Label>
                            <Typeahead
                                inputProps={{ required: true }}
                                id="countryselector"
                                selected={projectCountry}
                                onInputChange={e => { setProjectCountry([e])}}
                                onChange={o => { o.length && setProjectCountry(o)}}
                                options={countryOptions.map(e => e.label)}
                            />
                            <Form.Control.Feedback type="invalid" style={{display: (validated && !projectCountry[0]) ? "block": ''}}>Please specify a country</Form.Control.Feedback>
                        </Form.Group>

                        {isSump && <Form.Group className="mb-3">
                            <Form.Label className="reqStar">City</Form.Label>
                            <Typeahead
                                allowNew
                                inputProps={{ required: true }}
                                id="cityselector"
                                newSelectionPrefix="Use this city: "
                                selected={projectCity}
                                onInputChange={e => setProjectCity([e])}
                                onChange={o => { o.length && setProjectCity(o)}}
                                options={cityOptions[projectCountry[0]] || []}
                            />
                            <Form.Control.Feedback type="invalid" style={{display: (validated && !projectCity[0]) ? "block": ''}}>Please specify a city</Form.Control.Feedback>
                        </Form.Group> }

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

                        <Table className="inputTable">
                            <thead>
                                <tr>
                                    <th className="reqStar">
                                        <OverlayTrigger placement="left" delay={{ show: 250, hide: 400 }} overlay={referenceYearTooltip}>
                                            <span>Reference year (RY) 🛈</span>
                                        </OverlayTrigger>
                                    </th>
                                    <th className="reqStar">Y1</th>
                                    <th className="reqStar">Y2</th>
                                    <th className="reqStar">Y3</th>
                                    <th className="reqStar">Y4</th>
                                    <th className="reqStar">Y5</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {projectReferenceYears.map((year,i) => (
                                        <td key={i}>
                                            <Form.Group>
                                                <InputGroup>
                                                    <Form.Control type="number" required min="1900" max="2500" value={projectReferenceYears[i]} onChange={e => setProjectReferenceYear(i, e.target.value)} />
                                                    <Form.Control.Feedback type="invalid">Please enter a year between 1900 and 2500, avoid white spaces</Form.Control.Feedback>
                                                </InputGroup>
                                            </Form.Group>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </Table>
                        <Button variant="primary" type="submit">
                            Next
                        </Button>
                    </Form>

                </Col>
            </Row>
        </Container>
    )
}
