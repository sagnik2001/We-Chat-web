import React, { useEffect, useRef } from 'react';

const AudioVisualiser = ({ audioData }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const height = canvas.height;
    const width = canvas.width;
    const context = canvas.getContext('2d');
    let x = 0;
    const sliceWidth = (width * 1.0) / audioData.length;

    context.lineWidth = 2;
    context.strokeStyle = '#6BFBCE';
    context.clearRect(0, 0, width, height);

    context.beginPath();
    context.moveTo(0, height / 2);
    for (const item of audioData) {
      const y = (item / 255.0) * height;
      context.lineTo(x, y);
      x += sliceWidth;
    }
    context.lineTo(x, height / 2);
    context.stroke();
  }, [audioData]);

  return <canvas width="25" height="25" ref={canvasRef} />;
};

export default AudioVisualiser;
