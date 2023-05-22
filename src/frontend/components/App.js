import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom"
import './App.css';
import Navbar from './Navbar'
import Footer from './Footer'
import Home from './Home'
import Leaderboard from "./Leaderboard";

import { useState, useEffect, useRef } from 'react'
import Spinner from 'react-bootstrap/Spinner';
import { ethers } from 'ethers'

import Erc20UsdcAbi from '../contractsData/Erc20Usdc.json'
import Erc20UsdcAddress from '../contractsData/Erc20Usdc-address.json'
import TokenAbi from '../contractsData/Token.json'
import TokenAddress from '../contractsData/Token-address.json'
import PoolMasterAbi from '../contractsData/PoolMaster.json'
import PoolMasterAddress from '../contractsData/PoolMaster-address.json'

const fromWei = (num) => Math.floor(ethers.utils.formatEther(num))
const toWei = (num) => ethers.utils.parseEther(num.toString())


function App() {
  const [account, setAccount] = useState(null)
  const [menu, setMenu] = useState(0)
  const [popup, setPopup] = useState(0)
  const [intervalVariable, setIntervalVariable] = useState(null)
  const [signer, setSigner] = useState(null)
  const [provider, setProvider] = useState({})
  const [poolMaster, setPoolMaster] = useState(null)
  const [token, setToken] = useState({})
  const [usdc, setUsdc] = useState({})
  const [phase, setPhase] = useState(0)
  const [stakedAmountForAddress, setStakedAmountForAddress] = useState(0)
  const [poolIdForAddress, setPoolIdForAddress] = useState(0)
  const [timestampStartEpoch, setTimestampStartEpoch] = useState(0)
  const [timeleft, setTimeleft] = useState(null)
  const [pools, setPools] = useState([])

  const intervalRef = useRef();
  intervalRef.current = intervalVariable;
  const poolMasterRef = useRef();
  poolMasterRef.current = poolMaster;

  const zeroPad = (num, places) => String(num).padStart(places, '0')

  const network = 'sepolia'
  // const network = 'ethereum'

  const web3Handler = async () => {
    console.log("web3Handler")
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    console.log("account:", accounts[0])
    setAccount(accounts[0])

    const providerTemp = new ethers.providers.Web3Provider(window.ethereum)
    const signer = providerTemp.getSigner()
    setProvider(providerTemp)

    const poolMaster = new ethers.Contract(PoolMasterAddress.address, PoolMasterAbi.abi, signer)
    const token = new ethers.Contract(TokenAddress.address, TokenAbi.abi, signer)
    const usdc = new ethers.Contract(Erc20UsdcAddress.address, Erc20UsdcAbi.abi, signer)

    setPoolMaster(poolMaster)
    setToken(token)
    setUsdc(usdc)

    setStakedAmountForAddress(fromWei(await poolMaster.getStakedTokensForAddress(accounts[0])))
    setPoolIdForAddress(parseInt(await poolMaster.getPoolIdForAddress(accounts[0])))
  }

  const loadContracts = async () => {
    console.log("loadContracts")
    const providerTemp = new ethers.providers.InfuraProvider(network, process.env.REACT_APP_INFURA_PROJECT_ID);
    // const providerTemp = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(providerTemp)

    const poolMasterTemp = new ethers.Contract(PoolMasterAddress.address, PoolMasterAbi.abi, providerTemp)
    const token = new ethers.Contract(TokenAddress.address, TokenAbi.abi, providerTemp)
    const usdc = new ethers.Contract(Erc20UsdcAddress.address, Erc20UsdcAbi.abi, providerTemp)
    if (poolMaster == null) {
      setPoolMaster(poolMaster)
      setToken(token)
      setUsdc(usdc)
    }

    let phase = await poolMasterTemp.getPhase()
    setPhase(phase)

    let timestampStartEpoch = parseInt(await poolMasterTemp.timestampStartEpoch())
    console.log("timestampStartEpoch", timestampStartEpoch)
    setTimestampStartEpoch(timestampStartEpoch)

    console.log("poolMasterTemp", poolMasterTemp.address)
    
    let timerDuration = 0
    if (phase == 0)
      timerDuration = parseInt(await poolMasterTemp.bettingPhaseDuration())
    else timerDuration = parseInt(await poolMasterTemp.battlingPhaseDuration())

    iniTimer(timestampStartEpoch, timerDuration)

    loadPoolData(poolMasterTemp)
  }

  const loadPoolData = async (poolMaster) => {
    console.log("loadPoolData")
    let poolsTemp = []
    poolsTemp.push({
      token: await poolMaster.getSymbol(0),
      tokenCount: fromWei(await poolMaster.getStakedTokens(0, false)),
      usdcCount: fromWei(await poolMaster.getStakedTokens(0, true)),
      lastWinner: await poolMaster.getLastWinner(0)
    })
    poolsTemp.push({
      token: await poolMaster.getSymbol(1),
      tokenCount: fromWei(await poolMaster.getStakedTokens(1, false)),
      usdcCount: fromWei(await poolMaster.getStakedTokens(1, true)),
      lastWinner: await poolMaster.getLastWinner(1)
    })
    poolsTemp.push({
      tokenCount: fromWei(await poolMaster.getStakedTokens(2, false)),
      usdcCount: fromWei(await poolMaster.getStakedTokens(2, true)),
    })

    setPools(poolsTemp)

    console.log("poolsTemp")
    console.log(poolsTemp)
  }

  const iniTimer = (startTimestamp, duration) => {
    if (startTimestamp == 0) {
      setTimeleft(0)
      return
    }
    const testOffset = 0 * 24 * 60 * 1000 // Set to 0 for live version

    const timestampEnd = (startTimestamp + duration) * 1000
    let timeleftTemp = timestampEnd - Date.now() - testOffset

    let dateNow = Date.now() + testOffset
    setTimeleft(timeleftTemp)
    console.log("timeleftTemp: " + timeleftTemp)
    console.log("Date.now(): " + dateNow)
    console.log("Set interval")
    setIntervalVariable(setInterval(() => {
      dateNow = Date.now() + testOffset
      setTimeleft(timestampEnd - dateNow)
    }, 1000))
  }

  useEffect(async () => {
    loadContracts()
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [])

  const closePopup = () => {
    setPopup(0)
  }

  const triggerPopup = (popupId) => {
    console.log("triggerPopup", popupId)
    
    setPopup(popupId)
  }

  const setMenuConnectWallet = async (menuId) => {
    if (!account) return
    setMenu(menuId)
  }

  return (
    <BrowserRouter>
      <div className="App" id="wrapper">
        <div className="m-0 p-0 container-fluid">
          <Navbar web3Handler={web3Handler} account={account} setMenu={setMenu} />
          {
              {
                '0': <Home poolMaster={poolMaster} account={account} usdc={usdc} token={token} phase={phase} timeleft={timeleft}
                  pools={pools} stakedAmountForAddress={stakedAmountForAddress} poolIdForAddress={poolIdForAddress} />,
                '1': <Leaderboard />
              }[menu]
            }

          <Footer />
        </div>
        
      </div>
    </BrowserRouter>
  );
}

export default App;
