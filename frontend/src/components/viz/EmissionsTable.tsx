import React from "react"
import { ProjectType } from "../../frontendTypes"
import {Table, Badge} from 'react-bootstrap'
import ItemWithOverlay from "../ItemWithOverlay"
import OutputNumberTd from "../OutputNumberTd"

export default function EmissionsTable (props: {
    emissionsData: {[key: string]: {co2: number[], energy: number[]}},
    project: ProjectType
    }) {

    return (
        <Table bordered>
            <colgroup>
                <col className="tablecol4" />{/* Transport modes */}
                {props.project.referenceYears && props.project.referenceYears.map((y, yearIndex) => (
                    <col key={y} className="tablecolfluid" />
                ))}
            </colgroup>
            <thead>
                <tr>
                    <th><ItemWithOverlay overlayContent="Transport modes, current and expected"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>Vehicle</span></span></ItemWithOverlay></th>
                    {props.project.referenceYears && props.project.referenceYears.map((y, yearIndex) => (
                        <th key={yearIndex} >
                            <ItemWithOverlay overlayContent={
                                    <div>
                                        Emissions (1000 tons of greenhouse gases) computed by the tool, using previous steps inputs. Values for each transport mode and fuel are computed as
                                        <div style={{backgroundColor: "#C5E8F2", padding: "10px", margin: "10px 0px 10px 0px"}}>
                                        <Badge className="badge-read-only"><span className="item"><span>Fuel lower heating value (TJ/1000t)</span></span></Badge> / 10^6 × <Badge className="badge-read-only"><span className="item"><span>Fuel density (kg/kg or kg/l)</span></span></Badge> × <Badge className="badge-read-only"><span className="item"><span>Input VKT per fuel (Mkm)</span></span></Badge> × 10^6 × <Badge className="badge-read-only"><span className="item"><span>Fuel consumption factor (l-kg-kwh/100km)</span></span></Badge> / 100 × <Badge className="badge-read-only"><span className="item"><span>Fuel emission factor (kg/TJ)</span></span></Badge> / 10^6
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
                        <td>
                            <Badge className="badge-read-only">
                                <span className="item"><span>{vtype}</span></span>
                            </Badge>
                        </td>
                        {props.project.referenceYears && props.project.referenceYears.map((y, yearIndex) => (
                            <OutputNumberTd key={yearIndex} value={vehicle.co2[yearIndex]} decimals={2}></OutputNumberTd>
                        ))}
                    </tr>)
                })}

                <tr>
                    <td></td>
                    {props.project.referenceYears && props.project.referenceYears.map((y) => {
                        return (
                            <td key={y}></td>
                        )
                    })}
                </tr>
            </tbody>
        </Table>
    )
}
