import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useParams, useNavigate } from "react-router-dom"
import {Table, Button, Badge, Form, Modal} from 'react-bootstrap'
import {InputInventoryStep1, InputInventoryStep7, FuelType, ProjectType, TotalEnergyAndEmissions, ModalShare, EmissionParams} from '../../frontendTypes'
import ChoiceModal from '../../components/ChoiceModal'

import '../Project.css'
import DescAndNav from '../../components/DescAndNav'
import ValidSource from '../../components/ValidSource'
import ProjectStepContainerWrapper from '../../components/ProjectStepContainerWrapper'
import { Cell, LabelList, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import TdDiagonalBar from '../../components/TdDiagonalBar'

export default function InventoryStep7(){
    const { keycloak, initialized } = useKeycloak();
    const navigate = useNavigate()
    const params = useParams();
    const [inputData, setInputData] = useState({} as InputInventoryStep7)
    const [project, setProject ] = useState({} as ProjectType)
    const projectId = params.projectId
    const [ showSourceModal, setShowSourceModal ] = useState(false)
    const [ currentFType, setCurrentFType ] = useState("" as FuelType)
    const [ showMethodologyModal, setShowMethodologyModal ] = useState(false)
    const [ showEmissionFactorsModal, setShowEmissionFactorsModal ] = useState(false)
    const [ totalEnergyAndEmissions, setTotalEnergyAndEmissions] = useState({TTW: {} as TotalEnergyAndEmissions, WTW:  {} as TotalEnergyAndEmissions})
    const [ emissionFactorsWTWComputedForElectric, setEmissionFactorsWTWComputedForElectric] = useState({ElectricRail: {} as EmissionParams, ElectricRoad: {} as EmissionParams})
    const [ modalShare, setModalShare] = useState({} as ModalShare)
    const [ ttwOrWtw, setTtwOrWtw ] = useState("TTW" as "TTW" | "WTW")
    const defaultColors = ["#2CB1D5", "#A2217C", "#808080", "#67CAE4", "#CE8DBB", "#B3B3B3", "#C5E8F2", "#EBD1E1", "#E6E6E6"]
    const stepNumber = 7
    useEffect(() => {
        if (initialized && keycloak.authenticated){
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
                    let init:InputInventoryStep7 = {
                        emissionFactors: data.project.stages?.Inventory?.[0]?.steps?.[stepNumber]?.emissionFactors || {
                            "WTW": {
                                "Gasoline": {lowerHeatingValue: "43.2", density: "0.745", pci: "32.184", ges: "89400", source: ''},
                                "Diesel": {lowerHeatingValue: "43.1", density: "0.832", pci: "35,8592", ges: "90400", source: ''},
                                "CNG": {lowerHeatingValue: "45.1", density: "1", pci: "45.1", ges: "68100", source: ''},
                                "LPG": {lowerHeatingValue: "46", density: "0.522193211488251", pci: "24.020887728", ges: "75300", source: ''},
                                "LNG": {lowerHeatingValue: "45.1", density: "0.39", pci: "17.589", ges: "80270", source: ''},
                                "Hybrid": {lowerHeatingValue: "43.2", density: "0.745", pci: "32.184", ges: "89400", source: ''},
                                "Electric": {lowerHeatingValue: "3.6", density: "1", pci: "3.6", ges: "20556", source: ''},
                                "Hydrogen": {lowerHeatingValue: "119.88", density: "1", pci: "119.88", ges: "132900", source: ''},
                                "None": {lowerHeatingValue: "0", density: "0", pci: "0", ges: "0", source: ''}
                            },
                            "TTW": {
                                "Gasoline": {lowerHeatingValue: "43.2", density: "0.745", pci: "32.184", ges: "75200", source: ''},
                                "Diesel": {lowerHeatingValue: "43.1", density: "0.832", pci: "35,8592", ges: "74500", source: ''},
                                "CNG": {lowerHeatingValue: "45.1", density: "1", pci: "45.1", ges: "59400", source: ''},
                                "LPG": {lowerHeatingValue: "46", density: "0.522193211488251", pci: "24.020887728", ges: "67300", source: ''},
                                "LNG": {lowerHeatingValue: "45.1", density: "0.39", pci: "17.589", ges: "59420", source: ''},
                                "Hybrid": {lowerHeatingValue: "43.2", density: "0.745", pci: "32.184", ges: "75200", source: ''},
                                "Electric": {lowerHeatingValue: "3.6", density: "1", pci: "3.6", ges: "0", source: ''},
                                "Hydrogen": {lowerHeatingValue: "119.88", density: "1", pci: "119.88", ges: "0", source: ''},
                                "None": {lowerHeatingValue: "0", density: "0", pci: "0", ges: "0, source: ''"}
                            }
                        },
                        note: data.project.stages?.Inventory?.[0]?.steps?.[stepNumber]?.note || undefined
                    }
                    
                    setInputData(init)
                })
                fetchResults()
            }
            if (initialized && !keycloak.authenticated){
                navigate('/')
            }
    }, [keycloak, initialized, projectId, navigate])
    const fetchResults = () => {
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token }
        };
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + "/Inventory/0/results", requestOptions)
            .then(response => {
                return response.json()
            })
            .then(data => {
                console.log("get inv results reply", data)
                setTotalEnergyAndEmissions({
                    WTW: data.totalEnergyAndEmissionsWTW,
                    TTW: data.totalEnergyAndEmissionsTTW
                })
                setEmissionFactorsWTWComputedForElectric(data.emissionFactorsWTWComputedForElectric)
                setModalShare(data.modalShare)
            })
    }
    const updateInput = (ftype: FuelType, param: "lowerHeatingValue" | "density" | "pci" | "ges", value: string, wtwOrTtw?: "WTW" | "TTW", ) => {
        setInputData((prevInputData) => {
            let tmp = {...prevInputData}
            if (!wtwOrTtw) {
                tmp.emissionFactors.WTW[ftype][param] = value
                tmp.emissionFactors.TTW[ftype][param] = value
                if (param === 'lowerHeatingValue' || param === 'density') {
                    tmp.emissionFactors.WTW[ftype]['pci'] = (parseFloat(tmp.emissionFactors.WTW[ftype].density) * parseFloat(tmp.emissionFactors.WTW[ftype].lowerHeatingValue)).toString()
                    tmp.emissionFactors.TTW[ftype]['pci'] = (parseFloat(tmp.emissionFactors.WTW[ftype].density) * parseFloat(tmp.emissionFactors.WTW[ftype].lowerHeatingValue)).toString()
                }
            } else {
                tmp.emissionFactors[wtwOrTtw][ftype][param] = value
            }
            return tmp
        })
    }
    const configureSource = (ftype: FuelType) => {
        setCurrentFType(ftype)
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
            tmp.emissionFactors.TTW[currentFType].source = source
            tmp.emissionFactors.WTW[currentFType].source = source
            return tmp
        })
    }
    const setNote = (note: string | undefined) => {
        setInputData((prevInputData: any) => {
            return {
                ...prevInputData,
                note: note
            }
        })
    }
    const nextTrigger = () => {
        // Nothing should have to be saved before moving to next step
        navigate('/project/' + projectId + '/Inventory/step/' + (stepNumber + 1))
    }
    const saveEmissionFactors = () => {
        // Error detection

        // save data and nav to next step
        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keycloak.token },
            body: JSON.stringify({ inputData: inputData})
        };
        fetch(process.env.REACT_APP_BACKEND_API_BASE_URL + '/api/project/' + projectId + '/Inventory/0/step/' + stepNumber, requestOptions)
            .then(response => response.json())
            .then(() => {
                // some err handling ?
                setShowEmissionFactorsModal(false)
                fetchResults()
            });
    }
    const emissionsPieData = [].concat.apply([], Object.keys(totalEnergyAndEmissions[ttwOrWtw]).map((vtype, index) => {
        let res = []
        const fuels = totalEnergyAndEmissions[ttwOrWtw][vtype]
        const ftypes = Object.keys(fuels)
        for (let i = 0; i < ftypes.length; i++) {
            const ftype = ftypes[i] as FuelType
            const co2 = fuels[ftype]?.co2[0] || ''
            if (co2)
                res.push({name: vtype + ", " + ftype, value: co2})
        }
        return res
    })as any[])
    return (
        <>
            <ProjectStepContainerWrapper project={project} stage="Inventory" currentStep={stepNumber}>
                <h1>Results</h1>
                <DescAndNav 
                    prevNav={{link: '/project/' + project.id + '/Inventory/step/' + (stepNumber - 1), content: "<- Prev", variant: "secondary"}}
                    nextNav={{trigger: nextTrigger, content: "Next ->", variant: "primary"}}
                >
                    <p>
                        Emission factors are the last data you need to complete your GHG emissions calculation. Specific GHG emission factors (in CO2eq/MJ) apply according to the different fuel types (gasoline, diesel, CNG, LNG).
                    </p>
                </DescAndNav>
                <p>
                    The chart already integrates international ones that you can use as default values if you don’t have specific values.
                </p>
                <p>
                    We would recommend to check out the <Button variant="link" onClick={e => setShowMethodologyModal(true)} style={{padding: "0"}}>🛈 methodology used</Button> to obtain those factors first.
                </p>
                <div>
                    {ttwOrWtw === "TTW" && <p>Results are computed using the Tank to Wheel (TTW) approach, <Button variant="link" onClick={e=>setTtwOrWtw("WTW")} style={{padding: "0"}}>click here</Button> to switch to the Well To Wheel (WTW) approach.</p>}
                    {ttwOrWtw === "WTW" && <p>Results are computed using the Well to Wheel (WTW) approach, <Button variant="link" onClick={e=>setTtwOrWtw("TTW")} style={{padding: "0"}}>click here</Button> to switch to the Tank To Wheel (TTW) approach.</p>}
                </div>
                <h2>GHG emissions</h2>
                <Table bordered>
                    <thead>
                        <tr>
                            <th className="item-sm">🛈 Vehicle</th>
                            <th className="item-sm">🛈 Fuel</th>
                            <th className="item-sm">🛈 Emission Factor (kg/TJ) ({ttwOrWtw})</th>
                            <th className="item-sm">🛈 GHG emissions (1000t GHG) ({ttwOrWtw})</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(totalEnergyAndEmissions[ttwOrWtw]).map((vtype, index) => {
                            const fuels = totalEnergyAndEmissions[ttwOrWtw][vtype]
                            const ftypes = Object.keys(fuels)
                            let fuelJsx = []
                            for (let i = 0; i < ftypes.length; i++) {
                                const ftype = ftypes[i] as FuelType
                                const co2 = fuels[ftype]?.co2 || ''
                                let ges = inputData.emissionFactors[ttwOrWtw][ftype].ges
                                if (ftype === "Electric" && ttwOrWtw === "WTW") {
                                    const inputInventoryStep1 = project.stages.Inventory[0].steps[1] as InputInventoryStep1
                                    if (inputInventoryStep1.vtypes[vtype].network === "rail") {
                                        ges = emissionFactorsWTWComputedForElectric.ElectricRail.ges
                                    } else {
                                        ges = emissionFactorsWTWComputedForElectric.ElectricRoad.ges
                                    }
                                }
                                fuelJsx.push(<tr key={vtype + ftype}>
                                    {i===0 && <td rowSpan={ftypes.length} style={{verticalAlign: "top"}}><Badge bg="disabled">{vtype}</Badge></td>}
                                    <td><Badge bg="disabled">{ftype}</Badge></td>
                                    <td>{ges}</td>
                                    <td>{co2}</td>
                                </tr>)
                            }
                            return [
                                fuelJsx
                            ]
                        })}
                    </tbody>
                </Table>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart width={400} height={300}>
                    <Pie
                        dataKey="value"
                        data={emissionsPieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={(entry) => entry.name + ": " + Math.round(entry.value) + " 1000t GHG"}
                    >
                        {emissionsPieData.map((entry, index) => (<Cell key={index} fill={defaultColors[index]}></Cell>))}
                    </Pie>
                    <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <Button variant="link" onClick={e => setShowEmissionFactorsModal(true)} style={{padding: "0"}}>✍️ Edit GHG emission factors</Button>
                <h2>Modal Share</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart width={400} height={300}>
                    <Pie
                        dataKey="value"
                        isAnimationActive={false}
                        data={Object.keys(modalShare).map((vtype, index) => ({name: vtype, value: Math.round(modalShare[vtype][0] * 100)}))}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={(entry) => entry.name + ": " + entry.value + "%"}
                    >
                        {Object.keys(modalShare).map((vtype, index) => (<Cell key={index} fill={defaultColors[index]}></Cell>))}
                    </Pie>
                    <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </ProjectStepContainerWrapper>
            <ChoiceModal 
                showModal={showSourceModal} 
                setShowModal={setShowSourceModal} 
                availableChoices={(project?.sources || []).map(source => source.value)}
                callback={addSourceModalCallback}
            ></ChoiceModal>
            <Modal size="lg" centered show={showMethodologyModal} onHide={() => setShowMethodologyModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Emission factors methodology</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>GHG emissions consider CO2, CH4 and N20 that are transformed into gCO2eq/MJ.</p>
                    <p>CO2eq is an index created by IPCC to simplify the comparison and cumulate all of the gases in one index. In order to obtain this data, you need to convert other gases emissions in CO2 emissions, multiplying the emission factors by the Global Warming Potential of the gas. It is a measure of how much energy the emissions of 1 ton of a gas will absorb over a given period of time, relative to the emissions of 1 ton of carbon dioxide (CO2) (EPA, 2022).</p>
                    <p>CH4 have a GWP of 28 years average and N20 have a GWP of 265 average. This means that 1ton of CH4 emitted represents 28 tons of CO2.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowMethodologyModal(false)}>
                    Close
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal size="xl" centered show={showEmissionFactorsModal} onHide={() => setShowEmissionFactorsModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Emission factors</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table bordered>
                        <thead>
                            <tr>
                                <th className="item-sm">🛈 Fuel</th>
                                <th className="item-sm">Src</th>
                                <th className="item-sm">🛈 Lower heating value (TJ/1000t or MJ/kWh)</th>
                                <th className="item-sm">🛈 Fuel density (kg/kg or kg/l)</th>
                                <th className="item-sm">🛈 CO2e TTW (kg/Tj)</th>
                                <th className="item-sm">🛈 CO2e WTW (kg/Tj)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(inputData.emissionFactors?.WTW || {}).filter(ftypeString => ftypeString !== "None").map((ftypeString, index) => {
                                const ftype = ftypeString as FuelType
                                const fuel = inputData.emissionFactors.WTW[ftype]
                                return <tr key={index}>
                                        <td style={{verticalAlign: "top"}}><Badge bg="disabled">{ftype}</Badge></td>
                                        <td>
                                            {fuel.source 
                                            ? <ValidSource source={fuel.source} onClick={(e:any) => configureSource(ftype)}/>
                                            : <Button variant="action" onClick={e => configureSource(ftype)}>+</Button>}
                                        </td>
                                        <td><Form.Control value={fuel.lowerHeatingValue} onChange={e => updateInput(ftype, "lowerHeatingValue", e.target.value)}></Form.Control></td>
                                        <td><Form.Control value={fuel.density} onChange={e => updateInput(ftype, "density", e.target.value)}></Form.Control></td>
                                        {ftype !== "Electric" 
                                            ? <td><Form.Control value={inputData.emissionFactors.TTW[ftype].ges} onChange={e => updateInput(ftype, "ges", e.target.value, 'TTW')}></Form.Control></td>
                                            : <TdDiagonalBar></TdDiagonalBar>
                                        }
                                        {ftype !== "Electric" 
                                            ? <td><Form.Control value={inputData.emissionFactors.WTW[ftype].ges} onChange={e => updateInput(ftype, "ges", e.target.value, 'WTW')}></Form.Control></td>
                                            : <TdDiagonalBar></TdDiagonalBar>
                                        }
                                    </tr>
                            })}
                        </tbody>
                    </Table>
                    {inputData.note === undefined 
                        ? <Button variant="link" onClick={e=>setNote("")}>+ Add a note</Button>
                        : <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                            <Form.Label><Button variant="link" onClick={e=>setNote(undefined)}>User note X</Button></Form.Label>
                            <Form.Control as="textarea" rows={3} value={inputData.note} onChange={e => setNote(e.target.value)} />
                        </Form.Group>
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEmissionFactorsModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={() => saveEmissionFactors()}>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
