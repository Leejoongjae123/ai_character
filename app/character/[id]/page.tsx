"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { roles } from "@/app/const/role";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useButtonSound } from "@/app/components/ButtonSound";

export default function Home() {
  const router = useRouter();
  const { id } = useParams();
  const [isMicActive, setIsMicActive] = useState(false);
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);
  const { playSound } = useButtonSound();

  const role = roles.find((role) => role.id === parseInt(id as string));
  console.log(role);

  return (
    <div 
      className="w-full h-screen relative flex flex-col items-center justify-between"
    >
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
          className="text-[260px] font-bold text-center text-[#481F0E]"
          style={{ fontFamily: "MuseumClassic, serif" }}
        >
          {role?.title}
        </div>
        <div
          style={{ whiteSpace: "pre-line", fontFamily: "MuseumClassic, serif" }}
          className="text-[80px] font-bold text-center text-[#481F0E]"
        >
          {role?.description}
        </div>
      </div>

      <div 
        className="relative w-[1100px] h-[1650px]"
      >
        <Image
          src={role?.detail as string}
          alt="role"
          fill
          className="object-contain z-0"
          priority
          unoptimized
        />
      </div>

      <div 
        className="flex flex-col items-center justify-center z-30 border-[25px] border-[#D3B582] rounded-[60px] w-[1666px] h-[390px]"
      >
        <div 
          className="text-[79px] font-bold text-center text-[#481F0E]"
        >
          캐릭터에 어떤 상황을 설정하고 싶으신가요?
        </div>
        <div 
          className="text-[79px] font-bold text-center text-[#481F0E]/50"
        >
          예:햄버거를 먹으며 전투 지시를 하는 경상좌수사
        </div>
      </div>

      <div 
        className="flex items-center justify-center z-30 flex-row mb-[358px] mt-[191px]"
      >
        <div 
          className="relative w-[387px] h-[281px] cursor-pointer"
          onClick={() => setIsMicActive(!isMicActive)}
        >
          <Image 
            src={isMicActive ? "/mic2.png" : "/mic.png"} 
            fill 
            alt="mic" 
            className="object-contain" 
          />
        </div>
        
        <div>
          <Button
            onClick={() => {
              playSound();
              setTimeout(() => {
                router.push("/camera");
              }, 300);
            }}
            className="w-[899px] h-[281px] text-[128px] text-[#451F0D] bg-[#E4BE50] border-5 border-[#471F0D] rounded-[60px] font-bold z-20"
          >
            시작하기
          </Button>
        </div>
        
        <div 
          className="relative w-[387px] h-[281px] cursor-pointer"
          onClick={() => setIsKeyboardActive(!isKeyboardActive)}
        >
          <Image 
            src={isKeyboardActive ? "/keyboard2.png" : "/keyboard.png"} 
            fill 
            alt="keyboard" 
            className="object-contain" 
          />
        </div>
      </div>
    </div>
  );
}
