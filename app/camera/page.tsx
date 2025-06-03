'use client'
import { Suspense, use, useRef, useEffect, useState } from "react";
import Loading from "@/app/loading";

interface PageProps {
  searchParams: Promise<{ character?: string }>;
}

export default function Page({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<Loading />}>
      <CameraPageContent searchParams={searchParams} />
    </Suspense>
  );
}

// 클라이언트 컴포넌트 분리

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useButtonSound } from "@/app/components/ButtonSound";
import { toast } from "sonner";
import { capturePhotoFromVideo, generatePhotoFileName, blobToDataURL } from "@/utils/camera";

interface CameraPageContentProps {
  searchParams: Promise<{ character?: string }>;
}

function CameraPageContent({ searchParams }: CameraPageContentProps) {
  const resolvedSearchParams = use(searchParams);
  const characterId = resolvedSearchParams.character;

  return <CameraClient characterId={characterId} />;
}

interface CameraClientProps {
  characterId?: string;
}

// 웹캠 컴포넌트
interface WebcamComponentProps {
  onVideoRef: (ref: HTMLVideoElement | null) => void;
}

const WebcamComponent = ({ onVideoRef }: WebcamComponentProps) => {
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

function CameraClient({ characterId }: CameraClientProps) {
  const router = useRouter();
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(1);
  const [showWhiteCircle, setShowWhiteCircle] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { playSound } = useButtonSound();
  const flashSoundRef = useRef<HTMLAudioElement | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  // 컴포넌트 마운트 시 오디오 객체 생성
  useEffect(() => {
    // 오디오 객체를 미리 생성하고 로드
    flashSoundRef.current = new Audio("/flash.wav");
    flashSoundRef.current.load(); // 명시적으로 로드
    
    return () => {
      // 오디오 정리
      if (flashSoundRef.current) {
        flashSoundRef.current.pause();
        flashSoundRef.current = null;
      }
    };
  }, []);

  const handleVideoRef = (ref: HTMLVideoElement | null) => {
    videoElementRef.current = ref;
  };

  const uploadPhotoToSupabase = async (photoBlob: Blob, fileName: string) => {
    try {
      const formData = new FormData();
      formData.append('file', photoBlob, fileName);
      formData.append('fileName', fileName);

      const response = await fetch('/api/upload-photo', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {

        return null;
      }

      return result;
    } catch (error) {

      return null;
    }
  };

  const captureAndUploadPhoto = async () => {
    if (!videoElementRef.current) {

      return;
    }

    try {
      setIsUploading(true);
      
      // 사진 캡처
      const photoBlob = await capturePhotoFromVideo(videoElementRef.current);
      
      // 미리보기용 Data URL 생성
      const photoDataURL = await blobToDataURL(photoBlob);
      setCapturedPhoto(photoDataURL);

      // 파일명 생성
      const fileName = generatePhotoFileName();
      
      // Supabase에 업로드
      const uploadResult = await uploadPhotoToSupabase(photoBlob, fileName);
      
      if (uploadResult) {
        
        // 2초 후 완료 페이지로 이동
        setTimeout(() => {
          router.push(`/complete?character=${characterId}&photo=${uploadResult.fileName}`);
        }, 2000);
      }
    } catch (error) {

    } finally {
      setIsUploading(false);
    }
  };

  const handleTransform = () => {
    playSound(); // 버튼 클릭 효과음
    
    // flash.wav 재생
    if (flashSoundRef.current) {
      flashSoundRef.current.currentTime = 0;
      const playPromise = flashSoundRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // 오디오 재생 성공
          })
          .catch(() => {
            // 오디오 재생 실패 시 토스트 메시지로 알림
            toast("오디오 재생 실패", {
              description: "오디오 파일을 재생할 수 없습니다",
              action: {
                label: "확인",
                onClick: () => {}
              }
            });
          });
      }
    }
    
    // 300ms 후에 카운트다운 시작
    setTimeout(() => {
      setIsCountingDown(true);
      setCountdown(1);
    }, 300);
  };

  useEffect(() => {
    if (isCountingDown && countdown <= 3) {
      if (countdown < 3) {
        const timer = setTimeout(() => {
          setCountdown(countdown + 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else if (countdown === 3) {
        // 카운트다운 3을 충분히 보여준 후 플래시 효과 시작
        const timer = setTimeout(() => {
          setShowWhiteCircle(true);
          
          // 플래시 효과 후 사진 촬영
          setTimeout(() => {
            captureAndUploadPhoto();
          }, 200);
        }, 1000); // 3을 1초간 보여준 후 플래시 시작
        
        return () => clearTimeout(timer);
      }
    }
  }, [isCountingDown, countdown]);

  return (
    <div className="w-full h-screen relative flex flex-col items-center justify-between">
      <Image
        src="/bg2.webp"
        alt="background"
        fill
        className="object-cover z-0"
        priority
        unoptimized
      />

      <div className="flex flex-col items-center justify-center z-30 mt-[300px] animate-fade-in">
        <div
          className="text-[260px] font-bold text-center text-[#481F0E]"
          style={{ fontFamily: "MuseumClassic, serif" }}
        >
          사진 촬영
        </div>
      </div>

      <div className="relative w-[1225px] aspect-square animate-fade-in-delay">
        {/* 하얀 원 (플래시 효과) */}
        {showWhiteCircle && !capturedPhoto && (
          <div className="absolute inset-0 bg-white rounded-full z-40 animate-pulse"></div>
        )}

        {/* 촬영된 사진 미리보기 */}
        {capturedPhoto && (
          <div className="absolute inset-0 z-40 rounded-full overflow-hidden">
            <Image
              src={capturedPhoto}
              alt="촬영된 사진"
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* 웹캠 컴포넌트 */}
        {!capturedPhoto && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <WebcamComponent onVideoRef={handleVideoRef} />
          </div>
        )}

        {/* 카운트다운 */}
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          {isCountingDown && countdown > 0 && countdown <= 3 && !showWhiteCircle && (
            <div className="text-[400px] font-bold text-white z-40 animate-pulse drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
              {countdown}
            </div>
          )}
        </div>

        {/* 업로딩 표시 */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center z-50">
            <div className="text-[80px] font-bold text-white px-8 py-4 rounded-lg text-[#481F0E]">
              저장 중...
            </div>
          </div>
        )}

        {/* 사각형 귀퉁이 꺾쇠 표시 */}
        {/* 왼쪽 위 */}
        <div className="absolute top-0 left-0 w-[200px] h-[200px] z-50">
          <div className="absolute top-0 left-0 w-[200px] h-[10px] bg-[#B8B8B8]"></div>
          <div className="absolute top-0 left-0 w-[10px] h-[200px] bg-[#B8B8B8]"></div>
        </div>

        {/* 오른쪽 위 */}
        <div className="absolute top-0 right-0 w-[200px] h-[200px] z-50">
          <div className="absolute top-0 right-0 w-[200px] h-[10px] bg-[#B8B8B8]"></div>
          <div className="absolute top-0 right-0 w-[10px] h-[200px] bg-[#B8B8B8]"></div>
        </div>

        {/* 왼쪽 아래 */}
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] z-50">
          <div className="absolute bottom-0 left-0 w-[200px] h-[10px] bg-[#B8B8B8]"></div>
          <div className="absolute bottom-0 left-0 w-[10px] h-[200px] bg-[#B8B8B8]"></div>
        </div>

        {/* 오른쪽 아래 */}
        <div className="absolute bottom-0 right-0 w-[200px] h-[200px] z-50">
          <div className="absolute bottom-0 right-0 w-[200px] h-[10px] bg-[#B8B8B8]"></div>
          <div className="absolute bottom-0 right-0 w-[10px] h-[200px] bg-[#B8B8B8]"></div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center z-30 border-[25px] border-[#D3B582] rounded-[60px] w-[1666px] h-[390px] mt-[100px] animate-fade-in-up">
        <div className="text-[79px] font-bold text-center text-[#481F0E]">
          정면을 바라보고 얼굴이 전체가
        </div>
        <div className="text-[79px] font-bold text-center text-[#481F0E]">
          잘 보이도록 촬영해주세요
        </div>
      </div>

      <div className="flex items-center justify-center z-30 flex-row mb-[358px] animate-fade-in-up">
        <Button
          onClick={handleTransform}
          disabled={isCountingDown || showWhiteCircle || isUploading}
          className={`w-[1523px] h-[281px] text-[128px] font-bold z-20 rounded-[60px] border-4 border-[#471F0D] transition-all duration-200 hover:scale-101 active:scale-99 ${
            isCountingDown || showWhiteCircle || isUploading
              ? "text-[#8B7355] bg-[#A8956B] cursor-not-allowed opacity-50"
              : "text-[#451F0D] bg-[#E4BE50] hover:bg-[#E4BE50]/90 cursor-pointer"
          }`}
        >
          {isUploading ? "저장 중..." : "수군으로 변신하기"}
        </Button>
      </div>
    </div>
  );
}
