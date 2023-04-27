import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom"
import './App.css';
import Navbar from './Navbar'
import IntroVideo from './IntroVideo'
import Home from './Home'
import Sacrifice from './Sacrifice'
import Rebirth from './Rebirth'
import NewPrimates from './NewPrimates'
import SacrificePopup from './SacrificePopup'
import RebirthPopup from './RebirthPopup'
import Menu from './Menu'

import { useState, useEffect, useRef } from 'react'
import Spinner from 'react-bootstrap/Spinner';
import { ethers } from 'ethers'

import PrimeDragonAddress from '../contractsData/PrimeDragon-address.json'
import PrimeDragonAbi from '../contractsData/PrimeDragon.json'
import MintableERC721Address from '../contractsData/MintableERC721-address.json'
import MintableERC721Abi from '../contractsData/MintableERC721.json'
import PrimeKongPlanetERC721Address from '../contractsData/PrimeKongPlanetERC721-address.json'
import PrimeKongPlanetERC721Abi from '../contractsData/PrimeKongPlanetERC721.json'
import InfectedApePlanetAddress from '../contractsData/InfectedApePlanet-address.json'
import InfectedApePlanetAbi from '../contractsData/InfectedApePlanet.json'

import PrimeDragonAddressGoerli from '../contractsDataGoerli/PrimeDragon-address.json'
import PrimeDragonAbiGoerli from '../contractsDataGoerli/PrimeDragon.json'
import MintableERC721AddressGoerli from '../contractsDataGoerli/MintableERC721-address.json'
import MintableERC721AbiGoerli from '../contractsDataGoerli/MintableERC721.json'
import PrimeKongPlanetERC721AddressGoerli from '../contractsDataGoerli/PrimeKongPlanetERC721-address.json'
import PrimeKongPlanetERC721AbiGoerli from '../contractsDataGoerli/PrimeKongPlanetERC721.json'
import InfectedApePlanetAddressGoerli from '../contractsDataGoerli/InfectedApePlanet-address.json'
import InfectedApePlanetAbiGoerli from '../contractsDataGoerli/InfectedApePlanet.json'

import PrimeBabyDragonAbiGoerli from '../contractsData/PrimeBabyDragon.json'
import PrimeBabyDragonAddressGoerli from '../contractsData/PrimeBabyDragon-address.json'
import PrimeApeBurnerAbiGoerli from '../contractsData/PrimeApeBurner.json'
import PrimeApeBurnerAddressGoerli from '../contractsData/PrimeApeBurner-address.json'

import PrimeBabyDragonAbi from '../contractsData/PrimeBabyDragon.json'
import PrimeBabyDragonAddress from '../contractsData/PrimeBabyDragon-address.json'
import PrimeApeBurnerAbi from '../contractsData/PrimeApeBurner.json'
import PrimeApeBurnerAddress from '../contractsData/PrimeApeBurner-address.json'

import PrimeDragonAddressMainnet from '../contractsDataMainnet/PrimeDragon-address.json'
import PrimeDragonAbiMainnet from '../contractsDataMainnet/PrimeDragon.json'
import MintableERC721AddressMainnet from '../contractsDataMainnet/MintableERC721-address.json'
import MintableERC721AbiMainnet from '../contractsDataMainnet/MintableERC721.json'
import PrimeKongPlanetERC721AddressMainnet from '../contractsDataMainnet/PrimeKongPlanetERC721-address.json'
import PrimeKongPlanetERC721AbiMainnet from '../contractsDataMainnet/PrimeKongPlanetERC721.json'
import InfectedApePlanetAddressMainnet from '../contractsDataMainnet/InfectedApePlanet-address.json'
import InfectedApePlanetAbiMainnet from '../contractsDataMainnet/InfectedApePlanet.json'

