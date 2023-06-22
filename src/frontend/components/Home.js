import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Image, Row, Col, Button, Form, Card } from 'react-bootstrap'
import {getTimeLeftString} from './TimeOperation'
import PoolCard from './PoolCard'
import logo from './assets/logo.png'

const fromWei = (num) => ethers.utils.formatEther(num)
const toWei = (num) => ethers.utils.parseEther(num.toString())

const Home = ({}) => {

    return (
        <Row className="home">
            <Row className="m-auto">
                <div>
                    <Image src={logo} className="logoimage" />
                </div>
            </Row>
            <Row className="timeLeftRow mt-5">
                <div>
                    <a href="dapp">
                        <Button className="connectButton">Start Trading</Button>
                    </a>
                </div>
            </Row>
        </Row>
    );
}
export default Home