import React, { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom";
import ProfileSvg from "../../assests/Profile.svg"
import { useAuth } from "../../Providers/ContextProvider";


const Rooms = () => {
    const navigate = useNavigate()
    const [permissionsaccess, setpermissionaccess] = useState("Waiting for Audio Permission");
    const { userId, roomId } = useParams();
    const userDetails = {
        id: userId,
        name: userId,
        profilePicture: ProfileSvg
    }

    const [timer, setTimer] = useState(0);
    const [labelVisible, setLabelVisible] = useState(false);
    const [isTimerRunning, setIsTimerRunning] = useState(true);
    const { localMediaStream } = useAuth()

    useEffect(() => {
        let timerInterval;

        if (isTimerRunning) {
            timerInterval = setInterval(() => {
                if (timer < 30) {
                    setTimer(timer + 1);
                    if (timer === 20) {
                        setLabelVisible(true);
                    }
                } else {
                    clearInterval(timerInterval);
                    // Perform your action when 30 seconds are over here
                    console.log('Timer is over!');
                    navigate("/endCall")
                }
            }, 1000);
        }

        return () => {
            clearInterval(timerInterval);
        };
    }, [timer, isTimerRunning]);

    const [newtimer, setnewtimer] = useState(0)

    useEffect(() => {
        let timerInterval;

        if (permissionsaccess === "Permission Not Granted") {
            timerInterval = setInterval(() => {
                if (newtimer < 10) {
                    setnewtimer(newtimer + 1);

                } else {
                    clearInterval(timerInterval);
                    // Perform your action when 30 seconds are over here
                    console.log('Timer is over!');
                    navigate("/endCall")
                }
            }, 1000);
        }
        return () => {
            clearInterval(timerInterval);
        };
    }, [newtimer, permissionsaccess])

    const handleStopTimer = () => {
        setIsTimerRunning(false);
    };


    useEffect(() => {
        const startChat = async () => {
            async function captureMedia() {
                try {
                    // Start capturing local audio stream.
                    localMediaStream.current = await navigator.mediaDevices.getUserMedia({
                        audio: true,
                    });
                    console.log(localMediaStream.current)
                    setpermissionaccess("Permission Allowed")
                    handleStopTimer()
                    navigate("/callStarted", {
                        state: {
                            userDetails: userDetails,
                            roomId: roomId
                        }
                    })
                } catch (error) {
                    // localMediaStream.current = {
                    //   active: false,
                    //   id: "not given acess",
                    //   onactive: null,
                    //   onaddtrack: null,
                    //   oninactive: null,
                    //   onremovetrack: null
                    // };
                    console.log("Error capturing media: Please give access", error);
                    if (error.name === 'NotAllowedError') {
                        // User denied media access, ask again
                        // await captureMedia()
                        setpermissionaccess("Permission Not Granted")
                        console.log("Permission Not Granted")
                        handleStopTimer()
                    } else {
                        // Handle other errors
                        console.error('Error:', error);
                    }
                    // Handle error related to media permissions.
                }
            }
            try {
                console.log("Media access given")
                await captureMedia();
            } catch (error) {
                console.log("Error occured")
            }
        }
        startChat();
    }, [])
    return (
        <div>
            {permissionsaccess === "Waiting for Audio Permission" && <div className="App">
                <div className="auth-form-container">
                    {labelVisible ? <h2>Still Waiting for Permission.After 10s call will get cut</h2> : <h2>Waiting for Audio Permission</h2>}
                </div>
            </div>}
            {
                permissionsaccess === "Permission Not Granted" && <div className="App">
                    <div className="auth-form-container">
                        {<h2>Permission Not Granted.Call will get disconnect after 10s</h2>}
                    </div>
                </div>
            }
            {
                permissionsaccess === "Permission Allowed" && <div className="App">
                    <div className="auth-form-container">
                        {<h2>Permission Allowed</h2>}
                    </div>
                </div>
            }
        </div>
    )
}

export default Rooms