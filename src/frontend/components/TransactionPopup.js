import { useState, useEffect } from 'react'
import { Image, Row, Col, Button } from 'react-bootstrap'

const TransactionPopup = ({ showButton, onClickButton, title, subtitle, item, description }) => {

    return (
        <Row className="popup" style={{textAlign: "left"}}>
            <Row>
                <div className="popupTitle mb-5">{title}</div>
            </Row>
            {/* <Row className="my-4">
                <div>
                    <img src={checkMark} className="checkMarkImage" />
                </div>
            </Row> */}
            <Row className="mb-5">
                <div className="popupText">
                    {item}
                </div>
            </Row>
            <Row className="mb-1">
                <div className="popupText" style={{fontWeight: "bold"}}>
                    {subtitle}
                </div>
            </Row>
            <Row className="mb-2">
                <div className="popupText popupTextTransparent">
                    {description}
                </div>
            </Row>
            {showButton ? (
                <Row>
                    <Button className="backJungleButton mt-4" onClick={onClickButton} >Cancel</Button>
                </Row>
            ) : (
                <></>
            )}
        </Row>
    );
}
export default TransactionPopup