import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useParams, useNavigate } from "react-router-dom"
import {Table, Button, Badge, Form, Modal} from 'react-bootstrap'
import {FuelType, InputInventoryStep5, ProjectType} from '../../frontendTypes'
import ChoiceModal from '../../components/ChoiceModal'

import '../Project.css'
import DescAndNav from '../../components/DescAndNav'
import ValidSource from '../../components/ValidSource'
import ProjectStepContainerWrapper from '../../components/ProjectStepContainerWrapper'

export default function InventoryStep5(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    const params = useParams();
    const [inputData, setInputData ] = useState({} as InputInventoryStep5)
    const [project, setProject ] = useState({} as ProjectType)
    const projectId = params.projectId
    const [ showSourceModal, setShowSourceModal ] = useState(false)
    const [ showEnergySalesModal, setShowEnergySalesModal ] = useState(false)
    const [ showPossibleReasonsModal, setShowPossibleReasonsModal ] = useState(false)
    const [ currentType, setCurrentType ] = useState("" as "emissions" | "energy")
    const [ currentNetwork, setCurrentNetwork ] = useState("" as "road" | "rail")
    const [ currentFtype, setCurrentFtype ] = useState("" as FuelType)
    const [ energyAndEmission, setEnergyAndEmission ] = useState({} as InputInventoryStep5)
    const stepNumber = 5
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
                    if (data.project.stages['Inventory'][0]?.steps[stepNumber]) {
                        setInputData(data.project.stages['Inventory'][0]?.steps[stepNumber])
                    } else {
                        let init:InputInventoryStep5 = {emissions: {road: {fuels:{}}, rail: {fuels:{}}}, energy: {road: {fuels:{}}, rail: {fuels:{}}}, note: data.project.stages?.Inventory?.[0]?.steps?.[stepNumber]?.note || undefined}
                        const ftypes = Object.keys(FuelType)
                        for (let i = 0; i < ftypes.length; i++) {
                            const ftype = ftypes[i] as FuelType
                            init.emissions.road.fuels[ftype] = {value: "", source: ""}
                            init.energy.road.fuels[ftype] = {value: "", source: ""}
                            init.emissions.rail.fuels[ftype] = {value: "", source: ""}
                            init.energy.rail.fuels[ftype] = {value: "", source: ""}
                        }
                        setInputData(init)
                    }
                });
                fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/Inventory/0/emissions', requestOptions)
                .then(response => {
                    if (response.status !== 200) {
                        navigate('/')
                    }
                    return response.json()
                })
                .then(data => {
                    console.log("get energy and emission data", data)
                    setEnergyAndEmission(data.energyAndEmissions)
                })
            }
            if (initialized && !keycloak.authenticated){
                navigate('/')
            }
    }, [keycloak, initialized, projectId, navigate])
    const updateInput = (type: "emissions" | "energy", network: "road" | "rail", ftype: FuelType, value: string) => {
        setInputData((prevInputData) => {
            let tmp = {...prevInputData}
            tmp[type][network].fuels[ftype]!.value = value
            return tmp
        })
    }
    const configureSource = (type: "emissions" | "energy", network: "road" | "rail", ftype: FuelType) => {
        setCurrentType(type)
        setCurrentNetwork(network)
        setCurrentFtype(ftype)
        setShowSourceModal(true)
    }
    const addSourceModalCallback = (source: string) => {
        // Check if it's a new source
        if (!project.sources.find(s => s.value === source)) {
            // Call api point if it's the case
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
                body: JSON.stringify({ source: source })
            };
            // TODO: error handling ?
            fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/source', requestOptions)
                .then(response => response.json())
            setProject(prevProject => {
                return {
                    ...prevProject,
                    sources: [{value: source, projectId: 0, sourceId: 0}].concat(prevProject.sources)
                }
            })
        }
        // Add source to proper input
        setInputData((prevInputData) => {
            let tmp = {...prevInputData}
            tmp[currentType][currentNetwork].fuels[currentFtype]!.source = source
            return tmp
        })
    }

    const nextTrigger = () => {
        // Error detection

        // save data and nav to next step
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
            body: JSON.stringify({inputData: inputData})
        };
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/Inventory/0/step/' + stepNumber, requestOptions)
            .then(response => response.json())
            .then(() => navigate('/project/' + projectId + '/Inventory/step/' + (stepNumber + 1)));
    }
    return (
        <>
            <ProjectStepContainerWrapper project={project} stage="Inventory" currentStep={stepNumber} noteValue={inputData.note} setInputData={setInputData}>
                <h1>Top down validation</h1>
                <DescAndNav 
                    prevNav={{link: '/project/' + project.id + '/Inventory/step/' + (stepNumber - 1), content: "<- Prev", variant: "secondary"}}
                    nextNav={{trigger: nextTrigger, content: "Next ->", variant: "primary"}}
                >
                    <p>
                        The top down calculation is a well-known validation approach based on the <Button variant="link" onClick={e => setShowEnergySalesModal(true)} style={{padding: "0"}}>🛈 energy sales</Button> on a given territory to evaluate your bottom-up results.
                    </p>
                </DescAndNav>
                <p>
                    It is particularly adapted for NUMPs, since it is easier to get the energy balance data at a national scale - but you can also use it if you have the local data.
                </p>
                <p>
                    Differences within a range of +/- 10% are quitte common and should not be considered as error but as uncertainty. Check out the <Button variant="link" onClick={e => setShowPossibleReasonsModal(true)} style={{padding: "0"}}>🛈 possible reasons</Button> for uncertainty, for both calculation approach.
                </p>
                <h2>Energy balance</h2>
                <Table bordered>
                    <thead>
                        <tr>
                            <th className="item-sm">🛈 Network</th>
                            <th className="item-sm">🛈 Fuels</th>
                            <th className="item-sm">Src</th>
                            <th className="item-sm">🛈 Energy balance (1000 TOE)</th>
                            <th className="item-sm">🛈 Calculated (1000 TOE)</th>
                            <th className="item-sm">🛈 Gap (%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {["road", "rail"].map((net, index) => {
                            const networkName = net as "road" | "rail"
                            const networkFuels = energyAndEmission.energy?.[networkName].fuels || {}
                            const availableFtypes = Object.keys(networkFuels)
                            let fuelJsx = []
                            for (let i = 0; i < availableFtypes.length; i++) {
                                const ftype = availableFtypes[i] as FuelType
                                const computedValue = parseFloat(networkFuels[ftype]?.value || '0') * 1000 / 41868
                                const value = inputData.energy?.[networkName]?.fuels?.[ftype]?.value || ''
                                const source = inputData.energy?.[networkName]?.fuels?.[ftype]?.source || ''
                                fuelJsx.push(<tr key={net + ftype}>
                                    {i===0 && <td rowSpan={availableFtypes.length} style={{verticalAlign: "top"}}><Badge bg="disabled">{networkName}</Badge></td>}
                                    <td><Badge bg="disabled">{ftype}</Badge></td>
                                    <td>
                                        {source 
                                        ? <ValidSource source={source} onClick={(e:any) => configureSource("energy", networkName, ftype)}/>
                                        : <Button variant="action" onClick={e => configureSource("energy", networkName, ftype)}>+</Button>}
                                    </td>
                                    <td>
                                        <Form.Control value={value} onChange={e => updateInput("energy", networkName, ftype, e.target.value)}></Form.Control>
                                    </td>
                                    <td>
                                        {computedValue}
                                    </td>
                                    <td>{Math.round(computedValue * 100 / parseFloat(value) - 100) || '0'}%</td>
                                </tr>)
                            }
                            return [
                                fuelJsx
                            ]
                        })}
                        
                    </tbody>
                </Table>
                <h2>Emissions</h2>
                <Table bordered>
                    <thead>
                        <tr>
                            <th className="item-sm">🛈 Network</th>
                            <th className="item-sm">🛈 Fuels</th>
                            <th className="item-sm">Src</th>
                            <th className="item-sm">🛈 Emissions (1000t GHG)</th>
                            <th className="item-sm">🛈 Calculated (1000t GHG)</th>
                            <th className="item-sm">🛈 Gap (%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {["road", "rail"].map((net, index) => {
                            const networkName = net as "road" | "rail"
                            const networkFuels = energyAndEmission.emissions?.[networkName].fuels || {}
                            const availableFtypes = Object.keys(networkFuels)
                            let fuelJsx = []
                            for (let i = 0; i < availableFtypes.length; i++) {
                                const ftype = availableFtypes[i] as FuelType
                                const computedValue = networkFuels[ftype]?.value || ''
                                const value = inputData.emissions[networkName].fuels[ftype]?.value || ''
                                const source = inputData.emissions[networkName].fuels[ftype]?.source
                                fuelJsx.push(<tr key={net + ftype}>
                                    {i===0 && <td rowSpan={availableFtypes.length} style={{verticalAlign: "top"}}><Badge bg="disabled">{networkName}</Badge></td>}
                                    <td><Badge bg="disabled">{ftype}</Badge></td>
                                    <td>
                                        {source 
                                        ? <ValidSource source={source} onClick={(e:any) => configureSource("emissions", networkName, ftype)}/>
                                        : <Button variant="action" onClick={e => configureSource("emissions", networkName, ftype)}>+</Button>}
                                    </td>
                                    <td>
                                        <Form.Control value={value} onChange={e => updateInput("emissions", networkName, ftype, e.target.value)}></Form.Control>
                                    </td>
                                    <td>
                                        {computedValue}
                                    </td>
                                    <td>{Math.round(parseFloat(computedValue) * 100 / parseFloat(value) - 100) || '0'}%</td>
                                </tr>)
                            }
                            return [
                                fuelJsx
                            ]
                        })}
                        
                    </tbody>
                </Table>
            </ProjectStepContainerWrapper>
            <ChoiceModal 
                showModal={showSourceModal} 
                setShowModal={setShowSourceModal} 
                availableChoices={(project?.sources || []).map(source => source.value)}
                callback={addSourceModalCallback}
            ></ChoiceModal>
            <Modal size="lg" centered show={showEnergySalesModal} onHide={() => setShowEnergySalesModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Energy sales</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Emissions are calculated using a top-down approach based on statistics on fuel sales in the city. This approach only allows for a rough estimation since a purely sales-based approach does not provide any information on how much of the purchased fuel is actually used within the city. It also does not provide data on the actual transport activities that are related to the city, or their causes - information which is necessary for transport planning. Using energy sales data alone does not adequately monitor the effects of SUMPS, but it can be used to cross-check bottom-up calculations.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEnergySalesModal(false)}>
                    Close
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal size="lg" centered show={showPossibleReasonsModal} onHide={() => setShowPossibleReasonsModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Uncertainty reasons</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Energy balance data are based on the total fuel sales within the country. According to the IPCC guidelines 2006, the final energy consumption for the GHG inventory should be calculated as follow: production + import - export - international bunkers - stock change.</p>
                    <p>One reason why the calculations would be different can be for example, that the energy balance does not include fuels bought in neighboring countries and consumed within the country. The emission inventory report should try explaining gaps and analyze the possibility to minimize the related uncertainties.</p>

                    <p>The main uncertainties for energy balance data are</p>
                    <ul>
                        <li>Wrong allocation of fuels to the sub-transport sectors (e.g. fuel consumption from diesel generators should not be accounted in transport sector) or transport subcategories (i.e. road transportation vs. other transports, domestic use vs. international bunkers)</li>
                        <li>Amount of grey imports (illegally sold fuels, tank-tourism in small or transit-countries)</li>
                    </ul>

                    <p>The main uncertainties for bottom-up fuel consumption data are:</p>
                    <ul>
                        <li>Activity data i.e. fleet composition, number of vehicles or vkt, specific fuel consumption</li>
                        <li>A comparison of different sources can help to identify the range of uncertainties. If identifying the parameter with the highest uncertainties is possible, it makes sense to try adjusting it. For example, the calculated total gasoline consumption for road transport is 30% higher than the value given in the energy balance. Motorcycles consume 50% of motor gasoline and the motorcycle population could not be provided by official statistics but only estimated. In order to minimize the gap for motor gasoline to e.g. 10%, the number of motorcycles could be diminished by 30%. Another common approach is to adjust average vkt in order to match the energy balance results.</li>
                    </ul>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPossibleReasonsModal(false)}>
                    Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
