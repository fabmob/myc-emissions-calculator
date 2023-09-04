import React from "react"
import { Dropdown, Badge } from "react-bootstrap"

export default function TTWorWTWSelector (props: {
    ttwOrWtw: "TTW" | "WTW",
    setTtwOrWtw: React.Dispatch<React.SetStateAction<"TTW" | "WTW">>
}) {
    return (
        <div style={{display: "flex", marginBottom: "10px"}}>
            Results are computed using the
            <Dropdown onSelect={(key:any) => props.ttwOrWtw === "TTW" ? props.setTtwOrWtw("WTW") : props.setTtwOrWtw("TTW")}>
                <Dropdown.Toggle as={Badge} bg="info" style={{margin: "0 10px 0 10px"}}>
                    {props.ttwOrWtw === "TTW" ? "Tank to Wheel (TTW)" : "Well to Wheel (WTW)"}
                </Dropdown.Toggle>
                <Dropdown.Menu style={{padding: "10px"}}>
                    <Dropdown.Item as={Badge} bg="info">
                        {props.ttwOrWtw === "WTW" ? "Tank to Wheel (TTW)" : "Well to Wheel (WTW)"}
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
            approach
        </div>
    )
}

