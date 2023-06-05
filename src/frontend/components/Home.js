import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Image, Row, Col, Button, Form, Card } from 'react-bootstrap'
import {getTimeLeftString} from './TimeOperation'
import PoolCard from './PoolCard'

const fromWei = (num) => ethers.utils.formatEther(num)
const toWei = (num) => ethers.utils.parseEther(num.toString())

const Home = ({poolMaster, account, usdc, token, phase, timeleft, pools, stakedAmountForAddress, poolIdForAddress, 
    requestEndEpoch}) => {
    const [showPlaceBetPopup, setShowPlaceBetPopup] = useState(false)
    const [chosenPool, setChosenPool] = useState(0)
    const [chosenAmount, setChosenAmount] = useState(100)
    const [chosenUsdc, setchosenUsdc] = useState(false)

    const onChangeChosenAmount = (e) => {
        setChosenAmount(parseInt(e.target.value, 10));
    }

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
        console.log("stake", chosenPool, chosenAmount, chosenUsdc)
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

    return (
        <Row className="home">
            <Row className="cardRow">
                <PoolCard pool={pools[0]} poolNumber={1} phase={phase} clickBet={clickBet} stakedAmountForAddress={stakedAmountForAddress} />
                <PoolCard pool={pools[1]} poolNumber={2} phase={phase} clickBet={clickBet} stakedAmountForAddress={stakedAmountForAddress} />
                <PoolCard pool={pools[2]} poolNumber={3} phase={phase} clickBet={clickBet} stakedAmountForAddress={stakedAmountForAddress}  noWinner/>
            </Row>
            {stakedAmountForAddress > 0 ? (
                <Row className="timeLeftRow mt-5">
                    <div>
                        You bet {stakedAmountForAddress} in pool {poolIdForAddress + 1}
                    </div>
                </Row>
            ) : (<></>)}
            {pools != null && pools.length > 0 ?(
                <Row className="timeLeftRow mt-5">
                    <div>
                        Current phase: {phaseIdToText()}
                    </div>
                    <div>
                        {phase != 2 ? (
                            <>
                                {getTimeLeftString(timeleft)}
                            </>
                        ) : ( 
                            <>
                            Transitioning to the next epoch. This may take a few minutes...
                            </>
                            // <Button className="mx-2" variant="success" size="lg" onClick={() => {requestEndEpoch(); 
                            //     alert(("Transitioning to next epoch. This may take a few minutes..."));}}>
                            //     Find out who won!
                            // </Button>
                        )}
                    </div>
                </Row>
            ) : (<></>)}





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
                            <Form>
                            <Form.Group controlId="formRange" className="d-flex align-items-center justify-content-center">
                                <Form.Label className="me-3">Amount:</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={chosenAmount}
                                    onChange={onChangeChosenAmount}
                                    style={{ width: '100px' }}
                                />
                            </Form.Group>
                            <Form.Group controlId="formSlider">
                                <Form.Range
                                    min={5}
                                    max={500}
                                    step={1}
                                    value={chosenAmount}
                                    onChange={onChangeChosenAmount}
                                />
                            </Form.Group>
                            </Form>
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