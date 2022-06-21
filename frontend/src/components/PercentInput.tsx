import React from "react"
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'

const PercentInput = (props: any) => {
    return (
        <Form.Group>
            <InputGroup>
                <Form.Control type="number" required name={props.name} min="-100" max="100" step="0.01" value={props.value} onChange={props.onChange} placeholder="" />
                <InputGroup.Text>%</InputGroup.Text>
                <Form.Control.Feedback type="invalid">Please enter a number between -100 and 100, avoid white spaces</Form.Control.Feedback>
            </InputGroup>
        </Form.Group>
    )
}

export default PercentInput
