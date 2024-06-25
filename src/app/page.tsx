"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 1280,
  height: 720,
};

const WebcamCapture = () => {
  const webcamRef = useRef<any>(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const mediaRecorderRef = useRef<any>(null);

  const [deviceId, setDeviceId] = useState({});
  const [devices, setDevices] = useState([]);

  const handleDevices = useCallback(
    (mediaDevices) =>
      setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput")),
    [setDevices]
  );

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  const handleStartCaptureClick = useCallback(() => {
    setCapturing(true);
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: "video/webm",
    });
    mediaRecorderRef.current.addEventListener(
      "dataavailable",
      handleDataAvailable
    );
    mediaRecorderRef.current.start();
  }, [webcamRef, setCapturing, mediaRecorderRef]);

  const handleDataAvailable = useCallback(
    ({ data }: any) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  const handleStopCaptureClick = useCallback(() => {
    mediaRecorderRef.current.stop();
    setCapturing(false);
  }, [mediaRecorderRef, webcamRef, setCapturing]);

  const handleDownload = useCallback(() => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      a.href = url;
      a.download = "react-webcam-stream-capture.webm";
      a.click();
      window.URL.revokeObjectURL(url);
      setRecordedChunks([]);
    }
  }, [recordedChunks]);

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-black w-full p-20 md:p-0">
      <div>
        <Webcam
          ref={webcamRef}
          audio={false}
          height={360}
          screenshotFormat="image/jpeg"
          width={720}
          videoConstraints={{
            ...videoConstraints,
            facingMode,
          }}
        />
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full flex">
          <div
            onClick={() => {
              const imageSrc = webcamRef.current.getScreenshot();
              setImageSrc(imageSrc);
            }}
          >
            Capture photo
          </div>
        </button>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded-full"
          onClick={() => {
            setFacingMode(facingMode === "user" ? "environment" : "user");
          }}
        >
          Change Camera
        </button>
        {capturing ? (
          <button
            onClick={handleStopCaptureClick}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full flex"
          >
            Stop Capture
          </button>
        ) : (
          <div>
            <button
              onClick={handleStartCaptureClick}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full flex"
            >
              Start Capture
            </button>
            {imageSrc && (
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full flex"
                onClick={() => {
                  setImageSrc(null);
                }}
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {imageSrc && <img src={imageSrc} alt="captured" />}

      <div className="flex">
        {recordedChunks.length > 0 && (
          <video
            controls
            style={{
              marginTop: 20,
              width: 720,
              height: 360,
            }}
          >
            <source
              src={URL.createObjectURL(
                new Blob(recordedChunks, { type: "video/webm" })
              )}
              type="video/webm"
            />
          </video>
        )}

        {recordedChunks.length > 0 && (
          <div className="">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full flex"
              onClick={handleDownload}
            >
              Download
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full flex"
              onClick={() => {
                setRecordedChunks([]);
              }}
            >
              Clear
            </button>
          </div>
        )}
      </div>
      <div className="text-white">
        {/* {devices.map((device, key) => (
          <div>{device.label || `Device ${key + 1}`}</div>
        ))} */}
        <select
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        >
          {devices.map((device, key) => (
            <option key={key} value={device.deviceId}>
              {device.label || `Device ${key + 1}`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default WebcamCapture;
