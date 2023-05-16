import { useEffect, useState } from 'react'
import { Row, Col, Button, Image } from 'react-bootstrap'
import { getTimeLeftString } from './TimeOperation'
import tg from './assets/tg.svg'
import tw from './assets/tw.svg'
import gb from './assets/gb.svg'

const Footer = ({ menu, setMobileMenu, setMenu, setMenuConnectWallet, web3Handler}) => {
    
    return (
        <Row className="footer">
            {/* MOBILE */}
            <div className="displayMobile"> 
                <Col className="logoCol col-5 col-md-5">
                </Col>
                <Col className="m-0 p-0 col-7 col-lg-5">
                    <div className="connectButtonCol">
                    </div>
                </Col>
            </div>

            {/* DESKTOP */}
            <div className="displayDesktop">
                <div className="footerLogos">
                    <Image src={tw} className="footerIcon" />
                    <Image src={tg} className="footerIcon" />
                    <Image src={gb} className="footerIcon" />
                </div>
            </div>
        </Row>
    );
}
export default Footer