import React from "react";
import {Container, Row, Col,Button, Form} from 'react-bootstrap'
import {ProjectType, ProjectStage} from '../frontendTypes'
import Progress from "./Progress"
import './Progress.css'
import ItemWithOverlay from "./ItemWithOverlay";
import Footer from "../components/Footer"

const ProjectStepContainerWrapper = (props: {
    project: ProjectType,
    stage: ProjectStage,
    currentStep: number,
    noteValue?: string | undefined,
    setInputData?: Function, 
    climateScenarioId?: number, 
    isWithoutUpstream?: boolean,
    children: React.ReactNode}) => {
    const setNote = (note: string | undefined) => {
        if (props.setInputData)
            props.setInputData((prevInputData: any) => {
                return {
                    ...prevInputData,
                    note: note
                }
            })
    }
    return (
        <>
            <section>
                <Container className="projectStepContainer">
                    <Row className="justify-content-md-center" style={{minHeight: "calc(100vh - 200px)", marginTop: "20px"}}>
                        <Col xs="3" className="stepLeft">
                            <Progress project={props.project} stage={props.stage} currentStep={props.currentStep} climateScenarioId={props.climateScenarioId} isWithoutUpstream={props.isWithoutUpstream}/>
                        </Col>
                        <Col xs lg="8" className="stepRight">
                            {props.children}
                            {props.setInputData && (props.noteValue === undefined 
                                ? <Button className="user-note-button" variant="link" onClick={e=>setNote("")}><ItemWithOverlay overlayContent="Write a note to keep track of hypothesis and assumptions used to fill this step. For exemple, what arithmetic operations were used to convert data from sources to this tool's expected format."><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#plus"}/></svg><span>Add a note</span></span></ItemWithOverlay></Button>
                                : <Form.Group className="user-note mb-3" controlId="exampleForm.ControlTextarea1">
                                    <Form.Label><Button className="user-note-button" variant="link" onClick={e=>setNote(undefined)}><span className="item"><span>User note</span><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#times"}/></svg></span></Button></Form.Label>
                                    <Form.Control as="textarea" rows={3} value={props.noteValue} onChange={e => setNote(e.target.value)} />
                                </Form.Group>
                            )}
                            <Row className="footer">
                                <Col lg="8">
                                    <Footer />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Container>
            </section>
        </>
    )
}

export default ProjectStepContainerWrapper
