import React from "react";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


const MyFooter = () => {
    return (
        <footer>
            {/* <div className="container">
                <Row>
                    <Col className=""> */}
                        <div className='partnerLine'>
                            <div className="img-wrapper">
                                <img src='/logos/logo-EU.png' className="logo-EU" alt="European Commission"></img>
                            </div>
                            <div className="img-wrapper">
                                <img src='/logos/logo-AFD.png' className="logo-AFD" alt="AFD"></img>
                            </div>
                            <div className="img-wrapper">
                                <img src='/logos/logo-FFEM.png' className="logo-FFEM" alt="FFEM"></img>
                            </div>
                            <div className="img-wrapper">
                                <img src='/logos/logo-MTE.png' className="logo-MTE" alt="Ministère de la transition écologique"></img>
                            </div>
                            <div className="img-wrapper">
                                <img src='/logos/logo-FMECD.png' className="logo-FMECD" alt="BMZ"></img>
                            </div>
                            <div className="img-wrapper">
                                <img src='/logos/logo-FMENCNSCP.png' className="logo-FMENCNSCP" alt="BMUV"></img>
                            </div>
                        </div>
                    {/* </Col>
                </Row>
            </div> */}
        </footer>
    );
};

export default MyFooter;
