import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Image, Row, Col, Button, Form, Card } from 'react-bootstrap'
import {getTimeLeftString} from './TimeOperation'
import PoolMasterAbi from '../contractsData/PoolMaster.json'
import PoolMasterAddress from '../contractsData/PoolMaster-address.json'

const fromWei = (num) => ethers.utils.formatEther(num)
const toWei = (num) => ethers.utils.parseEther(num.toString())

const Leaderboard = ({network}) => {
    const [poolMaster, setPoolMaster] = useState(null)
    const [elements, setElements] = useState([])

    const loadContracts = async () => {
        console.log("loadContracts")
        const providerTemp = new ethers.providers.InfuraProvider(network, process.env.REACT_APP_INFURA_PROJECT_ID);

        const poolMasterTemp = new ethers.Contract(PoolMasterAddress.address, PoolMasterAbi.abi, providerTemp)
        setPoolMaster(poolMasterTemp)

        // let phase = await poolMasterTemp.getPhase()
        // setPhase(phase)
        let elementsTemp = []
        elementsTemp.push({
            address: "0x324r3rehdg",
            amount: 234523,
            isUsdc: false
        })
        elementsTemp.push({
            address: "0x234234234",
            amount: 234234234,
            isUsdc: true
        })

        setElements(elementsTemp)
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
                        {elements != null && elements.length > 0 ? elements.map((val) => {
                            return (
                                <tr>
                                    <th scope="row">{val.address}</th>
                                    <td>{val.amount} {val.isUsdc ? "USDC" : "$ATLAS"}</td>
                                </tr>
                            );
                        })
                        : <span />
                    }
                    </tbody>
                </table>
            </Row>
        </Row>
    );
}
export default Leaderboard