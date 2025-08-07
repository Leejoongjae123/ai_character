"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useButtonSound } from "@/app/components/ButtonSound";
import { RoleCard } from "./RoleCard";
import { Character } from "../types";

interface RoleSelectionProps {
  characters: Character[];
}

export function RoleSelection({ characters }: RoleSelectionProps) {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const { playSound } = useButtonSound();

  const handleRoleSelect = useCallback((characterId: number) => {
    setSelectedRole(characterId);
  }, []);

  const handleComplete = useCallback(() => {
    if (selectedRole) {
      playSound();
      setTimeout(() => {
        router.push(`/character/${selectedRole}`);
      }, 300);
    }
  }, [selectedRole, playSound, router]);

  return (
    <>
      {/* 4x3 그리드 카드 */}
      <div className="grid grid-cols-4 gap-6 z-30 w-[82vw] mx-auto px-4 mt-[171px] animate-fade-in-delay">
        {characters.map((character) => (
          <RoleCard
            key={character.id}
            character={character}
            isSelected={selectedRole === character.id}
            onSelect={handleRoleSelect}
          />
        ))}
      </div>

      <div className="flex flex-col items-center justify-center z-30 mb-[100px] mt-[145px] animate-fade-in-up">
        <div className="button-container hover:scale-101 active:scale-99 transition-transform">
          <Button
            onClick={handleComplete}
            disabled={!selectedRole}
            className={`w-[1341px] h-[281px] text-[128px] font-bold z-20 rounded-[60px] border-4 border-[#471F0D] transition-all duration-200 ${
              selectedRole
                ? "text-[#451F0D] bg-[#E4BE50] hover:bg-[#E4BE50]/90 cursor-pointer"
                : "text-[#8B7355] bg-[#A8956B] cursor-not-allowed opacity-50"
            }`}
            style={{ fontFamily: "MuseumClassic, serif" }}
          >
            선택완료
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center z-30 text-[48px] text-black font-bold mt-[85px] animate-fade-in">
          <p>얼굴을 인식하여 조선 수군으로 변신합니다.</p>
          <p>생성된 이미지는 포토카드로 제작할 수 있습니다.</p>
        </div>
      </div>
    </>
  );
}