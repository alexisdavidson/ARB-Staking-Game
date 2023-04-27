import { useEffect, useState } from 'react'
import { Row, Col, Button } from 'react-bootstrap'
import logo from './assets/PP_LINEAR_LOGO.png'
import mobileMenu from './assets/mobile/menu.svg'
import soundOffImg from './assets/audio_off.svg'
import soundOnImg from './assets/audio_on.svg'
import { getTimeLeftString } from './TimeOperation'
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Navbar = ({ menu, setMobileMenu, setMenu, setMenuConnectWallet, timeleft, soundOn, toggleSoundOn }) => {
    
    return (
        <Row className="navigation">
            <audio id="audioElement" autoPlay>
                <source src="bgm.mp3" type="audio/mp3" />
            </audio>

            {/* MOBILE */}
            <div className="displayMobile"> 
                <Col className="logoCol col-5 col-md-5">
                    <Button onClick={() => setMobileMenu(true)} className="soundButton"><img src={mobileMenu} className="soundImg" /></Button>
                        
                </Col>
                <Col className="m-0 p-0 col-7 col-lg-5">
                    <div className="connectButtonCol">
                        <Button onClick={toggleSoundOn} className="soundButton"><img src={soundOn ? soundOnImg : soundOffImg} className="soundImg" /></Button>
                        <ConnectButton.Custom>
                    {({
                        account,
                        chain,
                        openConnectModal,
                        openAccountModal
                    }) => {
                    const connected = account && chain;
                    return (
                        <div>
                            {!connected ? (
                                <Button className="connectButtonDisconnected" onClick={() => {openConnectModal()}}>Connect Wallet</Button>
                            ) : (
                                <Button className="connectButton" onClick={() => {openAccountModal()}}>{account.address.slice(0, 4) + '...' + account.address.slice(38, 42)}</Button>
                            )}
                        </div>
                        );
                    }}
                </ConnectButton.Custom>
                    </div>
                </Col>
            </div>

            {/* DESKTOP */}
            <div className="displayDesktop">
                <Col className="logoCol col-4">
                    <div className="logoCountdown" onClick={() => setMenu(0)}>
                        <img src={logo} className="logoNavbarImg" />
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
                    <Button onClick={toggleSoundOn} className="soundButton"><img src={soundOn ? soundOnImg : soundOffImg} className="soundImg" /></Button>
                    <ConnectButton.Custom>
                    {({
                        account,
                        chain,
                        openConnectModal,
                        openAccountModal
                    }) => {
                    const connected = account && chain;
                    return (
                        <div>
                            {!connected ? (
                                <Button className="connectButtonDisconnected" onClick={() => {openConnectModal()}}>Connect Wallet</Button>
                            ) : (
                                <Button className="connectButton" onClick={() => {openAccountModal()}}>{account.address.slice(0, 4) + '...' + account.address.slice(38, 42)}</Button>
                            )}
                        </div>
                        );
                    }}
                </ConnectButton.Custom>
                    {/* <ConnectButton showBalance={false} chainStatus="icon" className="connectButton" /> */}
                </Col>
            </div>
        </Row>
    );
}
export default Navbar