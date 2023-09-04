import React, {useCallback, useState} from "react"
import { ProjectType, TransportPerformance } from "../../frontendTypes"
import { Bar, BarChart, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { computePercentIncrease } from "../../utils/computePercentIncrease"
import { CSVLink } from "react-csv"
import { useCurrentPng } from "recharts-to-png"
import { saveAs } from 'file-saver'
import { Button, Col, Row } from "react-bootstrap"

export default function TransportPerformanceCompareBarChart (props: {
    title: string,
    bauTransportPerformanceData: TransportPerformance,
    climateTransportPerformanceData: TransportPerformance[],
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
        for (let c = 0; c < props.climateTransportPerformanceData.length; c++) {
            if (!props.displayedClimateScenarios[c]) continue
            csvExport.push(["Climate", (c+1).toString(), vtypes[j]].concat((props.project?.referenceYears || []).map(e => "0")))
        }
    }
    for (let y = 0; y < props.project?.referenceYears?.length || 0; y++) {
        const year = props.project.referenceYears[y];
        let totalForYear = 0
        let totalsForYear = {bau: 0, climate: props.climateTransportPerformanceData.map(_=>0)}
        chartData.push({
            name: year
        })
        for (let j = 0; j < vtypes.length; j++) {
            const vtype = vtypes[j];
            const bauVal = props.bauTransportPerformanceData[vtype]?.[y] || 0
            chartData[chartData.length -1]["BAU - " + vtype] = bauVal
            totalsForYear.bau += bauVal
            csvExport[j*(numberOfClimateScenarios + 1)+1][y+3] = bauVal.toString()
            let maxClimateVal = 0
            for (let c = 0; c < props.climateTransportPerformanceData.length; c++) {
                if (!props.displayedClimateScenarios[c]) continue
                const climateTransporPerformanceData = props.climateTransportPerformanceData[c]
                const climateTransportPerformanceVal = climateTransporPerformanceData[vtype]?.[y] || 0
                chartData[chartData.length -1]["Climate (" + (c+1) + ") - " + vtype] = climateTransportPerformanceVal
                totalsForYear.climate[c] += climateTransportPerformanceVal
                maxClimateVal = Math.max(maxClimateVal, climateTransportPerformanceVal)
                csvExport[j*(numberOfClimateScenarios + 1)+2][y+3] = climateTransportPerformanceVal.toString()
            }
            totalForYear += Math.max(bauVal,maxClimateVal)
        }
        for (let c = 0; c < props.climateTransportPerformanceData.length; c++) {
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
    const unit = props.title.includes("pkm") ? "pkm" : "tkm"
    return (
        <div className="chart">
            <div className="chart-header">
                <h3>{props.title}</h3>
                <div className="commands">
                    {props.project.name && 
                    <CSVLink data={csvExport} filename={props.project.name.replace(" ", "_") + "_emissions.csv"} className="btn btn-link">
                        <span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#download"}/></svg><span>CSV</span></span>
                    </CSVLink>}                      
                    <Button variant="link" onClick={handleDownload} style={{width: "100%", padding: "4px 4px"}}>
                        {isLoading 
                        ? <span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg></span>
                        : <span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#download"}/></svg><span>Graph</span></span>}
                    </Button>
                </div>
            </div>
            <div className="chart-content">
                <div>
                    <ResponsiveContainer width="100%" height={340}>
                        <BarChart data={chartData} ref={ref}>
                            <XAxis dataKey="name" />    
                            <YAxis tickFormatter={(value:number) => new Intl.NumberFormat('fr').format(value) + unit} domain={[0, maxValRoundedAbove]}/>
                            <Tooltip formatter={(value:number) => new Intl.NumberFormat('fr').format(value)} wrapperStyle={{zIndex: 10}}/>
                            <Legend />
                            {vtypes.map((vtype:string, i:number) => {
                                let jsx = [
                                    <Bar barSize={22} key={"bau" + i} dataKey={"BAU - " + vtype} fill={props.highContrastColors ? colorsPerVtype[vtype] : `rgba(44, 177, 213, ${1-i/vtypes.length})`} stackId="bau" unit={' ' + unit}>
                                        <LabelList className={(props.showLabels ? "" : "d-none ") + "d-print-block"} dataKey={"BAU - " + vtype} content={CustomLabel} />
                                        {/* {i===0 && props.showPercents && <LabelList dataKey="percent" content={PercentLabel} />} */}
                                    </Bar>
                                ]
                                for (let c = 0; c < props.climateTransportPerformanceData.length; c++) {
                                    if (!props.displayedClimateScenarios[c]) continue
                                    jsx.push(
                                        <Bar barSize={22} key={"climate" + i + c} dataKey={"Climate (" + (c+1) + ") - " + vtype} fill={props.highContrastColors ? colorsPerVtype[vtype] : `rgba(162, 33, 124, ${1-i/vtypes.length})`} stackId={"climate" + c} unit={' ' + unit}>
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