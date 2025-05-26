import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="w-full h-screen relative flex flex-col items-center justify-between">
      <Image
        src="/bg2.png"
        alt="background"
        fill
        className="object-cover z-0"
        priority
        unoptimized
      />

      <div className="flex flex-col items-center justify-center z-30 mt-[300px] leading-[1.2]">
        <div
          className="text-[#481F0E] text-[238px] font-bold text-center"
          style={{ fontFamily: "MuseumClassic, serif" }}
        >
          역할 선택하기
        </div>
        <div
          className="text-[#471F0D] text-[80px] font-bold text-center tracking-[-0.06em]"
          style={{ fontFamily: "MuseumClassic, serif" }}
        >
          한 번의 터치로, 당신은 조선의 수군이 됩니다.
        </div>
      </div>

      <div className="flex flex-col items-center justify-center z-30 mb-[229px]">
        <Button className="w-[1341px] h-[281px] text-[128px] text-[#451F0D] bg-[#E4BE50] border-5 border-[#471F0D] rounded-[60px] font-bold z-20 mb-[85px]">
          선택완료
        </Button>
        <div className="flex flex-col items-center justify-center z-30 text-[48px] text-black font-bold">
          <p>얼굴을 인식하여 조선 수군으로 변신합니다.</p>
          <p>생성된 이미지는 포토카드로 제작할 수 있습니다.</p>
        </div>
      </div>
    </div>
  );
}
