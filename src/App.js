// src/App.js
import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import "./App.css"

const App = () => {
  const videoRef = useRef(null); 
  const [mediaRecorder, setMediaRecorder] = useState(null); 
  const [isRecording, setIsRecording] = useState(false); 
  const [chunks, setChunks] = useState([]); 
  const [recordingDuration, setRecordingDuration] = useState(0); // for track the recording duration
  const [intervalId, setIntervalId] = useState(null);

  
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
      setRecordingDuration(0);
      mediaRecorder.start(); 

       // Start the timer to update recording duration every second
      const newIntervalId = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      setIntervalId(newIntervalId);

      mediaRecorder.ondataavailable = (event) => {
        setChunks((prevChunks) => [...prevChunks, event.data]); 
      };
    }
  };

 
  const handleStopCapture = () => {
    if (mediaRecorder) {
      setIsRecording(false); 
      clearInterval(intervalId);
      setIntervalId(null);
      mediaRecorder.stop(); 
      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: 'video/webm' }); 
        const formData = new FormData(); 
        formData.append('video', videoBlob);

        axios.post('https://api.jrlabs.co/saveVideo', formData)
          .then((response) => {
            if (response.data.success) {
              toast.success('Upload successful: ' + response.data.message);
            } else {
              toast.error('Upload failed'); 
            }
          })
          .catch((error) => {
            toast.error('Upload error: ' + error.message); 
          });
      };
      setChunks([]);
    }
  };

  return (
    <div className="app-container">
      <h1>WebRTC Video </h1>
      <video ref={videoRef} autoPlay className="centered-video"></video>
      <div className="button-container"> 
        <button onClick={handleStartCapture} disabled={isRecording} className="start-button">Start Capture</button>
        <button onClick={handleStopCapture} disabled={!isRecording} className="stop-button">Stop Capture</button>
      </div>
      <p>Recording Duration: {recordingDuration} seconds</p>
      <ToastContainer />
    </div>
  );
};

export default App;
