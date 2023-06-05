import React from "react"
import {Form, OverlayTrigger, Tooltip} from 'react-bootstrap'

const ErrorTooltip = (props: any) => {
    return (<Tooltip className="errorTooltip" {...props}>
        The sum of fuel shares in each vehicle category must be 100 %
    </Tooltip>)
}
const PercentInput = (props: {value:string, onChange: Function, invalid?: boolean, name?: string}) => {
    if (props.invalid) {
        return (
            <OverlayTrigger placement="bottom" delay={{ show: 250, hide: 400 }} overlay={ErrorTooltip}>
                <Form.Control className="cellError" value={props.value} onChange={e => props.onChange(e)}></Form.Control>
            </OverlayTrigger>
        )   
    }
    return (
        <Form.Control value={props.value} onChange={e => props.onChange(e)}></Form.Control>
    )
}

export default PercentInput
        // <Form.Group>
        //     <InputGroup>
        //         <Form.Control type="number" required name={props.name} min="-100" max="100" step="0.01" value={props.value} onChange={props.onChange} placeholder="" />
        //         <InputGroup.Text>%</InputGroup.Text>
        //         <Form.Control.Feedback type="invalid">Please enter a number between -100 and 100, avoid white spaces</Form.Control.Feedback>
        //     </InputGroup>
        // </Form.Group>