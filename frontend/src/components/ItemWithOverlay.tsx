import React from "react"
import { useNavigate } from "react-router-dom"
import { OverlayTrigger, Tooltip } from 'react-bootstrap'

export default function ItemWithOverlay (props: {children: React.ReactNode, overlayContent: React.ReactNode}) {
    const tooltip = (
        <Tooltip className="infoTooltip">
            <div style={{fontWeight: 700, marginBottom: "14px"}}>{props.children}</div>
            <div style={{fontWeight: 500}}>{props.overlayContent}</div>
        </Tooltip>
    )
    return (
        <OverlayTrigger placement="top" delay={{ show: 250, hide: 400 }} overlay={tooltip}>
            <span>{props.children}</span>
        </OverlayTrigger>
    )
}
