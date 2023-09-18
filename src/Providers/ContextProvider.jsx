import { React, useState, useContext, createContext, useRef } from "react";
import { getBase64Enc } from "../Components/FetchSpeakingQuestionsApi/createjwtToken";
import axios from "axios";
import { base_url } from "../app/base_url";
import CryptoJS from "crypto-js";
import { useNavigate } from "react-router-dom";


const AuthContext = createContext({
    localMediaStream: null
});

export const useAuth = () => useContext(AuthContext);

export default function AuthContextProvider(props) {
    const localMediaStream = useRef(null)
    const navigate = useNavigate()
    const audioMediaRefOfUsers = useRef({});
    const [audioMediaRefUpdated, setAudioMediaRefUpdated] = useState(0);

    const createjwt = (uid, platform, reportUid, reportReason) => {
        // Header

        var header = {
            alg: "HS256",
            typ: "JWT",
        };
        var header64 = getBase64Enc(JSON.stringify(header));

        //Playload
        var data = {
            uid: uid,
            platform,
            reportUid,
            reportReason
        };
        console.log("jwt", data);
        var data64 = getBase64Enc(JSON.stringify(data));
        var token = header64 + "." + data64;
        // secret token
        var secret = "120k%#n)^(don(omv4fg_-$8v+mm!(sy%#(h(=v%f+ywykd0(^";
        var signature = CryptoJS.HmacSHA256(token, secret);
        var sign64 = CryptoJS.enc.Base64.stringify(signature);
        var jwt = token + "." + sign64;
        console.log(jwt);
        // signupdata(jwt);

        return jwt;
    };

    const handleReportAbuse = (uid, platform, reportUid, reportReason) => {
        const jwt = createjwt(uid, platform, reportUid, reportReason);
        var bodyFormData = new FormData();
        bodyFormData.append("encrptData", jwt);
        axios({
            method: "post",
            url: `${base_url}reportUserForSpeakingCall/`,
            data: bodyFormData,
            headers: { "Content-Type": "multipart/form-data" },
        })
            .then((res) => {
                if (res.status === 200) {
                    console.log(res, "res");
                    navigate("/endCall")
                } else {
                    console.log("Api Status is not 200");
                }
            })
            .catch((err) => {
                console.log(err);
            });
    }

    const value = {
        localMediaStream,
        handleReportAbuse,
        audioMediaRefOfUsers,
        setAudioMediaRefUpdated
    }
    return (
        <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>
    );
}