import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Image, Row, Col, Button, Form } from 'react-bootstrap'

const fromWei = (num) => ethers.utils.formatEther(num)
const toWei = (num) => ethers.utils.parseEther(num.toString())

const Home = ({setMenu, setMenuConnectWallet}) => {
    return (
        <Row className="home">
            <Col className="col-12 col-xl-6 p-0"></Col>
            <Col className="col-12 col-xl-5 homeSection">
                <div className="homeTitle">Rescue Mission</div>
                <div className="homeSubtitle mb-4">Prime Burn Sacrifices for greater legacy</div>
            </Col>
        </Row>
    );
}
export default Home