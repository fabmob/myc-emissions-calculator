import React from 'react'
import { useKeycloak } from "@react-keycloak/web"
import { useNavigate } from 'react-router-dom'
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import './WelcomePage.css'
import { Image } from 'react-bootstrap'

export default function WelcomePage(){
    return (
        <div className="container">
            <Jumbo />
            <Methodology />
            <Devs />
            <Partners />
            {/* <footer className="p-3">
                <a href="https://github.com/fabmob/myc-emissions-calculator/" target="_blank" rel="noreferrer">
                    <Image src="/GitHub-Mark-32px.png" alt="github"></Image>
                </a>
            </footer> */}
        </div>
    )
}
const Jumbo = () => {
    const { keycloak } = useKeycloak()
    const navigate = useNavigate()
    return (
        <section className="hero">
            {/* <div id="container"> */}
            <Row>
                <Col lg="12"><h1>MYC GHG emissions calculator</h1></Col>
                <Col lg="6">
                    <div className="text">
                        <p>This online tool allows <b> greenhouse gas emission (GHG) calculations in the transport sector at the local level </b>.</p>
                        <p>It enables calculating GHG inventories of cities as well as BAU (business as usual) scenarios. <b>Governments can therefore calculate the environmental effects of local urban mobility activity and foresee the evolution if no actions is taken.</b></p>
                    </div>
                    {keycloak.authenticated ?
                    <Button variant="action" size="lg" onClick={() => navigate('/projects')}><span className="item"><span>Get started</span></span></Button>
                    : <Button variant="primary" size="lg" onClick={() => keycloak.login()}><span className="item"><span>Login</span></span></Button>
                    }
                </Col>
                <Col lg="6">
                    <div className="illustration">
                        <Image style={{maxHeight: '50vh'}} id="map-of-partners" src="/pictures/myc_map_transparent.png" alt="Map of partners"></Image>
                    </div>
                    {/* this should be replaced with an illustration showing the map of a city or/and an emission graph */}
                </Col>
            </Row>
            {/* </div> */}
        </section>
    )
}
const Methodology = () => (
    <section className="">
        <Row className='align-items-center'>
            <Col lg="6">
                <h2>Methodology</h2>
                <div className="text">
                    <p>It relies on a <b>bottom-up model</b> : calculations are based on distance travelled (whereas the top-down model bases the calculations on fuel/energy consumption). </p>
                    <p>The scope of the emission that should be taken into account is <b>based on a territorial principle</b> : basically all traffic within the city must taken into account. (For more details, go to chapter 3.2 of <a href="https://www.mobiliseyourcity.net/sites/default/files/2022-04/MRV%20GHG%20Guidelines_ENG_2020_final.pdf">MYC-GHG Guidelines</a>). </p>
                </div>
            </Col>
            <Col lg="6">
                <div className="illustration">
                    <img style={{height: "200px"}} src="/pictures/methodology.svg" alt="methodology"></img>
                </div>
            </Col>
        </Row>
    </section>
)
const Devs = () => (
    <section className="">
        <Row className='align-items-center'>
            <Col lg="6">
                <h2>Creators</h2>
                <div className="text">
                    <p>The tool was developed by <a href="https://lafabriquedesmobilites.fr/" target="_blank" rel="noreferrer">Fabrique des Mobilités </a> based on the <a href="https://www.mobiliseyourcity.net/mobiliseyourcity-emissions-calculator" target="_blank" rel="noreferrer">excel</a> model created by the <a href="http://www.ifeu.de">Institute for Energy and Environmental Research</a> in cooperation with the German and French development agencies GIZ and AFD. It is not allowed to use the tool for commercial purposes.</p>
                    <p>The developers are not responsible for the accuracy of the results. Any modification of the tool is the responsibility of the user.</p>
                </div>
            </Col>
            <Col lg="6">
                <div className="illustration">
                    <img style={{height: "100px"}} src="/logos/logo-fabmob.png" alt="fabmob"></img>
                    <img style={{height: "100px"}} className="m-3" src="/logos/logo-ifeu.gif" alt="ifeu"></img>
                </div>
            </Col>
        </Row>
    </section>
)
const Partners = () => (
    <section className="">
        <Row className='align-items-center'>
            <Col className="">
                {/* <!-- this needs to become a carousel. it takes way too much screen space. --> */}
                {/* <!-- <div>
                    <h2>This project is part of the MobiliseYourCity partnership</h2>
                </div> --> */}
                {/* <!-- <div>Supported by</div> --> */}
                <div className='partnerLine'>
                    {/* <div className="wrap">
                        <img className="fake" src="https://via.placeholder.com/300x200" />
                        <div className="img_wrap">
                            <img className="normal" src="https://via.placeholder.com/300x200/cccccc" />
                        </div>
                    </div> */}
                    <div className="img-wrapper">
                        <img src='/logos/logo-EU.png' className="logo-EU" alt="European Commission"></img>
                    </div>
                    <div className="img-wrapper">
                        <img src='/logos/logo-AFD.png' className="logo-AFD" alt="AFD"></img>
                    </div>
                    <div className="img-wrapper">
                        <img src='/logos/logo-FMENCNSCP.png' className="logo-FMENCNSCP" alt="BMUV"></img>
                    </div>
                    <div className="img-wrapper">
                        <img src='/logos/logo-FMECD.png' className="logo-FMECD" alt="BMZ"></img>
                    </div>
                    <div className="img-wrapper">
                        <img src='/logos/logo-FFEM.png' className="logo-FFEM" alt="FFEM"></img>
                    </div>
                    <div className="img-wrapper">
                        <img src='/logos/logo-MTE.png' className="logo-MTE" alt="Ministère de la transition écologique"></img>
                    </div>
                </div>
                {/* <!-- <div>Implemented by</div>
                <div className='partnerLine'>
                    <div className="img-wrapper">
                    <img src='/logos/logo-AFD.png' className="logo-AFD" alt="AFD"></img>
                    </div>
                    <div className="img-wrapper">
                        <img src='/logos/logo-GIZ.png' className="logo-GIZ" alt="GIZ"></img>
                    </div>
                    <div className="img-wrapper">
                        <img src='/logos/logo-ADEME.png' className="logo-ADEME" alt="Ademe"></img>
                    </div>
                    <div className="img-wrapper">
                        <img src='/logos/logo-Cerema.png' className="logo-Cerema" alt="Cerema"></img>
                    </div>
                    <div className="img-wrapper">
                        <img src='/logos/logo-Codatu.png' className="logo-Codatu" alt="Codatu"></img>
                    </div>
                    <div className="img-wrapper">
                        <img src='/logos/logo-EB.png' className="logo-EB" alt="European Bank"></img>
                    </div>
                    <div className="img-wrapper">
                        <img src='/logos/logo-KFW.png' className="logo-KFW" alt="KFW"></img>
                    </div>
                    <div className="img-wrapper">
                        <img src='/logos/logo-WI.png' className="logo-WI" alt="Wuppertal"></img>
                    </div>  
                </div>
                <div>Knowledge and Network Partners</div>
                <div className='partnerLine'>
                    <div className="img-wrapper">
                        <img src='/logos/logo-ECF.png' className="logo-ECF" alt="ECF"></img>
                    </div>
                    
                    <div className="img-wrapper">
                        <img src='/logos/logo-GPIT.png' className="logo-GPIT" alt="GPIT"></img>
                    </div>
                    
                    <div className="img-wrapper">
                        <img src='/logos/logo-ITDP.png' className="logo-ITDP" alt="ITDP"></img>
                    </div>
                    
                    <div className="img-wrapper">
                        <img src='/logos/logo-Platforma.png' className="logo-Platforma" alt="Platforma"></img>
                    </div>
                    
                    <div className="img-wrapper">
                        <img src='/logos/logo-SSATP.png' className="logo-SSATP" alt="SSATP"></img>
                    </div>
                    
                    <div className="img-wrapper">
                        <img src='/logos/logo-TRUFI.png' className="logo-TRUFI" alt="Trufi association"></img>
                    </div>
                    
                    <div className="img-wrapper">
                        <img src='/logos/logo-UCLG.png' className="logo-UCLG" alt="UCLG"></img>
                    </div>
                    
                    <div className="img-wrapper">
                        <img src='/logos/logo-UNH.png' className="logo-UNH" alt="UNHABITAT"></img>
                    </div>
                    
                </div>
                <div>In collaboration with</div>
                <div className='partnerLine'>
                    <div className="img-wrapper">
                        <img src='/logos/logo-TUMI.png' className="logo-TUMI" alt="TUMI"></img>
                    </div>
                    <div className="img-wrapper">
                        <img src='/logos/logo-Euroclima.png' className="logo-Euroclima" alt="Euroclima+"></img>
                    </div>
                    <div className="img-wrapper">
                        <img src='/logos/logo-ADB.png' className="logo-ADB" alt="ADB"></img>
                    </div>
                    <div className="img-wrapper">
                        <img src='/logos/logo-MP.png' className="logo-MP" alt="Marrakech Partnership"></img>
                    </div>
                    <div className="img-wrapper">
                       <img src='/logos/logo-SMFA.png' className="logo-SMFA" alt="SuM4All"></img>
                    </div>
                    <div className="img-wrapper">
                        <img src='/logos/logo-DTFA.png' className="logo-DTFA" alt="DT4A"></img>
                    </div>
                </div> --> */}
            </Col>
        </Row>
    </section>
)