import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Image, Row, Col, Button, Form } from 'react-bootstrap'

const fromWei = (num) => ethers.utils.formatEther(num)
const toWei = (num) => ethers.utils.parseEther(num.toString())

const NewPrimates = ({primeBabyDragonBalance, setMenu}) => {
    return (
        <Row className="newPrimates">
            <Row className="newPrimatesTitle">Prime Baby Dragon</Row>
            <Row className="rebirthMintedCard">
                <Col className="col-4 m-0">
                    <Row className="m-0 p-0">
                        <div className="newPrimatesBabyDragonCount">
                            {primeBabyDragonBalance}
                        </div>
                    </Row>
                    <Row className="mb-3" style={{color: "white"}}>
                        Baby Dragon
                    </Row>
                </Col>
                <Col className="col-4 eggVideoRow">
                    <video loop autoPlay muted className="eggVideo" >
                        <source src={'Egg.mp4'} type="video/mp4"/>
                    </video>
                </Col>
                <Col className="col-4 m-0 p-0">
                </Col>
                {/* <Row className="mb-4" style={{color: "white"}}>
                    This is the number of Prime Eggs in your wallet. Some of your Prime Eggs have a bonus chance to hatch into an Alpha as shown below.
                </Row>

                <Row>
                    <div className="newPrimatesCards">
                        <div className="newPrimatesCard">
                            <div className="newPrimatesCardTitle">
                                13
                            </div>
                            <div className="newPrimatesCardSubtitle newPrimatesCardSubtitleGreen">
                                Normal chance for Alpha Prime Baby
                            </div>
                        </div>
                        <div className="newPrimatesCard">
                            <div className="newPrimatesCardTitle">
                                5
                            </div>
                            <div className="newPrimatesCardSubtitle newPrimatesCardSubtitleBlue">
                                10% bonus chance for Alpha Prime Baby
                            </div>
                        </div>
                        <div className="newPrimatesCard">
                            <div className="newPrimatesCardTitle">
                                2
                            </div>
                            <div className="newPrimatesCardSubtitle newPrimatesCardSubtitlePurple">
                                25% bonus chance for Alpha Prime Baby
                            </div>
                        </div>
                    </div>
                </Row> */}
            </Row>
            <Row className="newPrimatesFooter">
                <Button className="backJungleButton" onClick={() => setMenu(1)}>Back to the Jungle</Button>
            </Row>
        </Row>
    );
}
export default NewPrimates