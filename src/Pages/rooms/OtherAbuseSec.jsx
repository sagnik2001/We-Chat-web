import React from "react";

import styles from "./SingleRoom.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../Providers/ContextProvider";



const OtherAbuseSec = () => {
    const navigate = useNavigate()

    const { handleReportAbuse } = useAuth()

    const [value, setValue] = React.useState('');

    const handleChange = (event) => {
        setValue(event.target.value);
    };

    const location = useLocation()


    return (
        <div className="App">
            <div className="auth-form-container">
                <h2>Other Issues</h2>
                <textarea value={value} onChange={handleChange} style={{ padding: '10px', marginTop: '10px' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                    <button className={styles.actionBtn} onClick={(e) => {
                        e.preventDefault()
                        navigate("/reportAbuse")
                    }}>
                        <div>Back</div>
                    </button>
                    <button className={styles.actionBtn} onClick={(e) => {
                        e.preventDefault()
                        if (value === "Other") navigate("/")
                        handleReportAbuse(location.state.userId, "callPlatform", location.state.reportUid, value)
                    }}>
                        <div>Submit</div>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default OtherAbuseSec