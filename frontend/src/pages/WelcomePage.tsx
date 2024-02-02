import React from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useNavigate } from 'react-router-dom'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Footer from "../components/Footer"

import { Image } from 'react-bootstrap'

export default function WelcomePage(){
    return (
        <>
            <Jumbo />
            <Initiative />
            <Methodology />
            <Devs />
            {/* <Partners /> */}
            <section className="footer">
                <div className="container">
                    <Row className="justify-content-md-center">
                        <Col lg="12">
                            <Footer />
                        </Col>
                    </Row>
                </div>
            </section>
        </>
    )
}
const Jumbo = () => {
    const { keycloak } = useKeycloak()
    const navigate = useNavigate()
    return (
        <>
        <section className="hero">
            <div className="container">
                <Row>
                    {/* <Col lg="12"><h1>Get emissions from local transportation</h1></Col> */}
                    <Col lg="5">
                        <h1>Estimate emissions from local transports</h1>
                        <div className="text">
                            <p>The <a href="https://www.mobiliseyourcity.net/" target="_blank" rel="noreferrer">MobiliseYourCity</a> Emissions Calculator helps government organizations and consulting agencies to estimate current and future greenhouse gas (GHG) emissions, and allows them to compare their “Business As Usual” scenario to GHG reduction plans.</p>
                            <p className="p3">The MobiliseYourCity Emissions Calculator is fully <a href="https://github.com/fabmob/myc-emissions-calculator/" target="_blank" rel="noreferrer">open source</a> and free to use.</p>
                        </div>
                        {/* {keycloak.authenticated ?
                            <Button variant="action" size="lg" 
                                onClick={() => navigate('/projects')}><span className="item"><span>Get started</span></span>
                            </Button>
                            : 
                            <Button variant="primary" size="lg" 
                                onClick={() => keycloak.login()}><span className="item"><span>Login</span></span>
                            </Button>
                        } */}
                        <Button variant="primary" size="lg" 
                                onClick={() => 
                                    {keycloak.authenticated ? navigate('/projects') : keycloak.login()}}>
                            <span className="item"><span>Get started</span></span>
                        </Button>                        
                    </Col>
                    <Col lg="7">
                        <div className="illustration">
                            {/* <div className="layers-wrapper">
                                <Image id="" src="/pictures/frame-364-3.png" alt=""></Image>
                                <Image id="" src="/pictures/frame-364-2.png" alt=""></Image>
                                <Image id="" src="/pictures/frame-364-1.png" alt=""></Image>
                            </div> */}
                            <div className="layers-wrapper">
                                <Image id="" src="/pictures/homepage-hero-illu-1.png" alt=""></Image>
                                <Image id="" src="/pictures/homepage-hero-illu-2.png" alt=""></Image>
                            </div>
                            {/* <img style={{}} src="/pictures/homepage-hero-illu.png" alt=""></img> */}
                        </div>
                        {/* this should be replaced with an illustration showing the map of a city or/and an emission graph */}
                    </Col>
                </Row>
            </div>
        </section>
        </>
    )
}
const Initiative = () => (
    <section className="" style={{position: "relative", background: "var(--c-h0-s0-l6)", boxShadow: "0rem 0rem 3.6rem 0rem hsla(0,0%,0%,0.2)"}}>
        <div className="container">
            <Row>
                <Col lg="5">
                    <h2 style={{marginTop: 0}}>Initiative</h2>
                    <div className="text">
                        <p>The Emissions Calculator is an initiative from the <a href="https://www.mobiliseyourcity.net/" target="_blank" rel="noreferrer">MobiliseYourCity</a> global partnership, which aims to improve sustainable mobility and decarbonize transport.</p>
                        <p>Launched in 2015, it has over <b>70 member cities</b> and <b>15 member countries</b>. It works to transition to sustainable urban mobility, develop comprehensive mobility plans, facilitate sustainable financing for large-scale projects, and close the investment gap for sustainable mobility.</p>
                    </div>
                </Col>
                <Col lg="7">
                    <div className="illustration">
                        <img style={{height: "120px"}} src="/pictures/myc_logo-h.png" alt="initiative"></img>
                    </div>
                </Col>
            </Row>
        </div>
    </section>
)
const Methodology = () => (
    <section className="" style={{position: "relative", background: "var(--c-h0-s0-l6)"}}>
        <div className="container">
            <Row>
                <Col lg="5">
                    <h2 style={{marginTop: 0}}>Methodology</h2>
                    <div className="text">
                        <p>The tool relies on a <b>bottom-up model</b> : calculations are based on distance travelled (whereas the top-down model bases the calculations on fuel/energy consumption). </p>
                        <p>The scope of the emission that should be taken into account is <b>based on a territorial principle</b> : basically all traffic within the city must taken into account. For more details, go to chapter 3.2 of <a href="https://www.mobiliseyourcity.net/sites/default/files/2022-04/MRV%20GHG%20Guidelines_ENG_2020_final.pdf">MYC-GHG Guidelines</a>. </p>
                    </div>
                </Col>
                <Col lg="7">
                    <div className="illustration">
                        <img style={{height: "200px"}} src="/pictures/methodology.svg" alt="methodology"></img>
                    </div>
                </Col>
            </Row>
        </div>
    </section>
)
const Devs = () => (
    <section className="" style={{position: "relative", background: "var(--c-h0-s0-l6)"}}>
        <div className="container">
            <Row>
                <Col lg="5">
                    <h2 style={{marginTop: 0}}>Development</h2>
                    <div className="text">
                        <p>The tool was developed by <a href="https://lafabriquedesmobilites.fr/" target="_blank" rel="noreferrer">Fabrique des Mobilités </a> based on the <a href="https://www.mobiliseyourcity.net/mobiliseyourcity-emissions-calculator" target="_blank" rel="noreferrer">Excel</a> model created by the <a href="http://www.ifeu.de" style={{display: 'inline'}}>Institute for Energy and Environmental Research</a> in cooperation with the German and French development agencies GIZ and AFD.</p>
                        <p>The developers are not responsible for the accuracy of the results. Any modification of the tool is the responsibility of the user. It is not allowed to use the tool for commercial purposes.</p>
                    </div>
                </Col>
                <Col lg="7">
                    <div className="illustration">
                        <img style={{height: "100px"}} src="/logos/logo-fabmob.png" alt="fabmob"></img>
                        <img style={{height: "100px"}} className="m-3" src="/logos/logo-IFEU.gif" alt="ifeu"></img>
                    </div>
                </Col>
            </Row>
        </div>
    </section>
)
