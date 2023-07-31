import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useParams, useNavigate } from "react-router-dom"
import {Table, Button, Badge, Modal, Form, Alert, Dropdown} from 'react-bootstrap'
import {FuelType, InputInventoryStep2, ProjectType} from '../../frontendTypes'
import ChoiceModal from '../../components/ChoiceModal'

import '../Project.css'
import DescAndNav from '../../components/DescAndNav'
import ValidSource from '../../components/ValidSource'
import TdDiagonalBar from '../../components/TdDiagonalBar'
import PercentInput from '../../components/PercentInput'
import ProjectStepContainerWrapper from '../../components/ProjectStepContainerWrapper'
import ItemWithOverlay from '../../components/ItemWithOverlay'

export default function InventoryStep2(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    const params = useParams();
    const [inputData, setInputData ] = useState({vtypes: {}, note: undefined} as InputInventoryStep2)
    const [project, setProject ] = useState({} as ProjectType)
    const projectId = params.projectId
    const [error, setError] = useState("")
    const [sourceWarning, setSourceWarning] = useState(false)
    const [ showSourceModal, setShowSourceModal ] = useState(false)
    const [ currentVtype, setCurrentVtype ] = useState("")
    const [ currentFtype, setCurrentFtype ] = useState("")
    const [showInfo, setShowInfo] = useState(false);
    const handleCloseInfo = () => setShowInfo(false);
    const [computationApproach, setComputationApproach] = useState("vkt" as "vkt" | "fleet")
    const [showComputationApproach, setShowComputationApproach] = useState(false)
    const handleCloseComputationApproach = () => setShowComputationApproach(false)
    const stepNumber = 2
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
                    let init:InputInventoryStep2 = {
                        vtypes: {},
                        note: data.project.stages?.Inventory?.[0]?.steps?.[stepNumber]?.note || undefined
                    }
                    const inventoryStep1 = data.project.stages?.Inventory?.[0]?.steps?.[1].vtypes || {}
                    const vtypes = Object.keys(inventoryStep1)
                    for (let i = 0; i < vtypes.length; i++) {
                        const vtype = vtypes[i];
                        if (data.project.stages['Inventory'][0]?.steps[stepNumber]?.vtypes[vtype]) {
                            init.vtypes[vtype] = data.project.stages['Inventory'][0]?.steps[stepNumber].vtypes[vtype]
                        } else {
                            init.vtypes[vtype] = {
                                vkt: "0",
                                vktSource: "",
                                fuels: {},
                                fleetStock: "0",
                                fleetMileage: "0"
                            }
                        }
                        const ftypes = Object.keys(inventoryStep1[vtype].fuels || {})
                        for (let i = 0; i < ftypes.length; i++) {
                            const ftype = ftypes[i] as FuelType;
                            if (!data.project.stages['Inventory'][0]?.steps[stepNumber]?.vtypes?.[vtype]?.fuels[ftype]) {
                                init.vtypes[vtype].fuels[ftype] = {
                                    percent: ftypes.length === 1 ? "100" : "",
                                    percentSource: ""
                                }
                            }
                        }
                    }
                    setInputData(init)

                });
            }
    }, [keycloak, initialized, projectId, navigate])
    const updateInputPercent = (vtype: string, ftype: FuelType, percent: string) => {
        setError("")
        setInputData((prevInputData) => {
            let tmp = {...prevInputData}
            tmp.vtypes[vtype].fuels[ftype]!.percent = percent
            return tmp
        })
    }
    const updateInputVkt = (vtype: string, vkt: string) => {
        setInputData((prevInputData) => {
            let tmp = {...prevInputData}
            tmp.vtypes[vtype].vkt = vkt
            return tmp
        })
    }
    const updateInputFleetStock = (vtype: string, fleetStock: string) => {
        setInputData((prevInputData) => {
            let tmp = {...prevInputData}
            let vkt = ""
            if (fleetStock) {
                vkt = (parseFloat(tmp.vtypes[vtype].fleetMileage) * parseFloat(fleetStock)).toString()
            }
            tmp.vtypes[vtype].vkt = vkt
            tmp.vtypes[vtype].fleetStock = fleetStock
            return tmp
        })
    }
    const updateInputFleetMileage = (vtype: string, fleetMileage: string) => {
        setInputData((prevInputData) => {
            let tmp = {...prevInputData}
            let vkt = "";
            if (fleetMileage) {
                vkt = (parseFloat(fleetMileage) * parseFloat(tmp.vtypes[vtype].fleetStock) / 1000000).toString() 
            }
            tmp.vtypes[vtype].vkt = vkt
            tmp.vtypes[vtype].fleetMileage = fleetMileage
            return tmp
        })
    }
    const configureSource = (vtype: string, ftype?: string) => {
        setCurrentVtype(vtype)
        setCurrentFtype(ftype || "")
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
        // Add source to proper input (using currentVtype and currentFtype if any)
        if (currentFtype) {
            const ftype = currentFtype as FuelType
            setInputData((prevInputData) => {
                let tmp = {...prevInputData}
                tmp.vtypes[currentVtype].fuels[ftype]!.percentSource = source
                return tmp
            })
        } else {
            setInputData((prevInputData) => {
                let tmp = {...prevInputData}
                tmp.vtypes[currentVtype].vktSource = source
                return tmp
            })
        }
        setSourceWarning(false)
    }

    const nextTrigger = () => {
        // Error detection
        const vtypes = Object.keys(inputData.vtypes)
        let srcMissing = false
        for (let i = 0; i < vtypes.length; i++) {
            const vtype = vtypes[i]
            const vehicle = inputData.vtypes[vtype]
            const ftypes = Object.keys(vehicle.fuels)
            
            let totalPercent = 0
            if (!vehicle.vktSource) srcMissing = true
            for (let i = 0; i < ftypes.length; i++) {
                const ftype = ftypes[i] as FuelType
                const value = vehicle?.fuels[ftype]?.percent || ''
                totalPercent += parseFloat(value) || 0
                if (!vehicle?.fuels[ftype]?.percentSource) srcMissing = true
            }
            if (totalPercent !== 100) {
                setError("Error: the sum of fuel shares (VKT %) for at least one vehicle is not 100%")
                return
            }
        }
        if (srcMissing && !sourceWarning) {
            setSourceWarning(true)
            return
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
    const ApproachSelector = () => {
        return (
            <div style={{display: "flex", marginBottom: "10px"}}>
                <Button variant="link" onClick={e => setShowComputationApproach(true)} style={{padding: "0", border: "0", marginRight: "5px"}}><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Vehicle mileage</span></span></Button> is computed using the
                <Dropdown onSelect={(key:any) => computationApproach === "vkt" ? setComputationApproach("fleet") : setComputationApproach("vkt")}>
                    <Dropdown.Toggle as={Badge} bg="info" style={{margin: "0 10px 0 10px"}}>
                        {computationApproach === "vkt" ? "Vkt approach" : "Fleet approach"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu style={{padding: "10px"}}>
                        <Dropdown.Item as={Badge} bg="info">
                            {computationApproach === "fleet" ? "Vkt approach" : "Fleet approach"}
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        )
    }
    return (
        <>
            <ProjectStepContainerWrapper project={project} stage="Inventory" currentStep={stepNumber} noteValue={inputData.note} setInputData={setInputData}>
                <h1>Transport activity</h1>
                {error && <Alert variant='danger'>{error}</Alert>}
                {sourceWarning && <Alert variant='warning'>Warning: At least one source is missing. Please add missing sources below or click the Next button again to ignore this warning.</Alert>}
                <DescAndNav 
                    prevNav={{link: '/project/' + project.id + '/Inventory/step/' + (stepNumber - 1), content: "<- Prev.", variant: "secondary"}}
                    nextNav={{trigger: nextTrigger, content: "Next ->", variant: "primary"}}
                    seeMoreCallBack={()=>setShowInfo(true)}
                >
                    <div className="text desc">
                        <p>
                            Mileage is the cornerstorne of the calculation of transport GHG emissions. Once the total vehicle mileage per vehicle category is known, it must be subdivided by fuel type e.g.the share of diesel car on the car category’s total mileage.
                        </p>
                        <p>
                            Please enter the vehicle kilometers travelled (Mio km) for the reference year. The total vkt should comply with the actual transport activity within the city or country territory.
                        </p>
                        <p>
                            Please also enter the percentage of vehicle kilometers travelled (vkt) per fuel type. The sum of fuel shares in each vehicle category must be 100 %.
                        </p>
                    </div>
                </DescAndNav>
                <ApproachSelector></ApproachSelector>
                <Table bordered>
                    <thead>
                        <tr>
                            <th className="item-sm"><ItemWithOverlay overlayContent="Transport modes, current and expected"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Vehicle</span></span></ItemWithOverlay></th>
                            <th className="item-sm"><ItemWithOverlay overlayContent="Fuels used by the transport mode, current and expected"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Fuels</span></span></ItemWithOverlay></th>
                            {computationApproach === "fleet" 
                                ? <th className="item-sm"><ItemWithOverlay overlayContent="Source of vehicle stock and average mileage values, click the blue + button to add a source"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Src</span></span></ItemWithOverlay></th>
                                : <th className="item-sm"><ItemWithOverlay overlayContent="Source of VKT value, click the blue + button to add a source"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Src</span></span></ItemWithOverlay></th>
                            }
                            {computationApproach === "fleet" && <th className="item-sm"><ItemWithOverlay overlayContent="Number of registered vehicles"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Vehicle stock</span></span></ItemWithOverlay></th>}
                            {computationApproach === "fleet" && <th className="item-sm"><ItemWithOverlay overlayContent="Average annual mileage per vehicle"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Avg mileage (km)</span></span></ItemWithOverlay></th>}
                            <th className="item-sm">
                                <ItemWithOverlay overlayContent={
                                    <div>Vehicle kilometers travelled. Values for each fuel are computed as
                                    <div style={{backgroundColor: "#C5E8F2", padding: "10px", margin: "10px 0px 10px 0px"}}><Badge bg="disabled"><span className="item"><span>Input VKT per vehicle (Mkm/y)</span></span></Badge> x <Badge bg="disabled"><span className="item"><span>VKT (%)</span></span></Badge> / 100</div>
                                    Set VKT to zero for vehicles that are not yet used in reference year.
                                    </div>
                                }><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>VKT (Mkm/y)</span></span></ItemWithOverlay>
                            </th>
                            <th className="item-sm"><ItemWithOverlay overlayContent="Source of share of vkt for a given fuel, click the blue + button to add a source"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Src</span></span></ItemWithOverlay></th>
                            <th className="item-sm"><ItemWithOverlay overlayContent="Share of vehicle vkt per fuel, sum should be 100%"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>VKT (%)</span></span></ItemWithOverlay></th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(inputData.vtypes).map((vtype, index) => {
                            const vehicle = inputData.vtypes[vtype]
                            if (!vehicle?.fuels) return <></>
                            const ftypes = Object.keys(vehicle.fuels)
                            let fuelJsx = []
                            let totalPercent = 0
                            const vkt = vehicle.vkt
                            const vktSource = vehicle.vktSource
                            const fleetStock = vehicle.fleetStock
                            const fleetMileage = vehicle.fleetMileage
                            for (let i = 0; i < ftypes.length; i++) {
                                const ftype = ftypes[i] as FuelType
                                const value = vehicle?.fuels[ftype]?.percent || ''
                                totalPercent += parseFloat(value) || 0
                            }
                            for (let i = 0; i < ftypes.length; i++) {
                                const ftype = ftypes[i] as FuelType
                                const value = vehicle?.fuels[ftype]?.percent || ''
                                const percentSource = vehicle?.fuels[ftype]?.percentSource
                            
                                fuelJsx.push(<tr key={vtype + ftype}>
                                    <td><Badge bg="disabled"><span className="item"><span>{ftype}</span></span></Badge></td>
                                    <TdDiagonalBar colSpan={computationApproach === "fleet" ? '3' : '1'}></TdDiagonalBar>
                                    <td>{parseFloat((parseFloat(value) / 100 * parseFloat(vkt)).toFixed(10)) || ""}</td>
                                    <td>
                                        {percentSource 
                                        ? <ValidSource source={percentSource} onClick={(e:any) => configureSource(vtype, ftype)}/>
                                        : <Button variant="action" onClick={e => configureSource(vtype, ftype)}><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#plus"}/></svg></span></Button>}
                                    </td>
                                    <td>
                                        <PercentInput value={value} onChange={(e:any) => updateInputPercent(vtype, ftype, e.target.value)} invalid={totalPercent > 100}></PercentInput>
                                    </td>
                                </tr>)
                            }
                            return [
                                <tr key={vtype}>
                                    <td rowSpan={ftypes.length +1} style={{verticalAlign: "top"}}><Badge bg="disabled"><span className="item"><span>{vtype}</span></span></Badge></td>
                                    <td>All</td>
                                    <td>
                                        {vktSource
                                        ? <ValidSource source={vktSource} onClick={(e:any) => configureSource(vtype)}/>
                                        : <Button variant="action" onClick={e => configureSource(vtype)}><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#plus"}/></svg></span></Button>}
                                    </td>
                                    {computationApproach === "fleet" && <td><Form.Control value={fleetStock} onChange={e => updateInputFleetStock(vtype, e.target.value)}></Form.Control></td>}
                                    {computationApproach === "fleet" && <td><Form.Control value={fleetMileage} onChange={e => updateInputFleetMileage(vtype, e.target.value)}></Form.Control></td>}
                                    {computationApproach === "vkt" && <td><Form.Control value={vkt} onChange={e => updateInputVkt(vtype, e.target.value)}></Form.Control></td>}
                                    {computationApproach === "fleet" && <td>{vkt}</td>}
                                    <TdDiagonalBar></TdDiagonalBar>
                                    <td className={totalPercent > 100 ? "cellError": ""}>{totalPercent || 0}</td>
                                </tr>,
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
            <Modal size="lg" centered show={showInfo} onHide={handleCloseInfo}>
                <Modal.Header closeButton>
                    <Modal.Title>Transport activity information</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>The composition of a city-specific vehicle fleet strongly influences local transport emissions. The more private cars are on the road and the larger or older the vehicles are, the higher their fuel consumption is and the higher the related GHG emissions are. In other words, GHG emissions depend on the vehicle fleet and on the distribution of VKT across the fleet's vehicle mix.</p>
                    <p>Data on the vehicle fleet is generally available from vehicle registration statistics for passenger cars, taxis, trucks, and motorcycles (e-bikes are mostly excluded), which includes technical specifications for the different vehicle types. Once the registered fleet is documented for the base year, e.g. 2015, only newly registered (and deregistered) vehicles have to be monitored each year.</p>
                    <p>If there are no big differences in the fleet compositions across different cities in a country, using national averages for urban fleet composition may be considered. Where the fleet is known to be quite specific, however, these local characteristics should be accounted for, e.g. prosperous metropolitan areas may have a larger number of new and larger cars than less prosperous mid-sized cities with a smaller but older fleet.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseInfo}>
                    <span className="item"><span>Close</span></span>
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal size="lg" centered show={showComputationApproach} onHide={handleCloseComputationApproach}>
                <Modal.Header closeButton>
                    <Modal.Title>There are two possible approaches to calculate vehicle mileage in the tool</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><b>VKT approach :</b> The first possible methodology to calculate vehicle mileage is called vehicle kilometre approach. Data needed for this approach can be provided by a transport planning model or derived from traffic counts. For rail transport with freight and passenger trains, vehicle Stock and average annual mileage (or total mileage) may be available from the national rail operator.</p>
                    <p><b>Fleet approach :</b> The so-called fleet approach is based on activity of vehicles. The number of registered vehicles in the urban area is multiplied with the average annual mileage per vehicle category.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseComputationApproach}>
                    <span className="item"><span>Close</span></span>
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
