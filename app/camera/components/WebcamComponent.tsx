'use client'

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { WebcamComponentProps } from "../types";

export const WebcamComponent = ({ onVideoRef }: WebcamComponentProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [error, setError] = useState<string>("");
  const [isRetrying, setIsRetrying] = useState(false);

  const startWebcam = async () => {
    try {
      setError("");
      setIsRetrying(true);

      // 먼저 미디어 디바이스가 지원되는지 확인
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("이 브라우저는 카메라를 지원하지 않습니다.");
        setIsRetrying(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // 비디오가 재생 가능한 상태가 되면 활성화
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              setIsWebcamActive(true);
              setIsRetrying(false);
              onVideoRef(videoRef.current);
            }).catch((playError) => {
              setError("비디오 재생에 실패했습니다. 페이지를 새로고침해주세요.");
              setIsRetrying(false);
            });
          }
        };
      }
    } catch (err: any) {
      setIsRetrying(false);
      
      // 구체적인 에러 메시지 제공
      if (err.name === 'NotAllowedError') {
        setError("카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.");
      } else if (err.name === 'NotFoundError') {
        setError("카메라를 찾을 수 없습니다. 카메라가 연결되어 있는지 확인해주세요.");
      } else if (err.name === 'NotReadableError') {
        setError("카메라가 다른 앱에서 사용 중입니다. 다른 앱을 종료하고 다시 시도해주세요.");
      } else if (err.name === 'OverconstrainedError') {
        setError("요청한 카메라 설정을 지원하지 않습니다.");
      } else if (err.name === 'SecurityError') {
        setError("보안상의 이유로 카메라에 접근할 수 없습니다. HTTPS 환경에서 시도해주세요.");
      } else {
        setError(`카메라 접근 실패: ${err.message || '알 수 없는 오류'}`);
      }
    }
  };

  useEffect(() => {
    startWebcam();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onVideoRef]);

  const handleRetry = () => {
    startWebcam();
  };

  if (error) {
    return (
      <div className="w-[1225px] aspect-square bg-red-100 border border-red-300 rounded-full flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">{error}</p>
          <div className="space-y-2 text-sm text-red-500 mb-6">
            <p>• 브라우저 주소창의 카메라 아이콘을 클릭하여 권한을 허용해주세요</p>
            <p>• 다른 앱(Zoom, Teams 등)에서 카메라를 사용 중이면 종료해주세요</p>
            <p>• 페이지를 새로고침하거나 브라우저를 재시작해보세요</p>
          </div>
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isRetrying ? "재시도 중..." : "다시 시도"}
          </button>
        </div>
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
          {isRetrying ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-600 mb-4"></div>
              <p className="text-gray-600">카메라 연결 중...</p>
            </div>
          ) : (
            <Image
              src="/camera.png"
              alt="camera"
              width={457}
              height={353}
              className="object-contain"
            />
          )}
        </div>
      )}
    </div>
  );
}; 