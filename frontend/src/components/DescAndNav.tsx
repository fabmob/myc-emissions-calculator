import React from "react"
import { useNavigate } from "react-router-dom"
import { Button, Col, Row } from 'react-bootstrap'

type NavButton = {link?: string, variant: string, content: string, showArrow?: boolean, trigger?: Function}
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
            <Col lg="8">
                <div className="text desc masked-overflow-y">
                    {props.children}{props.seeMoreCallBack && 
                    <Button className="info-button" variant="link" onClick={e => props.seeMoreCallBack && props.seeMoreCallBack()}>
                        <span className="item"><span>Read more...</span></span>
                    </Button>}
                </div>
            </Col>
            <Col lg="4">
                <div className="nav">
                    <div className="prevNav">
                        {props.prevNav && <Button variant={props.prevNav.variant} onClick={e => handleClick(props.prevNav)}>
                            <span className="item">
                                {props.prevNav.showArrow && <svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#left"}/></svg>}
                                <span>{props.prevNav.content}</span>
                            </span>
                        </Button>}
                    </div>
                    <div className="nextNav">
                        {props.nextNav && <Button variant={props.nextNav.variant} onClick={e => handleClick(props.nextNav)} style={{whiteSpace: "nowrap"}}>
                            <span className="item">
                                <span>{props.nextNav.content}</span>
                                {props.nextNav.showArrow && <svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#right"}/></svg>}
                            </span>
                        </Button>}
                    </div>
                </div>
            </Col>
        </Row>
    )
}
