import React, { useState, useEffect, useRef, forceUpdate } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import Raffle from "../components/common/Raffle";
import { ethers } from 'ethers'
import { motion } from "framer-motion";
import RaffleAbi from '../lib/contractsData/Raffle.json'
import RaffleAddress1 from '../lib/contractsData/Raffle-address-1.json'
import RaffleAddress2 from '../lib/contractsData/Raffle-address-2.json'
// import TokenAbi from '../lib/contractsData/Token.json'
// import TokenAddress from '../lib/contractsData/Token-address.json'
import TokenAbi from '../lib/contractsData/ApeCoinAbi.json'
import TokenAddress from '../lib/contractsData/ApeCoin-address.json'
import Axios from 'axios'

const fromWei = (num) => parseInt(ethers.utils.formatEther(num))
const toWei = (num) => ethers.utils.parseEther(num.toString())

function BurnRaffle() {
	const [raffles] = useState([{}, {}]);
	const [token, setToken] = useState(null);
    const [account, setAccount] = useState(null)
    const [firstLoaded] = useState(false)
    const [forceUpdate, setForceUpdate] = useState(true);
    const forceUpdateRef = useRef()
    forceUpdateRef.current = forceUpdate;
    const firstLoadedRef = useRef(); firstLoadedRef.current = firstLoaded;
    const rafflesRef = [useRef(), useRef()];
    rafflesRef[0].current = raffles[0];
    rafflesRef[1].current = raffles[1];

    function useForceUpdate() {
        setForceUpdate(!forceUpdateRef.current)
    }

    const requestEndRaffle = async (raffleId) => {
        console.log("requestEndRaffle")
        
        Axios.post('/api/end_raffle?raffle_address=' + rafflesRef[raffleId].current.contractInstance.address, {
            raffle_address: rafflesRef[raffleId].current.contractInstance.address
        }).then((response) => {
            const serverResult = response.data
            console.log(serverResult)
            loadSlots(raffleId)
        })
    }
    
    const listenToEvents = async (raffleId) => {
        if (rafflesRef[raffleId].current.contractInstance == null) {
            console.log("listenToEvents, raffle null")
            return
        }
        console.log("listenToEvents successfull")
        rafflesRef[raffleId].current.contractInstance.on("SlotEntered", (user, slot) => {
            console.log("SlotEntered");
            console.log(user, slot);
            loadSlots(raffleId)
        });
        rafflesRef[raffleId].current.contractInstance.on("SlotLeft", (user, slot) => {
            console.log("SlotLeft");
            console.log(user, slot);
            loadSlots(raffleId)
        });
        rafflesRef[raffleId].current.contractInstance.on("RaffleFilled", () => {
            console.log("RaffleFilled");
            requestEndRaffle(raffleId)
        });
        rafflesRef[raffleId].current.contractInstance.on("RaffleEnded", () => {
            console.log("RaffleEnded");
            loadSlots(raffleId)
        });
    }

    const loadSlots = async(raffleId) => {
        console.log("Load slots")
        if (rafflesRef[raffleId]?.current?.contractInstance == null) {
            console.log("loadSlots null")
            return
        }
        
        const participants = await rafflesRef[raffleId].current.contractInstance.getParticipants()
        console.log(participants)

        let slotsTemp = [
            { address: "Loading..." },
            { address: "Loading..." },
            { address: "Loading..." },
            { address: "Loading..." },
            { address: "Loading..." },
            { address: "Loading..." },
            { address: "Loading..." },
            { address: "Loading..." },
            { address: "Loading..." },
            { address: "Loading..." },
            { address: "Loading..." },
        ]

        for(let i = 0; i < participants.length; i++) {
            slotsTemp[i].address = participants[i]
        }

        console.log(rafflesRef[raffleId].current.contractInstance)

        rafflesRef[raffleId].current.slots = [...slotsTemp]
        rafflesRef[raffleId].current.lastWinner = await rafflesRef[raffleId].current.contractInstance.lastWinner()
        rafflesRef[raffleId].current.totalPayouts = fromWei(await rafflesRef[raffleId].current.contractInstance.totalPayout())
        rafflesRef[raffleId].current.totalBurn = fromWei(await rafflesRef[raffleId].current.contractInstance.totalBurned())
        rafflesRef[raffleId].current.isRaffleFilled = (await rafflesRef[raffleId].current.contractInstance.participantsCount()) >= 11

        useForceUpdate()
    }

    const web3Handler = async () => {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0])

        await loadContracts(accounts[0])
    }
  
    const loadContracts = async (acc) => {
        console.log("Load contracts")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()

        const raffleObject = {
            contractInstance: null,
            allowance: 0,
            slots: [],
            isRaffleFilled: false,
            lastWinner: "",
            totalPayouts: "",
            totalBurn: ""
        }

        const raffles = [raffleObject, raffleObject]
        raffles[0] = new ethers.Contract(RaffleAddress1.address, RaffleAbi.abi, signer)
        raffles[1] = new ethers.Contract(RaffleAddress2.address, RaffleAbi.abi, signer)

        const token = new ethers.Contract(TokenAddress.address, TokenAbi, signer)
        setToken(token)

        rafflesRef[0].current.contractInstance = raffles[0];
        rafflesRef[0].current.allowance = fromWei(await token.allowance(acc, raffles[0].address))

        rafflesRef[1].current.contractInstance = raffles[1];
        rafflesRef[1].current.allowance = fromWei(await token.allowance(acc, raffles[1].address))

        for(let i = 0; i < raffles.length; i++) {
            console.log(raffles[i].address)
            await loadSlots(i)
            listenToEvents(i)
        }

        console.log("Acc: " + acc)
    }
    
    useEffect(() => {
        if (!firstLoadedRef.current) {
            web3Handler()
            firstLoadedRef.current = true
        }

        return () => {
            for(let i = 0; i < raffles.length; i++) {
                raffles[i]?.contractInstance?.removeAllListeners("SlotEntered");
                raffles[i]?.contractInstance?.removeAllListeners("RaffleFilled");
                raffles[i]?.contractInstance?.removeAllListeners("SlotLeft");
            }
        };
    }, [])

    return (
        <>
            <Box id="burn-raffle" w="100%" h="100%" bg="#07091b" position="relative">
                <Flex className="image-wrapper hero-v2" >
                    <Box className="raffle-container" >
                        <Raffle id={0} name={"20M"} account={account} raffle={raffles[0]} web3Handler={web3Handler} 
                            token={token} requestEndRaffle={requestEndRaffle} />
                        <Raffle id={1} name={"50M"} account={account} raffle={raffles[1]} web3Handler={web3Handler} 
                            token={token} requestEndRaffle={requestEndRaffle} />
                    </Box>
                    <motion.div
                        className="box"
                        initial={{ opacity: 1, filter: "blur(0px)" }}
                        animate={{ opacity: [0.67, 0.63, 0.60, 0.63, 0.67], filter: ["blur(0.1px)", "blur(0.6px)", "blur(0.9px)", "blur(0.6px)", "blur(0.1px)"] }}
                        transition={{
                            duration: 2,
                            ease: "easeInOut",
                            times: [0, 0.2, 0.5, 0.8, 1],
                            repeat: Infinity,
                            repeatDelay: 0.7
                        }}
                    >
                        <img src="about-bg-p.webp" loading="eager" sizes="100vw" alt="" className="image cover"
                            srcSet="about-bg-p-500.webp 500w, about-bg-p-800.webp 800w, about-bg-p-1080.webp 1080w, about-bg-p-1600.webp 1600w, about-bg-p-2000.webp 2000w, about-bg-p-2600.webp 2600w, about-bg-p.webp 2880w"
                        />
                    </motion.div>
                </Flex>
            </Box>
        </>
    );
}

export default BurnRaffle;
