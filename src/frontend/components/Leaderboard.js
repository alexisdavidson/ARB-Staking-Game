import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Image, Row, Col, Button, Form, Card } from 'react-bootstrap'
import {getTimeLeftString} from './TimeOperation'
import PoolMasterAbi from '../contractsData/PoolMaster.json'
import PoolMasterAddress from '../contractsData/PoolMaster-address.json'

const fromWei = (num) => Math.ceil(ethers.utils.formatEther(num))
const toWei = (num) => ethers.utils.parseEther(num.toString())

const Leaderboard = ({network}) => {
    const [poolMaster, setPoolMaster] = useState(null)
    const [elements, setElements] = useState([])

    
    const loadLeaderboard = async (poolMaster) => {
        console.log("loadLeaderboard")

        let timeRandInSeconds = 60 * 60 * 24 * 7 // 1 week

        let winnerAddressAmountsForLastSeconds = await poolMaster.getWinnerAddressAmountsForLastSeconds(timeRandInSeconds)
        console.log("winnerAddressAmountsForLastSeconds", winnerAddressAmountsForLastSeconds)
        let winnerAddressStakerAddressForLastSeconds = await poolMaster.getWinnerAddressStakerAddressForLastSeconds(timeRandInSeconds)
        console.log("winnerAddressStakerAddressForLastSeconds", winnerAddressStakerAddressForLastSeconds)
        let winnerAddressIsUsdcForLastSeconds = await poolMaster.getWinnerAddressIsUsdcForLastSeconds(timeRandInSeconds)
        console.log("winnerAddressIsUsdcForLastSeconds", winnerAddressIsUsdcForLastSeconds)

        let arrayLength = winnerAddressAmountsForLastSeconds.length
        let elementsTemp = []
        for(let i = 0; i < arrayLength; i++) {
            elementsTemp.push({
                address: winnerAddressStakerAddressForLastSeconds[i],
                amount: winnerAddressIsUsdcForLastSeconds[i] ? 
                    fromWei(winnerAddressAmountsForLastSeconds[i])
                    : ethers.utils.formatUnits(winnerAddressAmountsForLastSeconds[i], 6),
                isUsdc: winnerAddressIsUsdcForLastSeconds[i]
            })
        }

        setElements(elementsTemp)
    }

    const loadContracts = async () => {
        console.log("loadContracts")
        const providerTemp = new ethers.providers.InfuraProvider(network, process.env.REACT_APP_INFURA_PROJECT_ID);

        const poolMasterTemp = new ethers.Contract(PoolMasterAddress.address, PoolMasterAbi.abi, providerTemp)
        setPoolMaster(poolMasterTemp)

        loadLeaderboard(poolMasterTemp)
    }
        
    useEffect(async () => {
        loadContracts()
    }, [])

    return (
        <Row className="">
            <h1>Leaderboard</h1>
            <div className="mb-5">Showing results of the last 7 days</div>
            <Row className="leaderboardRow">
                <table className="table table-bordered table-striped table-dark">
                    <thead>
                        <tr>
                            <th scope="col">Address</th>
                            <th scope="col">Gains</th>
                        </tr>
                    </thead>
                    <tbody>
                        {elements != null && elements.length > 0 ? elements.map((val, i) => {
                            return (
                                <tr key={i}>
                                    <th scope="row">{val.address}</th>
                                    <td>{val.amount} {val.isUsdc ? "USDC" : "$ATLAS"}</td>
                                </tr>
                            );
                        })
                        : <></>
                    }
                    </tbody>
                </table>
            </Row>
        </Row>
    );
}
export default Leaderboard