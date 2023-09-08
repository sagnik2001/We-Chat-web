import React from "react";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import { styled } from "@mui/material/styles";
import styles from "./SingleRoom.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../Providers/ContextProvider";



const ReportAbusePage = () => {
    const navigate = useNavigate()
    const BpIcon = styled('span')(({ theme }) => ({
        borderRadius: '50%',
        width: 16,
        height: 16,
        boxShadow:
            theme.palette.mode === 'dark'
                ? '0 0 0 1px rgb(16 22 26 / 40%)'
                : 'inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)',
        backgroundColor: theme.palette.mode === 'dark' ? '#394b59' : '#f5f8fa',
        backgroundImage:
            theme.palette.mode === 'dark'
                ? 'linear-gradient(180deg,hsla(0,0%,100%,.05),hsla(0,0%,100%,0))'
                : 'linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))',
        '.Mui-focusVisible &': {
            outline: '2px auto rgba(19,124,189,.6)',
            outlineOffset: 2,
        },
        'input:hover ~ &': {
            backgroundColor: theme.palette.mode === 'dark' ? '#30404d' : '#ebf1f5',
        },
        'input:disabled ~ &': {
            boxShadow: 'none',
            background:
                theme.palette.mode === 'dark' ? 'rgba(57,75,89,.5)' : 'rgba(206,217,224,.5)',
        },
    }));

    const BpCheckedIcon = styled(BpIcon)({
        backgroundColor: '#137cbd',
        backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))',
        '&:before': {
            display: 'block',
            width: 16,
            height: 16,
            backgroundImage: 'radial-gradient(#fff,#fff 28%,transparent 32%)',
            content: '""',
        },
        'input:hover ~ &': {
            backgroundColor: '#106ba3',
        },
    });

    // Inspired by blueprintjs
    function BpRadio(props) {
        return (
            <Radio
                disableRipple
                color="default"
                checkedIcon={<BpCheckedIcon />}
                icon={<BpIcon />}

                {...props}
            />
        );
    }

    const { handleReportAbuse } = useAuth()

    const [value, setValue] = React.useState('');

    const handleChange = (event) => {
        setValue((event.target).value);

    };

    const [valueother, setValueother] = React.useState('');

    const handleChangeother = (event) => {
        setValueother((event.target).value);

    };

    const location = useLocation()


    return (
        <div className="App">
            <div className="auth-form-container">
                {
                    value === "Other" ? <> <h2>Other Issues</h2>
                        <textarea value={valueother} onChange={handleChangeother} style={{ padding: '10px', marginTop: '10px' }} />
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                            <button className={styles.actionBtn} onClick={(e) => {
                                e.preventDefault()
                                setValue("")
                            }}>
                                <div>Back</div>
                            </button>
                            <button className={styles.actionBtn} onClick={(e) => {
                                e.preventDefault()
                                if (value === "Other") navigate("/")
                                handleReportAbuse(location.state.userId, "callPlatform", location.state.reportUid, valueother)
                            }}>
                                <div>Submit</div>
                            </button>
                        </div>
                    </> : <><FormControl>
                        <RadioGroup
                            aria-labelledby="demo-controlled-radio-buttons-group"
                            name="controlled-radio-buttons-group"
                            value={value}
                            onChange={handleChange}
                        >
                            <FormControlLabel sx={{ '& .MuiFormControlLabel-label': { fontSize: '18px' } }} value="Use abusive language" control={<BpRadio />} label="Use abusive language" />
                            <FormControlLabel sx={{ '& .MuiFormControlLabel-label': { fontSize: '18px' } }} value="Ask contact information" control={<BpRadio />} label="Ask contact information" />
                            <FormControlLabel sx={{ '& .MuiFormControlLabel-label': { fontSize: '18px' } }} value="Try to scam" control={<BpRadio />} label="Try to scam" />
                            <FormControlLabel sx={{ '& .MuiFormControlLabel-label': { fontSize: '18px' } }} value="Other" control={<BpRadio />} label="Other" />
                        </RadioGroup>
                    </FormControl>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                            <button className={styles.actionBtn} onClick={(e) => {
                                e.preventDefault()
                                navigate("/endCall")
                            }}>
                                <div>Cancel</div>
                            </button>
                            <button className={styles.actionBtn} onClick={(e) => {
                                e.preventDefault()

                                handleReportAbuse(location.state.userId, "callPlatform", location.state.reportUid, value)
                            }}>
                                <div>Submit</div>
                            </button>
                        </div>
                    </>
                }

            </div>
        </div>
    )
}

export default ReportAbusePage