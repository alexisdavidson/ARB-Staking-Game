import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom"
import './App.css';
import Navbar from './Navbar'
import Home from './Home'
import Menu from './Menu'

import { useState, useEffect, useRef } from 'react'
import Spinner from 'react-bootstrap/Spinner';
import { ethers } from 'ethers'


function App() {
  const [account, setAccount] = useState(null)
  const [menu, setMenu] = useState(-1 * 1)
  const [popup, setPopup] = useState(0)
  const [intervalVariable, setIntervalVariable] = useState(null)
  const [isAlphaBonusWindow, setIsAlphaBonusWindow] = useState(false)
  const [signer, setSigner] = useState(null)

  const intervalRef = useRef();
  intervalRef.current = intervalVariable;

  const isAlphaBonusWindowRef = useRef();
  isAlphaBonusWindowRef.current = isAlphaBonusWindow;

  const zeroPad = (num, places) => String(num).padStart(places, '0')

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

  const onConnect = async(acc) => {
    await loadContracts(acc)
    
    setAccount(acc)
  }

  const loadContracts = async (acc) => {
    console.log("loadContracts")
    const providerTemp = new ethers.providers.Web3Provider(window.ethereum)
    const signerTemp = providerTemp.getSigner()
    setSigner(signerTemp)

  }

  return (
    <BrowserRouter>
      <div className="App" id="wrapper">
        <div className="m-0 p-0 container-fluid">
          ababababab
            
            
        </div>
        
      </div>
    </BrowserRouter>
  );
}

export default App;
