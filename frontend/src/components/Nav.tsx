import React from "react";
import { useKeycloak } from "@react-keycloak/web";
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { NavLink } from "react-router-dom";


const MyNav = () => {
    const { keycloak, initialized } = useKeycloak();
    return (
        <Navbar bg="light" expand="lg">
            <Container>
                <Navbar.Brand href="/">
                    <img style={{height: "50px", marginRight: "20px"}}src="/fabmob.png" alt="Fabmob" />
                    <img style={{height: "50px", marginRight: "20px"}}src="/mobiliseyourcity.png" alt="Moblise Your City" />
                    Emissions Calculator
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <NavLink className="nav-link" to="/">Home</NavLink>
                        {!!keycloak.authenticated && (<NavLink className="nav-link" to="/getStarted">Get Started</NavLink>)}
                    </Nav>
                    {!!keycloak.authenticated && (
                        <Nav>
                            <NavDropdown title={keycloak?.tokenParsed?.preferred_username} id="navbarScrollingDropdown">
                            <NavDropdown.Item onClick={() => keycloak.logout()}>logout</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    )}
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default MyNav;
