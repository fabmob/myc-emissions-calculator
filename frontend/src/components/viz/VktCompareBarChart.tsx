import React, {useCallback} from "react"
import { ProjectType, VehicleKilometresTravelledComputed } from "../../frontendTypes"
import { Bar, BarChart, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { computePercentIncrease } from "../../utils/computePercentIncrease"
import { Button, Col, Row } from "react-bootstrap"
import { CSVLink } from "react-csv"
import { useCurrentPng } from "recharts-to-png"
import { saveAs } from 'file-saver'

export default function VktCompareBarChart (props: {
    bauVktData: VehicleKilometresTravelledComputed,
    climateVktData: VehicleKilometresTravelledComputed[],
    displayedVtypes: {[key: string]: boolean},
    displayedClimateScenarios: boolean[],
    showPercents: boolean,
    showLabels: boolean,
    highContrastColors: boolean,
    project: ProjectType
}) {
    const [getPng, { ref, isLoading }] = useCurrentPng()
    const defaultColors = ["#FF7C7C", "#FFEB7C", "#7BFFE3", "#7C81FF", "#DF7CFF", "#FF9F7C", "#CAFF7C", "#7CDDFF", "#9E7CFF", "#FF7CEC", "#FFB77C"," #8AFF89", "#7CB1FF", "#FF7CB2"]
    let chartData : {[key: string]: number|string}[] = []
    const vtypes = Object.keys(props.bauVktData).filter(vtype => props.displayedVtypes[vtype])
    const numberOfClimateScenarios = props.displayedClimateScenarios.reduce((p,v)=>p+(v?1:0),0)
    let highestYearTotal = 0
    let csvExport: (string)[][] = [
        ["scenario", "scenarioId", "vehicle"].concat((props.project?.referenceYears || []).map(e => e.toString()))
    ]
    for (let j = 0; j < vtypes.length; j++) {
        csvExport.push(["BAU", "1", vtypes[j]].concat((props.project?.referenceYears || []).map(e => "0")))
        for (let c = 0; c < props.climateVktData.length; c++) {
            if (!props.displayedClimateScenarios[c]) continue
            csvExport.push(["Climate", (c+1).toString(), vtypes[j]].concat((props.project?.referenceYears || []).map(e => "0")))
        }
    }
    for (let y = 0; y < props.project?.referenceYears?.length || 0; y++) {
        const year = props.project.referenceYears[y]
        let totalForYear = 0
        let totalsForYear = {bau: 0, climate: props.climateVktData.map(_=>0)}
        chartData.push({
            name: year
        })
        for (let j = 0; j < vtypes.length; j++) {
            const vtype = vtypes[j]
            const bauVal = props.bauVktData[vtype]?.[y] || 0
            chartData[chartData.length -1]["BAU - " + vtype] = bauVal
            totalsForYear.bau += bauVal
            csvExport[j*(numberOfClimateScenarios + 1)+1][y+3] = bauVal.toString()
            let maxClimateVal = 0
            for (let c = 0; c < props.climateVktData.length; c++) {
                if (!props.displayedClimateScenarios[c]) continue
                const climateVktData = props.climateVktData[c]
                const climateVktVal = climateVktData[vtype]?.[y] || 0
                chartData[chartData.length -1]["Climate (" + (c+1) + ") - " + vtype] = climateVktVal
                totalsForYear.climate[c] += climateVktVal
                maxClimateVal = Math.max(maxClimateVal, climateVktVal)
                csvExport[j*(numberOfClimateScenarios + 1)+2][y+3] = climateVktVal.toString()
            }
            totalForYear += Math.max(bauVal,maxClimateVal)
        }
        for (let c = 0; c < props.climateVktData.length; c++) {
            if (!props.displayedClimateScenarios[c]) continue
            chartData[chartData.length -1]["percent-"+c] = computePercentIncrease(totalsForYear.climate[c], totalsForYear.bau)
        }
        highestYearTotal = Math.max(highestYearTotal, totalForYear)
    }
    const roundFactor = Math.pow(10, Math.round(highestYearTotal).toString().length - 1)
    const maxValRoundedAbove = Math.ceil(highestYearTotal / roundFactor) * roundFactor
    let colors = defaultColors.slice()
    let colorsPerVtype : {[key: string]: string} = {}
    for (let i = 0; i < vtypes.length; i++) {
        colorsPerVtype[vtypes[i]] = colors.shift() || "black"
        if (colors.length === 0) {
            colors = defaultColors.slice()
        }
    }
    const handleDownload = useCallback(async () => {
        const png = await getPng()
        if (png) {
          saveAs(png, props.project.name.replace(" ", "_") + "_vkt.png")
        }
      }, [getPng, props.project])
    return (
        <div style={{marginTop: "20px"}}>
            <Row>
                <Col xs={10}><h3>Vehicle kilometer travelled</h3></Col>
                <Col xs={1}>
                    {props.project.name && <CSVLink data={csvExport} filename={props.project.name.replace(" ", "_") + "_vkt.csv"} className="btn btn-primary" style={{width: "100%", padding: "4px 4px"}}>
                        <img style={{width: "27px"}} src="/icon_dl_csv.svg" alt="Dowload as csv" title="Download as csv"></img>
                    </CSVLink>}
                </Col>
                <Col xs={1}>
                    <Button onClick={handleDownload} style={{width: "100%", padding: "4px 4px"}}>
                        {isLoading 
                        ? <img style={{width: "27px"}} src="/icon_spinner.svg" alt="Image is loading" title="Image is loading"></img>
                        : <img style={{width: "27px"}} src="/icon_dl_image.svg" alt="Download graph as png" title="Download graph as png"></img>}
                    </Button>
                </Col>
            </Row>
            <div style={{backgroundColor: "#E6E6E6", padding: "20px 0"}}>
                <ResponsiveContainer width="90%" height={300}>
                    <BarChart margin={{left: 50, top: props.showPercents? 20: 0}} data={chartData} ref={ref}>
                        <XAxis dataKey="name" />    
                        <YAxis tickFormatter={(value:number) => new Intl.NumberFormat('fr').format(value) + 'MVkt'} domain={[0, maxValRoundedAbove]}/>
                        <Tooltip formatter={(value:number) => new Intl.NumberFormat('fr').format(value)} wrapperStyle={{zIndex: 10}}/>
                        <Legend />
                        {vtypes.map((vtype:string, i:number) => {
                            let jsx = [
                                <Bar key={"bau" + i} dataKey={"BAU - " + vtype} fill={props.highContrastColors ? colorsPerVtype[vtype] : `rgba(44, 177, 213, ${1-i/vtypes.length})`} stackId="bau" unit=' MVkt'>
                                    <LabelList className={(props.showLabels ? "" : "d-none ") + "d-print-block"} dataKey={"BAU - " + vtype} content={CustomLabel} />
                                    {/* {i===0 && props.showPercents && <LabelList dataKey="percent" content={PercentLabel} />} */}
                                </Bar>
                            ]
                            for (let c = 0; c < props.climateVktData.length; c++) {
                                if (!props.displayedClimateScenarios[c]) continue
                                jsx.push(
                                    <Bar key={"climate" + i + c} dataKey={"Climate (" + (c+1) + ") - " + vtype} fill={props.highContrastColors ? colorsPerVtype[vtype] : `rgba(162, 33, 124, ${1-i/vtypes.length})`} stackId={"climate" + c} unit={' Mvkt'}>
                                        <LabelList className={(props.showLabels ? "" : "d-none ") + "d-print-block"} dataKey={"Climate (" + (c+1) + ") - " + vtype} content={CustomLabel} />
                                        {i===0 && props.showPercents && <LabelList dataKey={"percent-" + c} content={PercentLabel} />}
                                    </Bar>
                                )
                                
                            }
                            return jsx
                        })}
                    </BarChart>
                </ResponsiveContainer>
            </div>
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