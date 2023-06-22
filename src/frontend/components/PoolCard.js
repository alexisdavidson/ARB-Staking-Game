import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Image, Row, Col, Button, Form, Card } from 'react-bootstrap'
import {getTimeLeftString} from './TimeOperation'
import Spinner from 'react-bootstrap/Spinner';

const fromWei = (num) => ethers.utils.formatEther(num)
const toWei = (num) => ethers.utils.parseEther(num.toString())

const PoolCard = ({pool, poolNumber, phase, clickBet, noWinner, stakedAmountForAddress, noUsdc}) => {
    return (
        <Card bg="dark" className="cardPool">
            <Card.Title>Vault {poolNumber}</Card.Title>
            {pool != null ? (
                <>
                    <Card.Body color="secondary">
                        {!noWinner ? (
                            <div className="my-2 mt-4">
                                {pool?.token}
                            </div>
                        ) : (<></>)}
                        <div className="my-2">
                            Staked Atlas: {pool?.tokenCount}
                        </div>
                        {!noUsdc ? (
                            <div className="my-2">
                                Staked Usdc: {pool?.usdcCount}
                            </div>
                        ) : (
                            <></>
                        )}
                        {!noWinner && pool?.lastWinner != null && pool?.lastWinner != "0x0000000000000000000000000000000000000000"? (
                            <>Last Winner: {pool?.lastWinner}</>
                        ) : (<></>)}
                    </Card.Body>
                    <Card.Footer>
                        <div className='d-grid'>
                            {phase == 0 ? (
                                stakedAmountForAddress == 0 ? (
                                    <Button className="betButton" variant="success" size="lg" onClick={() => clickBet(poolNumber - 1)}>
                                        Bet
                                    </Button>
                                ) : ( <></> )
                            // ) : ( <>Betting phase not started</> )}
                            ) : ( <></> )}
                        </div>
                    </Card.Footer>
                </>
            ) : (
                <Spinner animation="border" role="status" size="m">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            )}
        </Card>
    );
}
export default PoolCard