import React from "react"
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap'

export default function ValidSource (props: {source: string, onClick?: Function}) {
    return (
        <OverlayTrigger placement="top" delay={{ show: 250, hide: 400 }} overlay={<Tooltip>{props.source}</Tooltip>}>
            <Button variant="link" onClick={(e:any)=> { if(props.onClick) props.onClick(e)}}><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#document"}/></svg></span></Button>
        </OverlayTrigger>
    )
}
