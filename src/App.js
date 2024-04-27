// src/App.js
import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const videoRef = useRef(null); 
  const [mediaRecorder, setMediaRecorder] = useState(null); 
  const [isRecording, setIsRecording] = useState(false); 
  const [chunks, setChunks] = useState([]); 

  
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        setMediaRecorder(new MediaRecorder(stream));
      })
      .catch((err) => console.error('Error accessing camera:', err));
  }, []);

  
  const handleStartCapture = () => {
    if (mediaRecorder) {
      setIsRecording(true); 
      mediaRecorder.start(); 
      mediaRecorder.ondataavailable = (event) => {
        setChunks((prevChunks) => [...prevChunks, event.data]); 
      };
    }
  };

 
  const handleStopCapture = () => {
    if (mediaRecorder) {
      setIsRecording(false); 
      mediaRecorder.stop(); 
      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: 'video/webm' }); 
        const formData = new FormData(); 
        formData.append('video', videoBlob);

        axios.post('https://api.jrlabs.co/saveVideo', formData)
          .then((response) => {
            if (response.data.success) {
              console.log('Upload successful:', response.data.message);
            } else {
              console.error('Upload failed');
            }
          })
          .catch((error) => console.error('Upload error:', error));
      };
      setChunks([]);
    }
  };

  return (
    <div>
      <h1>WebRTC Video Capture</h1>
      <video ref={videoRef} autoPlay></video> {/* Display live video */}
      <div>
        <button onClick={handleStartCapture} disabled={isRecording}>Start Capture</button>
        <button onClick={handleStopCapture} disabled={!isRecording}>Stop Capture</button>
      </div>
    </div>
  );
};

export default App;
