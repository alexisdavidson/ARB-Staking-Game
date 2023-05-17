import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Image, Row, Col, Button, Form, Card } from 'react-bootstrap'
import {getTimeLeftString} from './TimeOperation'

const fromWei = (num) => ethers.utils.formatEther(num)
const toWei = (num) => ethers.utils.parseEther(num.toString())

const Home = ({poolMaster, account, usdc, token, phase, timeleft, pools}) => {
    const [showPlaceBetPopup, setShowPlaceBetPopup] = useState(false)
    const [chosenPool, setChosenPool] = useState(0)
    const [chosenAmount, setChosenAmount] = useState(100)
    const [chosenUsdc, setchosenUsdc] = useState(false)
    const [pool1_tokenCount, setpool1_tokenCount] = useState(0)

    const phaseIdToText = () => {
        if (phase == 2)
            return "Epoch Ended"
        if (phase == 1)
            return "Battling Phase"
        return "Betting Phase"
    }

    const clickBet = (poolId) => {
        setChosenPool(poolId)
        setShowPlaceBetPopup(true)
    }

    const toggleTokenSwitch = () => {
        setchosenUsdc(!chosenUsdc)
    }
    
    const stake = async () => {
        console.log("stake", chosenPool)
        let amount = toWei(chosenAmount)
        let isUsdc = chosenUsdc

        setShowPlaceBetPopup(false)
        
        if (chosenUsdc) {
            if (parseInt(await usdc.allowance(account, poolMaster.address)) < amount)
                await(await usdc.approve(poolMaster.address, amount)).wait()
        } else {
            if (parseInt(await token.allowance(account, poolMaster.address)) < amount)
                await(await token.approve(poolMaster.address, amount)).wait()
        }

        await poolMaster.stake(chosenPool, amount, isUsdc)
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
                            <div className="my-2 mt-4">
                                {pools[0]?.token}
                            </div>
                            <div className="my-2">
                                Staked Tokens: {pools[0]?.tokenCount}
                            </div>
                            <div className="my-2">
                                Staked Usdc: {pools[0]?.usdcCount}
                            </div>
                            <div className="my-2">
                                {pools[0]?.lastWinner != null && pools[1]?.lastWinner != "0x0000000000000000000000000000000000000000" ? (
                                    <>Last Winner: {pools[0]?.lastWinner}</>
                                ) : <></>}
                            </div>
                    </Card.Body>
                    <Card.Footer>
                        <div className='d-grid'>
                            {phase == 0 ? (
                                <Button variant="success" size="lg" onClick={() => clickBet(0)}>
                                    Bet
                                </Button>
                            ) : ( <></> )}
                        </div>
                    </Card.Footer>
                </Card>
                <Card bg="dark" className="cardPool">
                    <Card.Body color="secondary">
                        <Card.Title>Pool 2</Card.Title>
                        <div className="my-2 mt-4">
                            {pools[1]?.token}
                        </div>
                        <div className="my-2">
                            Staked Tokens: {pools[1]?.tokenCount}
                        </div>
                        <div className="my-2">
                            Staked Usdc: {pools[1]?.usdcCount}
                        </div>
                        <div className="my-2">
                            {pools[1]?.lastWinner != null && pools[1]?.lastWinner != "0x0000000000000000000000000000000000000000" ? (
                                <>Last Winner: {pools[1]?.lastWinner}</>
                            ) : <></>}
                        </div>
                    </Card.Body>
                    <Card.Footer>
                        <div className='d-grid'>
                            {phase == 0 ? (
                                <Button variant="success" size="lg" onClick={() => clickBet(1)}>
                                    Bet
                                </Button>
                            ) : ( <></> )}
                        </div>
                    </Card.Footer>
                </Card>
                <Card bg="dark" className="cardPool">
                    <Card.Body color="secondary">
                        <Card.Title>Pool 3</Card.Title>
                        <div className="my-2 mt-4">
                            Staked Tokens: {pools[0]?.tokenCount}
                        </div>
                        <div className="my-2">
                            Staked Usdc: {pools[0]?.usdcCount}
                        </div>
                    </Card.Body>
                    <Card.Footer>
                        <div className='d-grid'>
                            {phase == 0 ? (
                                <Button variant="success" size="lg" onClick={() => clickBet(2)}>
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
            {showPlaceBetPopup ? (
                <>
                    <div className="placeBetPopupBg" onClick={() => setShowPlaceBetPopup(false)}>
                    </div>
                    <div className="placeBetPopup">
                        <h1>Place a Bet</h1>
                        <div className="my-3">
                            <Form className="switchCurrency">
                                <Form.Check className="switchCurrency"
                                    type="switch"
                                    id="custom-switch"
                                    label={chosenUsdc ? "USDC" : "$ATLAS"}
                                    onClick={toggleTokenSwitch}
                                    defaultChecked={!chosenUsdc}
                                />
                            </Form>
                        </div>
                        <div className="my-3">
                            Amount: 100
                        </div>
                        <div className="my-5">
                            <Button className="mx-2" variant="warning" size="lg" onClick={() => setShowPlaceBetPopup(false)}>
                                Cancel 
                            </Button>
                            <Button className="mx-2" variant="success" size="lg" onClick={() => stake()}>
                                Place Bet
                            </Button>
                        </div>
                    </div>
                </>
            ) : (<></>)}
        </Row>
    );
}
export default Home