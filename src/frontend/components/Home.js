import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Image, Row, Col, Button, Form, Card } from 'react-bootstrap'
import {getTimeLeftString} from './TimeOperation'

const fromWei = (num) => ethers.utils.formatEther(num)
const toWei = (num) => ethers.utils.parseEther(num.toString())

const Home = ({poolMaster, account, usdc, token, phase, timeleft}) => {
    const [pool1_tokenCount, setpool1_tokenCount] = useState(0)

    const phaseIdToText = () => {
        if (phase == 2)
            return "Epoch Ended"
        if (phase == 1)
            return "Battling Phase"
        return "Betting Phase"
    }
    
    const stake = async (poolId) => {
        console.log("stake", poolId)
        let amount = toWei(100)
        let isUsdc = false
        
        if (parseInt(await token.allowance(account, poolMaster.address)) < amount) {
            await(await token.approve(poolMaster.address, amount)).wait()
        }

        await poolMaster.stake(poolId, amount, isUsdc)
    }

    useEffect(async () => {
        if (poolMaster != null) {
            setpool1_tokenCount(fromWei(await poolMaster.getStakedTokens(0, false)))
        }
    }, [poolMaster])

    return (
        <Row className="home">
            <Row className="cardRow">
                <Card bg="dark" className="cardPool">
                    <Card.Body color="secondary">
                        <Card.Title>Pool 1</Card.Title>
                        <Card.Text>
                            ARB
                            <br/>
                            Staked Tokens: {pool1_tokenCount}
                        </Card.Text>
                    </Card.Body>
                    <Card.Footer>
                        <div className='d-grid'>
                            {phase == 0 ? (
                                <Button variant="success" size="lg" onClick={() => stake(0)}>
                                    Bet
                                </Button>
                            ) : ( <></> )}
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
                            {phase == 0 ? (
                                <Button variant="success" size="lg" onClick={() => stake(1)}>
                                    Bet
                                </Button>
                            ) : ( <></> )}
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
                            {phase == 0 ? (
                                <Button variant="success" size="lg" onClick={() => stake(2)}>
                                    Bet
                                </Button>
                            ) : ( <></> )}
                        </div>
                    </Card.Footer>
                </Card>
            </Row>

            <Row className="timeLeftRow mt-5">
                <div>
                    Current phase: {phaseIdToText()}
                </div>
                <div>
                    {phase != 2 ? (
                        <>
                            {getTimeLeftString(timeleft)}
                        </>
                    ) : ( <></> )}
                </div>
            </Row>
        </Row>
    );
}
export default Home