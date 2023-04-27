import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Image, Row, Col, Button } from 'react-bootstrap'

const Menu = ({setMenu, setMobileMenu, setMenuConnectWallet}) => {

    return (
        <Row className="menu">
            <div className="m-0 p-0 mobileMenuLinks">
                <div className="mobileMenuButton mb-4" onClick={() => {setMobileMenu(false);}}>X</div>
                <div className="mobileMenuButton mb-3" onClick={() => {setMenuConnectWallet(1); setMobileMenu(false);}}>Sacrifice</div>
                <div className="mobileMenuButton mb-3" onClick={() => {setMenuConnectWallet(2); setMobileMenu(false);}}>Rebirth</div>
                <div className="mobileMenuButton mb-3" onClick={() => {setMenuConnectWallet(3); setMobileMenu(false);}}>New Primates</div>
            </div>
        </Row>
    );
}
export default Menu