"use client"
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/intro");
  };

  return (
    <div className="w-full h-screen relative flex flex-col items-center justify-between">
      <Image 
        src="/bg.webp" 
        alt="background" 
        fill 
        className="object-cover z-0" 
        priority
        unoptimized
        onClick={handleClick}
      />
      
      <div 
        className="flex flex-col items-center justify-center z-30 mt-[190px]"
      >
        <div 
          className="text-black text-[220px] font-bold text-center" 
          style={{ fontFamily: 'MuseumClassic, serif' }}
        >
          동해를 지켜라!
        </div>
        <div 
          className="text-black text-[260px] font-bold text-center" 
          style={{ fontFamily: 'MuseumClassic, serif' }}
        >
          AI 수군 변신소
        </div>
      </div>

      <div 
        className="flex flex-col items-center justify-end z-30 " 
        style={{ fontFamily: 'MuseumClassic, serif' }}
      >
        <div>
          <Button 
            className="w-[1536px] h-[281px] text-[128px] text-[#451F0D] bg-[#E4BE50] border-5 border-[#471F0D] rounded-[60px] font-bold hover:bg-[#D4AE40] transition-colors duration-200"
            onClick={handleClick}
          >
            화면을 눌러주세요
          </Button>
        </div>
        
        <div 
          className="text-[48px] text-black drop-shadow-lg mt-[107px] mb-[214px]  font-bold"
        >
          <p className="text-center">얼굴을 인식하여 조선 수군으로 변신합니다.</p>
          <p className="text-center">생성된 이미지는 포토카드로 제작할 수 있습니다.</p>
        </div>
      </div>
    </div>
  );
}
