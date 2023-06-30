import React, {useCallback, useState} from "react"
import { ProjectType, TransportPerformance } from "../../frontendTypes"
import { Bar, BarChart, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { computePercentIncrease } from "../../utils/computePercentIncrease"
import { CSVLink } from "react-csv"
import { useCurrentPng } from "recharts-to-png"
import { saveAs } from 'file-saver'
import { Button, Col, Row } from "react-bootstrap"

export default function EmissionsPerUkmCompareBarChart (props: {
    title: string,
    bauTransportPerformanceData: TransportPerformance,
    climateTransportPerformanceData: TransportPerformance[],
    bauEmissionsData: {[key: string]: {co2: number[], energy: number[]}},
    climateEmissionsData: {[key: string]: {co2: number[], energy: number[]}}[],
    displayedVtypes: {[key: string]: boolean},
    displayedClimateScenarios: boolean[],
    showPercents: boolean,
    showLabels: boolean,
    highContrastColors: boolean,
    project: ProjectType
}) {
    const [getPng, { ref, isLoading }] = useCurrentPng()
    const defaultColors = ["#FF7C7C", "#FFEB7C", "#7BFFE3", "#7C81FF", "#DF7CFF", "#FF9F7C", "#CAFF7C", "#7CDDFF", "#9E7CFF", "#FF7CEC", "#FFB77C"," #8AFF89", "#7CB1FF", "#FF7CB2"]
    let chartData : {[key: string]: number | string}[] = []
    const vtypes = Object.keys(props.bauTransportPerformanceData).filter(vtype => props.displayedVtypes[vtype])
    const numberOfClimateScenarios = props.displayedClimateScenarios.reduce((p,v)=>p+(v?1:0),0)
    let highestYearTotal = 0
    let csvExport: (string)[][] = [
        ["scenario", "scenarioId", "vehicle"].concat((props.project?.referenceYears || []).map(e => e.toString()))
    ]
    for (let j = 0; j < vtypes.length; j++) {
        csvExport.push(["BAU", "1", vtypes[j]].concat((props.project?.referenceYears || []).map(e => "0")))
        for (let c = 0; c < props.climateEmissionsData.length; c++) {
            if (!props.displayedClimateScenarios[c]) continue
            csvExport.push(["Climate", (c+1).toString(), vtypes[j]].concat((props.project?.referenceYears || []).map(e => "0")))
        }
    }
    for (let y = 0; y < props.project?.referenceYears?.length || 0; y++) {
        const year = props.project.referenceYears[y];
        let totalForYear = 0
        let totalsForYear = {bau: 0, climate: props.climateEmissionsData.map(_=>0)}
        chartData.push({
            name: year
        })
        for (let j = 0; j < vtypes.length; j++) {
            const vtype = vtypes[j]
            const bauEmissionVal = props.bauEmissionsData[vtype]?.co2?.[y] || 0
            const bauTransportPerformanceVal = props.bauTransportPerformanceData[vtype]?.[y] || 0
            // We go from tons to grams (*10^6) and from Mkm to km (/10^6), but GHG are 1000t, so *1000
            const bauVal = bauEmissionVal * 1000 / bauTransportPerformanceVal|| 0
            csvExport[j*(numberOfClimateScenarios + 1)+1][y+3] = bauVal.toString()
            chartData[chartData.length -1]["BAU - " + vtype] = bauVal
            let maxClimateVal = 0
            for (let c = 0; c < props.climateEmissionsData.length; c++) {
                if (!props.displayedClimateScenarios[c]) continue
                const climateEmissionData = props.climateEmissionsData[c]
                const climateTransporPerformanceData = props.climateTransportPerformanceData[c]
                const climateEmissionVal = climateEmissionData[vtype]?.co2?.[y] || 0
                const climateTransportPerformanceVal = climateTransporPerformanceData[vtype]?.[y] || 0
                const climateVal = climateEmissionVal * 1000 / climateTransportPerformanceVal || 0
                chartData[chartData.length -1]["Climate (" + (c+1) + ") - " + vtype] = climateVal
                totalsForYear.climate[c] += climateVal
                maxClimateVal = Math.max(maxClimateVal, climateVal)
                csvExport[j*(numberOfClimateScenarios + 1)+2][y+3] = climateVal.toString()
            }
            totalForYear += Math.max(bauVal,maxClimateVal)
            totalsForYear.bau += bauVal
        }
        for (let c = 0; c < props.climateEmissionsData.length; c++) {
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
            saveAs(png, props.project.name.replace(" ", "_") + props.title.replace(" ", "_") + ".png")
        }
      }, [getPng])
    const unit = props.title.includes("pkm") ? "gCO2/pkm" : "gCO2/pkm"
    return (
        <div style={{marginTop: "20px"}}>
            <Row>
                <Col xs={10}><h3>{props.title}</h3></Col>
                <Col xs={1}>
                    {props.project.name && <CSVLink data={csvExport} filename={props.project.name.replace(" ", "_") + props.title.replace(" ", "_") + ".csv"} className="btn btn-primary" style={{width: "100%", padding: "4px 4px"}}>
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
                        <YAxis tickFormatter={(value:number) => new Intl.NumberFormat('fr').format(value)} domain={[0, maxValRoundedAbove]}/>
                        <Tooltip formatter={(value:number) => new Intl.NumberFormat('fr').format(value)} wrapperStyle={{zIndex: 10}}/>
                        <Legend />
                        {vtypes.map((vtype:string, i:number) => {
                            let jsx = [
                                <Bar key={"bau" + i} dataKey={"BAU - " + vtype} fill={props.highContrastColors ? colorsPerVtype[vtype] : `rgba(44, 177, 213, ${1-i/vtypes.length})`} stackId="bau" unit={' ' + unit}>
                                    <LabelList className={(props.showLabels ? "" : "d-none ") + "d-print-block"} dataKey={"BAU - " + vtype} content={CustomLabel} />
                                    {/* {i===0 && props.showPercents && <LabelList dataKey="percent" content={PercentLabel} />} */}
                                </Bar>
                            ]
                            for (let c = 0; c < props.climateEmissionsData.length; c++) {
                                if (!props.displayedClimateScenarios[c]) continue
                                jsx.push(
                                    <Bar key={"climate" + i + c} dataKey={"Climate (" + (c+1) + ") - " + vtype} fill={props.highContrastColors ? colorsPerVtype[vtype] : `rgba(162, 33, 124, ${1-i/vtypes.length})`} stackId={"climate" + c} unit={' ' + unit}>
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