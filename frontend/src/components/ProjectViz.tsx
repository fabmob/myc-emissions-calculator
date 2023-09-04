import React, {useState, useEffect} from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useParams, useNavigate, Navigate } from "react-router-dom"
import { Container, Row, Col, Button, Card, Form, Alert, Badge } from 'react-bootstrap'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, LabelList } from 'recharts';
import { ProjectType, InputStep2 } from '../frontendTypes'
import { CSVLink } from "react-csv";

import '../pages/Project.css'
import '../print.css'

type DataVkt = {[key: string]: number | string}
type DataModalShare = {[key : string]: number} & {name: number}

export default function ProjectViz(props: {project: ProjectType}){
    const [project, setProject ] = useState({} as ProjectType)
    const [typeOfGHGIsWTW, setTypeOfGHGIsWTW] = useState(true)
    const [showPercents, setShowPercents] = useState(false)
    const [showLabels, setShowLabels] = useState(false)
    const [activeVtypesVkt, setActiveVtypesVkt] = useState([] as string[])
    const [dates, setDates] = useState([2020, 2025, 2030, 2035, 2040, 2050])
    const [csvExport, setCsvExport] = useState([] as string[][])
    const [dataVkt, setDataVkt] = useState([] as DataVkt[])
    const [colorsPerVtype, setColorsPerVtype] = useState({} as {[key: string]: string})
    const [dataPassengersModalShare, setDataPassengersModalShare] = useState([] as DataModalShare[])
    const [dataFreightModalShare, setDataFreightModalShare] = useState([] as DataModalShare[])
    const [activeVTypesPassengersModalShare, setActiveVTypesPassengersModalShare] = useState([] as string[])
    const [activeVTypesFreightModalShare, setActiveVTypesFreightModalShare] = useState([] as string[])
    const [dataEnergyWTW, setDataEnergyWTW] = useState([[], [], 0] as [string[], any[], number])
    const [dataEnergyTTW, setDataEnergyTTW] = useState([[], [], 0] as [string[], any[], number])
    const [dataEnergyDomain, setDataEnergyDomain] = useState([] as number[])
    
    useEffect(() => {
        init(props.project)
    }, [props.project])
    const init = (_project: ProjectType) => {
        console.log(_project)
        setProject(_project)
        if (!_project.stages || !_project.stages['Inventory'][0].steps) {
            return
        }
        let _csvExport: string[][] = []
        _csvExport = [
            ["dataType", "dataName", "dataSource1", "dataSource2", "vehicleType", "fuelType"].concat(_project.referenceYears.map(e => e.toString())),
            ["input", "population", _project.stages['Inventory'][0].steps[1].populationSource, _project.stages['Inventory'][0].steps[1].populationGrowthSource, "NA", "NA", _project.stages['Inventory'][0].steps[1].population].concat(_project.stages['Inventory'][0].steps[1].populationRate),
            ["input", "gdp", _project.stages['Inventory'][0].steps[1].gdpSource, _project.stages['Inventory'][0].steps[1].gdpGrowthSource, "NA", "NA", _project.stages['Inventory'][0].steps[1].gdp].concat(_project.stages['Inventory'][0].steps[1].gdpRate),
            ["output", "population", "computed", "", "NA", "NA"].concat((_project?.outputSocioEconomicDataComputed?.population || []).map(e => Math.round(e).toString())),
            ["output", "gdp", "computed", "", "NA", "NA"].concat((_project?.outputSocioEconomicDataComputed?.gdp || []).map(e => e.toString()))
        ]
        let vehicleKilometresTravelledComputed = _project?.vehicleKilometresTravelledComputed || {}
        let vtypesvkt = Object.keys(vehicleKilometresTravelledComputed)
        let _activeVtypesVkt = [] as string[]
        let _dataVkt : DataVkt[] = [
            {name: _project.referenceYears[0], total: 0, percent: "+0%"},
            {name: _project.referenceYears[1], total: 0, percent: ""},
            {name: _project.referenceYears[2], total: 0, percent: ""},
            {name: _project.referenceYears[3], total: 0, percent: ""},
            {name: _project.referenceYears[4], total: 0, percent: ""},
            {name: _project.referenceYears[5], total: 0, percent: ""}
        ]
        for (let i = 0; i < vtypesvkt.length; i++) {
            let vtype = vtypesvkt[i]
            if (!_project?.stages?.['Inventory']?.[0]?.steps?.[2]?.[vtype]?.isActive)
                continue
            for (let j = 0; j < 6; j++) {
                if (vehicleKilometresTravelledComputed?.[vtype]?.[j]) {
                    _dataVkt[j][vtype] = Math.round((vehicleKilometresTravelledComputed?.[vtype]?.[j] || 0))
                    _dataVkt[j].total = Math.round((vehicleKilometresTravelledComputed?.[vtype]?.[j] || 0)) + (_dataVkt[j].total as number)
                    if (_activeVtypesVkt.indexOf(vtypesvkt[i]) === -1)
                        _activeVtypesVkt.push(vtypesvkt[i])
                    }
                }
            _csvExport.push(["output", "vkt", "computed", "", vtype, "NA"].concat(_dataVkt.map(e => e[vtype].toString())))
            if (_project.stages['Inventory'][0].steps[3][vtype].averageMileage && _project.stages['Inventory'][0].steps[3][vtype].averageMileage !== "0") {
                _csvExport.push(["input", "averageMileage", _project.stages['Inventory'][0].steps[3].averageMileageSource, _project.stages['Inventory'][0].steps[3].vktGrowthSource, vtype, "NA", _project.stages['Inventory'][0].steps[3][vtype].averageMileage].concat(_project.stages['Inventory'][0].steps[3][vtype].vktRate))
                _csvExport.push(["input", "vehicleStock", _project.stages['Inventory'][0].steps[3].vehicleStockSource, _project.stages['Inventory'][0].steps[3].vktGrowthSource, vtype, "NA", _project.stages['Inventory'][0].steps[3][vtype].vehicleStock].concat(_project.stages['Inventory'][0].steps[3][vtype].vktRate))
                _csvExport.push(["input", "vkt", "computed", _project.stages['Inventory'][0].steps[3].vktGrowthSource, vtype, "NA", _project.stages['Inventory'][0].steps[3][vtype].vkt].concat(_project.stages['Inventory'][0].steps[3][vtype].vktRate))
            } else {
                _csvExport.push(["input", "vkt", _project.stages['Inventory'][0].steps[3].vktSource, _project.stages['Inventory'][0].steps[3].vktGrowthSource, vtype, "NA", _project.stages['Inventory'][0].steps[3][vtype].vkt].concat(_project.stages['Inventory'][0].steps[3][vtype].vktRate))
            }
            _csvExport.push(["input", "occupancy", _project.stages['Inventory'][0].steps[4].source, "", vtype, "NA", _project.stages['Inventory'][0].steps[4][vtype].occupancy, "", "", "", "", ""])
            Object.keys(_project.stages['Inventory'][0].steps[6][vtype]).map(ftype => {
                if (ftype !== "None") {
                    _csvExport.push(["input", "fuelBreakdown", _project.stages['Inventory'][0].steps[6].source, "", vtype, ftype].concat(_project.stages['Inventory'][0].steps[6][vtype][ftype]))
                    _csvExport.push(["input", "fuelConsumption", _project.stages['Inventory'][0].steps[7].energySource, _project.stages['Inventory'][0].steps[7].energyGrowthSource, vtype, ftype].concat(_project.stages['Inventory'][0].steps[7][vtype][ftype]))
                }
                return null
            })
        }
        for (let j = 1; j < 6; j++) {
            _dataVkt[j].percent = computePercentIncrease(_dataVkt[j].total as number, _dataVkt[j-1].total as number)
        }
        let outputPassengersModalShare = _project?.outputPassengersModalShare || {}
        let vTypesPassengersModalShare = Object.keys(outputPassengersModalShare)
        let _activeVTypesPassengersModalShare = []
        let _dataPassengersModalShare : DataModalShare[] = [
            {name: _project.referenceYears[0]},
            {name: _project.referenceYears[1]},
            {name: _project.referenceYears[2]},
            {name: _project.referenceYears[3]},
            {name: _project.referenceYears[4]},
            {name: _project.referenceYears[5]}
        ]
        for (let i = 0; i < vTypesPassengersModalShare.length; i++) {
            let vtype = vTypesPassengersModalShare[i]
            if (!_project?.stages?.['Inventory']?.[0]?.steps?.[2]?.[vtype]?.isActive)
                continue
            for (let j = 0; j < 6; j++) {
                if (outputPassengersModalShare?.[vtype]?.[j] !== undefined) {
                    _dataPassengersModalShare[j][vtype] = Math.round((outputPassengersModalShare?.[vtype]?.[j] || 0) * 100)
                    if (_activeVTypesPassengersModalShare.indexOf(vTypesPassengersModalShare[i]) === -1)
                        _activeVTypesPassengersModalShare.push(vTypesPassengersModalShare[i])
                }
            }
            _csvExport.push(["output", "passengersModalShare", "computed", "", vtype, "NA"].concat(_dataPassengersModalShare.map(e => e[vtype].toString())))
        }
        let outputFreightModalShare = _project?.outputFreightModalShare || {}
        let vTypesFreightModalShare = Object.keys(outputFreightModalShare)
        let _activeVTypesFreightModalShare = []
        let _dataFreightModalShare : DataModalShare[] = [
            {name: _project.referenceYears[0]},
            {name: _project.referenceYears[1]},
            {name: _project.referenceYears[2]},
            {name: _project.referenceYears[3]},
            {name: _project.referenceYears[4]},
            {name: _project.referenceYears[5]}
        ]
        for (let i = 0; i < vTypesFreightModalShare.length; i++) {
            let vtype = vTypesFreightModalShare[i]
            if (!_project?.stages?.['Inventory']?.[0]?.steps?.[2]?.[vtype]?.isActive)
                continue
            for (let j = 0; j < 6; j++) {
                if (outputFreightModalShare?.[vtype]?.[j] !== undefined) {
                    _dataFreightModalShare[j][vtype] = Math.round((outputFreightModalShare?.[vtype]?.[j] || 0) * 100)
                    if (_activeVTypesFreightModalShare.indexOf(vTypesFreightModalShare[i]) === -1)
                        _activeVTypesFreightModalShare.push(vTypesFreightModalShare[i])
                }
            }
            _csvExport.push(["output", "freightModalShare", "computed", "", vtype, "NA"].concat(_dataFreightModalShare.map(e => e[vtype].toString())))
        }

        

        type OutputSumTotalEnergyAndEmissions = typeof _project.outputSumTotalEnergyAndEmissionsWTW
        const computeDataEnergy = (outputSumTotalEnergyAndEmissions: OutputSumTotalEnergyAndEmissions) : [string[], any[], number] => {
            let activeVtypesEnergy = []
            let dataEnergy : any[] = [
                {name: _project.referenceYears[0], total: 0, percent: "+0%"},
                {name: _project.referenceYears[1], total: 0, percent: ""},
                {name: _project.referenceYears[2], total: 0, percent: ""},
                {name: _project.referenceYears[3], total: 0, percent: ""},
                {name: _project.referenceYears[4], total: 0, percent: ""},
                {name: _project.referenceYears[5], total: 0, percent: ""}
            ]
            for (let i = 0; i < vTypesPassengersModalShare.length; i++) {
                let vtype = vTypesPassengersModalShare[i]
                // if (!_project?.stages?.['Inventory']?.[0]?.steps?.[2]?.[vtype]?.isActive)
                //     continue
                for (let j = 0; j < 6; j++) {
                    let val = outputSumTotalEnergyAndEmissions?.[vtype]?.co2?.[j]
                    if (val !== undefined) {
                        dataEnergy[j][vtype] = Math.round(val * 1000)
                        dataEnergy[j].total += Math.round(val * 1000)
                        if (activeVtypesEnergy.indexOf(vtype) === -1)
                            activeVtypesEnergy.push(vtype)
                    }
                }
                _csvExport.push(["output", "ghg" + typeOfGHGIsWTW ? "WTW" : "TTW", "computed", "", vtype, "NA"].concat(dataEnergy.map(e => (e[vtype] || 0).toString())))
            }
            for (let i = 0; i < vTypesFreightModalShare.length; i++) {
                let vtype = vTypesFreightModalShare[i]
                // if (!_project?.stages?.['Inventory']?.[0]?.steps?.[2]?.[vtype]?.isActive)
                //     continue
                for (let j = 0; j < 6; j++) {
                    let val = outputSumTotalEnergyAndEmissions?.[vtype]?.co2?.[j]
                    if (val !== undefined) {
                        dataEnergy[j][vtype] = Math.round(val * 1000)
                        dataEnergy[j].total += Math.round(val * 1000)
                        if (activeVtypesEnergy.indexOf(vtype) === -1)
                            activeVtypesEnergy.push(vtype)
                    }
                }
                _csvExport.push(["output", "ghg" + typeOfGHGIsWTW ? "WTW" : "TTW", "computed", "", vtype, "NA"].concat(dataEnergy.map(e => (e[vtype] || 0).toString())))
            }
            for (let j = 1; j < 6; j++) {
                dataEnergy[j].percent = computePercentIncrease(dataEnergy[j].total as number, dataEnergy[j-1].total as number)
            }
            let maxVal = dataEnergy.map(e => e.total).reduce((c,n) => Math.max(c,n), 0)
            return [activeVtypesEnergy, dataEnergy, maxVal]
        }
        const _dataEnergyWTW = computeDataEnergy(_project?.outputSumTotalEnergyAndEmissionsWTW || {})
        const _dataEnergyTTW = computeDataEnergy(_project?.outputSumTotalEnergyAndEmissionsTTW || {})
        const maxVal = Math.max(_dataEnergyTTW[2], _dataEnergyWTW[2])
        const roundFactor = Math.pow(10, maxVal.toString().length - 1)
        const maxValRoundedAbove = Math.ceil(maxVal / roundFactor) * roundFactor
        const _dataEnergyDomain = [0, maxValRoundedAbove]
        let defaultColors = ["#FF7C7C", "#FFEB7C", "#7BFFE3", "#7C81FF", "#DF7CFF", "#FF9F7C", "#CAFF7C", "#7CDDFF", "#9E7CFF", "#FF7CEC", "#FFB77C"," #8AFF89", "#7CB1FF", "#FF7CB2"]
        let colors = defaultColors.slice()
        let _colorsPerVtype : {[key: string]: string} = {}
        let vtypes = Object.keys(_project?.stages?.['Inventory']?.[0]?.steps?.[2] || {}).filter(vtype => _project?.stages?.['Inventory']?.[0]?.steps?.[2]?.[vtype])
        for (let i = 0; i < vtypes.length; i++) {
            _colorsPerVtype[vtypes[i]] = colors.shift() || "black"
            if (colors.length === 0) {
                colors = defaultColors.slice()
            }
        }
        _csvExport.sort((a, b) => (a[0]+a[1]).localeCompare(b[0]+b[1]))

        setDates(_project.referenceYears)
        setActiveVtypesVkt(_activeVtypesVkt)
        setDataVkt(_dataVkt)
        setCsvExport(_csvExport)
        setDataPassengersModalShare(_dataPassengersModalShare)
        setActiveVTypesPassengersModalShare(_activeVTypesPassengersModalShare)
        setDataFreightModalShare(_dataFreightModalShare)
        setActiveVTypesFreightModalShare(_activeVTypesFreightModalShare)
        setColorsPerVtype(_colorsPerVtype)
        setDataEnergyWTW(_dataEnergyWTW)
        setDataEnergyTTW(_dataEnergyTTW)
        setDataEnergyDomain(_dataEnergyDomain)
    }
    
    const filterByVtype = (selectedVtypes: InputStep2) => {
        if (project?.stages?.['Inventory']?.[0]?.steps?.[2]) {
            project.stages['Inventory'][0].steps[2] = selectedVtypes
            init(project)
        }
    }
    const computePercentIncrease = (currentVal: number, lastVal: number | undefined) : string => {
        if (lastVal === undefined) {
            return "+0%"
        }
        const percentIncrease = Math.round(currentVal*100/lastVal - 100)
        if (percentIncrease >= 0) {
            return "+" + percentIncrease + "%"
        }
        return percentIncrease + "%"
    }
    const validateProject = () => {
        console.log("todo callback")
    }
    return (
        <div>
            <h1>Project overview</h1>
            <h2 className="d-print-none" style={{marginTop: "-40px", marginBottom: "40px"}}>Project: {project.name} {project.status === 'draft' ? <Badge bg="secondary"><span className="item"><span>Draft</span></span></Badge> : <Badge bg="success"><span className="item"><span>Validated</span></span></Badge>}</h2>
            <div className="d-none d-print-block">
                Project: {project.name}, author: {project.owner}, country: {project.country} {project.isSump && <span>, city: {project.city}</span>}, status: {project.status}
            </div>
            {project.status === 'draft' && <Alert variant="secondary">
                This project is still in a <Badge bg="secondary"><span className="item"><span>Draft</span></span></Badge> state, once you are satistified with its content, <a href="#" onClick={validateProject}>click here to validate it</a>
            </Alert>}
            <Options 
                project={project} 
                filterByVtype={filterByVtype} 
                typeOfGHGIsWTW={typeOfGHGIsWTW} 
                setTypeOfGHGIsWTW={setTypeOfGHGIsWTW}
                showPercents={showPercents} 
                setShowPercents={setShowPercents}
                showLabels={showLabels} 
                setShowLabels={setShowLabels}
            />
            <Row className="justify-content-md-center align-items-center" style={{"marginBottom": "40px"}}>
                <h3>Population evolution</h3>
                <Col lg={{span: '6', order: 'last'}} style={{textAlign: "left"}} className="p-4">
                    Population evolution is computed using current population and expected annual growth<br/><br/>
                    <div className="inputDesc">Inputs are in the Socio economic data step</div>
                </Col>
                <Col lg="6">
                    {project?.outputSocioEconomicDataComputed?.population !== undefined && <ResponsiveContainer width="100%" height={340}>
                        <BarChart margin={{left: 50, top: showPercents? 20: 0}} data={(project.outputSocioEconomicDataComputed.population).map((e,i)=>({name:dates[i], population: Math.round(e), percent: computePercentIncrease(e, project?.outputSocioEconomicDataComputed?.population?.[i-1])}))}>
                            <XAxis dataKey="name"  />
                            <YAxis tickFormatter={(value:number) => new Intl.NumberFormat('fr').format(value)} />
                            <Tooltip formatter={(value:number) => new Intl.NumberFormat('fr').format(value)}/>
                            <Legend />
                            <Bar barSize={22} dataKey="population" fill="#92E5FF">
                                <LabelList className={(showLabels ? "" : "d-none ") + "d-print-block"} dataKey="population" content={CustomLabel} />
                                {showPercents && <LabelList dataKey="percent" content={PercentLabel} />}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>}
                </Col>
            </Row>

            <Row className="justify-content-md-center align-items-center" style={{"marginBottom": "40px"}}>
                <h3>GDP evolution</h3>
                <Col lg="6" style={{textAlign: "left"}} className="p-4">
                    GDP evolution is computed using current GDP and expected annual growth<br/><br/>
                    <div className="inputDesc">Inputs are in the Socio economic data step</div>
                </Col>
                <Col lg="6">
                    {project?.outputSocioEconomicDataComputed?.gdp !== undefined && <ResponsiveContainer width="100%" height={340}>
                        <BarChart margin={{left: 50, top: showPercents? 20: 0}} data={(project.outputSocioEconomicDataComputed.gdp).map((e,i)=>({name:dates[i], gdp: Math.round(e), percent: computePercentIncrease(e, project?.outputSocioEconomicDataComputed?.gdp?.[i-1])}))}>
                            <XAxis dataKey="name"  />
                            <YAxis tickFormatter={(value:number) => new Intl.NumberFormat('fr').format(value) + "Mrd$"} />
                            <Tooltip formatter={(value:number) => new Intl.NumberFormat('fr').format(value)}/>
                            <Legend />
                            <Bar barSize={22} dataKey="gdp" fill="#50F19E" unit=' Mrd $'>
                                <LabelList className={(showLabels ? "" : "d-none ") + "d-print-block"} dataKey="gdp" content={CustomLabel} />
                                {showPercents && <LabelList dataKey="percent" content={PercentLabel} />}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>}
                </Col>
            </Row>

            <Row className="justify-content-md-center align-items-center" style={{"marginBottom": "40px"}}>
                <h3>Vkt</h3>
                <Col lg={{span: '6', order: 'last'}} style={{textAlign: "left"}} className="p-4">
                    Vehicle Kilometers Traveled evolution is computed using current kilometers traveled per vehicle and expected annual growth<br/><br/>
                    <div className="inputDesc">Inputs are in the Transport activity data step</div>
                </Col>
                <Col lg="6">
                    <ResponsiveContainer width="100%" height={340}>
                        <BarChart margin={{left: 50, top: showPercents? 20: 0}} data={dataVkt}>
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value:number) => new Intl.NumberFormat('fr').format(value) + "Mkm"} />
                            <Tooltip formatter={(value:number) => new Intl.NumberFormat('fr').format(value)}/>
                            <Legend />
                                {activeVtypesVkt.map((e, i) => (
                                    <Bar barSize={22} key={i} dataKey={e} fill={colorsPerVtype[e]} stackId="a" unit=' Mkm'>
                                        <LabelList className={(showLabels ? "" : "d-none ") + "d-print-block"} dataKey={e} content={CustomLabel} />
                                        {i===0 && showPercents && <LabelList dataKey="percent" content={PercentLabel} />}
                                    </Bar>
                                ))}
                        </BarChart>
                    </ResponsiveContainer>
                </Col>
            </Row>
            <Row className="d-none d-print-block">
                <Col style={{textAlign: "right"}}>1/2</Col>
            </Row>

            <Row className="justify-content-md-center align-items-center" style={{"marginBottom": "40px"}}>
                <div className="d-none d-print-block m-3">
                    Project: {project.name}, author: {project.owner}, country: {project.country} {project.isSump && <span>, city: {project.city}</span>}
                </div>
                <h3>Passengers modal split evolution</h3>
                <Col lg="6" style={{textAlign: "left"}} className="p-4">
                    The modal split helps to visualize which transport the population mostly uses for their travels.<br/><br/>
                    It is computed using total vkt and vehicle occupancy, expressed as a percent of passenger-kilometre (pkm) <br/><br/>
                    <div className="inputDesc">Inputs are in the Transport activity data step</div>
                    <div className="inputDesc">as well as the Vehicle occupancy step</div>
                </Col>
                <Col lg="6">
                    <ResponsiveContainer width="100%" height={340}>
                        <BarChart margin={{left: 10}} data={dataPassengersModalShare}>
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value:number) => new Intl.NumberFormat('fr').format(value) + "%"} domain={[0,100]}/>
                            <Tooltip formatter={(value:number) => new Intl.NumberFormat('fr').format(value)}/>
                            <Legend />
                                {activeVTypesPassengersModalShare.map((e, i) => (
                                    <Bar barSize={22} key={i} dataKey={e} fill={colorsPerVtype[e]} stackId="a" unit='%'>
                                        <LabelList className={(showLabels ? "" : "d-none ") + "d-print-block"} dataKey={e} content={CustomLabel} />
                                    </Bar>
                                ))}
                        </BarChart>
                    </ResponsiveContainer>
                </Col>
            </Row>
            <Row className="justify-content-md-center align-items-center" style={{"marginBottom": "40px"}}>
                <h3>Transport modal split evolution</h3>
                <Col lg={{span: '6', order: 'last'}} style={{textAlign: "left"}} className="p-4">
                    The modal split helps to visualize which transport is mostly used in freight.<br/><br/>
                    It is computed using total vkt and vehicle load, expressed as a percent of tons-kilometre (tkm) <br/><br/>
                    <div className="inputDesc">Inputs are in the Transport activity data step</div>
                    <div className="inputDesc">as well as the Vehicle occupancy step</div>
                </Col>
                <Col lg="6">
                    <ResponsiveContainer width="100%" height={340}>
                        <BarChart margin={{left: 10}} data={dataFreightModalShare}>
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value:number) => new Intl.NumberFormat('fr').format(value) + "%"} domain={[0,100]}/>
                            <Tooltip formatter={(value:number) => new Intl.NumberFormat('fr').format(value)}/>
                            <Legend />
                                {activeVTypesFreightModalShare.map((e, i) => (
                                    <Bar barSize={22} key={i} dataKey={e} fill={colorsPerVtype[e]} stackId="a" unit='%'>
                                        <LabelList className={(showLabels ? "" : "d-none ") + "d-print-block"} dataKey={e} content={CustomLabel} />
                                    </Bar>
                                ))}
                        </BarChart>
                    </ResponsiveContainer>
                </Col>
            </Row>

            <Row className="justify-content-md-center align-items-center" style={{"marginBottom": "40px"}}>
                <h3>GHG evolution ({typeOfGHGIsWTW?"Well To Wheel":"Tank To Wheel"})</h3>
                <Col lg="6" style={{textAlign: "left"}} className="p-4">
                    Estimated tons of greenhouse gases emissions for upcoming years per vehicle type.<br/><br/>
                    It is computed by multiplying for each fuel: vkt, average consumption and default emission factors.<br/><br/>
                    <div className="inputDescNoLink">Inputs are all the previous steps</div>
                </Col>
                <Col lg="6">
                    <ResponsiveContainer width="100%" height={340}>
                        <BarChart margin={{left: 50, top: showPercents? 20: 0}} data={typeOfGHGIsWTW?dataEnergyWTW[1]:dataEnergyTTW[1]}>
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value:number) => new Intl.NumberFormat('fr').format(value) + 't'} domain={dataEnergyDomain}/>
                            <Tooltip formatter={(value:number) => new Intl.NumberFormat('fr').format(value)}/>
                            <Legend />
                            {dataEnergyWTW[0].map((e:string, i:number) => (
                                <Bar barSize={22} key={i} dataKey={e} fill={colorsPerVtype[e]} stackId="a" unit=' tons GHG'>
                                    <LabelList className={(showLabels ? "" : "d-none ") + "d-print-block"} dataKey={e} content={CustomLabel} />
                                    {i===0 && showPercents && <LabelList dataKey="percent" content={PercentLabel} />}
                                </Bar>
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </Col>
            </Row>
            <Row className="d-none d-print-block" style={{position: "fixed", bottom: "20px", width: "100%", left: "0"}}>
                <Col><img src="/mobiliseyourcity.png" alt="mobilise your city"></img></Col>
            </Row>
            <Row className="d-none d-print-block">
                <Col style={{textAlign: "right"}}>2/2</Col>
            </Row>
            {project?.name && <div style={{marginBottom: "10px"}}>
                <CSVLink data={csvExport} filename={project.name.replace(" ", "_") + "_export.csv"} className="btn btn-primary">
                    Download data as csv
                </CSVLink>
            </div>}
        </div>
    )
}

const CustomLabel = (props: any) => {
    const { x, y, width, height, value, offset, className } = props
    const verticalOffset = 5 + offset;
    if (height < 10) {
        return <></>
    }
    return (
        <g className={className}>
          <text x={x + width / 2} y={y + verticalOffset} fontSize="12" fill="black" textAnchor="middle" dominantBaseline="middle">
            {new Intl.NumberFormat('fr', { notation: 'compact' }).format(value)}
          </text>
        </g>
      );
}
const PercentLabel = (props: any) => {
    const { x, width, value, className } = props
    return (
        <g className={className}>
          <text x={x + width / 2} y={12} fontSize="12" fill="black" textAnchor="middle" dominantBaseline="middle">
            {value}
          </text>
        </g>
      );
}
type SetBoolean = (key:boolean | ((k:boolean) => boolean)) => void
const Options = (
    {project, filterByVtype, typeOfGHGIsWTW, setTypeOfGHGIsWTW, showPercents, setShowPercents, showLabels, setShowLabels}: 
    {project: ProjectType, filterByVtype: (inputStep2: InputStep2) => void, typeOfGHGIsWTW: boolean, setTypeOfGHGIsWTW: SetBoolean, showPercents: boolean, setShowPercents: SetBoolean, showLabels: boolean, setShowLabels: SetBoolean}
    ) => {
    const [showBody, setShowBody] = useState(false)
    const [pin, setPin] = useState(false)
    const [selectedVtypes, setSelectedVtypes] = useState({} as InputStep2)
    useEffect(() => {
        const inputStep2 = project?.stages?.['Inventory']?.[0]?.steps?.[2] as InputStep2
        if (inputStep2)
            setSelectedVtypes(inputStep2)
    }, [project])
    useEffect(() => {
        if (selectedVtypes)
            filterByVtype(selectedVtypes)
    }, [selectedVtypes])
    if (!project?.stages?.['Inventory']?.[0]?.steps?.[2]) {
        return <></>
    }
    const vtypes = Object.keys(selectedVtypes)
    const updateSelectedVtypes = (event: React.BaseSyntheticEvent) => {
        let target = event.target as HTMLInputElement
        let vtype = target.name
        setSelectedVtypes((prevSelectedVtypes) => {
            const newSelectedVtypes = {
                ...prevSelectedVtypes,
                [vtype]: {isActive: !prevSelectedVtypes[vtype].isActive, isFreight: prevSelectedVtypes[vtype].isFreight}
            }
            return newSelectedVtypes
        })
    }
    return (
        <>
            <Card className={"d-print-none" + (pin ? " stickyOptions" : "")} style={{textAlign: "left", marginBottom: "20px"}}>
                <Card.Header onClick={() => setShowBody(p=>!p)} style={{cursor: "pointer"}}>
                    Vizualisations option (click to display)
                    <span style={{float: "right"}} onClick={(e) => {e.stopPropagation(); setPin(p => !p)}}>📌</span>
                </Card.Header>
                {showBody && <Card.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Displayed categories of transport</Form.Label>
                        <Row>
                        {vtypes.map((vtype, index) => {
                            return (
                                <Col xs="4" key={index}>
                                    <Form.Switch style={{margin: "5px"}} id={"custom-switch-" + vtype} key={index}>
                                        <Form.Switch.Input  name={vtype} checked={selectedVtypes[vtype].isActive} onChange={updateSelectedVtypes}/>
                                        <Form.Switch.Label>{vtype}</Form.Switch.Label>
                                    </Form.Switch>
                                </Col>
                            )
                        })}
                        </Row>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>GHG emission type</Form.Label>
                        <Form.Check
                            id="custom-switch-wtw"
                            type="radio"
                            checked={typeOfGHGIsWTW}
                            onChange={() => setTypeOfGHGIsWTW(true)}
                            label="Well To Wheel (WTW)"
                        />
                        <Form.Check
                            id="custom-switch-ttw"
                            type="radio"
                            checked={!typeOfGHGIsWTW}
                            onChange={() => setTypeOfGHGIsWTW(false)}
                            label="Tank To Wheel (TTW)"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Graph content</Form.Label>
                        <Form.Switch style={{margin: "5px"}} id="custom-switch-percent">
                            <Form.Switch.Input checked={showPercents} onChange={() => setShowPercents((p:boolean)=>!p)}/>
                            <Form.Switch.Label>Display percents increase</Form.Switch.Label>
                        </Form.Switch>
                        <Form.Switch style={{margin: "5px"}} id="custom-switch-labels">
                            <Form.Switch.Input checked={showLabels} onChange={() => setShowLabels((p:boolean)=>!p)}/>
                            <Form.Switch.Label>Display labels</Form.Switch.Label>
                        </Form.Switch>
                    </Form.Group>
                </Card.Body>}
            </Card>
        </>
    );
  }