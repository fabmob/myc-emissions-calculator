import React from "react"
import { useNavigate } from "react-router-dom"
import {ButtonGroup, Button} from 'react-bootstrap'
import { ProjectType } from "../frontendTypes"

const ProjectNav = (props: {project: ProjectType, current: "Config" | "Edition" | "Compare"}) => {
    const navigate = useNavigate()
    const edit = () => navigate('/project/' + props.project.id + '/edit')
    const config = () => navigate('/project/' + props.project.id + '/config')
    const compare = () => navigate('/project/' + props.project.id + '/viz')
    return (
        <ButtonGroup size="lg" className="col-12" style={{marginBottom: "48px"}}>
            <Button variant={props.current === 'Config'? 'primary' : 'secondary'} onClick={config}><span className="item"><span>Config.</span></span></Button>
            <Button variant={props.current === 'Edition'? 'primary' : 'secondary'} onClick={edit}><span className="item"><span>Edition</span></span></Button>
            <Button variant={props.current === 'Compare'? 'primary' : 'secondary'} onClick={compare}><span className="item"><span>Comparison</span></span></Button>
        </ButtonGroup>
    )
}

export default ProjectNav

