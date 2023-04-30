import { useEffect, useState } from 'react'
import { Row, Col, Button } from 'react-bootstrap'
import { getTimeLeftString } from './TimeOperation'

const Navbar = ({ menu, setMobileMenu, setMenu, setMenuConnectWallet, timeleft, soundOn, toggleSoundOn }) => {
    
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
                        {timeleft && timeleft > 0 ? (
                            <div className="countdownPhaseLeft">
                                <div className="countdownPhase">
                                    Phase 1
                                </div>
                                <div className="countdownTimeleft">
                                    {getTimeLeftString(timeleft)} Left
                                </div>
                            </div>
                        ) : (
                            timeleft && timeleft < 0 ? (
                                <div className="countdownPhaseLeft">
                                    <div className="countdownPhase">Phase 2</div>
                                </div>
                            ) : (
                                <></>
                            )
                        )}
                    </div>
                </Col>
                <Col className="m-0 p-0 col-4 navbarLinks">
                    <div className="m-0 p-0 navbarLink" onClick={() => setMenuConnectWallet(1)}>
                        {menu == 1 ? (
                            <span className='selectedMenu'>Sacrifice</span>
                        ) : (
                            <>Sacrifice</>
                        )}
                    </div>
                    <div className="m-0 p-0 navbarLink" onClick={() => setMenuConnectWallet(2)}>
                        {menu == 2 ? (
                            <span className='selectedMenu'>Rebirth</span>
                        ) : (
                            <>Rebirth</>
                        )}
                    </div>
                    <div className="m-0 p-0 navbarLink" onClick={() => setMenuConnectWallet(3)}>
                        {menu == 3 ? (
                            <span className='selectedMenu'>New Primates</span>
                        ) : (
                            <>New Primates</>
                        )}
                    </div>
                </Col>
                <Col className="col-4 connectButtonCol">
                    {/* <ConnectButton showBalance={false} chainStatus="icon" className="connectButton" /> */}
                </Col>
            </div>
        </Row>
    );
}
export default Navbar