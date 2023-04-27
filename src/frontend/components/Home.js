import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Image, Row, Col, Button, Form } from 'react-bootstrap'
import { ConnectButton } from '@rainbow-me/rainbowkit';

const fromWei = (num) => ethers.utils.formatEther(num)
const toWei = (num) => ethers.utils.parseEther(num.toString())

const Home = ({setMenu, setMenuConnectWallet}) => {
    return (
        <Row className="home">
            <Col className="col-12 col-xl-6 p-0"></Col>
            <Col className="col-12 col-xl-5 homeSection">
                <div className="homeTitle">Rescue Mission</div>
                <div className="homeSubtitle mb-4">Prime Burn Sacrifices for greater legacy</div>
                <ConnectButton.Custom>
                {({
                    account,
                    chain,
                    openConnectModal,
                }) => {
                    const connected = account && chain;
                    return (
                        <div>
                            <Button className="callButtonHome" onClick={() => {if (!connected) openConnectModal(); else setMenuConnectWallet(1)}}>Rescue Prime Planet</Button>
                            <div className="m-0 p-0 homeBottomButtons">
                                <Button className="callSubbuttonHome" onClick={() => {if (!connected) openConnectModal(); else setMenuConnectWallet(2)}}>Rebirth</Button>
                                <Button className="callSubbuttonHome" onClick={() => {if (!connected) openConnectModal(); else setMenuConnectWallet(3)}}>SEE PRIME BABY</Button>
                            </div>
                        </div>
                        );
                    }}
                </ConnectButton.Custom>
            </Col>
        </Row>
    );
}
export default Home