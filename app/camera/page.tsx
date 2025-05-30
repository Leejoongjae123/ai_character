'use client'
import { Suspense, use } from "react";
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
import { useState, useEffect, useRef } from "react";
import { useButtonSound } from "@/app/components/ButtonSound";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";

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

function CameraClient({ characterId }: CameraClientProps) {
  const router = useRouter();
  const [isMicActive, setIsMicActive] = useState(false);
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(1);
  const [showWhiteCircle, setShowWhiteCircle] = useState(false);
  const { playSound } = useButtonSound();
  const flashSoundRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  // 카메라 디바이스 정보를 위한 상태 추가
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCamera, setCurrentCamera] = useState<MediaDeviceInfo | null>(null);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  
  // 타이밍 조절을 위한 상태 추가
  const [countdownDelay, setCountdownDelay] = useState(300); // 카운트다운 시작 지연 시간 (밀리초)
  const [countdownInterval, setCountdownInterval] = useState(1000); // 카운트다운 숫자 간격 (밀리초)
  const [whiteCircleDelay, setWhiteCircleDelay] = useState(2000); // 하얀 원 표시 후 다음 페이지 이동 지연 (밀리초)
  const [showSettings, setShowSettings] = useState(false); // 설정 UI 표시 여부

  // 사용 가능한 카메라 디바이스 목록 가져오기
  const getCameraDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(videoDevices);
      
      if (videoDevices.length === 0) {
        setCameraError('사용 가능한 카메라가 없습니다.');
        toast("카메라 없음", {
          description: "연결된 카메라를 찾을 수 없습니다.",
          action: {
            label: "확인",
            onClick: () => {}
          }
        });
      }
      
      return videoDevices;
    } catch (error) {
      setCameraError('카메라 디바이스 목록을 가져올 수 없습니다.');
      toast("디바이스 오류", {
        description: "카메라 디바이스 정보를 가져올 수 없습니다.",
        action: {
          label: "확인",
          onClick: () => {}
        }
      });
      return [];
    }
  };

  // 카메라 스트림 시작
  const startCamera = async (deviceId?: string) => {
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      // 특정 디바이스 ID가 지정된 경우
      if (deviceId) {
        constraints.video = {
          deviceId: { exact: deviceId },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        };
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      
      // 현재 사용 중인 카메라 정보 업데이트
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        const currentDevice = availableCameras.find(device => device.deviceId === settings.deviceId);
        setCurrentCamera(currentDevice || null);
        setSelectedCameraId(settings.deviceId || '');
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setCameraError(null);
    } catch (error) {
      setCameraError('카메라에 접근할 수 없습니다. 카메라 권한을 확인해주세요.');
      toast("카메라 오류", {
        description: "카메라에 접근할 수 없습니다. 권한을 확인해주세요.",
        action: {
          label: "확인",
          onClick: () => {}
        }
      });
    }
  };

  // 카메라 변경
  const changeCamera = async (deviceId: string) => {
    stopCamera();
    await startCamera(deviceId);
  };

  // 카메라 스트림 정리
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  // 컴포넌트 마운트 시 오디오 객체 생성 및 카메라 시작
  useEffect(() => {
    // 오디오 객체를 미리 생성하고 로드
    flashSoundRef.current = new Audio("/flash.wav");
    flashSoundRef.current.load(); // 명시적으로 로드
    
    // 카메라 디바이스 목록 가져오기 및 카메라 시작
    const initCamera = async () => {
      const devices = await getCameraDevices();
      if (devices.length > 0) {
        await startCamera();
      }
    };
    
    initCamera();
    
    // 개발 모드에서 설정 UI 표시를 위한 키보드 이벤트 리스너 추가
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        setShowSettings(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      if (flashSoundRef.current) {
        flashSoundRef.current.pause();
        flashSoundRef.current = null;
      }
      stopCamera();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleTransform = () => {
    playSound(); // 버튼 클릭 효과음
    
    // flash.wav 재생
    if (flashSoundRef.current) {
      flashSoundRef.current.currentTime = 0;
      const playPromise = flashSoundRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // 오디오 재생 성공 - 콘솔 대신 toast 사용
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
    
    // countdownDelay 시간 후에 카운트다운 시작
    setTimeout(() => {
      setIsCountingDown(true);
      setCountdown(1);
    }, countdownDelay);
  };

  useEffect(() => {
    if (isCountingDown && countdown < 3) {
      const timer = setTimeout(() => {
        setCountdown(countdown + 1);
      }, countdownInterval);
      return () => clearTimeout(timer);
    } else if (isCountingDown && countdown === 3) {
      setShowWhiteCircle(true);
      setTimeout(() => {
        router.push(`/complete?character=${characterId}`);
      }, whiteCircleDelay);
    }
  }, [isCountingDown, countdown, router, countdownInterval, whiteCircleDelay, characterId]);

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
        {/* 회색 원 또는 하얀 원 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-full h-full rounded-full transition-colors duration-1000 ${showWhiteCircle ? 'bg-white' : 'bg-[#D9D9D9]'}`}></div>
        </div>

        {/* 카메라 영상 */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full">
          {cameraStream && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover z-5"
            />
          )}
          {cameraError && (
            <div className="text-red-500 text-center p-4 bg-white/80 rounded-lg">
              {cameraError}
            </div>
          )}
        </div>

        {/* 기존 카메라 이미지 (10% 투명도) 또는 카운트다운 */}
        <div className="absolute inset-0 flex items-center justify-center">
          {!isCountingDown && !showWhiteCircle && (
            <div className="animate-fade-in">
              <Image
                src="/camera.png"
                alt="camera"
                width={441}
                height={337}
                className="z-10 opacity-10"
                unoptimized
              />
            </div>
          )}

          {isCountingDown && countdown > 0 && (
            <div className="text-[400px] font-bold text-white z-10 animate-pulse">
              {countdown}
            </div>
          )}
        </div>

        {/* 사각형 귀퉁이 꺾쇠 표시 */}
        {/* 왼쪽 위 */}
        <div className="absolute top-0 left-0 w-[200px] h-[200px]">
          <div className="absolute top-0 left-0 w-[200px] h-[10px] bg-[#B8B8B8]"></div>
          <div className="absolute top-0 left-0 w-[10px] h-[200px] bg-[#B8B8B8]"></div>
        </div>

        {/* 오른쪽 위 */}
        <div className="absolute top-0 right-0 w-[200px] h-[200px]">
          <div className="absolute top-0 right-0 w-[200px] h-[10px] bg-[#B8B8B8]"></div>
          <div className="absolute top-0 right-0 w-[10px] h-[200px] bg-[#B8B8B8]"></div>
        </div>

        {/* 왼쪽 아래 */}
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px]">
          <div className="absolute bottom-0 left-0 w-[200px] h-[10px] bg-[#B8B8B8]"></div>
          <div className="absolute bottom-0 left-0 w-[10px] h-[200px] bg-[#B8B8B8]"></div>
        </div>

        {/* 오른쪽 아래 */}
        <div className="absolute bottom-0 right-0 w-[200px] h-[200px]">
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

      {/* 카운트다운 싱크 조정을 위한 설정 UI - Ctrl+Shift+S로 토글 */}
      {showSettings && (
        <div className="fixed top-4 right-4 bg-white/90 p-6 rounded-lg shadow-lg z-50 text-black w-[500px] backdrop-blur-sm max-h-[80vh] overflow-y-auto">
          <h3 className="text-lg font-bold mb-4">카메라 및 타이밍 설정</h3>
          
          <div className="space-y-6">
            {/* 카메라 정보 섹션 */}
            <div className="space-y-3 border-b pb-4">
              <h4 className="font-semibold text-blue-600">카메라 정보</h4>
              
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">현재 카메라:</span>
                  <div className="mt-1 p-2 bg-gray-100 rounded text-xs">
                    {currentCamera ? (
                      <>
                        <div><strong>이름:</strong> {currentCamera.label || '알 수 없는 카메라'}</div>
                        <div><strong>ID:</strong> {currentCamera.deviceId}</div>
                      </>
                    ) : (
                      '카메라가 연결되지 않음'
                    )}
                  </div>
                </div>
                
                <div className="text-sm">
                  <span className="font-medium">사용 가능한 카메라 ({availableCameras.length}개):</span>
                  <div className="mt-1 space-y-1">
                    {availableCameras.map((camera, index) => (
                      <div key={camera.deviceId} className="flex items-center space-x-2">
                        <button
                          onClick={() => changeCamera(camera.deviceId)}
                          className={`flex-1 p-2 text-left text-xs rounded border ${
                            selectedCameraId === camera.deviceId 
                              ? 'bg-blue-100 border-blue-300' 
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <div><strong>{index + 1}.</strong> {camera.label || `카메라 ${index + 1}`}</div>
                          <div className="text-gray-500 truncate">{camera.deviceId}</div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={getCameraDevices}
                  className="w-full p-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                >
                  카메라 목록 새로고침
                </button>
              </div>
            </div>
            
            {/* 타이밍 설정 섹션 */}
            <div className="space-y-4">
              <h4 className="font-semibold text-green-600">타이밍 설정</h4>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="font-medium">카운트다운 시작 지연 ({countdownDelay}ms)</label>
                </div>
                <Slider 
                  value={[countdownDelay]} 
                  min={0} 
                  max={2000} 
                  step={50}
                  onValueChange={(value: number[]) => setCountdownDelay(value[0])} 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="font-medium">카운트다운 간격 ({countdownInterval}ms)</label>
                </div>
                <Slider 
                  value={[countdownInterval]} 
                  min={500} 
                  max={2000} 
                  step={50}
                  onValueChange={(value: number[]) => setCountdownInterval(value[0])} 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="font-medium">페이지 이동 지연 ({whiteCircleDelay}ms)</label>
                </div>
                <Slider 
                  value={[whiteCircleDelay]} 
                  min={500} 
                  max={5000} 
                  step={100}
                  onValueChange={(value: number[]) => setWhiteCircleDelay(value[0])} 
                />
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            Ctrl+Shift+S로 이 설정창을 숨길 수 있습니다
          </div>
        </div>
      )}

      <div className="flex items-center justify-center z-30 flex-row mb-[358px] animate-fade-in-up">
        <Button
          onClick={handleTransform}
          disabled={isCountingDown || showWhiteCircle}
          className={`w-[1523px] h-[281px] text-[128px] font-bold z-20 rounded-[60px] border-4 border-[#471F0D] transition-all duration-200 hover:scale-101 active:scale-99 ${
            isCountingDown || showWhiteCircle
              ? "text-[#8B7355] bg-[#A8956B] cursor-not-allowed opacity-50"
              : "text-[#451F0D] bg-[#E4BE50] hover:bg-[#E4BE50]/90 cursor-pointer"
          }`}
        >
          수군으로 변신하기
        </Button>
      </div>
    </div>
  );
}
