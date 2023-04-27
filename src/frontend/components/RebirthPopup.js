import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Image, Row, Col, Button } from 'react-bootstrap'
import checkMark from './assets/check-mark.svg'

const fromWei = (num) => ethers.utils.formatEther(num)
const toWei = (num) => ethers.utils.parseEther(num.toString())

const RebirthPopup = ({ closePopup, onClickButton }) => {

    return (
        <Row className="popup">
            <Row>
                <div className="popupTitle">You have successfully Rebirth new Primates!</div>
            </Row>
            <Row className="my-4">
                <div>
                    <img src={checkMark} className="checkMarkImage" />
                </div>
            </Row>
            <Row className="mb-1">
                <div className="popupText">
                    For all your act of valour, your New Prime Eggs will be sent to your wallet.
                </div>
            </Row>
            <Row className="mb-4">
                <div className="popupText popupTextTransparent">
                    These Eggs will hatch and reveal at a later date; Dawn of a New Era for Prime Planet
                </div>
            </Row>
            <Row>
                <Button className="alertButton" onClick={onClickButton} >See Baby Dragons</Button>
            </Row>

        </Row>
    );
}
export default RebirthPopup