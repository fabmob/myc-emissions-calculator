import React from "react";
import { useNavigate } from "react-router-dom"
import {Button, Row, Col,ProgressBar} from 'react-bootstrap'
import {ProjectType, ProjectStage} from '../frontendTypes'

const steps : {[stage in ProjectStage]: string[]} = {
    "Inventory": [
        "Vehicles and fuels in use",
        "Transport activity",
        "Fuel consumption factors",
        "Energy production CO2",
        "Top-down validation",
        "Vehicles load",
        "Results",
        "Vehicles trip length"
    ],
    "BAU": [
        "Transport activity",
        "Fuel breakdown",
        "Fuel consumption factors",
        "Energy production CO2",
        "Results"
    ],
    "Climate": [
        "Transport activity",
        "Transport performance",
        "Fuel breakdown",
        "Fuel consumption factors",
        "Results"
    ]
}
const withoutUpstreamClimateSteps = [
    "Use of vehicles : avoided",
    "Use of vehicles : added",
    "Vehicles load",
    "Vehicles shift",
    "Fuel breakdown",
    "Fuel consumption factors",
    "Results"
]

const Progress = (props: {project: ProjectType, stage: ProjectStage, currentStep: number, climateScenarioId?: number, isWithoutUpstream?: boolean}) => {
    const navigate = useNavigate()
    if (props.project.id === undefined) {
        return <div></div>
    }
    const link = (step: string) => {
        if (props.stage === "Climate" && props.climateScenarioId !== undefined) {
            if (props.isWithoutUpstream) {
                navigate(`/project/${props.project.id}/Climate/${props.climateScenarioId}/Without/step/${step}`)
            } else {
                navigate(`/project/${props.project.id}/Climate/${props.climateScenarioId}/With/step/${step}`)
            }
        } else {
            navigate('/project/' + props.project.id + '/' + props.stage + '/step/' + step)
        }
    }
    const getClassName = (step: number) => {
        // if (props.project.stages[props.stage][0].step === 9) {
        //     // Step 9: overview is done by default
        //     props.project.stages[props.stage][0].step = 100
        // }
        // const isStepResults = steps[props.stage][props.currentStep-1] === "Results"
        if (props.currentStep === step) {
            if (props.project.stages?.[props.stage][0]?.step > props.currentStep ) {
                return "currentStepDone"
            }
            return "currentStep"
        }
        if (!(props.project.stages?.[props.stage][0]?.step > step)) {
            return "stepDisabled"
        } else {
            return "stepDone"
        }
    }
    const progressValue = (props.project.stages?.[props.stage][0]?.step - 1) / steps[props.stage].length *100;
    const stepsToUse = props.isWithoutUpstream ? withoutUpstreamClimateSteps : steps[props.stage]
    return (
        <div className="progressMenu d-print-none">
            <div className="header">
                <span className="item"><span><h3>{props.stage}</h3></span></span>
                <Button variant="link" onClick={e => navigate("/project/" + props.project.id + "/edit")}><span className="item"><span>Exit</span></span></Button>
            </div>
            <hr/>
            <Row>
                <Col className="progressBar">
                    <span>
                        <ProgressBar now={progressValue} label={`${progressValue}%`} visuallyHidden />
                    </span>
                </Col>
            </Row>
            <Row>
                <Col className="lastSaved">
                    <span>Last saved : {new Date(props.project.modifiedDate).toLocaleString()}</span>
                </Col>
                
            </Row>
            <ol>
                {stepsToUse.map((step, index) => {
                    const className = getClassName(index + 1)
                    return (
                        <li className={className} key={index + 1} onClick={() => link((index + 1).toString())}>
                            <Button
                                variant="link"
                                disabled={props.project.stages?.[props.stage][0]?.step < index + 1}
                                >
                                {/* <span className="item"><span>{step}</span></span> */}
                                <span className="item">
                                    <span>{step}</span>
                                    {(className === "currentStepDone" || className === "stepDone") && <svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#check"}/></svg>}
                                </span>
                            </Button>
                        </li>
                    )
                    })}
            </ol>
        </div>
    );
};

export default Progress;
