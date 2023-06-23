import React from "react";
import {Container, Row, Col,Button, Form} from 'react-bootstrap'
import {ProjectType, ProjectStage} from '../frontendTypes'
import Progress from "./Progress"
import './Progress.css'
import ItemWithOverlay from "./ItemWithOverlay";

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
        <Container className="projectStepContainer">
            <Row className="justify-content-md-center" style={{minHeight: "calc(100vh - 200px)", marginTop: "20px"}}>
                <Col xs="3" className="stepLeft">
                    <Progress project={props.project} stage={props.stage} currentStep={props.currentStep} climateScenarioId={props.climateScenarioId} isWithoutUpstream={props.isWithoutUpstream}/>
                </Col>
                <Col xs lg="8" className="stepRight">
                    {props.children}
                    {props.setInputData && (props.noteValue === undefined 
                        ? <Button variant="link" onClick={e=>setNote("")}><ItemWithOverlay overlayContent="Write a note to keep track of hypothesis and assumptions used to fill this step. For exemple, what arithmetic operations were used to convert data from sources to this tool's expected format.">+ Add a note</ItemWithOverlay></Button>
                        : <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                            <Form.Label><Button variant="link" onClick={e=>setNote(undefined)}>User note X</Button></Form.Label>
                            <Form.Control as="textarea" rows={3} value={props.noteValue} onChange={e => setNote(e.target.value)} />
                        </Form.Group>
                    )}
                </Col>
            </Row>
        </Container>
    )
}

export default ProjectStepContainerWrapper
