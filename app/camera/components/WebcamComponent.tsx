'use client'

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { WebcamComponentProps } from "../types";

export const WebcamComponent = ({ onVideoRef }: WebcamComponentProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user"
          },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsWebcamActive(true);
          onVideoRef(videoRef.current);
        }
      } catch (err) {
        setError("웹캠에 접근할 수 없습니다. 권한을 확인해주세요.");
      }
    };

    startWebcam();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onVideoRef]);

  if (error) {
    return (
      <div className="w-[1225px] aspect-square bg-red-100 border border-red-300 rounded-full flex items-center justify-center">
        <p className="text-red-600 text-2xl text-center p-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-[1225px] aspect-square bg-black rounded-full overflow-hidden shadow-lg border-4 border-gray-300">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover transform scale-x-[-1]"
      />
      {!isWebcamActive && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full" style={{ backgroundColor: '#D9D9D9' }}>
          <Image
            src="/camera.png"
            alt="camera"
            width={457}
            height={353}
            className="object-contain"
          />
        </div>
      )}
    </div>
  );
}; 