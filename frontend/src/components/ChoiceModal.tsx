import React, {useState} from 'react'
import { Modal, Form, InputGroup, Button, Badge } from "react-bootstrap"

const ChoiceModal = (props: {
    showModal: boolean,
    setShowModal: Function,
    valRange?: [string, string],
    availableChoices?: string[],
    callback: Function
}) => {
    const [inputVal, setInputVal] = useState("")
    const [validated, setValidated] = useState(false)
    const checkFrom = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        event.stopPropagation()
        setValidated(true)
        if (event.currentTarget.checkValidity() === false) {
            return
        }
        props.setShowModal(false)
        setInputVal("")
        props.callback(inputVal)
    }
    const setChoice = (choice: string) => {
        props.setShowModal(false)
        props.callback(choice)
    }
    return (
        <Modal size="sm" centered show={props.showModal} onHide={() => props.setShowModal(false)}>
            <Form noValidate validated={validated} onSubmit={checkFrom}>
                <Modal.Header closeButton>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Select an option or create one</Form.Label>
                        {props.valRange 
                            ? <InputGroup>
                                <Form.Control type="number" required min={props.valRange[0]} max={props.valRange[1]} value={inputVal} onChange={e => setInputVal(e.target.value)} />
                                <Form.Control.Feedback type="invalid">Please enter a value between {props.valRange[0]} and {props.valRange[1]}, avoid white spaces</Form.Control.Feedback>
                            </InputGroup>
                            : <InputGroup>
                                <Form.Control type="input" required value={inputVal} onChange={e => setInputVal(e.target.value)} />
                            </InputGroup>
                        }
                    </Form.Group>
                    {props.availableChoices && props.availableChoices.map(choice => (
                        <Badge key={choice} onClick={e => setChoice(choice)}>+ {choice}</Badge>
                    ))
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" type="submit">
                        Save
                    </Button>
                    <Button variant="secondary" onClick={() => props.setShowModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    )
}

export default ChoiceModal
