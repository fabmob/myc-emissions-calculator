import React from "react"
import { useNavigate } from "react-router-dom"
import { Button, Col, Row } from 'react-bootstrap'

type NavButton = {link?: string, variant: string, content: string, trigger?: Function}
export default function DescAndNav (props: {children: React.ReactNode, prevNav?: NavButton, nextNav?: NavButton, seeMoreCallBack?: Function}) {
    const navigate = useNavigate()
    const handleClick = (nav: NavButton | undefined) => {
        if (!nav) {
            return
        }
        if (nav.trigger) {
            nav.trigger()
        } else if (nav.link){
            navigate(nav.link)
        }
    }
    return (
        <Row className="descAndNav">
            <Col xs="8">
                {props.children}
            </Col>
            <Col xs="4">
                <Row className="nav">
                    <Col className="prevNav" xs="6">
                        {props.prevNav && <Button variant={props.prevNav.variant} onClick={e => handleClick(props.prevNav)}><span className="item"><span>{props.prevNav.content}</span></span></Button>}
                    </Col>
                    <Col className="nextNav" xs="6">
                        {props.nextNav && <Button variant={props.nextNav.variant} onClick={e => handleClick(props.nextNav)} style={{whiteSpace: "nowrap"}}><span className="item"><span>{props.nextNav.content}</span></span></Button>}
                    </Col>
                </Row>
                <Row className="info">
                    <Col>
                        {props.seeMoreCallBack && <Button variant="link" onClick={e => props.seeMoreCallBack && props.seeMoreCallBack()}><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#circle-info"}/></svg><span>See more</span></span></Button>}
                    </Col>
                </Row>
            </Col>
        </Row>
    )
}
