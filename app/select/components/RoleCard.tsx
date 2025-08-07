"use client";

import Image from "next/image";
import { Card, CardTitle } from "@/components/ui/card";
import { RoleCardProps } from "../types";

// 글자 수에 따라 스페이스를 조정하는 함수
function formatTitle(title: string): string {
  const length = title.length;
  
  if (length >= 4) {
    // 4글자 이상은 그대로
    return title;
  } else if (length === 3) {
    // 3글자는 글자 사이에 1칸씩 스페이스
    return title.split('').join(' ');
  } else if (length === 2) {
    // 2글자는 글자 사이에 2칸씩 스페이스
    return title.split('').join('  ');
  } else {
    // 1글자는 그대로
    return title;
  }
}

export function RoleCard({ character, isSelected, onSelect }: RoleCardProps) {
  return (
    <div className="card-container w-[400px] h-[650px] relative">
      <Card
        onClick={() => onSelect(character.id)}
        className={`w-full h-full border-[13px] ${
          isSelected
            ? "border-[#E4BE50] shadow-[0_0_30px_rgba(228,190,80,0.8)]"
            : "border-[#D2B582]"
        } rounded-[80px] cursor-pointer transition-all duration-200 bg-transparent flex flex-col overflow-hidden justify-end p-0 gap-0 box-border`}
        style={{ boxSizing: 'border-box' }}
      >
        {/* 이미지 영역 - z-index를 낮게 설정 */}
        <div className="flex-1 overflow-hidden rounded-t-[67px] z-10">
          <Image
            src={character.picture_select}
            alt={character.role}
            width={400}
            height={650}
            className="character-image object-cover"
            unoptimized
          />
        </div>
        
        {/* 네임택 영역 - z-index를 높게 설정하여 이미지보다 앞에 배치 */}
        <div
          className={`h-[122px] ${
            isSelected ? "bg-[#E4BE50]" : "bg-[#D2B582]"
          } flex flex-col items-center justify-center border-[#471F0D] transition-all duration-200 rounded-b-[67px] relative z-20`}
        >
          <CardTitle
            className="text-[#471F0D] text-[66px] font-bold text-center"
            style={{ fontFamily: "MuseumClassic, serif" }}
          >
            {formatTitle(character.role)}
          </CardTitle>
        </div>
      </Card>
    </div>
  );
}