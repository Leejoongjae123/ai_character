"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const [isMicActive, setIsMicActive] = useState(false);
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showWhiteCircle, setShowWhiteCircle] = useState(false);

  const handleTransform = () => {
    setIsCountingDown(true);
    setCountdown(3);
  };

  useEffect(() => {
    if (isCountingDown && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isCountingDown && countdown === 0) {
      setShowWhiteCircle(true);
      setTimeout(() => {
        router.push("/complete");
      }, 2000); // 하얀 원을 2초간 보여준 후 이동
    }
  }, [isCountingDown, countdown, router]);

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
