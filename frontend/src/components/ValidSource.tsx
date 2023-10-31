import React from "react"
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap'

export default function ValidSource (props: {source: string, onClick?: Function}) {
    return (
        <OverlayTrigger placement="top" delay={{ show: 50, hide: 50 }} offset={[0, 24]} overlay={<Tooltip className="infoTooltip">{props.source}</Tooltip>}>
            <Button className="badge-default" size="sm" variant="link" onClick={(e:any)=> { if(props.onClick) props.onClick(e)}}>
                <span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#document"}/></svg></span>
            </Button>
        </OverlayTrigger>
    )
}
