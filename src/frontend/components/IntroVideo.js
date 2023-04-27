import { useState, useEffect, useRef } from 'react'
import { ethers } from "ethers"
import { Image, Row, Col, Button, Form } from 'react-bootstrap'
import Spinner from 'react-bootstrap/Spinner';

const fromWei = (num) => ethers.utils.formatEther(num)
const toWei = (num) => ethers.utils.parseEther(num.toString())

const IntroVideo = ({setMenu, setMenuConnectWallet, tryForceSoundOn, setVideoLoading}) => {
    const [video, setVideo] = useState(0)
    const [videoUrl, setVideoUrl] = useState("1.mp4")
    const videoRef1 = useRef();
    const videoRef2 = useRef();
    const videoRef3 = useRef();
    const videoRefMobile1 = useRef();
    const videoRefMobile2 = useRef();
    const videoRefMobile3 = useRef();

    const clickOnVideo = () => {
        console.log("clickOnVideo")
        setVideoLoading(false)
        if (videoUrl == "1.mp4") {
            var vid1 = document.getElementById("vid1");
            vid1?.remove()
            videoRef2.current?.play();

            var vidMobile1 = document.getElementById("vidMobile1");
            vidMobile1?.remove()
            videoRefMobile2.current?.play();

            setVideoUrl("2.mp4")
        }
        else if (videoUrl == "2.mp4") {
            var vid2 = document.getElementById("vid2");
            vid2?.remove()
            videoRef3.current?.play();
            
            var vidMobile2 = document.getElementById("vidMobile2");
            vidMobile2?.remove()
            videoRefMobile3.current?.play();

            setVideoUrl("3.mp4")
        }
        else {
            var vid3 = document.getElementById("vid3");
            vid3?.remove()
            
            var vidMobile3 = document.getElementById("vidMobile3");
            vidMobile3?.remove()
            
            setMenu(0)
            tryForceSoundOn()
            return
        }
    }

    const callbackEndVideo = () => {
        if (videoUrl == "2.mp4") {
            var vid2 = document.getElementById("vid2");
            vid2?.remove()
            videoRef3.current?.play();
            setVideoUrl("3.mp4")
        }
    }

    return (
        <Row className="home">
            <div className="displayDesktop">
                <video ref={videoRef1} id="vid1" loop muted autoPlay className="introVideo" style={{zIndex: "20"}}
                onClick={() => clickOnVideo()} onEnded={() => callbackEndVideo()}>
                    <source src={"intro/1.mp4"} type="video/mp4"/>
                </video>
                <video ref={videoRef2} id="vid2" loop className="introVideo" style={{zIndex: "10"}}
                onClick={() => clickOnVideo()} onEnded={() => callbackEndVideo()}>
                    <source src={"intro/2.mp4"} type="video/mp4"/>
                </video>
                <video ref={videoRef3} id="vid2" loop className="introVideo" style={{zIndex: "5"}}
                onClick={() => clickOnVideo()} onEnded={() => callbackEndVideo()}>
                    <source src={"intro/3.mp4"} type="video/mp4"/>
                </video>
            </div>
            <div className="displayMobile">
                <video ref={videoRefMobile1} id="vidMobile1" loop muted autoPlay className="introVideo" style={{zIndex: "20"}}
                onClick={() => clickOnVideo()} onEnded={() => callbackEndVideo()}>
                    <source src={"intro/mobile/1.mp4"} type="video/mp4"/>
                </video>
                <video ref={videoRefMobile2} id="vidMobile2" loop muted className="introVideo" style={{zIndex: "10"}}
                onClick={() => clickOnVideo()} onEnded={() => callbackEndVideo()}>
                    <source src={"intro/mobile/2.mp4"} type="video/mp4"/>
                </video>
                <video ref={videoRefMobile3} id="vidMobile3" loop muted className="introVideo" style={{zIndex: "5"}}
                onClick={() => clickOnVideo()} onEnded={() => callbackEndVideo()}>
                    <source src={"intro/mobile/3.mp4"} type="video/mp4"/>
                </video>
            </div>
        </Row>
    );
}
export default IntroVideo