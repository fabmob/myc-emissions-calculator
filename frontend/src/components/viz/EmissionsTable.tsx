import React from "react"
import { ProjectType } from "../../frontendTypes"
import {Table, Badge} from 'react-bootstrap'

export default function EmissionsTable (props: {
    emissionsData: {[key: string]: {co2: number[], energy: number[]}},
    project: ProjectType
    }) {

    return (
        <Table bordered>
            <thead>
                <tr>
                    <th className="item-sm">🛈 Vehicle</th>
                    {props.project.referenceYears && props.project.referenceYears.map((y, yearIndex) => (
                        <th key={yearIndex}  className="item-sm" style={{whiteSpace: "initial"}}>GHG {y} (1000t GHG)</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {Object.keys(props.emissionsData).map((vtype, index) => {
                    const vehicle = props.emissionsData[vtype]
                    return (<tr key={index}>
                        <td><Badge bg="disabled">{vtype}</Badge></td>
                        {props.project.referenceYears && props.project.referenceYears.map((y, yearIndex) => (
                            <td key={yearIndex}>{vehicle.co2[yearIndex].toFixed(2)}</td>
                        ))}
                    </tr>)
                    
                })}
                
            </tbody>
        </Table>
    )
}
