import React, {useState} from "react"
import { ProjectType } from "../../frontendTypes"
import { Bar, BarChart, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function EmissionsBarChart (props: {
    emissionsData: {[key: string]: {co2: number[], energy: number[]}},
    project: ProjectType
}) {
    const defaultColors = ["#2CB1D5", "#A2217C", "#808080", "#67CAE4", "#CE8DBB", "#B3B3B3", "#C5E8F2", "#EBD1E1", "#E6E6E6"]
    let emissionChartData : {[key: string]: number}[] = []
    const vtypes = Object.keys(props.emissionsData)
    let highestYearTotal = 0
    for (let y = 0; y < props.project?.referenceYears?.length || 0; y++) {
        const year = props.project.referenceYears[y]
        let totalForYear = 0
        emissionChartData.push({
            name: year
        })
        for (let j = 0; j < vtypes.length; j++) {
            const vtype = vtypes[j];
            emissionChartData[emissionChartData.length -1][vtype] = props.emissionsData[vtype].co2[y]
            totalForYear += props.emissionsData[vtype].co2[y]
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
    const [showPercents, setShowPercents] = useState(false)
    const [showLabels, setShowLabels] = useState(false)
    return (
        <ResponsiveContainer width="90%" height={300}>
            <BarChart margin={{left: 50, top: showPercents? 20: 0}} data={emissionChartData}>
                <XAxis dataKey="name" />    
                <YAxis tickFormatter={(value:number) => new Intl.NumberFormat('fr').format(value) + 't'} domain={[0, maxValRoundedAbove]}/>
                <Tooltip formatter={(value:number) => new Intl.NumberFormat('fr').format(value)}/>
                <Legend />
                {vtypes.map((vtype:string, i:number) => (
                    <Bar key={i} dataKey={vtype} fill={colorsPerVtype[vtype]} stackId="a" unit=' tons GHG'>
                        <LabelList className={(showLabels ? "" : "d-none ") + "d-print-block"} dataKey={vtype} content={CustomLabel} />
                        {i===0 && showPercents && <LabelList dataKey="percent" content={PercentLabel} />}
                    </Bar>
                ))}
            </BarChart>
        </ResponsiveContainer>
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