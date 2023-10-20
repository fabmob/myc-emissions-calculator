import React from "react"
import { Dropdown, Badge } from "react-bootstrap"

export default function TTWorWTWSelector (props: {
    ttwOrWtw: "TTW" | "WTW",
    setTtwOrWtw: React.Dispatch<React.SetStateAction<"TTW" | "WTW">>
}) {
    return (
        <div className="text">
            <p style={{display: "inline-flex", gap:"0.4em"}}>
                Results are computed using the
                <Dropdown onSelect={(key:any) => props.ttwOrWtw === "TTW" ? props.setTtwOrWtw("WTW") : props.setTtwOrWtw("TTW")}>
                    <Dropdown.Toggle as={Badge} className="badge-default" style={{verticalAlign:"text-top"}}>
                        {props.ttwOrWtw === "TTW" ? "Tank to Wheel (TTW)" : "Well to Wheel (WTW)"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item as={Badge} className="badge-default">
                            {props.ttwOrWtw === "WTW" ? "Tank to Wheel (TTW)" : "Well to Wheel (WTW)"}
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                approach.
            </p>
        </div>
    )
}

