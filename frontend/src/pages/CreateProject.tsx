import React, {useState, useMemo, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import countryList from 'react-select-country-list'
import { Button, Container, Row, Col, Form, InputGroup, OverlayTrigger, Tooltip, Badge, ButtonGroup } from 'react-bootstrap'
import { Typeahead } from 'react-bootstrap-typeahead'
import 'react-bootstrap-typeahead/css/Typeahead.css'
import { ProjectType } from '../frontendTypes'
import ChoiceModal from '../components/ChoiceModal'
import ProjectNav from '../components/ProjectNav'
import Footer from "../components/Footer"

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
    const [ geoData, setGeoData ] = useState("")
    const [ isSump, setIsSump ] = useState(true)
    const [validated, setValidated] = useState(false)
    const [ createWarning, setCreateWarning ] = useState(false)
    const [ showProjectReferenceYearsModal, setShowProjectReferenceYearsModal ] = useState(false)
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
                    if (response.status !== 200) {
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
            projectReferenceYears: projectReferenceYears.map(year => parseInt(year)),
            isSump: isSump
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
                        navigate('/project/' + data.projectId + '/edit')
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
                        navigate('/project/' + projectId + '/edit')
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
    const addProjectReferenceYear = (year: string) => {
        setProjectReferenceYears((prevProjectReferenceYears) => {
            prevProjectReferenceYears.push(year)
            prevProjectReferenceYears.sort()
            return prevProjectReferenceYears
        })
    }
    const removeProjectReferenceYear = (index: number) => {
        setProjectReferenceYears((prevProjectReferenceYears) => {
            return prevProjectReferenceYears.filter((_,i) => i !== index)
        })
    }

    return (
        <>
            <section>
            <Container>
                <Row className="justify-content-md-center">
                    <Col xs lg="8">
                        <h1>{project.id ? projectName : "New Project"}</h1>
                    </Col>
                </Row>
                <Row className="justify-content-md-center align-items-center">
                    <Col xs xl="8" lg="12">
                        {project.id && <ProjectNav current="Config" project={project} />}
                        <Form noValidate validated={validated} style={{textAlign: "left"}} onSubmit={createProject}>
                            <Row>
                                <Col>
                                    <h3>Study</h3>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="reqStar">Study name</Form.Label>
                                        <Form.Control type="input" required placeholder={(isSump ? "SUMP City" : "NUMP Country") + " - " + projectReferenceYears[0]} value={projectName} onChange={e => setProjectName(e.target.value)} isInvalid={createWarning}/>
                                        <Form.Control.Feedback type="invalid">{createWarning ? "This project name already exists" : "Please specify a project name"}</Form.Control.Feedback>
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label className="reqStar">Plan type</Form.Label>
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
                                    {project.createdDate && <Form.Group className="mb-3">
                                        <Form.Label>Created</Form.Label>
                                        <Form.Control type="input" value={new Date(project.createdDate).toLocaleString()} readOnly/>
                                    </Form.Group>}
                                    {project.modifiedDate && <Form.Group className="mb-3">
                                        <Form.Label>Modified</Form.Label>
                                        <Form.Control type="input" value={new Date(project.modifiedDate).toLocaleString()} readOnly/>
                                    </Form.Group>}
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <h3>Area of study</h3>
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
                                        <Form.Label className="reqStar">Area</Form.Label>
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
                                    {/* <Form.Group className="mb-3">
                                        <Form.Label>Geo. Data</Form.Label>
                                        <Form.Control type="input" placeholder="" value={geoData} onChange={e => setGeoData(e.target.value)}/>
                                    </Form.Group> */}
                                    <Form.Group className="mb-3">   
                                        <Form.Label>Partner name in city</Form.Label>
                                        <Form.Control type="input" placeholder="" value={partnerLocation} onChange={e => setPartnerLocation(e.target.value)}/>
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Territory area (km²)</Form.Label>
                                        <InputGroup>
                                            <Form.Control type="input" placeholder="" value={projectArea} onChange={e => setProjectArea(e.target.value)}/>
                                            {/* <InputGroup.Text>km²</InputGroup.Text> */}
                                        </InputGroup>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <h3>Years of study</h3>
                                    <Form.Group className="mb-3">
                                        <Form.Label>
                                            <OverlayTrigger placement="left" delay={{ show: 250, hide: 400 }} overlay={referenceYearTooltip}>
                                                <span><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg> Ref. year</span>
                                            </OverlayTrigger>
                                        </Form.Label>
                                        <InputGroup>
                                            <Form.Control type="number" required min="1900" max="2500" value={projectReferenceYears[0]} onChange={e => setProjectReferenceYear(0, e.target.value)} />
                                            <Form.Control.Feedback type="invalid">Please enter a year between 1900 and 2500, avoid white spaces</Form.Control.Feedback>
                                        </InputGroup>
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Proj. Year(s)</Form.Label>
                                        <InputGroup>
                                            {projectReferenceYears.map((year,i) => (
                                                (i>0) && <Badge key={i} bg="secondary"><span className="item"><span>{year} <span style={{"cursor": "pointer"}} onClick={e => removeProjectReferenceYear(i)}><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#times"}/></svg></span></span></span></Badge>
                                            ))}
                                            <Badge bg="primary" onClick={_ => setShowProjectReferenceYearsModal(true)}><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#plus"}/></svg></span></Badge>
                                        </InputGroup>
                                    </Form.Group>                              
                                </Col>
                            </Row>
                            {project.id ? '' : 
                                <Row>
                                    <Col style={{display: "flex", justifyContent: "right"}}>                            
                                        <Button size="lg" variant="primary" type="submit">
                                            <span className="item"><span>Create</span></span>
                                        </Button>
                                    </Col>
                                </Row>}
                        </Form>

                    </Col>
                </Row>
            </Container>
            </section>
            <section className="footer">
                <div className="container">
                    <Row className="justify-content-md-center">
                        <Col lg="8">
                            <Footer />
                        </Col>
                    </Row>
                </div>
            </section>
            <ChoiceModal 
                showModal={showProjectReferenceYearsModal} 
                setShowModal={setShowProjectReferenceYearsModal} 
                valRange={[projectReferenceYears[0], "2500"]}
                callback={addProjectReferenceYear}
            ></ChoiceModal>
        </>
    )
}
