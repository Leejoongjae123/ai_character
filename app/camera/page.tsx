'use client'
import { Suspense, use, useRef, useEffect, useState } from "react";
import Loading from "@/app/loading";
import Lottie from "lottie-react";
import loaderAnimation from "@/public/loader.json";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useButtonSound } from "@/app/components/ButtonSound";
import { toast } from "sonner";
import { capturePhotoFromVideo, generatePhotoFileName, blobToDataURL } from "@/utils/camera";
import { requestFaceSwap, pollJobStatus } from "@/utils/faceSwap";
import { WebcamComponent } from "./components/WebcamComponent";
import { CameraCorners } from "./components/CameraCorners";
import { ProcessingStatus } from "./components/ProcessingStatus";
import { PageProps, CameraPageContentProps, CameraClientProps } from "./types";

export default function Page({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<Loading />}>
      <CameraPageContent searchParams={searchParams} />
    </Suspense>
  );
}

function CameraPageContent({ searchParams }: CameraPageContentProps) {
  const resolvedSearchParams = use(searchParams);
  const characterId = resolvedSearchParams.character;

  return <CameraClient characterId={characterId} />;
}

function CameraClient({ characterId }: CameraClientProps) {
  const router = useRouter();
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(1);
  const [showWhiteCircle, setShowWhiteCircle] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showLottieLoader, setShowLottieLoader] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("이미지 생성중...");
  const { playSound } = useButtonSound();
  const flashSoundRef = useRef<HTMLAudioElement | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  // 컴포넌트 마운트 시 오디오 객체 생성
  useEffect(() => {
    flashSoundRef.current = new Audio("/flash.wav");
    flashSoundRef.current.load();
    
    return () => {
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

  const processWithFaceSwap = async (uploadedPhotoUrl: string) => {
    if (!characterId) {
      toast("캐릭터 정보가 없습니다", {
        description: "캐릭터를 선택해주세요.",
      });
      return;
    }

    try {
      setShowLottieLoader(true);
      setProcessingMessage("얼굴 스왑 요청중...");

      // 1. 얼굴 스왑 요청
      const faceSwapResult = await requestFaceSwap(uploadedPhotoUrl, characterId);
      
      if (!faceSwapResult.success || !faceSwapResult.jobId) {
        toast("얼굴 스왑 요청 실패", {
          description: faceSwapResult.error || "얼굴 스왑 요청에 실패했습니다.",
        });
        setShowLottieLoader(false);
        return;
      }

      setProcessingMessage("이미지 생성중...");

      // 2. 작업 상태 폴링
      const finalResult = await pollJobStatus(
        faceSwapResult.jobId,
        (status) => {
          // 진행 상황 업데이트
          if (status.status === 'processing') {
            setProcessingMessage("이미지 생성중...");
          }
        }
      );

      if (finalResult.image_url) {
        // 3. 완료 페이지로 이동
        router.push(`/complete?character=${characterId}&resultImage=${encodeURIComponent(finalResult.image_url)}`);
      } else {
        toast("이미지 생성 실패", {
          description: "이미지 생성에 실패했습니다.",
        });
        setShowLottieLoader(false);
      }
    } catch (error) {
      toast("처리 중 오류 발생", {
        description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      });
      setShowLottieLoader(false);
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
      
      if (uploadResult && uploadResult.publicUrl) {
        setIsUploading(false);
        
        // 얼굴 스왑 처리 시작
        await processWithFaceSwap(uploadResult.publicUrl);
      } else {
        toast("사진 업로드 실패", {
          description: "사진 업로드에 실패했습니다.",
        });
        setIsUploading(false);
      }
    } catch (error) {
      toast("사진 촬영 실패", {
        description: "사진 촬영 중 오류가 발생했습니다.",
      });
      setIsUploading(false);
    }
  };

  const handleTransform = () => {
    playSound();
    
    // 플래시 음향 재생
    if (flashSoundRef.current) {
      flashSoundRef.current.currentTime = 0;
      const playPromise = flashSoundRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // 오디오 재생 성공
          })
          .catch(() => {
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
        }, 1000);
        
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
        {showWhiteCircle && !capturedPhoto && !showLottieLoader && (
          <div className="absolute inset-0 bg-white rounded-full z-40 animate-pulse"></div>
        )}

        {/* Lottie 로딩 애니메이션 */}
        {showLottieLoader && (
          <div className="absolute inset-0 z-50 rounded-full overflow-hidden flex items-center justify-center">
            <div className="w-full h-full">
              <Lottie 
                animationData={loaderAnimation} 
                loop={true}
                autoplay={true}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>
        )}

        {/* 촬영된 사진 미리보기 */}
        {capturedPhoto && !showLottieLoader && (
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
        {!capturedPhoto && !showLottieLoader && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <WebcamComponent onVideoRef={handleVideoRef} />
          </div>
        )}

        {/* 카운트다운 */}
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          {isCountingDown && countdown > 0 && countdown <= 3 && !showWhiteCircle && !showLottieLoader && (
            <div className="text-[400px] font-bold text-white z-40 animate-pulse drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
              {countdown}
            </div>
          )}
        </div>

        {/* 처리 상태 표시 */}
        <ProcessingStatus 
          isUploading={isUploading}
          showLottieLoader={showLottieLoader}
          processingMessage={processingMessage}
        />

        {/* 카메라 모서리 꺾쇠 */}
        <CameraCorners />
      </div>

      <div className="flex flex-col items-center justify-center z-30 border-[25px] border-[#D3B582] rounded-[60px] w-[1666px] h-[390px] mt-[100px] animate-fade-in-up">
        {showLottieLoader ? (
          <div className="text-[120px] font-bold text-center text-[#481F0E]">
            {processingMessage}
          </div>
        ) : (
          <>
            <div className="text-[79px] font-bold text-center text-[#481F0E]">
              정면을 바라보고 얼굴이 전체가
            </div>
            <div className="text-[79px] font-bold text-center text-[#481F0E]">
              잘 보이도록 촬영해주세요
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-center z-30 flex-row mb-[358px] animate-fade-in-up">
        <Button
          onClick={handleTransform}
          disabled={isCountingDown || showWhiteCircle || isUploading || showLottieLoader}
          className={`w-[1523px] h-[281px] text-[128px] font-bold z-20 rounded-[60px] border-4 border-[#471F0D] transition-all duration-200 hover:scale-101 active:scale-99 ${
            isCountingDown || showWhiteCircle || isUploading || showLottieLoader
              ? "text-[#8B7355] bg-[#A8956B] cursor-not-allowed opacity-50"
              : "text-[#451F0D] bg-[#E4BE50] hover:bg-[#E4BE50]/90 cursor-pointer"
          }`}
        >
          {isUploading ? "저장 중..." : showLottieLoader ? "변신 중..." : "수군으로 변신하기"}
        </Button>
      </div>
    </div>
  );
}
