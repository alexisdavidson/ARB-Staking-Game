import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Image, Row, Col, Button, Form, Card } from 'react-bootstrap'
import {getTimeLeftString} from './TimeOperation'

const fromWei = (num) => ethers.utils.formatEther(num)
const toWei = (num) => ethers.utils.parseEther(num.toString())

const Leaderboard = ({poolMaster, account, usdc, token, phase, timeleft, pools}) => {

    return (
        <Row className="home">
            Leaderboard
        </Row>
    );
}
export default Leaderboard