import React, { useState, useEffect } from "react";
import styles from "./SingleRoom.module.css";
import { useWebRTC } from "../../Components/Hooks/useWebRTC";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { base_url } from "../../app/base_url";
// import { BsFillMicFill, BsFillMicMuteFill } from "react-icons/bs";
import MicButton from "../../assests/Unmute.svg"
import MuteMicButton from "../../assests/Mute.svg"
import CallCutButton from "../../assests/CallCut.svg"
import ProfileSvg from "../../assests/Profile.svg"
import { createjwt } from "../../Components/FetchSpeakingQuestionsApi/createjwtToken";
// import

const SingleRoom = () => {
  const { userId, roomId } = useParams();
  const [isMuted, setMuted] = useState(false);
  const [questions, setquestions] = useState("")

  // const { roomDetails, userDetails } = location.state;

  console.log(roomId, "roomId", userId, "user")
  const userDetails = {
    id: userId,
    name: userId,
    profilePicture: ProfileSvg
  }

  useEffect(() => {
    const jwt = createjwt(
      userId,
      "webviewCall"
    );
    var bodyFormData = new FormData();
    bodyFormData.append("encrptData", jwt);
    axios({
      method: "post",
      url: `${base_url}fetchQuestionForSpeakingPractice/`,
      data: bodyFormData,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then((res) => {
        if (res.status === 200) {
          console.log(res, "res");
          setquestions(res.data.data.question)
        } else {
          console.log("Api Status is not 200");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [userId])

  // console.log(roomDetails, "roomDetails", userDetails, "userDetails")

  const { clients, provideRef, handleMute } = useWebRTC(roomId, userDetails);

  console.log(clients,"clients")

  useEffect(() => {
    handleMute(isMuted, userDetails.id);
  }, [isMuted]);

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

  return (
    <div>
      {/* <div className="container">
        <button onClick={handManualLeave} className={styles.goBack}>
          <MdOutlineArrowBack size={35} />
          <span>All voice rooms</span>
        </button>
      </div> */}
      <div className={styles.clientsWrap}>
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
        {clients?.length > 1 && <div className={styles.question}>
          <h2 className={styles.topic}>{questions}</h2>
        </div>}
        <div className={styles.footer}>
          <button
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
          </button>
          <button
            // onClick={() => handleMuteClick(client.id)}
            onClick={handManualLeave}
            className={styles.micBtn}
          >
            <img
              className={styles.userAvatar}
              src={CallCutButton}
              alt=""
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleRoom;
