import React from "react";

const MyFooter = () => {
    return (
        <footer className="footer">
            <div className='partnerLine'>
                <div className='group'>
                    <a href="https://commission.europa.eu/index_en" target="_blank" rel="noreferrer">
                        <div className="img-wrapper">
                            <img src='/logos/logo-EU.png' className="logo-EU" alt="European Commission"></img>
                        </div>
                    </a>
                    <a href="https://www.afd.fr/en" target="_blank" rel="noreferrer">
                        <div className="img-wrapper">
                            <img src='/logos/logo-AFD.png' className="logo-AFD" alt="AFD"></img>
                        </div>
                    </a>
                </div>
                <div className='group'>
                    <a href="https://www.ffem.fr/en" target="_blank" rel="noreferrer">
                        <div className="img-wrapper">
                            <img src='/logos/logo-FFEM.png' className="logo-FFEM" alt="FFEM"></img>
                        </div>
                    </a>
                    <a href="https://www.ecologie.gouv.fr/en" target="_blank" rel="noreferrer">
                        <div className="img-wrapper">
                            <img src='/logos/logo-MTE.png' className="logo-MTE" alt="Ministère de la transition écologique"></img>
                        </div>
                    </a>
                </div>
                <div className='group'>
                    <a href="https://www.bmz.de/en" target="_blank" rel="noreferrer">
                        <div className="img-wrapper">
                            <img src='/logos/logo-FMECD.png' className="logo-FMECD" alt="BMZ"></img>
                        </div>
                    </a>
                    <a href="https://www.bmuv.de/en/" target="_blank" rel="noreferrer">
                        <div className="img-wrapper">
                            <img src='/logos/logo-FMENCNSCP.png' className="logo-FMENCNSCP" alt="BMUV"></img>
                        </div>
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default MyFooter;
