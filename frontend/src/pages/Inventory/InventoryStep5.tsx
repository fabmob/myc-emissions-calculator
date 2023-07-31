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
import ItemWithOverlay from '../../components/ItemWithOverlay'
import EditEmissionFactors from '../../components/EditEmissionFactors'

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
                    prevNav={{link: '/project/' + project.id + '/Inventory/step/' + (stepNumber - 1), content: "<- Prev.", variant: "secondary"}}
                    nextNav={{trigger: nextTrigger, content: "Next ->", variant: "primary"}}
                >
                    <div className="text desc">
                        <p>
                            The top down calculation is a well-known validation approach based on the <Button variant="link" onClick={e => setShowEnergySalesModal(true)} style={{padding: "0"}}><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>energy sales</span></span></Button> on a given territory to evaluate your bottom-up results.
                        </p>                
                        <p>
                            It is particularly adapted for NUMPs, since it is easier to get the energy balance data at a national scale - but you can also use it if you have the local data.
                        </p>
                        <p>
                            Differences within a range of +/- 10% are quitte common and should not be considered as error but as uncertainty. Check out the <Button variant="link" onClick={e => setShowPossibleReasonsModal(true)} style={{padding: "0"}}><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>possible reasons</span></span></Button> for uncertainty, for both calculation approach.
                        </p>
                    </div>
                </DescAndNav>
                <h3>Energy balance</h3>
                <Table bordered>
                    <thead>
                        <tr>
                            <th className="item-sm"><ItemWithOverlay overlayContent="Energy stats sources usually differ if network is road or rail"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Network</span></span></ItemWithOverlay></th>
                            <th className="item-sm"><ItemWithOverlay overlayContent="Fuels used by network type"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Fuels</span></span></ItemWithOverlay></th>
                            <th className="item-sm"><ItemWithOverlay overlayContent="Source of energy value, click the blue + button to add a source"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Src</span></span></ItemWithOverlay></th>
                            <th className="item-sm">
                                <ItemWithOverlay overlayContent="Energy balance data (1000 Tons of oil equivalent) are based on the total fuel sales within the country. According to the IPCC guidelines 2006, the final energy consumption for the GHG inventory should be calculated as follow: production + import - export - international bunkers - stock change">
                                <span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Energy balance (1000 TOE)</span></span>
                                </ItemWithOverlay>
                            </th>
                            <th className="item-sm">
                                <ItemWithOverlay overlayContent={
                                    <div>
                                        Energy balance (1000 Tons of oil equivalent) computed by the tool, using previous steps inputs. Values for each fuel are computed as
                                        <div style={{backgroundColor: "#C5E8F2", padding: "10px", margin: "10px 0px 10px 0px"}}>
                                            <Badge bg="disabled"><span className="item"><span>Fuel lower heating value (TJ/1000t)</span></span></Badge> / 10^6 x <Badge bg="disabled"><span className="item"><span>Fuel density (kg/kg or kg/l)</span></span></Badge> x <Badge bg="disabled"><span className="item"><span>Input VKT per fuel (Mkm)</span></span></Badge> x 10^6 x <Badge bg="disabled"><span className="item"><span>Fuel consumption factor (l-kg-kwh/100km)</span></span></Badge> / 100 / <Badge bg="disabled"><span className="item"><span>TOE factor (0.041868 TJ)</span></span></Badge> / 1000
                                        </div>
                                        Lower heating value and fuel density use default values that can be edited at a later step.
                                    </div>
                                }>
                                    <span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Calculated (1000 TOE)</span></span>
                                </ItemWithOverlay>
                            </th>
                            <th className="item-sm">
                            <ItemWithOverlay overlayContent={
                                    <div>
                                        Difference between energy balance coming from energy sales and calculation. 
                                        <div style={{backgroundColor: "#C5E8F2", padding: "10px", margin: "10px 0px 10px 0px"}}>
                                            <Badge bg="disabled"><span className="item"><span>Calculated</span></span></Badge> x 100 / <Badge bg="disabled"><span className="item"><span>Energy balance</span></span></Badge> - 100
                                        </div>
                                        Differences within a range of +/- 10% are quitte common and should not be considered as error but as uncertainty.
                                    </div>
                                }>
                                    <span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Gap (%)</span></span>
                                </ItemWithOverlay>
                            </th>
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
                                    {i===0 && <td rowSpan={availableFtypes.length} style={{verticalAlign: "top"}}><Badge bg="disabled"><span className="item"><span>{networkName}</span></span></Badge></td>}
                                    <td><Badge bg="disabled"><span className="item"><span>{ftype}</span></span></Badge></td>
                                    <td>
                                        {source 
                                        ? <ValidSource source={source} onClick={(e:any) => configureSource("energy", networkName, ftype)}/>
                                        : <Button variant="action" onClick={e => configureSource("energy", networkName, ftype)}><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#plus"}/></svg></span></Button>}
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
                <h3>Emissions</h3>
                <Table bordered>
                    <thead>
                        <tr>
                            <th className="item-sm"><ItemWithOverlay overlayContent="Energy stats sources usually differ if network is road or rail"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Network</span></span></ItemWithOverlay></th>
                            <th className="item-sm"><ItemWithOverlay overlayContent="Fuels used by network type"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Fuels</span></span></ItemWithOverlay></th>
                            <th className="item-sm"><ItemWithOverlay overlayContent="Source of emission value, click the blue + button to add a source"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Src</span></span></ItemWithOverlay></th>
                            <th className="item-sm">
                                <ItemWithOverlay overlayContent="Emissions data (1000 tons of greenhouse gases). It should be proportional to energy balance, if available">
                                <span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Emissions (1000t GHG)</span></span>
                                </ItemWithOverlay>
                            </th>
                            <th className="item-sm">
                                <ItemWithOverlay overlayContent={
                                    <div>
                                        Emissions (1000 tons of greenhouse gases) computed by the tool, using previous steps inputs. Values for each fuel are computed as
                                        <div style={{backgroundColor: "#C5E8F2", padding: "10px", margin: "10px 0px 10px 0px"}}>
                                        <Badge bg="disabled"><span className="item"><span>Fuel lower heating value (TJ/1000t)</span></span></Badge> / 10^6 x <Badge bg="disabled"><span className="item"><span>Fuel density (kg/kg or kg/l)</span></span></Badge> x <Badge bg="disabled"><span className="item"><span>Input VKT per fuel (Mkm)</span></span></Badge> x 10^6 x <Badge bg="disabled"><span className="item"><span>Fuel consumption factor (l-kg-kwh/100km)</span></span></Badge> / 100 x <Badge bg="disabled"><span className="item"><span>Fuel emission factor (kg/TJ)</span></span></Badge> / 10^6
                                        </div>
                                        Lower heating value, fuel density and fuel emission factors use default values that can be edited at a later step.
                                    </div>
                                }>
                                    <span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Calculated (1000t GHG)</span></span>
                                </ItemWithOverlay>
                            </th>
                            <th className="item-sm">
                            <ItemWithOverlay overlayContent={
                                    <div>
                                        Difference between emissions comming from energy sales and calculation. 
                                        <div style={{backgroundColor: "#C5E8F2", padding: "10px", margin: "10px 0px 10px 0px"}}>
                                            <Badge bg="disabled"><span className="item"><span>Calculated</span></span></Badge> x 100 / <Badge bg="disabled"><span className="item"><span>Emissions</span></span></Badge> - 100
                                        </div>
                                        Differences within a range of +/- 10% are quitte common and should not be considered as error but as uncertainty.
                                    </div>
                                }>
                                    <span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Gap (%)</span></span>
                                </ItemWithOverlay>
                            </th>
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
                                const value = inputData.emissions?.[networkName]?.fuels[ftype]?.value || ''
                                const source = inputData.emissions?.[networkName]?.fuels[ftype]?.source
                                fuelJsx.push(<tr key={net + ftype}>
                                    {i===0 && <td rowSpan={availableFtypes.length} style={{verticalAlign: "top"}}><Badge bg="disabled"><span className="item"><span>{networkName}</span></span></Badge></td>}
                                    <td><Badge bg="disabled"><span className="item"><span>{ftype}</span></span></Badge></td>
                                    <td>
                                        {source 
                                        ? <ValidSource source={source} onClick={(e:any) => configureSource("emissions", networkName, ftype)}/>
                                        : <Button variant="action" onClick={e => configureSource("emissions", networkName, ftype)}><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#plus"}/></svg></span></Button>}
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
                        <span className="item"><span>Close</span></span>
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
                        <span className="item"><span>Close</span></span>
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
