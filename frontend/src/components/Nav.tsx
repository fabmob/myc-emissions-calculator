import React from "react";
import { useKeycloak } from "@react-keycloak/web";
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { NavLink } from "react-router-dom";


const MyNav = () => {
    const { keycloak } = useKeycloak();
    const roles = keycloak?.tokenParsed?.realm_access?.roles
    let isAdmin = false
    if (roles && roles.indexOf('app-admin') > -1) {
        isAdmin = true
    }
    return (
        <Navbar bg="light" expand="lg" className="d-print-none">
            <Container>
                <Navbar.Brand href="/">
                    <img style={{height: "50px", marginRight: "20px"}}src="/mobiliseyourcity.png" alt="Moblise Your City" />
                    MYC GHG Emissions Calculator
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <NavLink className="nav-link" to="/">Home</NavLink>
                        {!!keycloak.authenticated && (<NavLink className="nav-link" to="/getStarted">Get Started</NavLink>)}
                    </Nav>
                    {!!keycloak.authenticated && (
                        <Nav>
                            <NavDropdown title={keycloak?.tokenParsed?.preferred_username + (isAdmin ? " (admin)" : '')} id="navbarScrollingDropdown">
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
