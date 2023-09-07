import CryptoJS from "crypto-js";
const getBase64Enc = (e) => {
    var WordArray = CryptoJS.enc.Utf8.parse(e);
    var result = CryptoJS.enc.Base64.stringify(WordArray);
    // Remove padding equal characters
    result = result.replace(/=+$/, "");
    //Replace characters according to base64url specifications
    result = result.replace(/\+/g, "-");
    result = result.replace(/\//g, "_");

    return result;
};
export const createjwt = (uid, platform) => {
    // Header

    var header = {
        alg: "HS256",
        typ: "JWT",
    };
    var header64 = getBase64Enc(JSON.stringify(header));

    //Playload
    var data = {
        uid: uid,
        platform
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