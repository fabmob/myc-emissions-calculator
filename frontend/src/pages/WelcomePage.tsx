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
        <>
            <Jumbo />
            <Methodology />
            <Devs />
            <Partners />
            <footer className="p-3">
                <a href="https://github.com/fabmob/myc-emissions-calculator/" target="_blank" rel="noreferrer">
                    <Image src="/GitHub-Mark-32px.png" alt="github"></Image>
                </a>
            </footer>
        </>
    )
}
const Jumbo = () => {
    const { keycloak } = useKeycloak()
    const navigate = useNavigate()
    return (
        <header className="shadowbelow">
            <div id="container">
                <div>
                    <h1>Calculate and monitor transport related GHG emissions with MobiliseYourCity</h1>
                </div>
                <Row>
                    <Col xs lg="12">
                        <p>
                            This online tool allows <b> greenhouse gas emission (GHG) calculations in the transport sector at the local level </b>.
                        </p>
                        <p>
                        It enables calculating GHG inventories of cities as well as BAU (business as usual) scenarios. <b>Governments can therefore calculate the environmental effects of local urban mobility activity and foresee the evolution if no actions is taken.</b>
                        </p>
                        {keycloak.authenticated ?
                        <Button variant="success" size="lg" onClick={() => navigate('/getStarted')}>Get Started</Button>
                        : <Button variant="primary" size="lg" onClick={() => keycloak.login()}>Login</Button>
                        }
                    </Col>
                </Row>
                <Row>
                    <Image style={{maxHeight: '50vh'}} className="mt-2" src="/myc_map_transparent.png" alt="map of partners"></Image>
                </Row>
            </div>
        </header>
    )
}
const Methodology = () => (
    <section className="p-3 shadowbelow">
        <Row className='align-items-center'>
            <Col lg={{span: '5', offset: '1'}} className="p-5">
                <h1>Methodology</h1>
                <p>It relies on a <b>bottom-up model</b> : calculations are based on distance travelled (whereas the top-down model bases the calculations on fuel/energy consumption). </p>
                <p>The scope of the emission that should be taken into account is <b>based on a territorial principle</b> : basically all traffic within the city must taken into account. (For more details, go to chapter 3.2 of <a href="https://www.mobiliseyourcity.net/sites/default/files/2022-04/MRV%20GHG%20Guidelines_ENG_2020_final.pdf">MYC-GHG Guidelines</a>). </p>
            </Col>
            <Col lg="5" className="p-5">
                <img style={{height: "200px"}} src="/methodology.svg" alt="methodology"></img>
            </Col>
        </Row>
    </section>
)
const Devs = () => (
    <section className="p-3 shadowbelow">
        <Row className='align-items-center'>
            <Col lg={{span: '5', order: 'last'}} className="p-5">
                <h1>Creators</h1>
                <p>The tool was developed by <a href="https://lafabriquedesmobilites.fr/" target="_blank" rel="noreferrer">Fabrique des Mobilités </a> based on the excel model created by the <a href="http://www.ifeu.de">Institute for Energy and Environmental Research</a> in cooperation with the German and French development agencies GIZ and AFD. It is not allowed to use the tool for commercial purposes.</p>
                <p>The developers are not responsible for the accuracy of the results. Any modification of the tool is the responsibility of the user.</p>
            </Col>
            <Col lg={{span: '5', order: 'first', offset: '1'}} className="p-5">
                <img style={{height: "100px"}} src="/fabmob.png" alt="fabmob"></img>
                <img style={{height: "100px"}} className="m-3" src="/ifeu.gif" alt="ifeu"></img>
            </Col>
        </Row>
    </section>
)
const Partners = () => (
    <section className="p-3">
        <Row className='align-items-center'>
            <Col className="p-5">
                <div>
                    <h1>This project is taking part of the MobiliseYourCity partnership</h1>
                </div>
                <div>Supported by</div>
                <div className='partnerLine'>
                    <img src='/partners/EuropeanCommission_logo.jpg' alt="European Commission"></img>
                    <img src='/partners/AFD_logo.png' alt="AFD"></img>
                    <img src='/partners/BMUV-Logo_en_2022.jpg' alt="BMUV"></img>
                    <img src='/partners/BMZ-Logo_en.png' alt="BMZ"></img>
                    <img src='/partners/FFEM_logo.jpg' alt="FFEM"></img>
                    <img src='/partners/Min_transition_ecologique_logo.jpg' alt="Ministère de la transition écologique"></img>
                </div>
                <div>Implemented by</div>
                <div className='partnerLine'>
                    <img src='/partners/AFD_logo.png' alt="AFD"></img>
                    <img src='/partners/GIZ_logo.jpg' alt="GIZ"></img>
                    <img src='/partners/Ademe2020_GB_RVB.jpg' alt="Ademe"></img>
                    <img src='/partners/Cerema_horizontal_ENG_RVB.jpg' alt="Cerema"></img>
                    <img src='/partners/Codatu_logo.png' alt="Codatu"></img>
                    <img src='/partners/European-bank-for-reconstruction-and-development-ebrd-vector-logo-horizontal.png' alt="European Bank"></img>
                    <img src='/partners/KfW_logo.png' alt="KFW"></img>
                    <img src='/partners/WUPPERTAL_logo.png' alt="Wuppertal"></img>
                </div>
                <div>Knowledge and Network Partners</div>
                <div className='partnerLine'>
                    <img src='/partners/ECF_logo.jpg' alt="ECF"></img>
                    <img src='/partners/GPIT_logo.png' alt="GPIT"></img>
                    <img src='/partners/ITDP_logo.png' alt="ITDP"></img>
                    <img src='/partners/Platforma_logo.png' alt="Platforma"></img>
                    <img src='/partners/Ssatp_logo.jpg' alt="Ssatp"></img>
                    <img src='/partners/Trufi_association_logo.png' alt="Trufi association"></img>
                    <img src='/partners/UCLG_logo.jpg' alt="UCLG"></img>
                    <img src='/partners/UNHABITAT_logo.jpg' alt="UNHABITAT"></img>
                </div>
                <div>In collaboration with</div>
                <div className='partnerLine'>
                    <img src='/partners/TUMI_logo.jpg' alt="TUMI"></img>
                    <img src='/partners/Euroclima+_logo.jpg' alt="Euroclima+"></img>
                    <img src='/partners/ADB_logo.png' alt="ADB"></img>
                    <img src='/partners/Marrakech_Partnership.png' alt="Marrakech Partnership"></img>
                    <img src='/partners/SuM4All_logo.png' alt="SuM4All"></img>
                    <img src='/partners/DT4A_logo.png' alt="DT4A"></img>
                </div>
            </Col>
        </Row>
    </section>
)