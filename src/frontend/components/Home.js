import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Image, Row, Col, Button, Form, Card } from 'react-bootstrap'

const fromWei = (num) => ethers.utils.formatEther(num)
const toWei = (num) => ethers.utils.parseEther(num.toString())

const Home = ({setMenu, setMenuConnectWallet}) => {
    return (
        <Row className="home">
            <Row className="cardRow">
                <Card bg="dark" className="cardPool">
                    <Card.Body color="secondary">
                        <Card.Title>Pool 1</Card.Title>
                        <Card.Text>
                            ARB
                            <br/>
                            Price: 0.2eth
                        </Card.Text>
                    </Card.Body>
                    <Card.Footer>
                        <div className='d-grid'>
                            <Button variant="success" size="lg" onClick={() => console.log("bet")}>
                                Bet
                            </Button>
                        </div>
                    </Card.Footer>
                </Card>
                <Card bg="dark" className="cardPool">
                    <Card.Body color="secondary">
                        <Card.Title>Pool 2</Card.Title>
                        <Card.Text>
                            ARB
                            <br/>
                            Price: 0.2eth
                        </Card.Text>
                    </Card.Body>
                    <Card.Footer>
                        <div className='d-grid'>
                            <Button variant="success" size="lg" onClick={() => console.log("bet")}>
                                Bet
                            </Button>
                        </div>
                    </Card.Footer>
                </Card>
                <Card bg="dark" className="cardPool">
                    <Card.Body color="secondary">
                        <Card.Title>Pool 3</Card.Title>
                        <Card.Text>
                            ARB
                            <br/>
                            Price: 0.2eth
                        </Card.Text>
                    </Card.Body>
                    <Card.Footer>
                        <div className='d-grid'>
                            <Button variant="success" size="lg" onClick={() => console.log("bet")}>
                                Bet
                            </Button>
                        </div>
                    </Card.Footer>
                </Card>
            </Row>

            <Row className="timeLeftRow mt-5">
                <div>
                    Time Left for current Epoch: 02:14:58:01
                </div>
            </Row>
        </Row>
    );
}
export default Home