import React, {useCallback} from "react"
import { ProjectType, VehicleKilometresTravelledComputed } from "../../frontendTypes"
import { Bar, BarChart, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button, Col, Row } from "react-bootstrap"
import { CSVLink } from "react-csv"
import { useCurrentPng } from "recharts-to-png"
import { saveAs } from 'file-saver'

export default function ModalShareCompareBarChart(props: {
    title: string,
    bauModalShareData: VehicleKilometresTravelledComputed,
    climateModalShareData: VehicleKilometresTravelledComputed[],
    displayedClimateScenarios: boolean[],
    showLabels: boolean,
    highContrastColors: boolean,
    project: ProjectType
}) {
    const [getPng, { ref, isLoading }] = useCurrentPng()
    const defaultColors = ["#FF7C7C", "#FFEB7C", "#7BFFE3", "#7C81FF", "#DF7CFF", "#FF9F7C", "#CAFF7C", "#7CDDFF", "#9E7CFF", "#FF7CEC", "#FFB77C"," #8AFF89", "#7CB1FF", "#FF7CB2"]
    let chartData : {[key: string]: number}[] = []
    const vtypes = Object.keys(props.bauModalShareData)
    const numberOfClimateScenarios = props.displayedClimateScenarios.reduce((p,v)=>p+(v?1:0),0)
    let csvExport: (string)[][] = [
        ["scenario", "scenarioId", "vehicle"].concat((props.project?.referenceYears || []).map(e => e.toString()))
    ]
    for (let j = 0; j < vtypes.length; j++) {
        csvExport.push(["BAU", "1", vtypes[j]].concat((props.project?.referenceYears || []).map(e => "0")))
        for (let c = 0; c < props.climateModalShareData.length; c++) {
            if (!props.displayedClimateScenarios[c]) continue
            csvExport.push(["Climate", (c+1).toString(), vtypes[j]].concat((props.project?.referenceYears || []).map(e => "0")))
        }
    }
    for (let y = 0; y < props.project?.referenceYears?.length || 0; y++) {
        const year = props.project.referenceYears[y]
        chartData.push({
            name: year
        })
        for (let j = 0; j < vtypes.length; j++) {
            const vtype = vtypes[j];
            const bauValue = (props.bauModalShareData[vtype]?.[y] || 0) * 100
            csvExport[j*(numberOfClimateScenarios + 1)+1][y+3] = bauValue.toString()
            chartData[chartData.length -1]["BAU - " + vtype] = bauValue
            for (let c = 0; c < props.climateModalShareData.length; c++) {
                if (!props.displayedClimateScenarios[c]) continue
                const climateModalShareData = props.climateModalShareData[c]
                const climateModalShareVal = (climateModalShareData[vtype]?.[y] || 0) * 100
                chartData[chartData.length -1]["Climate (" + (c+1) + ") - " + vtype] = climateModalShareVal
                csvExport[j*(numberOfClimateScenarios + 1)+2][y+3] = climateModalShareVal.toString()
            }
        }
    }
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
      }, [getPng, props.project])
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
                            <YAxis tickFormatter={(value:number) => new Intl.NumberFormat('fr').format(value) + '%'} domain={[0, 100]}/>
                            <Tooltip formatter={(value:number) => new Intl.NumberFormat('fr').format(value)} wrapperStyle={{zIndex: 10}}/>
                            <Legend />
                            {vtypes.map((vtype:string, i:number) => {
                                let jsx = [
                                    <Bar key={"bau" + i} dataKey={"BAU - " + vtype} fill={props.highContrastColors ? colorsPerVtype[vtype] : `rgba(44, 177, 213, ${1-i/vtypes.length})`} stackId="bau" unit='%'>
                                        <LabelList className={(props.showLabels ? "" : "d-none ") + "d-print-block"} dataKey={"BAU - " + vtype} content={CustomLabel} />
                                    </Bar>
                                ]
                                for (let c = 0; c < props.climateModalShareData.length; c++) {
                                    if (!props.displayedClimateScenarios[c]) continue
                                    jsx.push(
                                        <Bar key={"climate" + i + c} dataKey={"Climate (" + (c+1) + ") - " + vtype} fill={props.highContrastColors ? colorsPerVtype[vtype] : `rgba(162, 33, 124, ${1-i/vtypes.length})`} stackId={"climate" +c} unit='%'>
                                            <LabelList className={(props.showLabels ? "" : "d-none ") + "d-print-block"} dataKey={"Climate (" + (c+1) + ") - " + vtype} content={CustomLabel} />
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