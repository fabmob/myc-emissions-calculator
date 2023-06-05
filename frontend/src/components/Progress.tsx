import React from "react";
import { useNavigate } from "react-router-dom"
import {Button, Row, Col,ProgressBar} from 'react-bootstrap'
import {ProjectType, ProjectStage} from '../frontendTypes'
import './Progress.css'

const steps : {[stage in ProjectStage]: string[]} = {
    "Inventory": [
        "Vehicles and fuels in use",
        "Transport activity",
        "Fuel consumption factors",
        "Consumption of electricity",
        "Top-down validation",
        "Vehicles load",
        "Results",
        "Vehicles trip length"
    ],
    "BAU": [],
    "Scenario": []
}

const Progress = (props: {project: ProjectType, stage: ProjectStage, currentStep: number}) => {
    const navigate = useNavigate()
    const link = (step: string) => navigate('/project/' + props.project.id + '/' + props.stage + '/step/' + step)
    const getClassName = (step: number) => {
        if (props.project.stages[props.stage][0].step === 9) {
            // Step 9: overview is done by default
            props.project.stages[props.stage][0].step = 100
        }
        if (props.currentStep === step) {
            if (props.project.stages[props.stage][0].step > props.currentStep) {
                return "currentStepDone"
            }
            return "currentStep"
        }
        if (!(props.project.stages[props.stage][0].step > step)) {
            return "stepDisabled"
        } else {
            return "stepDone"
        }
    }
    if (props.project.stages?.[props.stage][0]?.step === undefined) {
        return <div className="progressMenu"></div>
    }
    const progressValue = props.project.stages?.[props.stage][0]?.step / 8 *100;
    return (
        <div className="progressMenu d-print-none">
            <Row className="align-items-center">
                <Col>
                    <h2>{props.stage}</h2>
                </Col>
                <Col>
                    <Button variant="link" onClick={e => navigate("/project/" + props.project.id + "/edit")}>Exit</Button>
                </Col>
            </Row>
            <hr/>
            <Row>
                <Col>
                    <ProgressBar now={progressValue} label={`${progressValue}%`} visuallyHidden />
                </Col>
            </Row>
            <Row>
                <Col>
                    <span className="item-sm">Last saved {new Date(props.project.modifiedDate).toLocaleString()}</span>
                </Col>
                
            </Row>
            <ol style={{"marginTop": "40px"}}>
                {steps[props.stage].map((step, index) => (
                    <li key={index + 1}>
                        <Button
                            className={getClassName(index + 1)}
                            variant="link"
                            disabled={props.project.stages[props.stage][0].step < index + 1}
                            onClick={() => link((index + 1).toString())}>
                            {step}
                        </Button>
                    </li>
                ))}
            </ol>
        </div>
    );
};

export default Progress;
