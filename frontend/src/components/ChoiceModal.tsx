import React, {useState} from 'react'
import { Modal, Form, InputGroup, Button, Badge } from "react-bootstrap"

const ChoiceModal = (props: {
    showModal: boolean,
    setShowModal: Function,
    valRange?: [string, string],
    availableChoices?: string[],
    callback: Function,
    preventCreate?: boolean
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
                    {
                        props.preventCreate 
                        ? <Form.Label>Select an option</Form.Label>
                        : <Form.Group>
                            <Form.Label>Select an option or create one</Form.Label>
                            {props.valRange 
                                ? <InputGroup>
                                    <Form.Control type="number" required min={props.valRange[0]} max={props.valRange[1]} value={inputVal} onChange={e => setInputVal(e.target.value)} />
                                    <Form.Control.Feedback type="invalid">Please enter a value between {props.valRange[0]} and {props.valRange[1]}, avoid white spaces</Form.Control.Feedback>
                                </InputGroup>
                                : <InputGroup>
                                    <Form.Control type="input" required value={inputVal} onChange={e => setInputVal(e.target.value)} />
                                    <Form.Control.Feedback type="invalid">Please enter a source, select an existing one or close this modal.</Form.Control.Feedback>
                                </InputGroup>
                            }
                        </Form.Group>
                    }
                    {props.availableChoices && props.availableChoices.map(choice => (
                        <div key={choice}><Badge onClick={e => setChoice(choice)} bg="info">+ {choice}</Badge></div>
                    ))
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" type="submit">
                        Save
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    )
}

export default ChoiceModal
