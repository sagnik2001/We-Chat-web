import React, { useState, useEffect, useRef } from "react";
import styles from "./SingleRoom.module.css";
import { useWebRTC } from "../../Components/Hooks/useWebRTC";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { base_url } from "../../app/base_url";
// import { BsFillMicFill, BsFillMicMuteFill } from "react-icons/bs";
import MicButton from "../../assests/Unmute.svg"
import MuteMicButton from "../../assests/Mute.svg"
import CallCutButton from "../../assests/CallCut.svg"
import { createjwt } from "../../Components/FetchSpeakingQuestionsApi/createjwtToken";
import { useAuth } from "../../Providers/ContextProvider";
import { BiSolidErrorAlt } from "react-icons/bi"
import AudioAnalyser from "./AudioAnalyser";
import { BsFillMicMuteFill } from "react-icons/bs"
// import

const SingleRoom = () => {
  const [isMuted, setMuted] = useState(false);
  const [questions, setquestions] = useState("")
  const location = useLocation()
  const roomId = location.state.roomId
  const userDetails = location.state.userDetails
  const userId = location.state.userDetails.id
  const { localMediaStream, audioMediaRefOfUsers } = useAuth()

  const containerRef = useRef(null)
  const textRef = useRef(null)

  const [fontSize, setFontSize] = useState(18); // Initial font size

  useEffect(() => {
    const container = containerRef.current;
    const textElement = textRef.current;

    const adjustFontSize = () => {
      if (container && textElement) {
        // Calculate the container height and text height
        let containerHeight = container.clientHeight;
        let textHeight = textElement.scrollHeight;
        console.log(containerHeight, textHeight)

        // Check if text overflows the container
        if (textHeight + 250 > containerHeight) {
          // Reduce font size by a fixed step until it fits
          let newFontSize = fontSize;
          while (textHeight + 250 > containerHeight) {
            newFontSize -= 1;
            textElement.style.fontSize = `${newFontSize}px`;
            textHeight = textElement.scrollHeight;
          }
        }
      }
    };

    // Call the adjustFontSize function whenever the text content changes
    adjustFontSize();
  }, [questions, fontSize]);




  // const { roomDetails, userDetails } = location.state;





  // console.log(roomDetails, "roomDetails", userDetails, "userDetails")

  const { clients, provideRef, handleMute, audioElements } = useWebRTC(roomId, userDetails, localMediaStream);

  console.log(audioMediaRefOfUsers, "audioclients1")

  useEffect(() => {
    handleMute(isMuted, userDetails.id);
  }, [isMuted]);
  const [timer, setTimer] = useState(0);
  let time1 = 0;

  useEffect(() => {
    let timerInterval;

    if (clients.length <= 1) {
      timerInterval = setInterval(() => {
        if (timer < 50) {
          setTimer(timer + 1);
          console.log(timer)
        } else {
          clearInterval(timerInterval);
          console.log('Timer is over!');
          navigate("/endCall")
        }
      }, 1000);
    }
    else {
      clearInterval(timerInterval);
      console.log('Timer is over! becoz new user joined');
    }

    return () => {
      clearInterval(timerInterval);
    };
  }, [clients, timer]);


  const handleMuteClick = () => {
    // if (clientId !== userDetails.id) {
    //   return;
    // }
    setMuted((prev) => !prev);
  };

  const navigate = useNavigate();

  const handManualLeave = (e) => {
    e.preventDefault()
    navigate("/endCall");
  };

  const handManualAbuse = (e) => {
    e.preventDefault()
    let otherpersonroomId = roomId.split(userId);
    navigate("/reportAbuse", {
      state: {
        userId: userId,
        reportUid: otherpersonroomId[1]
      }
    })
  }

  console.log(clients);

  return (
    <div className={styles.container}>

      <div className={styles.clientsWrap} ref={containerRef}>
        {clients?.length > 1 && <div style={{ display: 'flex', justifyContent: 'end', marginBottom: '10px' }} >
          <button onClick={handManualAbuse} className={styles.actionBtn}>
            <span>Report User</span>
            <BiSolidErrorAlt style={{ color: 'red' }} size={25} />
          </button>
        </div>}
        <div className={styles.header}>
          {/* {roomDetails && <h2 className={styles.topic}>{roomDetails}</h2>} */}
          {clients?.length > 1 ? <h2 className={styles.topic}>Ask this question to your partner and practice speaking English.</h2> :
            <h2 className={styles.topic}>Connecting, please wait for your partner to join.</h2>}
          <div className={styles.actions}>

            {/* <button onClick={handManualLeave} className={styles.actionBtn}>
            <FaRegHandPeace size={35} />
            <span>Leave quietly</span>
          </button> */}
          </div>
        </div>
        <div className={styles.clientsList}>
          {/*  */}
          {clients.filter((users) => users.id !== userDetails.id).map((client) => {
            console.log(client)
            return (
              <div className={styles.client} key={client.id}>
                <div className={styles.userHead}>
                  <img
                    className={styles.userAvatar}
                    src={client.profilePicture}
                    alt=""
                  />
                  <audio
                    autoPlay
                    ref={(instance) => {
                      console.log(client.id, "hello");
                      provideRef(instance, client.id);
                    }}
                  />
                  {console.log(client)}
                  {client.muted && <BsFillMicMuteFill />}
                  {console.log(audioMediaRefOfUsers.current[client.id], "pi")}
                  {audioMediaRefOfUsers.current[client.id] && !client.muted ? <div className={styles.uservisualize}><AudioAnalyser audio={audioMediaRefOfUsers.current[client.id]} /></div> : ''}
                  {/* <button
                  onClick={() => handleMuteClick(client.id)}
                  className={styles.micBtn}
                >
                  {isMuted ? <BsFillMicMuteFill /> : <BsFillMicFill />}
                </button> */}
                </div>
              </div>

            );
          })}
        </div>


        {localMediaStream.current ? <div className={styles.audiovisualize}><AudioAnalyser audio={localMediaStream.current} /></div> : ''}

      </div>
      <div className={styles.footer}>

        <div
          onClick={() => handleMuteClick()}
          className={styles.micBtn}
        >
          {isMuted ? <img
            className={styles.userAvatar}
            src={MuteMicButton}
            alt=""
          /> : <img
            className={styles.userAvatar}
            src={MicButton}
            alt=""
          />}
        </div>
        <div
          // onClick={() => handleMuteClick(client.id)}
          onClick={handManualLeave}
          className={styles.micBtn}
        >
          <img
            className={styles.userAvatar}
            src={CallCutButton}
            alt=""
          />
        </div>
      </div>
    </div>
  );
};

export default SingleRoom;
