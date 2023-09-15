import React from "react"
import { useNavigate } from "react-router-dom"
import { OverlayTrigger, Tooltip } from 'react-bootstrap'

export default function ItemWithOverlay (props: {children: React.ReactNode, overlayContent: React.ReactNode}) {
    const tooltip = (
        <Tooltip className="infoTooltip">
            <div className="tooltip-header">{props.children}</div>
            <div className="tooltip-content">{props.overlayContent}</div>
        </Tooltip>
    )
    return (
        <OverlayTrigger placement="top" delay={{ show: 250, hide: 400 }} overlay={tooltip} offset={[0, 20]}>
            <span>{props.children}</span>
        </OverlayTrigger>
    )
}
