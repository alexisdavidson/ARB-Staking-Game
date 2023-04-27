import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Image, Row, Col, Button, Form } from 'react-bootstrap'
import eggImage from './assets/Egg.png'
import Spinner from 'react-bootstrap/Spinner';
import TransactionPopup from './TransactionPopup'

const fromWei = (num) => ethers.utils.formatEther(num)
const toWei = (num) => ethers.utils.parseEther(num.toString())

const Rebirth = ({primeBabyDragonTotalSupply, primePoints, primeApeBurner, triggerPopup,
    primeBabyDragonBalance, setPrimeBabyDragonBalance, setPrimePoints}) => {
    const [quantity, setQuantity] = useState(1)
    const [transactionPending, setTransactionPending] = useState(false)
    const [transactionPopupTitle, setTransactionPopupTitle] = useState(null)
    const [transactionPopupSubtitle, setTransactionPopupSubtitle] = useState(null)
    const [transactionPopupItem, setTransactionPopupItem] = useState(null)
    const [transactionPopupDescription, setTransactionPopupDescription] = useState(null)
    const [transactionPopupShowButton, setTransactionPopupShowButton] = useState(null)

    const redeem = async () => {
        // triggerPopup(2); return; // for testing purposes only

        setTransactionPending(true)
        setTransactionPopupTitle("Confirm transaction")
        setTransactionPopupSubtitle("Go to your wallet")
        setTransactionPopupItem("Redeem NFTs")
        setTransactionPopupDescription("You'll be asked to approve the transaction to redeem NFTs.")
        setTransactionPopupShowButton(false)

        console.log("redeem", quantity)

        try {
            await(await primeApeBurner.redeemBatch(quantity)).wait()

            setPrimePoints(primePoints - quantity * 60)
            setPrimeBabyDragonBalance(primeBabyDragonBalance + quantity)
            
            triggerPopup(2)
            setTransactionPending(false)
            setTransactionPopupTitle(null)
            setTransactionPopupSubtitle(null)
            setTransactionPopupItem(null)
            setTransactionPopupDescription(null)
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
    
    const changeQuantity = (direction) => {
        let maxPoints = Math.floor(primePoints / 60)
        if (quantity + direction < 0)
            setQuantity(0)
        else if (quantity + direction > maxPoints)
            setQuantity(maxPoints)
        else
            setQuantity(quantity + direction)
    }

    useEffect(() => {
        if (primePoints < 60)
            setQuantity(0)
    }, [])

    return (
        <Row className="rebirth">
            <Row className="rebirthTitle"><div>Mint New Prime Eggs</div></Row>
            <Row className="rebirthSubtitle">
                <div>
                    Honour the great sacrifices of your Prime Warriors and let their legacy live on!
                </div>
            </Row>
            <Row className="rebirthMintedCard">
                <Col className="col-4 col-lg-3 rebirthMintedCardImage">
                    <video loop autoPlay muted className="eggVideoSmall" >
                        <source src={'Egg.mp4'} type="video/mp4"/>
                    </video>
                </Col>
                <Col className="col-8 col-lg-9 rebirthMintedCardRight">
                    <div className="rebirthMintedCardTitle">
                        <span className="rebirthMintedCardTitleCount">{primeBabyDragonTotalSupply}</span>/1,111
                    </div>
                    <div className="rebirthMintedCardSubtitle">
                        Baby Dragons Minted
                    </div>
                </Col>
            </Row>
            
            <Row className="rebirthMintedCard">
                <div className="rebirthPointsCard">
                    <div>
                        Your Prime Points
                    </div>
                    <div className="pointsCount">
                        {primePoints}
                    </div>
                    <div>
                        How many Baby Dragons Egg you want to mint?
                    </div>

                    <div className="quantitySelector">
                        <Button className="quantitySelectorButton" onClick={() => changeQuantity(-1)}>
                            -
                        </Button>
                        <div>
                            {quantity}
                        </div>
                        <Button className="quantitySelectorButton" onClick={() => changeQuantity(1)}>
                            +
                        </Button>
                    </div>
                </div>
            </Row>

            <Row className="rebirthMintedCard">
                <Row className="rebirthTotalCard">
                    <Col className="rebirthTotalCol">
                        <div className="rebirthTotal">
                            Total
                        </div>
                    </Col>
                    <Col>
                        <div className="rebirthTotalPoints">
                            {quantity * 60} points
                        </div>
                    </Col>
                </Row>
            </Row>
            <Row className="rebirthFooter">
                {quantity > 0 ? (
                        !transactionPending ? (
                            <Button className="backJungleButton" onClick={redeem} >Mint</Button>
                        ) : (
                            <Button className="backJungleButton backJungleButtonNotClickable" >
                                <Spinner animation="border" role="status" size="sm">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                            </Button>
                        )
                ) : (
                    <Button className="backJungleButton backJungleButtonNotClickable" >Mint</Button>
                )}
            </Row>
            
            {transactionPending  && transactionPopupTitle != null ? (
                <>
                    <div className="popupBackground"></div>
                    <TransactionPopup title={transactionPopupTitle} item={transactionPopupItem} description={transactionPopupDescription}
                        subtitle={transactionPopupSubtitle} onClickButton={() => setTransactionPending(false)}
                        showButton={transactionPopupShowButton} />
                </>
            ) : ( <></> )}
        </Row>
    );
}
export default Rebirth