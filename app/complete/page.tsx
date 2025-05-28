"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import QRCodeComponent from "@/components/QRCode";

export default function Home() {
  const router = useRouter();
  const [isMicActive, setIsMicActive] = useState(false);
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showCharacter, setShowCharacter] = useState(false);

  const handleTransform = () => {
    setIsCountingDown(true);
    setCountdown(3);
  };

  const handleGoHome = () => {
    router.push("/");
  };

  useEffect(() => {
    if (isCountingDown && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isCountingDown && countdown === 0) {
      setShowCharacter(true);
      setTimeout(() => {
        router.push("/complete");
      }, 2000); // 캐릭터를 2초간 보여준 후 이동
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

      <div 
        className="flex flex-col items-center justify-center z-30 mt-[300px]"
      >
        <div
          className="text-[190px] font-bold text-center text-[#481F0E]"
          style={{ fontFamily: "MuseumClassic, serif" }}
        >
          "출전 준비 완료"
        </div>
      </div>

      <div 
        className="w-[1594px] h-[2543px] border-[10px] border-black z-20 rounded-[50px] flex flex-col items-center justify-between"
      >
        <div
          className="text-[170px] font-bold text-center text-[#481F0E] mt-[60px]"
          style={{ fontFamily: "MuseumClassic, serif" }}
        >
          경상좌수사
        </div>
        
        <div 
          className="w-[1368px] h-[2070px] border-[10px] border-black z-20 rounded-[50px] mb-[100px] relative overflow-hidden flex flex-col items-center justify-end"
        >
          <div 
            className="qrcode absolute bottom-0 right-0 w-[460px] h-[460px] bg-white z-30 border-l-[10px] border-t-[10px] border-black rounded-tl-[50px] flex items-center justify-center"
          >
            <QRCodeComponent 
              value="https://www.naver.com" 
              size={380}
              className="rounded-lg"
            />
          </div>
          
          <div
            className="absolute inset-0"
          >
            <Image
              src="/detail1.png"
              alt="role1"
              fill
              className="object-contain"
            />
          </div>
          
          <div 
            className="w-full h-[290px] z-20 bg-[#E4BE50] flex flex-row border relative"
          >
            {/* 네임택 위 텍스트 */}
            <div 
              className="absolute w-[814px] h-[298px] z-30 flex flex-col items-center justify-center bg-[#FFE7BB] rounded-[130px] border-[10px] border-black"
              style={{ 
                top: '-350px',
                left: '32.5%',
                transform: 'translateX(-50%)',
                fontFamily: "MuseumClassic, serif"
              }}
            >
              <p className="text-[95px] font-bold text-[#481F0E] leading-tight">
                좌수영 수군
              </p>
              <p className="text-[95px] font-bold text-[#481F0E] leading-tight">
                출전 준비 완료!
              </p>
            </div>
            
            <div
              className="flex-1 bg-[#E4BE50] flex flex-col items-center justify-center py-[100px] gap-y-0 border-t-[10px] border-t-black relative"
              style={{ fontFamily: "MuseumClassic, serif" }}
            >
              <p className="text-[69px] font-bold text-black leading-[150%]">
                지도력
              </p>
              <p className="text-[134px] font-bold text-black leading-none">
                150
              </p>
              {/* 투명한 겹치는 div */}
              <div className="absolute inset-0 bg-transparent">
                {/* 오른쪽 검정색 divider */}
                <div className="absolute right-0 top-[20px] bottom-[20px] w-[10px] bg-black"></div>
              </div>
            </div>
            
            <div
              className="flex-1 bg-[#E4BE50] flex flex-col items-center justify-center py-[100px] gap-y-0 border-t-[10px] border-t-black"
              style={{ fontFamily: "MuseumClassic, serif" }}
            >
              <p className="text-[69px] font-bold text-black leading-[150%]">
                결단력
              </p>
              <p className="text-[134px] font-bold text-black leading-none">
                150
              </p>
            </div>
            <div className="w-[460px]">123</div>
          </div>
        </div>
      </div>
      
      <div 
        className="flex items-center justify-center z-30 flex-row mb-[358px] gap-x-24"
      >
        <div>
          <Button
            onClick={handleTransform}
            disabled={isCountingDown || showCharacter}
            className="w-[752px] h-[281px] text-[128px] text-[#451F0D] bg-[#E4BE50] border-5 border-[#471F0D] rounded-[60px] font-bold z-20 disabled:opacity-50"
          >
            출력하기
          </Button>
        </div>
        
        <div>
          <Button
            onClick={handleGoHome}
            className="w-[752px] h-[281px] text-[128px] text-[#451F0D] bg-[#E4BE50] border-5 border-[#471F0D] rounded-[60px] font-bold z-20"
          >
            처음으로
          </Button>
        </div>
      </div>
    </div>
  );
}
