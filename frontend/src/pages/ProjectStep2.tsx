import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useParams, useNavigate } from "react-router-dom"
import Form from 'react-bootstrap/Form'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import {InputStep2, ProjectType} from '../frontendTypes'
import Progress from '../components/Progress'

import './Project.css'


const defaultVehicles = [
    [
        "👟 Walking",
        "🚲 Cycling",
        "🚲 Cargo bike",
        "🚘 Private car",
        "🏍️ Motorcycle",
    ],
    [
        "🚕 Individual taxi",
        "🛺 Motorcycle taxi",
        "🚐 Minibus",
        "🚌 Bus",
        "🚌 Coach",
        "🚌 Bus rapid transit",
        "🚄 Long distance train",
        "🚃 Urban train",
        "🚈 Metro",
    ],
    [
        "🛺 Very light LCV",
        "🛻 LCV",
        "🚚 Solo truck",
        "🚛 Articulated truck",
        "🚄 Freight train",
    ]
]
const defaultVehiclesTooltips : {[key: string]: string} = {
    "👟 Walking": 'Walking',
    "🚲 Cycling": 'Cycling and other Non Motorised Transport like small-wheeled transport (e.g.skateboards, e-scooters...)',
    "🚲 Cargo bike": 'Cycle designed for transporting loads',
    "🚘 Private car": 'Any motor vehicle intended for passenger transport, the seat capacity does not exceed nine seats (including driver), the total permissible gross weight does not exceed 3,5t.',
    "🏍️ Motorcycle": 'A two-wheeled vehicle with an engine.',
    "🚕 Individual taxi": 'Cars which transport passengers in return for payment of a fare and which are typically fitted with a taximeter.',
    "🛺 Motorcycle taxi": 'Motorcycles which transport passengers in return for payment of a fare (e.g. Go-jek, Grab).',
    "🚐 Minibus": 'Any motor vehicle intended for the collective transport of persons whose number of seats is less than nine, including hirings, collective taxis and rural transportation.',
    "🚌 Bus": 'Any motor vehicle intended for the collective transport of persons, the number of seats of which is greater than nine or the permissible total weight exceeds 3.5t.',
    "🚌 Coach": 'Bus used for longer-distance service.',
    "🚌 Bus rapid transit": 'Bus Rapid Transit (BRT) is a high-quality bus-based transit system. It is typically specified with dedicated lanes, iconic stations, off-board fare collection, and fast and frequent operations.',
    "🚄 Long distance train": 'Passenger train mainly traveling outside the city - long distance train',
    "🚃 Urban train": 'Passenger train mainly traveling within the city territory - short distance train.',
    "🚈 Metro": 'Passenger train mainly traveling within the city territory - Tram and Metro.',
    "🛺 Very light LCV": "A mostly three-wheeled motorized vehicle used for goods transport",
    "🛻 LCV": "Motor vehicle intended for the transport of freight, the permissible gross weight does not exceed 3.5t",
    "🚚 Solo truck": "Motor vehicle intended for the transport of freight, the permissible load is up to 10t",
    "🚛 Articulated truck": "Motor vehicle intended for the transport of freight and the total authorized load exceeds 10t. Trucks consist of trucks and tractors (truck with trailer)",
    "🚄 Freight train": "Any freight train, usually for long distance transport",
}
const defaultVehiclesList = [
    "👟 Walking",
    "🚲 Cycling",
    "🚲 Cargo bike",
    "🚘 Private car",
    "🏍️ Motorcycle",
    "🚕 Individual taxi",
    "🛺 Motorcycle taxi",
    "🚐 Minibus",
    "🚌 Bus",
    "🚌 Coach",
    "🚌 Bus rapid transit",
    "🚄 Long distance train",
    "🚃 Urban train",
    "🚈 Metro",
    "🛺 Very light LCV",
    "🛻 LCV",
    "🚚 Solo truck",
    "🚛 Articulated truck",
    "🚄 Freight train"
]
export default function ProjectStep2(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    let params = useParams();
    let init:InputStep2 = {}
    for (let i = 0; i < defaultVehiclesList.length; i++) {
        let vtype = defaultVehiclesList[i]
        init[vtype] = {isActive: false, isFreight: i>13}
    }
    const [inputData, setInputData ] = useState(init)

    const [showAddCustomType, setShowAddCustomType] = useState(false);
    const handleCloseAddCustomType = () => setShowAddCustomType(false);
    const handleShowAddCustomType = () => setShowAddCustomType(true);
    
    const [categoryName, setCategoryName ] = useState("")
    const [categoryIsFreight, setCategoryIsFreight] = useState(false)
    const [validated, setValidated ] = useState(false)

    const [showInfo, setShowInfo] = useState(false);
    const handleCloseInfo = () => setShowInfo(false);
    const handleShowInfo = () => setShowInfo(true);

    const [project, setProject ] = useState({} as ProjectType)
    let projectId = params.projectId
    useEffect(() => {
        if (initialized && keycloak.authenticated){
            const requestOptions = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token }
            };
            fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId, requestOptions)
                .then(response => {
                    if (response.status !== 200) {
                        return navigate('/')
                    }
                    return response.json()
                })
                .then(data => {
                    setProject(data.project)
                    if (data.project.steps[2]){
                        setInputData((prevInputData) => {
                            let vtypes = Object.keys(data.project.steps[2])
                            for (let i = 0; i < vtypes.length; i++) {
                                let val = data.project.steps[2][vtypes[i]]
                                if (val.isActive !== undefined) {
                                    prevInputData[vtypes[i]] = val
                                } else {
                                    prevInputData[vtypes[i]] = {isActive: val, isFreight: false}
                                }
                            }
                            return prevInputData
                        })
                    }
                });
            }
    }, [keycloak, initialized, projectId])
    const updateInput = (event: React.BaseSyntheticEvent) => {
        let target = event.target as HTMLInputElement
        let vtype = target.name
        setInputData((prevInputData) => ({
            ...prevInputData,
            [vtype]: {isActive: !prevInputData[vtype].isActive, isFreight: prevInputData[vtype].isFreight}
        }))
    }
    // Only send selected vtypes to backend
    const filterData = (inp: InputStep2): InputStep2 => {
        let output: InputStep2 = {}
        let keys = Object.keys(inp)
        for (let i = 0; i < keys.length; i++) {
            if (inp[keys[i]].isActive) {
                output[keys[i]] = inp[keys[i]]
            }
        }
        return output
    }
    const addCategory = (event: React.FormEvent<HTMLFormElement>) => {
        const form = event.currentTarget;
        setValidated(true);
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
            return
        }
        setInputData((prevInputData) => {
            prevInputData[categoryName] = {isActive: true, isFreight: categoryIsFreight}
            return prevInputData
        })
        event.preventDefault();
        handleCloseAddCustomType()
    }
    const addEmoji = (emoji: string) => {
        setCategoryName((prevCategoryName) => emoji + " " + prevCategoryName)
    }
    const goPreviousStep = () => {
        navigate('/project/' + projectId + '/step/1');
    }
    const saveAndGoNextStep = () => {
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
            body: JSON.stringify({ inputData: filterData(inputData) })
        };
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/step/2', requestOptions)
            .then(response => response.json())
            .then(() => navigate('/project/' + projectId + '/step/3'));
    }
    return (
        <>
            <Container className="projectStepContainer">
                <Progress project={project} currentStep={2} />
                <Row className="justify-content-md-center align-items-center" style={{minHeight: "calc(100vh - 200px)", marginTop: "20px"}}>
                    <Col xs lg="8">
                        <h1>Select / add category of transport</h1>
                        <h2 style={{marginTop: "-40px", marginBottom: "40px"}}>Project: {project.name}</h2>
                        <p>Please select existing or expected means of transport on your territory. Click <a href="#" onClick={handleShowInfo}>here</a> for more details on default categories.<br/>You can also add a custom vehicle category below, if you don't find it in the list. </p>
                        <p>
                            For each category, you will later need to fill the following information: Total vkt, Vehicle occupancy, Fuel types and consumptions, Vkt breakdown per fuel
                        </p>
                        <Form style={{"marginBottom": "20px"}}>
                            <Row style={{textAlign: "left"}}>
                            <b>Default Categories</b>
                            {defaultVehicles.map((vCol, index) => {
                                return (
                                    <Col lg="4" key={index}>
                                        {vCol.map((vtype, index) => {
                                            return (
                                                <Form.Switch style={{margin: "15px"}} id={"custom-switch-" + vtype} key={index}>
                                                    <Form.Switch.Input style={{marginRight: "10px"}} name={vtype} checked={inputData[vtype].isActive} onChange={updateInput}/>
                                                    <OverlayTrigger 
                                                        key={index} 
                                                        placement="right"
                                                        delay={{ show: 250, hide: 400 }} 
                                                        overlay={<Tooltip>{defaultVehiclesTooltips?.[vtype]}</Tooltip>}
                                                    >
                                                        <Form.Switch.Label>{vtype}</Form.Switch.Label>
                                                    </OverlayTrigger>
                                                </Form.Switch>
                                            )
                                        })}
                                    </Col>
                                )
                            })}
                            <hr/>
                            <b>Custom Categories</b>
                            {Object.keys(inputData).filter(vtype => defaultVehiclesList.indexOf(vtype) === -1).map((vtype, index) => {
                                return (
                                    <Col lg="4" key={index}>
                                        <Form.Switch
                                            style={{margin: "10px"}}
                                            id={"custom-switch-" + vtype}
                                            label={vtype}
                                            key={index}
                                            name={vtype}
                                            checked={inputData[vtype].isActive}
                                            onChange={updateInput}
                                        />
                                    </Col>
                                )
                            })}
                            </Row>
                        </Form>
                        <div style={{marginBottom: "20px"}}>
                            <Button variant="primary" onClick={handleShowAddCustomType}>
                                Add a custom vehicle category
                            </Button>
                        </div>
			            <hr />
                        <Button variant="secondary" style={{marginRight: "20px"}} onClick={goPreviousStep}>
                            Previous
                        </Button>
                        <Button variant="primary" onClick={saveAndGoNextStep}>
                            Next
                        </Button>
                    </Col>
                </Row>
            </Container>
            <Modal size="lg" centered show={showAddCustomType} onHide={handleCloseAddCustomType}>
                <Modal.Header closeButton>
                    <Modal.Title>Add a custom vehicle category</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        If no category is matching your vehicle, you can create a new one.
                    </p>
                    <div>Just like the default categories, you will later need to fill the following information for this newly created category:
                        <ul>
                            <li>Total vkt</li>
                            <li>Vehicle occupancy</li>
                            <li>Fuel types and consumptions</li>
                            <li>Vkt breakdown per fuel</li>
                        </ul>
                    </div>
                    <Form noValidate validated={validated} onSubmit={addCategory}>
                        <Form.Group className="mb-3">
                            <Form.Label>Category name</Form.Label>
                            <Form.Control type="input" required placeholder="" value={categoryName} onChange={e => setCategoryName(e.target.value)}/>
                            <Form.Control.Feedback type="invalid">Please specify a name</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Category type</Form.Label>
                            <Form.Check
                                type="radio"
                                checked={categoryIsFreight}
                                onChange={() => setCategoryIsFreight(true)}
                                label="Freight"
                            />
                            <Form.Check
                                type="radio"
                                checked={!categoryIsFreight}
                                onChange={() => setCategoryIsFreight(false)}
                                label="Passengers"
                            />
                        </Form.Group>
                        <div style={{display: "flex", color: "gray"}}>
                            <div style={{lineHeight: "40px"}}>Click to add an emoji: </div>
                            <div className='emojiChoice' onClick={() => addEmoji("👟")}>👟</div>
                            <div className='emojiChoice' onClick={() => addEmoji("🚲")}>🚲</div>
                            <div className='emojiChoice' onClick={() => addEmoji("🚘")}>🚘</div>
                            <div className='emojiChoice' onClick={() => addEmoji("🏍️")}>🏍️</div>
                            <div className='emojiChoice' onClick={() => addEmoji("🚕")}>🚕</div>
                            <div className='emojiChoice' onClick={() => addEmoji("🛺")}>🛺</div>
                            <div className='emojiChoice' onClick={() => addEmoji("🚐")}>🚐</div>
                            <div className='emojiChoice' onClick={() => addEmoji("🚌")}>🚌</div>
                            <div className='emojiChoice' onClick={() => addEmoji("🚃")}>🚃</div>
                            <div className='emojiChoice' onClick={() => addEmoji("🚈")}>🚈</div>
                            <div className='emojiChoice' onClick={() => addEmoji("🚄")}>🚄</div>
                            <div className='emojiChoice' onClick={() => addEmoji("🛻")}>🛻</div>
                            <div className='emojiChoice' onClick={() => addEmoji("🚚")}>🚚</div>
                            <div className='emojiChoice' onClick={() => addEmoji("🚛")}>🚛</div>
                        </div>
                        <div style={{textAlign: "center", marginTop: "10px"}}>
                            <Button variant="primary" type="submit">
                                Add new category
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseAddCustomType}>
                    Close
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal size="lg" centered show={showInfo} onHide={handleCloseInfo}>
                <Modal.Header closeButton>
                    <Modal.Title>Categories of transport</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {Object.entries(defaultVehiclesTooltips).map((key, index) => <p key={index}><b>{key[0]} :</b> {key[1]}</p>)}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseInfo}>
                    Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
