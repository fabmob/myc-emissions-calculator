import React, {useState, useEffect} from "react"
import { ProjectType, InputInventoryStep7, FuelType} from "../frontendTypes"
import {Table, Button, Badge, Form, Modal} from 'react-bootstrap'
import ChoiceModal from "./ChoiceModal"
import TdDiagonalBar from "./TdDiagonalBar"
import ValidSource from "./ValidSource"
import ItemWithOverlay from "./ItemWithOverlay"

export default function EditEmissionFactors (props: {
    project: ProjectType,
    stepNumber: number,
    saveSource: Function,
    saveEmissionsFactors: Function,
    inputData: InputInventoryStep7,
    setInputData: React.Dispatch<React.SetStateAction<InputInventoryStep7>>
}) {
    const [ showSourceModal, setShowSourceModal ] = useState(false)
    const [ currentFType, setCurrentFType ] = useState("" as FuelType)
    const [ showEmissionFactorsModal, setShowEmissionFactorsModal ] = useState(false)
    const [ showMethodologyModal, setShowMethodologyModal ] = useState(false)

    useEffect(() => {
        let init:InputInventoryStep7 = {
            emissionFactors: props.project.stages?.Inventory?.[0]?.steps?.[props.stepNumber]?.emissionFactors || {
                "WTW": {
                    "Gasoline": {lowerHeatingValue: "43.2", density: "0.745", pci: "32.184", ges: "89400", source: ''},
                    "Diesel": {lowerHeatingValue: "43.1", density: "0.832", pci: "35.8592", ges: "90400", source: ''},
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
                    "Diesel": {lowerHeatingValue: "43.1", density: "0.832", pci: "35.8592", ges: "74500", source: ''},
                    "CNG": {lowerHeatingValue: "45.1", density: "1", pci: "45.1", ges: "59400", source: ''},
                    "LPG": {lowerHeatingValue: "46", density: "0.522193211488251", pci: "24.020887728", ges: "67300", source: ''},
                    "LNG": {lowerHeatingValue: "45.1", density: "0.39", pci: "17.589", ges: "59420", source: ''},
                    "Hybrid": {lowerHeatingValue: "43.2", density: "0.745", pci: "32.184", ges: "75200", source: ''},
                    "Electric": {lowerHeatingValue: "3.6", density: "1", pci: "3.6", ges: "0", source: ''},
                    "Hydrogen": {lowerHeatingValue: "119.88", density: "1", pci: "119.88", ges: "0", source: ''},
                    "None": {lowerHeatingValue: "0", density: "0", pci: "0", ges: "0", source: ''}
                }
            },
            note: props.project.stages?.Inventory?.[0]?.steps?.[props.stepNumber]?.note || undefined
        }
        
        props.setInputData(init)
    }, [props.project])
    const updateInput = (ftype: FuelType, param: "lowerHeatingValue" | "density" | "pci" | "ges", value: string, wtwOrTtw?: "WTW" | "TTW", ) => {
        props.setInputData((prevInputData) => {
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
        props.saveSource(source)
        // Add source to proper input
        props.setInputData((prevInputData) => {
            let tmp = {...prevInputData}
            tmp.emissionFactors.TTW[currentFType].source = source
            tmp.emissionFactors.WTW[currentFType].source = source
            return tmp
        })
    }
    const setNote = (note: string | undefined) => {
        props.setInputData((prevInputData: any) => {
            return {
                ...prevInputData,
                note: note
            }
        })
    }
    const saveEmissionFactors = () => {
        // Error detection

        // save data 
        props.saveEmissionsFactors(props.inputData)
        setShowEmissionFactorsModal(false)
    }
    return (
        <div>
            <Button variant="link" onClick={e => setShowEmissionFactorsModal(true)} style={{padding: "0"}}><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#edit"}/></svg><span>Edit GHG emission factors</span></span></Button>
            <Modal size="xl" centered show={showEmissionFactorsModal} onHide={() => setShowEmissionFactorsModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Emission factors</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Emission factors are the last data you need to complete your GHG emissions calculation. Specific GHG emission factors (in kgCO2eq/TJ) apply according to the different fuel types (gasoline, diesel, CNG, LNG).
                    </p>
                    <p>
                        The table already integrates international ones that you can use as default values if you don’t have specific values.
                    </p>
                    <p>
                        We would recommend to check out the <Button variant="link" onClick={e => setShowMethodologyModal(true)} style={{padding: "0"}}><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>methodology used</span></span></Button> to obtain those factors first.
                    </p>
                    <Table bordered>
                        <thead>
                            <tr>
                                <th className="item-sm"><ItemWithOverlay overlayContent="Fuels types, current and expected"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Fuels</span></span></ItemWithOverlay></th>
                                <th className="item-sm"><ItemWithOverlay overlayContent="Source of factors, default values use EN 16258. Click the blue + button to add a source"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Src</span></span></ItemWithOverlay></th>
                                <th className="item-sm"><span className="item"><span>Lower heating value (TJ/1000t or MJ/kWh)</span></span></th>
                                <th className="item-sm"><span className="item"><span>Fuel density (kg/kg or kg/l)</span></span></th>
                                <th className="item-sm"><ItemWithOverlay overlayContent="Tank to wheel emission factor for given fuel"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>CO2e TTW (kg/Tj)</span></span></ItemWithOverlay></th>
                                <th className="item-sm"><ItemWithOverlay overlayContent="Well to wheel emission factor for given fuel"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>CO2e WTW (kg/Tj)</span></span></ItemWithOverlay></th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(props.inputData.emissionFactors?.WTW || {}).filter(ftypeString => ftypeString !== "None" && ftypeString !== "Electric" && ftypeString !== "Hydrogen").map((ftypeString, index) => {
                                const ftype = ftypeString as FuelType
                                const fuel = props.inputData.emissionFactors.WTW[ftype]
                                return <tr key={index}>
                                        <td style={{verticalAlign: "top"}}><Badge bg="disabled"><span className="item"><span>{ftype}</span></span></Badge></td>
                                        <td>
                                            {fuel.source 
                                            ? <ValidSource source={fuel.source} onClick={(e:any) => configureSource(ftype)}/>
                                            : <Button variant="action" onClick={e => configureSource(ftype)}><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#plus"}/></svg></span></Button>}
                                        </td>
                                        <td><Form.Control value={fuel.lowerHeatingValue} onChange={e => updateInput(ftype, "lowerHeatingValue", e.target.value)}></Form.Control></td>
                                        <td><Form.Control value={fuel.density} onChange={e => updateInput(ftype, "density", e.target.value)}></Form.Control></td>
                                        <td><Form.Control value={props.inputData.emissionFactors.TTW[ftype].ges} onChange={e => updateInput(ftype, "ges", e.target.value, 'TTW')}></Form.Control></td>
                                        <td><Form.Control value={props.inputData.emissionFactors.WTW[ftype].ges} onChange={e => updateInput(ftype, "ges", e.target.value, 'WTW')}></Form.Control></td>
                                    </tr>
                            })}
                        </tbody>
                    </Table>
                    {props.inputData.note === undefined 
                        ? <Button variant="link" onClick={e=>setNote("")}><ItemWithOverlay overlayContent="Write a note to keep track of hypothesis and assumptions used to fill this step. For exemple, what arithmetic operations were used to convert data from sources to this tool's expected format."><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#plus"}/></svg><span>Add a note</span></span></ItemWithOverlay></Button>
                        : <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                            <Form.Label><Button variant="link" onClick={e=>setNote(undefined)}><span className="item"><span>User note</span><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#times"}/></svg></span></Button></Form.Label>
                            <Form.Control as="textarea" rows={3} value={props.inputData.note} onChange={e => setNote(e.target.value)} />
                        </Form.Group>
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEmissionFactorsModal(false)}>
                        <span className="item"><span>Close</span></span>
                    </Button>
                    <Button variant="primary" onClick={() => saveEmissionFactors()}>
                        <span className="item"><span>Save</span></span>
                    </Button>
                </Modal.Footer>
            </Modal>
            <ChoiceModal 
                showModal={showSourceModal} 
                setShowModal={setShowSourceModal} 
                availableChoices={(props.project?.sources || []).map(source => source.value)}
                callback={addSourceModalCallback}
            ></ChoiceModal>
            <Modal size="lg" centered show={showMethodologyModal} onHide={() => setShowMethodologyModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Emission factors methodology</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>GHG emissions consider CO2, CH4 and N20 that are transformed into kgCO2eq/TJ.</p>
                    <p>CO2eq is an index created by IPCC to simplify the comparison and cumulate all of the gases in one index. In order to obtain this data, you need to convert other gases emissions in CO2 emissions, multiplying the emission factors by the Global Warming Potential of the gas. It is a measure of how much energy the emissions of 1 ton of a gas will absorb over a given period of time, relative to the emissions of 1 ton of carbon dioxide (CO2) (EPA, 2022).</p>
                    <p>CH4 have a GWP of 28 years average and N20 have a GWP of 265 average. This means that 1ton of CH4 emitted represents 28 tons of CO2.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowMethodologyModal(false)}>
                        <span className="item"><span>Close</span></span>
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

