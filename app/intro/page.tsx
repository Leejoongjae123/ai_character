"use client"
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import IntroMusic from "@/app/components/IntroMusic";
import { useButtonSound } from "@/app/components/ButtonSound";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const { playSound } = useButtonSound();

  const handleButtonClick = () => {
    // 효과음 재생
    playSound();
    
    // 효과음 재생 후 페이지 이동 (약간의 지연 추가)
    setTimeout(() => {
      router.push("/select");
    }, 300); // 300ms 후 페이지 이동
  };

  return (
    <div className="w-full h-screen relative flex flex-col items-center justify-between">
      <IntroMusic />
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
          className="text-[238px] font-bold text-center text-[#481F0E] tracking-[-0.03em]"
          style={{ fontFamily: "MuseumClassic, serif" }}
        >
          AI 수군 변신소
        </div>
      </div>

      <div className="relative flex flex-col items-start justify-between z-20 w-[1735px] h-[2825px] rounded-[100px] bg-[#471F0D]/10 mb-[354px] pl-[161px] pt-[149px]  pb-[96px]">
        <div className="text-[90px] font-bold text-[#471F0D]" style={{ lineHeight: '134px', letterSpacing: '-1%' }}>
          <p>
            <span>울산 외황강 끝자락에 자리한</span>
            <br />
            <span>경상좌수영성은,</span>
            <br />
            <span>조선 수군이 왜군으로부터</span>
            <br />
            <span>우리 땅을 지키던 최전선이었습니다.</span>
            <br />
            <br />
          
            <span>지금은 성터만 남았지만,</span>
            <br />
            <span>그 자리에 수군으로 변신한</span>
            <br />
            <span>당신이 선다면, 경상좌수영성은</span>
            <br />
            <span>다시 살아납니다.</span>
            <br /><br />

            <span>AI를 통해</span>
            <br />
            <span>조선 수군이 된</span>
            <br />
            <span>당신,</span>
            <br />
            <span>다시 한 번 동해를</span>
            <br />
            <span>지켜주세요.</span>
            <br /><br />
          </p>
        </div>

        <div>
          <Button
            onClick={handleButtonClick}
            className="absolute bottom-[96px] left-[92.5px] w-[1550px] h-[281px] text-[128px] text-[#451F0D] bg-[#E4BE50] border-5 border-[#471F0D] rounded-[60px] font-bold z-20"
          >
            수군으로 변신하기
          </Button>
        </div>

        <img 
          src="/ship.png" 
          alt="jss" 
          className="absolute bottom-[438px] right-[27.5px] -z-10 w-[815px] h-[1083px]"
        />
        <img 
          src="/wave.png" 
          alt="jss" 
          className="absolute bottom-[305px] right-[92.5px] -z-10 w-[1550px] h-[405px]"
        />
      </div>
    </div>
  );
}
