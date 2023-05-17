import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom"
import './App.css';
import Navbar from './Navbar'
import Footer from './Footer'
import Home from './Home'
import Menu from './Menu'

import { useState, useEffect, useRef } from 'react'
import Spinner from 'react-bootstrap/Spinner';
import { ethers } from 'ethers'

import Erc20UsdcAbi from '../contractsData/Erc20Usdc.json'
import Erc20UsdcAddress from '../contractsData/Erc20Usdc-address.json'
import TokenAbi from '../contractsData/Token.json'
import TokenAddress from '../contractsData/Token-address.json'
import PoolMasterAbi from '../contractsData/PoolMaster.json'
import PoolMasterAddress from '../contractsData/PoolMaster-address.json'

const fromWei = (num) => ethers.utils.formatEther(num)
const toWei = (num) => ethers.utils.parseEther(num.toString())


function App() {
  const [account, setAccount] = useState(null)
  const [menu, setMenu] = useState(-1 * 1)
  const [popup, setPopup] = useState(0)
  const [intervalVariable, setIntervalVariable] = useState(null)
  const [signer, setSigner] = useState(null)
  const [provider, setProvider] = useState({})
  const [poolMaster, setPoolMaster] = useState({})
  const [token, setToken] = useState({})
  const [usdc, setUsdc] = useState({})
  const [phase, setPhase] = useState(0)
  const [timestampStartEpoch, setTimestampStartEpoch] = useState(0)

  const intervalRef = useRef();
  intervalRef.current = intervalVariable;
  const poolMasterRef = useRef();
  poolMasterRef.current = poolMaster;

  const zeroPad = (num, places) => String(num).padStart(places, '0')

  const web3Handler = async () => {
    console.log("web3Handler")
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    console.log("account:", accounts[0])
    setAccount(accounts[0])

    await loadContracts(accounts[0])
  }

  const loadContracts = async (acc) => {
    console.log("loadContracts")
    const providerTemp = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(providerTemp)
    const signer = providerTemp.getSigner()

    const poolMaster = new ethers.Contract(PoolMasterAddress.address, PoolMasterAbi.abi, signer)
    const token = new ethers.Contract(TokenAddress.address, TokenAbi.abi, signer)
    const usdc = new ethers.Contract(Erc20UsdcAddress.address, Erc20UsdcAbi.abi, signer)

    setPoolMaster(poolMaster)
    setToken(token)
    setUsdc(usdc)

    setPhase(await poolMaster.getPhase())
    setTimestampStartEpoch(parseInt(await poolMaster.timestampStartEpoch()))

    console.log("poolMaster", poolMaster.address)
  }

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
          <Navbar web3Handler={web3Handler} account={account} />
          <Home poolMaster={poolMaster} account={account} usdc={usdc} token={token} phase={phase} timeleft={timestampStartEpoch}/>
          <Footer />
        </div>
        
      </div>
    </BrowserRouter>
  );
}

export default App;
