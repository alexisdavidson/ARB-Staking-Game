import { useEffect, useState } from 'react'
import { Row, Col, Button, Image } from 'react-bootstrap'
import { getTimeLeftString } from './TimeOperation'
import logo from './assets/logo.png'

const Navbar = ({ account, menu, setMobileMenu, setMenu, setMenuConnectWallet, web3Handler}) => {

    return (
        <Row className="navigation">
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
                <Col className="logoCol col-4">
                    <div className="logoCountdown" onClick={() => setMenu(0)}>
                    </div>
                </Col>
                <Col className="m-0 p-0 col-4 navbarLinks">
                    <Image src={logo} className="logoimage" onClick={() => setMenu(0)}/>
                </Col>
                <Col className="col-4 connectButtonCol">
                    <div className="navbarLink" onClick={() => setMenu(1)}>
                        Leaderboard
                    </div>
                    <div>
                        {account ? (
                            <Button className="connectButton" >{account.slice(0, 4) + '...' + account.slice(38, 42)}</Button>
                        ) : (
                            <Button className="connectButton" onClick={web3Handler}>Connect Wallet</Button>
                        )}
                    </div>
                </Col>
            </div>
        </Row>
    );
}
export default Navbar