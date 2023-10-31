import React, {useState, useEffect} from 'react'
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
    useEffect(() => {
        if(props.showModal === true) {
            // Clear validation when reopening popup
            setValidated(false)
        }
    }, [props.showModal])
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
        <Modal className="selector" size="sm" centered show={props.showModal} onHide={() => props.setShowModal(false)}>
            <Form noValidate validated={validated} onSubmit={checkFrom}>
                {/* <Modal.Header></Modal.Header> */}
                <Modal.Body>
                    {
                        props.preventCreate 
                        ? <Form.Label>Select an option</Form.Label>
                        : <Form.Group>
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
                            <Form.Label>Select an option or create one</Form.Label>
                        </Form.Group>
                    }
                    <div className="options">
                        {props.availableChoices && props.availableChoices.map(choice => (
                            <div className="option" key={choice}><Badge onClick={e => setChoice(choice)} className="badge-default"><span className="item"><svg className="icon icon-size-s" viewBox="0 0 22 22"><use href={"/icons.svg#plus"}/></svg><span>{choice}</span></span></Badge></div>
                        ))
                        }
                    </div>
                </Modal.Body>
                {/* <Modal.Footer>
                    <Button variant="primary" type="submit">
                        <span className="item"><span>Save</span></span>
                    </Button>
                </Modal.Footer> */}
            </Form>
        </Modal>
    )
}

export default ChoiceModal
