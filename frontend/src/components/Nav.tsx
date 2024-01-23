import React from "react";
import { useKeycloak } from "@react-keycloak/web";
import Navbar from 'react-bootstrap/Navbar';
import { Container, Row, Col } from 'react-bootstrap';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { NavLink } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import { useLocation } from "react-router-dom";


const MyNav = () => {
    const { keycloak } = useKeycloak();
    const roles = keycloak?.tokenParsed?.realm_access?.roles
    let isAdmin = false
    if (roles && roles.indexOf('app-admin') > -1) {
        isAdmin = true
    }
    /* adrien : discriminate homepage nav */
        const {pathname} = useLocation();
    return (
        <header className={pathname=="/" ? "homepage-header" : ""}>
            <Container>
                <Row className="justify-content-md-center">
                    <Col lg="12">
                        <Navbar expand="lg" className="d-print-none">
                            <Navbar.Brand href="/">
                                {/* <img style={{height: "50px", marginRight: "20px"}}src="/mobiliseyourcity.png" alt="Mobilise Your City" /> */}
                                <span className="item"><span>MYC Emissions Calculator</span></span>
                            </Navbar.Brand>
                            <Navbar.Toggle aria-controls="basic-navbar-nav" />
                            <Navbar.Collapse id="basic-navbar-nav">
                                <Nav className="ms-auto">
                                    {/* <NavLink className="nav-link" to="/"><span className="item"><span>Home</span></span></NavLink> */}
                                    {!!keycloak.authenticated && (<NavLink className="nav-link" to="/projects"><span className="item"><span>Projects</span></span></NavLink>)}
                                </Nav>
                                {keycloak.authenticated ?
                                    <Nav>
                                        <NavDropdown 
                                            title={
                                                <span className="item">
                                                    <span>
                                                        {keycloak?.tokenParsed?.preferred_username 
                                                        + (isAdmin ? " (admin)" : "")}
                                                    </span>
                                                </span>
                                            } 
                                            id="navbarScrollingDropdown">
                                            <NavDropdown.Item onClick={() => keycloak.logout()}>Logout</NavDropdown.Item>                
                                        </NavDropdown>    
                                    </Nav>
                                    : 
                                    <NavLink className="nav-link" to="/">
                                        <Button style={{fontSize: "inherit", color: "inherit"}} variant="btn-link" onClick={() => keycloak.login()}><span className="item"><span>Login</span></span></Button>
                                    </NavLink>
                                }
                                <span className="github-link-container">
                                    <span className="item">
                                        <a id="github-link" href="https://github.com/fabmob/myc-emissions-calculator/" target="_blank" rel="noreferrer">
                                            <svg viewBox="0 0 98 96"><use href={"/logos/logo-github.svg#0"}/></svg>  
                                        </a>
                                    </span>
                                </span>
                            </Navbar.Collapse>
                        </Navbar>
                    </Col>
                </Row>
            </Container>
        </header>
    );
};

export default MyNav;
