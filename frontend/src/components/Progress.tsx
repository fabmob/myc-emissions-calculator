import React from "react";
import { useNavigate } from "react-router-dom"
import Button from 'react-bootstrap/Button'
import {ProjectType} from '../frontendTypes'
import './Progress.css'

const Progress = (props: {project: ProjectType, currentStep: number}) => {
    const navigate = useNavigate()
    const link = (step: string) => navigate('/project/' + props.project.id + '/step/' + step)
    const viz = () => navigate('/project/' + props.project.id + '/viz')
    const getClassName = (step: number) => {
        if (props.project.step === 8) {
            // Step 8: overview is done by default
            props.project.step = 100
        }
        if (props.currentStep === step) {
            if (props.project.step > props.currentStep) {
                return "currentStepDone"
            }
            return "currentStep"
        }
        if (props.project.step === step){
            return "stepTodo"
        }
        if (props.project.step > step) {
            return "stepDone"
        } else {
            return "stepDisabled"
        }
    }
    if (props.project.step === undefined) {
        return <div className="progressMenu" style={{marginTop: "-20px"}}></div>
    }
    return (
        <div className="progressMenu" style={{marginTop: "-20px"}}>
            <Button
                className={getClassName(1)}
                disabled={props.project.step < 1}
                onClick={() => link('1')}>
                Socio economic data
            </Button>
            →
            <Button
                className={getClassName(2)}
                disabled={props.project.step < 2}
                onClick={() => link('2')}>
                Category of transport
            </Button>
            →
            <Button
                className={getClassName(3)}
                disabled={props.project.step < 3}
                onClick={() => link('3')}>
                Transport activity data
            </Button>
            →
            <Button
                className={getClassName(4)}
                disabled={props.project.step < 4}
                onClick={() => link('4')}>
                Vehicle occupancy
            </Button>
            →
            <Button
                className={getClassName(5)}
                disabled={props.project.step < 5}
                onClick={() => link('5')}>
                Fuel types
            </Button>
            →
            <Button
                className={getClassName(6)}
                disabled={props.project.step < 6}
                onClick={() => link('6')}>
                Fuel breakdown
            </Button>
            →
            <Button
                className={getClassName(7)}
                disabled={props.project.step < 7}
                onClick={() => link('7')}>
                Fuel consumption
            </Button>
            →
            <Button
                className={getClassName(8)}
                disabled={props.project.step < 8}
                onClick={() => viz()}>
                Overview
            </Button>
        </div>
    );
};

export default Progress;
