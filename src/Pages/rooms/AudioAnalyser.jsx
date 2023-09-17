import React, { useState, useEffect, useRef } from 'react';
import AudioVisualiser from './AudioVisualizer';

const AudioAnalyser = (props) => {
  const [audioData, setAudioData] = useState(new Uint8Array(0));
  const audioContext = useRef(null);
  const analyser = useRef(null);
  const dataArray = useRef(new Uint8Array(0));
  const source = useRef(null);
  const rafId = useRef(null);

  const tick = () => {
    analyser.current.getByteTimeDomainData(dataArray.current);
    setAudioData([...dataArray.current]);
    rafId.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    analyser.current = audioContext.current.createAnalyser();
    dataArray.current = new Uint8Array(analyser.current.frequencyBinCount);
    source.current = audioContext.current.createMediaStreamSource(props.audio);
    source.current.connect(analyser.current);
    rafId.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId.current);
      analyser.current.disconnect();
      source.current.disconnect();
    };
  }, [props.audio]);

  return <AudioVisualiser audioData={audioData} />;
};

export default AudioAnalyser;
