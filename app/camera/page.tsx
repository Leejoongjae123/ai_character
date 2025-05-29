'use client'
import { Suspense } from "react";
import Loading from "@/app/loading";

interface PageProps {
  searchParams: { character?: string };
}

export default function Page({ searchParams }: PageProps) {
  const characterId = searchParams.character;

  return (
    <Suspense fallback={<Loading />}>
      <CameraClient characterId={characterId} />
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
  
  // 타이밍 조절을 위한 상태 추가
  const [countdownDelay, setCountdownDelay] = useState(300); // 카운트다운 시작 지연 시간 (밀리초)
  const [countdownInterval, setCountdownInterval] = useState(1000); // 카운트다운 숫자 간격 (밀리초)
  const [whiteCircleDelay, setWhiteCircleDelay] = useState(2000); // 하얀 원 표시 후 다음 페이지 이동 지연 (밀리초)
  const [showSettings, setShowSettings] = useState(false); // 설정 UI 표시 여부

  // 컴포넌트 마운트 시 오디오 객체 생성
  useEffect(() => {
    // 오디오 객체를 미리 생성하고 로드
    flashSoundRef.current = new Audio("/flash.wav");
    flashSoundRef.current.load(); // 명시적으로 로드
    
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
            // 오디오 재생 성공
            console.log("플래시 효과음 재생 성공");
          })
          .catch(err => {
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

      <div className="flex flex-col items-center justify-center z-30 mt-[300px]">
        <div
          className="text-[260px] font-bold text-center text-[#481F0E]"
          style={{ fontFamily: "MuseumClassic, serif" }}
        >
          사진 촬영
        </div>
      </div>

      <div className="relative w-[1225px] aspect-square">
        {/* 회색 원 또는 하얀 원 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-full h-full rounded-full transition-colors duration-1000 ${showWhiteCircle ? 'bg-white' : 'bg-[#D9D9D9]'}`}></div>
        </div>

        {/* 카메라 이미지 또는 카운트다운 */}
        <div className="absolute inset-0 flex items-center justify-center">
          {!isCountingDown && !showWhiteCircle && (
            <div className="animate-fade-in">
              <Image
                src="/camera.png"
                alt="camera"
                width={441}
                height={337}
                className="z-10"
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

      <div className="flex flex-col items-center justify-center z-30 border-[25px] border-[#D3B582] rounded-[60px] w-[1666px] h-[390px] mt-[100px]">
        <div className="text-[79px] font-bold text-center text-[#481F0E]">
          정면을 바라보고 얼굴굴 전체가
        </div>
        <div className="text-[79px] font-bold text-center text-[#481F0E]">
          잘 보이도록 촬영해주세요
        </div>
      </div>

      {/* 카운트다운 싱크 조정을 위한 설정 UI - Ctrl+Shift+S로 토글 */}
      {showSettings && (
        <div className="fixed top-4 right-4 bg-white/90 p-6 rounded-lg shadow-lg z-50 text-black w-[400px]">
          <h3 className="text-lg font-bold mb-4">타이밍 설정</h3>
          
          <div className="space-y-6">
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
          
          <div className="mt-4 text-xs text-gray-500">
            Ctrl+Shift+S로 이 설정창을 숨길 수 있습니다
          </div>
        </div>
      )}

      {/* 오디오 요소 직접 추가 */}
      <audio id="flashSound" src="/flash.wav" preload="auto" />

      <div className="flex items-center justify-center z-30 flex-row mb-[358px]">
        <Button
          onClick={handleTransform}
          disabled={isCountingDown || showWhiteCircle}
          className="w-[1523px] h-[281px] text-[128px] text-[#451F0D] bg-[#E4BE50] border-5 border-[#471F0D] rounded-[60px] font-bold z-20 disabled:opacity-50"
        >
          수군으로 변신하기
        </Button>
      </div>
    </div>
  );
}
