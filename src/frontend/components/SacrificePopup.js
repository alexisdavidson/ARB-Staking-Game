import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Image, Row, Col, Button } from 'react-bootstrap'
import checkMark from './assets/check-mark.svg'

const fromWei = (num) => ethers.utils.formatEther(num)
const toWei = (num) => ethers.utils.parseEther(num.toString())

const SacrificePopup = ({ closePopup, onClickButton }) => {

    return (
        <Row className="popup">
            <Row>
                <div className="popupTitle">Rescue Mission Successful!</div>
            </Row>
            <Row className="my-4">
                <div>
                    <img src={checkMark} className="checkMarkImage" />
                </div>
            </Row>
            <Row className="mb-1">
                <div className="popupText">
                    Your valiant Prime Warriors fought hard to rescue their fellow Primates for the future of Prime Planet.
                </div>
            </Row>
            <Row className="mb-4">
                <div className="popupText popupTextTransparent">
                    For their sacrifices, you have received points for the Egg of Rebirth to mint your new Primates.
                </div>
            </Row>
            <Row>
                <Button className="backJungleButton" onClick={onClickButton} >See Prime Points</Button>
            </Row>

            
        </Row>
    );
}
export default SacrificePopup