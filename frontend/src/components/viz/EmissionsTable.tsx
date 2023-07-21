import React from "react"
import { ProjectType } from "../../frontendTypes"
import {Table, Badge} from 'react-bootstrap'
import ItemWithOverlay from "../ItemWithOverlay"

export default function EmissionsTable (props: {
    emissionsData: {[key: string]: {co2: number[], energy: number[]}},
    project: ProjectType
    }) {

    return (
        <Table bordered>
            <thead>
                <tr>
                    <th className="item-sm"><ItemWithOverlay overlayContent="Transport modes, current and expected"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg> Vehicle</ItemWithOverlay></th>
                    {props.project.referenceYears && props.project.referenceYears.map((y, yearIndex) => (
                        <th key={yearIndex}  className="item-sm" style={{whiteSpace: "initial"}}>
                            <ItemWithOverlay overlayContent={
                                    <div>
                                        Emissions (1000 tons of greenhouse gases) computed by the tool, using previous steps inputs. Values for each transport mode and fuel are computed as
                                        <div style={{backgroundColor: "#C5E8F2", padding: "10px", margin: "10px 0px 10px 0px"}}>
                                        <Badge bg="disabled">Fuel lower heating value (TJ/1000t)</Badge> / 10^6 x <Badge bg="disabled">Fuel density (kg/kg or kg/l)</Badge> x <Badge bg="disabled">Input VKT per fuel (Mkm)</Badge> x 10^6 x <Badge bg="disabled">Fuel consumption factor (l-kg-kwh/100km)</Badge> / 100 x <Badge bg="disabled">Fuel emission factor (kg/TJ)</Badge> / 10^6
                                        </div>
                                        These values per fuel are then summed per transport mode.<br/>
                                        Lower heating value, fuel density and fuel emission factors use default values that can be edited using the Edit GHG emission factors link above.
                                    </div>
                                }>
                                    <svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg> GHG {y} (1000t GHG)
                                </ItemWithOverlay>
                            </th>
                        
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
