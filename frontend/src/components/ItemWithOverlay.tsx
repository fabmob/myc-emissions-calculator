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
        <OverlayTrigger placement="top" delay={{ show: 50, hide: 50 }} overlay={tooltip} offset={[0, 24]}>
            <span className="tooltip-button">{props.children}</span>
        </OverlayTrigger>
    )
}
