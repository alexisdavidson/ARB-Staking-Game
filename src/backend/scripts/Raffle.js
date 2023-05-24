import React, { useState, useEffect, useRef } from "react"
import { ethers } from 'ethers'

const fromWei = (num) => parseInt(ethers.utils.formatEther(num))
const toWei = (num) => ethers.utils.parseEther(num.toString())

const Raffle = ({id, name, account, raffle, token, web3Handler, requestEndRaffle}) => {
    const raffleRef = useRef()
    raffleRef.current = raffle;

    const enterRaffle = async(slotId) => {
        console.log("Enter Raffle " + id + " for slot " + slotId)

        if (account == null) {
            await web3Handler();
        }

        console.log("allowance: " + parseInt(raffle.allowance))

        try {
            if (parseInt(raffle.allowance) == 0) {
                console.log("Approve")
                await(await token.approve(raffle.contractInstance.address, toWei(10_000_000_000))).wait()
                let all = fromWei(await token.allowance(account, raffle.contractInstance.address))
                raffleRef.current.allowance = all
            }

            await(await raffle.contractInstance.play(slotId))
        }
        catch (error) {
            console.error("Custom error handling: " + error);
            // alert((error.toString()).split('reverted:')[1].split('"')[0]);
            alert((error.toString()));
        };
    }

    const pullOutRaffle = async(slotId) => {
        console.log("Leave Raffle " + id + " from slot " + slotId)

        if (account == null) {
            await web3Handler();
        }

        await raffle.contractInstance.pullOut(slotId)
    }

    return (
        <div className="col mx-auto overflow-hidden raffle-column">
            {Object.keys(raffle).length !== 0 ? (
                <>
                    <div className="row">
                        <div className="card bg-dark mb-2">
                            <div className="card-header raffle-card-header">{name}</div>
                        </div>
                        <div className="card bg-dark">
                            <div className="card-body bg-secondary">
                                <div className="card-text raffle-card-text">
                                    {raffle?.slots?.map((item, idx) => (
                                        item.address != "0x0000000000000000000000000000000000000000" ? (
                                            <div key={idx} className="raffle-slot raffle-slotTaken" onClick={() => pullOutRaffle(idx)}>
                                                {item.address.slice(0, 10) + '...' + item.address.slice(32, 42)}
                                            </div>
                                        ) : (
                                            <div key={idx} className="raffle-slot raffle-slotFree" onClick={() => enterRaffle(idx)}>
                                                Click to Enter {name}
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="raffle-last-winner row mt-4">
                        <div className="col">Last Winner: {raffle.lastWinner}</div>
                    </div>
                    <div className="raffle-last-winner row mt-4">
                        <div className="col">Total Payouts: {raffle.totalPayouts}</div>
                    </div>
                    <div className="raffle-last-winner row mt-4">
                        <div className="col">Total Burnt: {raffle.totalBurn}</div>
                    </div>
        
                    {raffle.isRaffleFilled ? (
                        <div className="raffle-slot raffle-slotFree raffle-card-text" onClick={() => requestEndRaffle()}>
                            Find out who won!
                        </div>
                    ) : (
                        <></>
                    )}
                </>
            ) : (
                <div>
                    Loading...
                </div>
            )}
        </div>
    );
};

export default Raffle;