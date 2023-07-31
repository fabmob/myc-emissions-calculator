import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useParams, useNavigate } from "react-router-dom"
import {Table, Button, Badge, Modal, Alert, Stack} from 'react-bootstrap'
import {FuelType, InputInventoryStep1, ProjectType} from '../../frontendTypes'
import ChoiceModal from '../../components/ChoiceModal'

import '../Project.css'
import DescAndNav from '../../components/DescAndNav'
import ProjectStepContainerWrapper from '../../components/ProjectStepContainerWrapper'
import ItemWithOverlay from '../../components/ItemWithOverlay'

const defaultVehiclesParams : {[key: string]: {desc: string, network: "road" | "rail", type: "freight" | "public transport" | "private transport", fuels?: {}}} = {
    "👟 Walking": {
        desc: 'Walking',
        network: "road",
        type: "private transport",
        fuels: {"None": true}
    },
    "🚲 Cycling": {
        desc: 'Cycling and other Non Motorised Transport like small-wheeled transport (e.g.skateboards, e-scooters...)',
        network: "road",
        type: "private transport",
        fuels: {"None": true}
    },
    "🚲 Cargo bike": {
        desc: 'Cycle designed for transporting loads',
        network: "road",
        type: "freight",
        fuels: {"Electric": true}
    },
    "🚘 Private car": {
        desc: 'Any motor vehicle intended for passenger transport, the seat capacity does not exceed nine seats (including driver), the total permissible gross weight does not exceed 3,5t.',
        network: "road",
        type: "private transport"
    },
    "🏍️ Motorcycle": {
        desc: 'A two-wheeled vehicle with an engine.',
        network: "road",
        type: "private transport"
    },
    "🚕 Individual taxi": {
        desc: 'Cars which transport passengers in return for payment of a fare and which are typically fitted with a taximeter.',
        network: "road",
        type: "public transport"
    },
    "🛺 Motorcycle taxi": {
        desc: 'Motorcycles which transport passengers in return for payment of a fare (e.g. Go-jek, Grab).',
        network: "road",
        type: "public transport"
    },
    "🚐 Minibus": {
        desc: 'Any motor vehicle intended for the collective transport of persons whose number of seats is less than nine, including hirings, collective taxis and rural transportation.',
        network: "road",
        type: "public transport"
    },
    "🚌 Bus": {
        desc: 'Any motor vehicle intended for the collective transport of persons, the number of seats of which is greater than nine or the permissible total weight exceeds 3.5t.',
        network: "road",
        type: "public transport"
    },
    "🚌 Coach": {
        desc: 'Bus used for longer-distance service.',
        network: "road",
        type: "public transport"
    },
    "🚌 Bus rapid transit": {
        desc: 'Bus Rapid Transit (BRT) is a high-quality bus-based transit system. It is typically specified with dedicated lanes, iconic stations, off-board fare collection, and fast and frequent operations.',
        network: "road",
        type: "public transport"
    },
    "🚄 Long distance train": {
        desc: 'Passenger train mainly traveling outside the city - long distance train',
        network: "rail",
        type: "public transport"
    },
    "🚃 Urban train": {
        desc: 'Passenger train mainly traveling within the city territory - short distance train.',
        network: "rail",
        type: "public transport"
    },
    "🚈 Metro": {
        desc: 'Passenger train mainly traveling within the city territory - Tram and Metro.',
        network: "rail",
        type: "public transport"
    },
    "🛺 Very light LCV": {
        desc: "A mostly three-wheeled motorized vehicle used for goods transport",
        network: "road",
        type: "freight"
    },
    "🛻 LCV": {
        desc: "Motor vehicle intended for the transport of freight, the permissible gross weight does not exceed 3.5t",
        network: "road",
        type: "freight"
    },
    "🚚 Solo truck": {
        desc: "Motor vehicle intended for the transport of freight, the permissible load is up to 10t",
        network: "road",
        type: "freight"
    },
    "🚛 Articulated truck": {
        desc: "Motor vehicle intended for the transport of freight and the total authorized load exceeds 10t. Trucks consist of trucks and tractors (truck with trailer)",
        network: "road",
        type: "freight"
    },
    "🚄 Freight train": {
        desc: "Any freight train, usually for long distance transport",
        network: "rail",
        type: "freight"
    }
}
export default function InventoryStep1(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    const params = useParams();
    const [inputData, setInputData ] = useState({vtypes: {}, note: undefined} as InputInventoryStep1)
    const [project, setProject ] = useState({} as ProjectType)
    const projectId = params.projectId
    const [error, setError] = useState("")
    const [ showAddVehicleModal, setShowAddVehicleModal ] = useState(false)
    const [ showAddFuelModal, setShowAddFuelModal ] = useState(false)
    const [ showNetworkModal, setShowNetworkModal ] = useState(false)
    const [ showTypeModal, setShowTypeModal ] = useState(false)
    const [ currentVtype, setCurrentVtype ] = useState("")
    const [showInfo, setShowInfo] = useState(false);
    const handleCloseInfo = () => setShowInfo(false);
    const stepNumber = 1
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
                    if (data.project.stages['Inventory'][0]?.steps[stepNumber]){
                        setInputData(data.project.stages['Inventory'][0]?.steps[stepNumber])
                    }
                });
            }
    }, [keycloak, initialized, projectId, navigate])

    const addVehicle = (vtype: string) => {
        setError("")
        setInputData((prevInputData) => {
            return {
                ...prevInputData,
                vtypes: {
                    ...prevInputData.vtypes,
                    [vtype]: {
                        network: defaultVehiclesParams[vtype]?.network || "road",
                        type: defaultVehiclesParams[vtype]?.type || "private transport",
                        fuels: defaultVehiclesParams[vtype]?.fuels || {}
                    }
                }
            }
        })
    }
    const removeVehicle = (vtype: string) => {
        setInputData((prevInputData) => {
            const tmp = {...prevInputData}
            delete tmp.vtypes[vtype]
            return tmp
        })
    }
    const fuelTrigger = (vtype: string) => {
        setShowAddFuelModal(true)
        setCurrentVtype(vtype)
    }
    const addFuel = (ftype: string) => {
        setError("")
        setInputData((prevInputData) => {
            let tmp = {...prevInputData}
            tmp.vtypes[currentVtype].fuels[ftype as FuelType] = true
            return tmp
        })
    }
    const removeFuel = (vtype: string, ftype: FuelType) => {
        setInputData((prevInputData) => {
            const tmp = {...prevInputData}
            delete tmp.vtypes[vtype].fuels[ftype]
            return tmp
        })
    }
    const networkTrigger = (vtype: string) => {
        setShowNetworkModal(true)
        setCurrentVtype(vtype)
    }
    const editNetwork = (network: string) => {
        setInputData((prevInputData) => {
            let tmp = {...prevInputData}
            tmp.vtypes[currentVtype].network = network as "road" | "rail"
            return tmp
        })
    }
    const typeTrigger = (vtype: string) => {
        setShowTypeModal(true)
        setCurrentVtype(vtype)
    }
    const editType = (vehicleType: string) => {
        setInputData((prevInputData) => {
            let tmp = {...prevInputData}
            tmp.vtypes[currentVtype].type = vehicleType as "freight" | "public transport" | "private transport"
            return tmp
        })
    }
    const nextTrigger = () => {
        // Error detection
        const vtypes = Object.keys(inputData.vtypes)
        if (vtypes.length === 0) {
            setError("Error: Please add at least one vehicle")
            return
        }
        for (let i = 0; i < vtypes.length; i++) {
            const vtype = vtypes[i]
            const vehicle = inputData.vtypes[vtype]
            const fuels = Object.keys(vehicle.fuels)
            if (fuels.length === 0) {
                setError("Error: At least one vehicle is missing a fuel")
                return
            }
        }
        // save data and nav to next step
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
            body: JSON.stringify({ inputData: inputData})
        };
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/Inventory/0/step/' + stepNumber, requestOptions)
            .then(response => response.json())
            .then(() => navigate('/project/' + projectId + '/Inventory/step/' + (stepNumber + 1)));
    }
    return (
        <>
            <ProjectStepContainerWrapper project={project} stage="Inventory" currentStep={stepNumber} noteValue={inputData.note} setInputData={setInputData}>
                <h1>Vehicles and fuels in use</h1>
                {error && <Alert variant='danger'>{error}</Alert>}
                <DescAndNav 
                    prevNav={{link: '/project/' + project.id + '/Inventory/intro', content: "<- Prev.", variant: "secondary"}}
                    nextNav={{trigger: nextTrigger, content: "Next ->", variant: "primary"}}
                    
                >
                    <div className="text desc">
                        <p>Please define all combinations of vehicle and fuel types to be used in the following steps to calculate GHG emissions. You also need to specify :</p>
                        <ul>
                            <li>if they are using the road or rail network</li>
                            <li>if they are used for public transport, private transport or freight (if one transport mode is used for multiple, create two categories with unique names)</li>
                            <li>the fuel types that are used</li>
                        </ul>
                        <p>You can also add a custom vehicle category below, if you don’t find it in the list. For each category, you will later need to fill the following information: Total vkt, Vehicle occupancy, Fuel consumptions, Vkt breakdown per fuel.</p>
                    </div>
                </DescAndNav>
                <Table bordered>
                    <thead>
                        <tr>
                            <th className="item-sm"><ItemWithOverlay overlayContent="Transport modes, current and expected"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Vehicle</span></span></ItemWithOverlay></th>
                            <th className="item-sm"><ItemWithOverlay overlayContent="Used network, can be road or rail. Create a custom vehicle category to edit this field."><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Network</span></span></ItemWithOverlay></th>
                            <th className="item-sm"><ItemWithOverlay overlayContent="Type of transport, can be public transport, private transport or freight. Create a custom vehicle category to edit this field."><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Type</span></span></ItemWithOverlay></th>
                            <th className="item-sm"><ItemWithOverlay overlayContent="Fuels used by the transport mode, current and expected"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Fuels</span></span></ItemWithOverlay></th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(inputData.vtypes).map((vtype, index) => {
                            const vehicle = inputData.vtypes[vtype]
                            let networkBadge = <Badge bg="info" onClick={e => networkTrigger(vtype)}><span className="item"><span>{vehicle.network} v</span></span></Badge>
                            let typeBadge = <Badge bg="info" onClick={e => typeTrigger(vtype)}><span className="item"><span>{vehicle.type} v</span></span></Badge>
                            if (defaultVehiclesParams[vtype]) {
                                networkBadge = <Badge bg="disabled"><span className="item"><span>{vehicle.network}</span></span></Badge>
                                typeBadge = <Badge bg="disabled"><span className="item"><span>{vehicle.type}</span></span></Badge>
                            }
                            return (<tr key={index}>
                                <td><Badge bg="info" onClick={e=>removeVehicle(vtype)}><span className="item"><span>{vtype}</span><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#times"}/></svg></span></Badge></td>
                                <td>{networkBadge}</td>
                                <td>{typeBadge}</td>
                                <td>
                                    <Stack direction="horizontal" gap={2}>
                                        {Object.keys(vehicle.fuels).map((ftype, index) => (
                                            <Badge key={index} bg="info" onClick={e=>removeFuel(vtype, ftype as FuelType)}><span className="item"><span>{ftype}</span><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#times"}/></svg></span></Badge>
                                        ))}
                                        <Button size="sm" variant="action" onClick={e => fuelTrigger(vtype)}><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#plus"}/></svg></span></Button>
                                    </Stack>
                                </td>
                            </tr>)
                        })}
                        <tr>
                            <td>
                                <Button size="sm" variant="action" onClick={e => setShowAddVehicleModal(true)}><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#plus"}/></svg></span></Button>
                            </td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                    </tbody>
                </Table>
            </ProjectStepContainerWrapper>
            <ChoiceModal 
                showModal={showAddVehicleModal} 
                setShowModal={setShowAddVehicleModal} 
                availableChoices={Object.keys(defaultVehiclesParams).filter(vtype => !inputData.vtypes[vtype])}
                callback={addVehicle}
            ></ChoiceModal>
            <ChoiceModal 
                showModal={showAddFuelModal} 
                setShowModal={setShowAddFuelModal} 
                availableChoices={Object.keys(FuelType).filter(ftype => !inputData.vtypes[currentVtype]?.fuels[ftype as FuelType])}
                callback={addFuel}
                preventCreate={true}
            ></ChoiceModal>
            <ChoiceModal 
                showModal={showNetworkModal} 
                setShowModal={setShowNetworkModal} 
                availableChoices={['road', 'rail'].filter(n => n !== inputData.vtypes[currentVtype]?.network)}
                callback={editNetwork}
                preventCreate={true}
            ></ChoiceModal>
            <ChoiceModal 
                showModal={showTypeModal} 
                setShowModal={setShowTypeModal} 
                availableChoices={["freight", "public transport", "private transport"].filter(n => n !== inputData.vtypes[currentVtype]?.type)}
                callback={editType}
                preventCreate={true}
            ></ChoiceModal>
            <Modal size="lg" centered show={showInfo} onHide={handleCloseInfo}>
                <Modal.Header closeButton>
                    <Modal.Title>Default categories of transport</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {Object.keys(defaultVehiclesParams).map((vtype, index) => <p key={index}><b>{vtype} :</b> {defaultVehiclesParams[vtype].desc}</p>)}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseInfo}>
                        <span className="item"><span>Close</span></span>
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