import PrimeBabyDragonAbiMainnet from '../contractsDataMainnet/PrimeBabyDragon.json'
import PrimeBabyDragonAddressMainnet from '../contractsDataMainnet/PrimeBabyDragon-address.json'
import PrimeApeBurnerAbiMainnet from '../contractsDataMainnet/PrimeApeBurner.json'
import PrimeApeBurnerAddressMainnet from '../contractsDataMainnet/PrimeApeBurner-address.json'

import babyList from '../../backend/baby.json'
import epicList from '../../backend/epic.json'
import alphaList from '../../backend/alpha.json'

import nftPlaceholder from './assets/nftPlaceholder.png'

import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme 
} from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig, useAccount, useNetwork } from 'wagmi';
import { mainnet, goerli, sepolia } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

const { chains, provider } = configureChains(
  [mainnet, goerli, sepolia],
  [
    alchemyProvider({ apiKey: process.env.REACT_APP_ALCHEMY_KEY }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

const fromWei = (num) => ethers.utils.formatEther(num)
const toWei = (num) => ethers.utils.parseEther(num.toString())

let primeApeOffset = 7979

let networkConfig = {
  1: {
    PrimeDragonAddress: PrimeDragonAddressMainnet,
    PrimeDragonAbi: PrimeDragonAbiMainnet,
    MintableERC721Address: MintableERC721AddressMainnet,
    MintableERC721Abi: MintableERC721AbiMainnet,
    PrimeKongPlanetERC721Address: PrimeKongPlanetERC721AddressMainnet,
    PrimeKongPlanetERC721Abi: PrimeKongPlanetERC721AbiMainnet,
    InfectedApePlanetAddress: InfectedApePlanetAddressMainnet,
    InfectedApePlanetAbi: InfectedApePlanetAbiMainnet,
    PrimeBabyDragonAbi: PrimeBabyDragonAbiMainnet,
    PrimeBabyDragonAddress: PrimeBabyDragonAddressMainnet,
    PrimeApeBurnerAbi: PrimeApeBurnerAbiMainnet,
    PrimeApeBurnerAddress: PrimeApeBurnerAddressMainnet,
    alchemyAPI: "https://eth-mainnet.g.alchemy.com"
  },
  5: {
    PrimeDragonAddress: PrimeDragonAddressGoerli,
    PrimeDragonAbi: PrimeDragonAbiGoerli,
    MintableERC721Address: MintableERC721AddressGoerli,
    MintableERC721Abi: MintableERC721AbiGoerli,
    PrimeKongPlanetERC721Address: PrimeKongPlanetERC721AddressGoerli,
    PrimeKongPlanetERC721Abi: PrimeKongPlanetERC721AbiGoerli,
    InfectedApePlanetAddress: InfectedApePlanetAddressGoerli,
    InfectedApePlanetAbi: InfectedApePlanetAbiGoerli,
    PrimeBabyDragonAbi: PrimeBabyDragonAbiGoerli,
    PrimeBabyDragonAddress: PrimeBabyDragonAddressGoerli,
    PrimeApeBurnerAbi: PrimeApeBurnerAbiGoerli,
    PrimeApeBurnerAddress: PrimeApeBurnerAddressGoerli,
    alchemyAPI: "https://eth-goerli.g.alchemy.com"
  },
  11155111: {
    PrimeDragonAddress: PrimeDragonAddress,
    PrimeDragonAbi: PrimeDragonAbi,
    MintableERC721Address: MintableERC721Address,
    MintableERC721Abi: MintableERC721Abi,
    PrimeKongPlanetERC721Address: PrimeKongPlanetERC721Address,
    PrimeKongPlanetERC721Abi: PrimeKongPlanetERC721Abi,
    InfectedApePlanetAddress: InfectedApePlanetAddress,
    InfectedApePlanetAbi: InfectedApePlanetAbi,
    PrimeBabyDragonAbi: PrimeBabyDragonAbi,
    PrimeBabyDragonAddress: PrimeBabyDragonAddress,
    PrimeApeBurnerAbi: PrimeApeBurnerAbi,
    PrimeApeBurnerAddress: PrimeApeBurnerAddress,
    alchemyAPI: "https://eth-sepolia.g.alchemy.com"
  }
}
let currentNetwork = 1

function App() {
  const [account, setAccount] = useState(null)
  const [primeBabyDragonBalance, setPrimeBabyDragonBalance] = useState(0)
  const [primeBabyDragonTotalSupply, setPrimeBabyDragonTotalSupply] = useState(0)
  const [primePoints, setPrimePoints] = useState(0)
  const [primeApeBurner, setPrimeApeBurner] = useState(null)
  const [menu, setMenu] = useState(-1 * 1)
  const [popup, setPopup] = useState(0)
  const [timeleft, setTimeleft] = useState(null)
  const [intervalVariable, setIntervalVariable] = useState(null)
  const [provider, setProvider] = useState({})
  const [mobileMenu, setMobileMenu] = useState(false)
  const [isAlphaBonusWindow, setIsAlphaBonusWindow] = useState(false)
  const [nftsLoading, setNftsLoading] = useState(true)
  const [nfts, setNfts] = useState([])
  const [signer, setSigner] = useState(null)
  const { address, connector, isConnected,  } = useAccount()
  const { chain } = useNetwork()
  const [soundOn, setSoundOn] = useState(false)
  const [videoLoading, setVideoLoading] = useState(true)

  const intervalRef = useRef();
  intervalRef.current = intervalVariable;

  const isAlphaBonusWindowRef = useRef();
  isAlphaBonusWindowRef.current = isAlphaBonusWindow;

  const zeroPad = (num, places) => String(num).padStart(places, '0')

  const tryForceSoundOn = () => {
    document.getElementById('audioElement')?.play()
    setSoundOn(true)
  }

  const toggleSoundOn = () => {
      const newState = !soundOn
      console.log("toggleSoundOn", newState)
      setSoundOn(newState)

      var element = document.getElementById('audioElement');
      if (newState) {
          element.play()
      } else {
          element.pause()
      }
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

  const onConnect = async(acc) => {
    // tryForceSoundOn()

    await loadContracts(acc)
    
    setAccount(acc)

    loadOwnedNfts(acc)
  }

  const loadContracts = async (acc) => {
    console.log("loadContracts")
    const providerTemp = new ethers.providers.Web3Provider(window.ethereum)
    const signerTemp = providerTemp.getSigner()
    setSigner(signerTemp)

    const primeBabyDragon = new ethers.Contract(networkConfig[currentNetwork].PrimeBabyDragonAddress.address, 
                                                networkConfig[currentNetwork].PrimeBabyDragonAbi.abi, signerTemp)
    
    if (primeBabyDragon == null)
      return
    
    console.log("primeBabyDragon address: " + primeBabyDragon.address)
    const primeApeBurner = new ethers.Contract( networkConfig[currentNetwork].PrimeApeBurnerAddress.address,
                                                networkConfig[currentNetwork].PrimeApeBurnerAbi.abi, signerTemp)
    setPrimeApeBurner(primeApeBurner)
    console.log("primeApeBurner address: " + primeApeBurner.address)

    const balanceTemp = parseInt(await primeBabyDragon.balanceOf(acc))
    console.log("balance", balanceTemp)
    setPrimeBabyDragonBalance(balanceTemp)
    
    const totalSupplyTemp = parseInt(await primeBabyDragon.totalSupply())
    console.log("totalSupply", totalSupplyTemp)
    setPrimeBabyDragonTotalSupply(totalSupplyTemp)
    
    const primePointsTemp = parseInt(await primeApeBurner.pointsPerAddress(acc))
    console.log("primePoints", primePointsTemp)
    setPrimePoints(primePointsTemp)

    let alphaBabyBonusWindowStartTimestamp = parseInt(await primeApeBurner.alphaBabyBonusWindowStartTimestamp())
    let alphaBabyBonusWindowDuration = parseInt(await primeApeBurner.alphaBabyBonusWindowDuration())
    // alphaBabyBonusWindowStartTimestamp = 1680604176 // testing purposes only
    iniTimer(alphaBabyBonusWindowStartTimestamp, alphaBabyBonusWindowDuration)

    const isDuringAlphaBabyBonusWindow = await primeApeBurner.isDuringAlphaBabyBonusWindow()
    console.log("isDuringAlphaBabyBonusWindow", isDuringAlphaBabyBonusWindow)
    setIsAlphaBonusWindow(isDuringAlphaBabyBonusWindow)
  }

  const loadOwnedNfts = async (acc) => {
    console.log("loadOwnedNfts")
    
    let pageKey = null
    let nftItems = [[], [], [], [], []]
    do {
      let requestUrl = networkConfig[currentNetwork].alchemyAPI + '/nft/v2/' + process.env.REACT_APP_ALCHEMY_KEY + '/getNFTs?contractAddresses[]='
      requestUrl += networkConfig[currentNetwork].PrimeDragonAddress.address + "," + networkConfig[currentNetwork].MintableERC721Address.address + "," + networkConfig[currentNetwork].PrimeKongPlanetERC721Address.address + "," + networkConfig[currentNetwork].InfectedApePlanetAddress.address
      requestUrl += '&owner=' + acc + '&withMetadata=true&pageSize=100'
      if (pageKey) requestUrl += '&pageKey=' + pageKey
      
      console.log("requestUrl", requestUrl)
      let itemsAlchemy = await fetch(requestUrl)
      .then(response => response.json())
      .then(response => {
        console.log("response", response);
        pageKey = response.pageKey
        return response.ownedNfts
      })
      .catch(err => console.error(err))

      console.log("itemsAlchemy", itemsAlchemy)
      for(let i = 0; i < itemsAlchemy.length; i++) {
        let tabId = 0
        let pointsWorth = 60
        let address = itemsAlchemy[i].contract.address.toLowerCase()
        let tokenId = parseInt(itemsAlchemy[i].id.tokenId, 16)
        let image_url = itemsAlchemy[i]?.media[0]?.thumbnail ?? itemsAlchemy[i]?.media[0]?.gateway
        let rarity = "Normal"
        let additionalChance = "0%"

        if (address == networkConfig[currentNetwork].MintableERC721Address.address.toLowerCase()) {
          tabId = 1
          pointsWorth = 12
        }
        else if (address == networkConfig[currentNetwork].PrimeKongPlanetERC721Address.address.toLowerCase()) {
          tabId = 2
          pointsWorth = 6
        }
        else if (address == networkConfig[currentNetwork].InfectedApePlanetAddress.address.toLowerCase()) {
          if (tokenId < primeApeOffset) {
            tabId = 3
            pointsWorth = 5
          } else {
            tabId = 4
            pointsWorth = 10
          }
        } else if (address == networkConfig[currentNetwork].PrimeDragonAddress.address.toLowerCase()) {
          if (babyList.includes(tokenId)) {
            rarity = "Rare"
            additionalChance = "10%"
            if (!isAlphaBonusWindowRef.current) pointsWorth = 8
          } else if (epicList.includes(tokenId)) {
            rarity = "Epic"
            additionalChance = "25%"
            if (!isAlphaBonusWindowRef.current) pointsWorth = 8
          } else if (alphaList.includes(tokenId)) {
            rarity = "Alpha"
            if (!isAlphaBonusWindowRef.current) pointsWorth = 8
          } else pointsWorth = 8
        }

        if (image_url == null || image_url.length == 0) {
          image_url = nftPlaceholder
        }

        nftItems[tabId].push({
          contract: address,
          collection: itemsAlchemy[i].contractMetadata.name,
          name: itemsAlchemy[i].title,
          token_id: tokenId,
          image_url: image_url,
          rarity: rarity,
          additional_chance: additionalChance,
          selected: false,
          points: pointsWorth
        })

        // duplicate for testing purposes only
        // nftItems[tabId].push({
        //   contract: address,
        //   name: itemsAlchemy[i].title,
        //   token_id: tokenId,
        //   image_url: image_url,
        //   rarity: rarity,
        //   additional_chance: additionalChance,
        //   selected: false,
        //   points: pointsWorth
        // })
      }
    } while (pageKey != null)
    console.log("itemsOpenSea", nftItems)

    setNfts(nftItems)
    setNftsLoading(false)
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
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [])

  useEffect(async () => {
    if (address) {
      console.log("wagmiClient", wagmiClient)
      console.log("address", address)
      console.log("chain", chain)
      currentNetwork = chain.id
      onConnect(address)
    }
  }, [address, chain])

  return (
    <WagmiConfig client={wagmiClient}>
    <RainbowKitProvider chains={chains} theme={darkTheme()} >
    <BrowserRouter>
      <div className="App" id="wrapper">
        <div className="m-0 p-0 container-fluid">
            {menu != -1 ? (
              <Navbar menu={menu} setMobileMenu={setMobileMenu} setMenu={setMenu} 
              account={account} setMenuConnectWallet={setMenuConnectWallet} timeleft={timeleft} 
              toggleSoundOn={toggleSoundOn} soundOn={soundOn} />
            ) : ( <></> )}
            
            {
              {
                '-1': <>
                        {videoLoading ? (
                          <div className="loadingVideo">
                              Loading...
                              <br/>
                              <Spinner animation="border" role="status" size="m">
                                  <span className="visually-hidden">Loading...</span>
                              </Spinner>
                          </div>
                        ) : (
                          <></>
                        )}
                        <IntroVideo setVideoLoading={setVideoLoading} 
                          setMenu={setMenu} setMenuConnectWallet={setMenuConnectWallet} tryForceSoundOn={tryForceSoundOn} />
                      </>,
                '0': <Home setMenu={setMenu} setMenuConnectWallet={setMenuConnectWallet} />,
                '1': <Sacrifice account={account} nfts={nfts} primeApeBurner={primeApeBurner} triggerPopup={triggerPopup}
                  networkConfig={networkConfig} currentNetwork={currentNetwork} signer={signer} setPrimePoints={setPrimePoints} 
                  primePoints={primePoints} nftsLoading={nftsLoading} setNfts={setNfts} timeleft={timeleft} />,
                '2': <Rebirth primeBabyDragonTotalSupply={primeBabyDragonTotalSupply} primePoints={primePoints} primeApeBurner={primeApeBurner} triggerPopup={triggerPopup} 
                  setPrimePoints={setPrimePoints} setPrimeBabyDragonBalance={setPrimeBabyDragonBalance} primeBabyDragonBalance={primeBabyDragonBalance}
                  />,
                '3': <NewPrimates primeBabyDragonBalance={primeBabyDragonBalance} setMenu={setMenu} />,
              }[menu]
            }
          
          
            {
              {
              '0': <></>,
              '1': <>
                    <div className="popupBackground"></div>
                    <SacrificePopup closePopup={closePopup} onClickButton={() => {setMenu(2); closePopup();}} />
                  </>,
              '2': <>
                    <div className="popupBackground"></div>
                    <RebirthPopup closePopup={closePopup} onClickButton={() => {setMenu(3); closePopup();}} />
                  </>,
              }[popup]
            }
            
            {mobileMenu ? (
              <Menu setMenu={setMenu} setMobileMenu={setMobileMenu} setMenuConnectWallet={setMenuConnectWallet} />
            ) : (
              <></>
            )}
        </div>
        
        {menu != -1 ? (
          <div>
              {/* Disabled during testing */}
              <video id="vid" loop muted autoPlay className="backgroundVideo">
                  <source src={"Keyframe_Burn_L1.mp4"} type="video/mp4"/>
              </video>
          </div>
            ) : ( <></> )}
      </div>
    </BrowserRouter>
    </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
