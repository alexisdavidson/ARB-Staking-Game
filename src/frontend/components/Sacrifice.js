import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Button, Form } from 'react-bootstrap'
import Spinner from 'react-bootstrap/Spinner';
import TransactionPopup from './TransactionPopup'

import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

import { Buffer } from "buffer/";
window.Buffer = window.Buffer || Buffer;

const keccak256 = require("keccak256")
const { MerkleTree } = require("merkletreejs")
const babyList = require('../../backend/baby.json')
const epicList = require('../../backend/epic.json')
const alphaList = require('../../backend/alpha.json')

const fromWei = (num) => ethers.utils.formatEther(num)
const toWei = (num) => ethers.utils.parseEther(num.toString())

const options = [
    'Dragon', 'Ape', 'Kong', 'Infected L1', 'Infected L2'
  ];
const defaultOption = options[0];

const getMerkleProof = (tokenIdsList, tokenId) => {
    const tokenIdHashed = keccak256(tokenId.toString())
    const leafNodes = tokenIdsList.map(e => keccak256(e.toString()));
    const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true});
    const hexProof = merkleTree.getHexProof(tokenIdHashed);

    return hexProof
}

let apeContracts = null

const Sacrifice = ({timeleft, account, nfts, primeApeBurner, triggerPopup, networkConfig, currentNetwork, signer, primePoints, setPrimePoints,
    nftsLoading, setNfts}) => {
    const [tab, setTab] = useState(0)
    const [selection, setSelection] = useState([])
    const [selectedCount, setSelectedCount] = useState(0)
    const [selectedPoints, setSelectedPoints] = useState(0)
    const [claimableEggs, setClaimableEggs] = useState(0)
    const [transactionPending, setTransactionPending] = useState(false)
    const [transactionPopupTitle, setTransactionPopupTitle] = useState(null)
    const [transactionPopupSubtitle, setTransactionPopupSubtitle] = useState(null)
    const [transactionPopupItem, setTransactionPopupItem] = useState(null)
    const [transactionPopupDescription, setTransactionPopupDescription] = useState(null)
    const [transactionPopupShowButton, setTransactionPopupShowButton] = useState(null)

    const loadApeContracts = async () => {
        if (apeContracts == null) {
            console.log("loadApeContracts")
            apeContracts = {}
            apeContracts[networkConfig[currentNetwork].PrimeDragonAddress.address.toLowerCase()] =
                new ethers.Contract(networkConfig[currentNetwork].PrimeDragonAddress.address,
                    networkConfig[currentNetwork].PrimeDragonAbi.abi, signer)
            apeContracts[networkConfig[currentNetwork].MintableERC721Address.address.toLowerCase()] =
                new ethers.Contract(networkConfig[currentNetwork].MintableERC721Address.address, 
                    networkConfig[currentNetwork].MintableERC721Abi.abi, signer)
            apeContracts[networkConfig[currentNetwork].PrimeKongPlanetERC721Address.address.toLowerCase()] = 
                new ethers.Contract(networkConfig[currentNetwork].PrimeKongPlanetERC721Address.address, 
                    networkConfig[currentNetwork].PrimeKongPlanetERC721Abi.abi, signer)
            apeContracts[networkConfig[currentNetwork].InfectedApePlanetAddress.address.toLowerCase()] = 
                new ethers.Contract(networkConfig[currentNetwork].InfectedApePlanetAddress.address, 
                    networkConfig[currentNetwork].InfectedApePlanetAbi.abi, signer)
            // console.log(apeContracts)
        }
    }

    const approveSelection = async () => {
        console.log("approveSelection")
        loadApeContracts()
        let differentContracts = []

        // find out different selected contracts
        for(let i = 0; i < selection.length; i++) {
            if (!differentContracts.includes({collection: selection[i].collection, address: selection[i].contract})) {
                differentContracts.push({collection: selection[i].collection, address: selection[i].contract})
            }
        }
        console.log(differentContracts)

        for(let i = 0; i < differentContracts.length; i ++) {
            let isApprovedForAll = await apeContracts[differentContracts[i].address].isApprovedForAll(account, primeApeBurner.address)
            // console.log(differentContracts[i], primeApeBurner.address, isApprovedForAll)
            if (!isApprovedForAll) {
                setTransactionPopupTitle("Approve collection")
                setTransactionPopupSubtitle("Go to your wallet")
                setTransactionPopupItem(differentContracts[i].collection)
                setTransactionPopupDescription("You'll be asked to approve this collection from your wallet. You only need to approve each collection once.")
                await(await apeContracts[differentContracts[i].address].setApprovalForAll(primeApeBurner.address, true)).wait()
            }
        }
    }

    const isSpecialDragon = (contract, tokenId) => {
        // console.log("isSpecialDragon", contract, tokenId)
        let result = contract == networkConfig[currentNetwork].PrimeDragonAddress.address.toLowerCase()
        result = result && (alphaList.includes(tokenId) || epicList.includes(tokenId) || babyList.includes(tokenId))

        // console.log("isSpecialDragon", result)
        return result
    }

    const sacrifice = async () => {
        // triggerPopup(1); return; // for testing purposes only

        setTransactionPending(true)
        setTransactionPopupTitle(null)
        setTransactionPopupShowButton(false)

        console.log("sacrifice")
        console.log(selection)

        try {
            await approveSelection()

            console.log(babyList)
            console.log(epicList)

            let slicedNfts = nfts.slice()
            let addresses = []
            let tokenIds = []
            let proofs = []

            for(let i = 0; i < selection.length; i++) {
                let proof = []
                let tokenId = selection[i].token_id
                if (selection[i].contract == networkConfig[currentNetwork].PrimeDragonAddress.address.toLowerCase()) {
                    // console.log("primeDragon proof")
                    if (babyList.includes(tokenId))
                        proof = getMerkleProof(babyList, tokenId.toString())
                    else if (epicList.includes(tokenId))
                        proof = getMerkleProof(epicList, tokenId.toString())
                    else if (alphaList.includes(tokenId))
                        proof = getMerkleProof(alphaList, tokenId.toString())
                }
                addresses.push(selection[i].contract)
                tokenIds.push(tokenId)
                proofs.push(proof)

                slicedNfts[selection[i].tabIndex] = slicedNfts[selection[i].tabIndex].filter(
                    (x, j) => !(x.token_id == selection[i].token_id && x.contract == selection[i].contract))
            }
            console.log("primeApeBurner.burnBatch arguments:")
            console.log(addresses)
            console.log(tokenIds)
            console.log(proofs)

            setTransactionPopupTitle("Confirm transaction")
            setTransactionPopupSubtitle("Go to your wallet")
            setTransactionPopupItem("Burning NFTs")
            setTransactionPopupDescription("You'll be asked to approve the transaction to burn the selected NFTs.")
            
            await(await primeApeBurner.burnBatch(addresses, tokenIds, proofs)).wait()
            triggerPopup(1)
            setTransactionPending(false)
            setTransactionPopupTitle(null)
            setTransactionPopupItem(null)
            setTransactionPopupDescription(null)

            setPrimePoints(primePoints + selectedPoints)

            setNfts(slicedNfts)
            updateSelectedUi(slicedNfts)
        } catch (error) {
            console.error("Custom error handling: " + error);
            setTransactionPopupTitle("Error")
            setTransactionPopupSubtitle("Transaction canceled")
            setTransactionPopupShowButton(true)
            let errorSplit = (error.toString()).split('reverted:')
            let errorMessage = ""
            if (errorSplit.length > 1) errorMessage = errorSplit[1].split('"')[0] ?? ""
            setTransactionPopupDescription(errorMessage)
        }

    }

    const clickCheckbox = (id) => {
        // console.log("clickCheckbox", id)
        if (nfts == null || nfts[tab] == null) return

        if (id == null) { // Header checkbox: Select / deselect all
            let allWasChecked = true
            for(let i = 0; i < nfts[tab].length; i++) {
                if (!nfts[tab][i].selected)
                    allWasChecked = false
                nfts[tab][i].selected = true
            }

            if (allWasChecked) {
                for(let i = 0; i < nfts[tab].length; i++)
                    nfts[tab][i].selected = false
            }
        } else if (id < nfts[tab].length) { // Toggle item checkbox
            nfts[tab][id].selected = !nfts[tab][id].selected
        }

        updateSelectedUi()
    }

    const updateSelectedUi = (nftsTemp) => {
        if (nftsTemp == null) nftsTemp = nfts
        if (nftsTemp == null || nftsTemp[tab] == null) return
        // console.log("updateSelectedUi", tab)
        let allChecked = true
        if (nftsTemp != null && nftsTemp[tab] != null) {
            for(let i = 0; i < nftsTemp[tab].length; i++) {
                var element = document.getElementById('checkbox-' + i);
                element.checked = nftsTemp[tab][i].selected
                // console.log(nftsTemp[tab][i].selected)
                if (!nftsTemp[tab][i].selected)
                    allChecked = false
            }
        }

        var elementHeader = document.getElementById('checkbox-header');
        elementHeader.checked = allChecked && nftsTemp[tab].length > 0

        updateSelection()
        updateDropdown()
    }

    const updateSelection = () => {
        if (nfts == null) return
        // console.log("updateSelection")

        let selectionTemp = []
        let selectedCountTemp = 0
        let selectedPointsTemp = 0
        for(let i = 0; i < nfts.length; i++) {
            for(let j = 0; j < nfts[i].length; j++) {
                let selectedItem = nfts[i][j]
                if (selectedItem.selected) {
                    selectedItem.tabIndex = i

                    selectionTemp.push(selectedItem)
                    selectedCountTemp ++
                    selectedPointsTemp += selectedItem.points
                }
            }
        }
        setSelection(selectionTemp)
        setSelectedCount(selectedCountTemp)
        setSelectedPoints(selectedPointsTemp)
        setClaimableEggs(Math.floor(selectedPointsTemp / 60))
    }
    const updateDropdown = () => {
        // var element = document.getElementById('mobileDropdown');
        // element.value = tab
    }

    const clickTab = (tabId) => {
        // console.log("clickTab", tabId)
        setTab(tabId)
        // updateSelectedUi(tabId)
    }

    const onSelect = (e, idx) => {
        let dropdownIndex = 0
        if (e.value == "Ape")
            dropdownIndex = 1
        else if (e.value == "Kong")
            dropdownIndex = 2
        else if (e.value == "Infected L1")
            dropdownIndex = 3
        else if (e.value == "Infected L2")
            dropdownIndex = 4
        console.log("onSelect", e, dropdownIndex)
        setTab(dropdownIndex)
    }

    const itemColor = (rarity) => {
        if (rarity == "Epic")
            return "sacrificeListItemRed"
        if (rarity == "Rare")
            return "sacrificeListItemBlue"
        if (rarity == "Alpha")
            return "sacrificeListItemGolden"
        return ""
    }

    useEffect(() => {
        updateSelectedUi()
    }, [tab])

    return (
        <Row className="sacrificeRow">
            <Row className="sacrificeTitle"><div>Select Your Prime Warriors</div></Row>
            <Row className="sacrifice">
                <Row className="m-0 p-0 p-lg-4">
                    <div className="sacrificeTabs displayDesktop">
                        <div>
                            {tab == 0 ? (
                                <Button className="tab tabSelected" >Dragon</Button>
                            ) : (
                                (!timeleft || timeleft > 0) ? (
                                    <Button className="tab" onClick={() => clickTab(0)} >Dragon</Button>
                                ) : (
                                    <Button className="tab" onClick={() => clickTab(0)} >Dragon</Button>
                                )
                            )}
                        </div>
                        <div>
                            {tab == 1 ? (
                                <Button className="tab tabSelected" >Ape</Button>
                            ) : (
                                (!timeleft || timeleft > 0) ? (
                                    <Button className="tab" disabled >Ape</Button>
                                ) : (
                                    <Button className="tab" onClick={() => clickTab(1)} >Ape</Button>
                                )
                            )}
                        </div>
                        <div>
                            {tab == 2 ? (
                                <Button className="tab tabSelected" >Kong</Button>
                            ) : (
                                (!timeleft || timeleft > 0) ? (
                                    <Button className="tab" disabled >Kong</Button>
                                ) : (
                                    <Button className="tab" onClick={() => clickTab(2)}>Kong</Button>
                                )
                            )}
                        </div>
                        <div>
                            {tab == 3 ? (
                                <Button className="tab tabSelected" >Infected L1</Button>
                            ) : (
                                (!timeleft || timeleft > 0) ? (
                                    <Button className="tab" disabled >Infected L1</Button>
                                ) : (
                                    <Button className="tab" onClick={() => clickTab(3)}>Infected L1</Button>
                                )
                            )}
                        </div>
                        <div>
                            {tab == 4 ? (
                                <Button className="tab tabSelected" >Infected L2</Button>
                            ) : (
                                (!timeleft || timeleft > 0) ? (
                                    <Button className="tab" disabled >Infected L2</Button>
                                ) : (
                                    <Button className="tab" onClick={() => clickTab(4)}>Infected L2</Button>
                                )
                            )}
                        </div>
                    </div>
                    <div className='sacrificeDropwdown displayMobile'>
                        {(!timeleft || timeleft > 0) ? (
                            <Dropdown className="mobileDropdown" menuClassName='myMenuClassName' controlClassName='myControlClassName' 
                                id="mobileDropdown" options={options} onChange={onSelect} value={defaultOption} disabled />
                        ) : (
                            <Dropdown className="mobileDropdown" menuClassName='myMenuClassName' controlClassName='myControlClassName' 
                            id="mobileDropdown" options={options} onChange={onSelect} value={defaultOption} />
                        )}
                    </div>
                </Row>

                <Row className="m-0 p-0">
                    <Row className="sacrificeListHeader m-0 px-4">
                        <Col className="col-1 col-lg-1 sacrificeListCheckbox p-0">
                            <Form.Check className="checkboxSacrifice" type="checkbox" id="checkbox-header" onClick={() => clickCheckbox(null)}/>
                        </Col>
                        <Col className="col-4 col-lg-3 sacrificeListHeaderElement p-0">
                            NFT
                        </Col>
                        <Col className="col-3 col-lg-3 sacrificeListHeaderElement p-0">
                            Rarity
                        </Col>
                        <Col className="col-4 col-lg-5 sacrificeListHeaderElement p-0" style={{fontSize: ".9rem"}}>
                            Alpha Baby Dragon Bonus
                        </Col>
                    </Row>
                </Row>

                <Row className="m-0 p-4">
                    {nfts != null && nfts[tab] != null && nfts[tab].length > 0 ? (
                        <Row className="sacrificeList m-0 p-0">
                            <Row className="actionFrameScroll m-0 p-0">
                                {nfts[tab].map((item, idx) => (
                                    <Row key={idx} className={"sacrificeListItem " + itemColor(item.rarity)}>
                                        <Col className="col-1 col-lg-1 sacrificeListCheckbox p-0">
                                            {(!timeleft || timeleft > 0) && !isSpecialDragon(item.contract, item.token_id) ? (
                                                <div title ="Can be burned during phase 2">
                                                    <Form.Check className="checkboxSacrifice" type="checkbox" id={"checkbox-" + idx} disabled />
                                                </div>
                                            ) : (
                                                <Form.Check className="checkboxSacrifice" type="checkbox" id={"checkbox-" + idx} onClick={() => clickCheckbox(idx)} />
                                            )}
                                        </Col>
                                        <Col className="col-2 col-lg-1 sacrificeListImageDiv p-0">
                                            <img src={item.image_url} className="sacrificeListImage" />
                                        </Col>
                                        <Col className="col-2 col-lg-2 sacrificeListImageDiv p-0">
                                            {item.token_id}
                                        </Col>
                                        <Col className="col-3 col-lg-3 sacrificeListElement p-0">
                                            {item.rarity}
                                        </Col>
                                        <Col className="col-4 col-lg-5 sacrificeListElement p-0">
                                            {timeleft && timeleft > 0 ? item.additional_chance : "0%"}
                                        </Col>
                                    </Row>
                                ))}
                            </Row>
                        </Row>
                    ) : (
                        <Row>
                            {nftsLoading ? (
                                <div>
                                    <Spinner animation="border" role="status" size="sm">
                                        <span className="visually-hidden">Loading...</span>
                                    </Spinner>
                                </div>
                            ) : (
                                <div>
                                    Empty List
                                </div>
                            )}
                        </Row>
                    )}
                </Row>

                <Row className="m-0 p-0 sacrificeFooter">
                    <Col className="col-8 sacrificeFooterLeft">
                        <div className="sacrificeFooterLeftTitle">
                            {selectedPoints} Prime Points
                        </div>
                        <div className="sacrificeFooterLeftSubtitle">
                            {claimableEggs} Claimable Baby Dragon Eggs • {selectedCount} NFTs selected
                        </div>
                    </Col>
                    <Col className="col-4 sacrificeFooterRight">
                        {selectedPoints > 0 ? (
                            !transactionPending ? (
                                <Button className="sacrificeButton sacrificeButtonReady" onClick={sacrifice}>Sacrifice</Button>
                            ) : (
                                <Button className="sacrificeButton" >
                                    <Spinner animation="border" role="status" size="sm">
                                        <span className="visually-hidden">Loading...</span>
                                    </Spinner>
                                </Button>
                            )
                        ) : (
                            <Button className="sacrificeButton" >Sacrifice</Button>
                        )}
                    </Col>
                </Row>
            </Row>

            {transactionPending  && transactionPopupTitle != null ? (
                <>
                    <div className="popupBackground"></div>
                    <TransactionPopup title={transactionPopupTitle} item={transactionPopupItem} description={transactionPopupDescription}
                    subtitle={transactionPopupSubtitle} onClickButton={() => setTransactionPending(false)} showButton={transactionPopupShowButton} />
                </>
            ) : ( <></> )}
        </Row>
    );
}
export default Sacrifice