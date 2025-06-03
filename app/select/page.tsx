"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { useButtonSound } from "@/app/components/ButtonSound";

interface Role {
  id: number;
  title: string;
  description: string;
  image: string;
}

const roles: Role[] = [
  {
    id: 1,
    title: "경상좌수사",
    description: "조선 수군을 이끄는 지휘관",
    image: "/role1.png",
  },
  {
    id: 2,
    title: "첨사",
    description: "대포를 다루는 전문가",
    image: "/role2.png",
  },
  {
    id: 3,
    title: "사수",
    description: "활을 다루는 숙련된 병사",
    image: "/role3.png",
  },
  {
    id: 4,
    title: "사 졸",
    description: "검술에 능한 근접 전투 병사",
    image: "/role4.png",
  },
  {
    id: 5,
    title: "화 포 수",
    description: "바다를 읽는 항해 전문가",
    image: "/role5.png",
  },
  {
    id: 6,
    title: "격 군",
    description: "부상병을 치료하는 의료진",
    image: "/role6.png",
  },
  {
    id: 7,
    title: "나 장",
    description: "배의 기계를 관리하는 기술자",
    image: "/role7.png",
  },
  {
    id: 8,
    title: "화 약 장",
    description: "적의 동향을 파악하는 정찰 전문가",
    image: "/role8.png",
  },
  {
    id: 9,
    title: "의 원",
    description: "신호와 통신을 담당하는 병사",
    image: "/role9.png",
  },
  {
    id: 10,
    title: "취 사 병",
    description: "물자 보급을 담당하는 병사",
    image: "/role10.png",
  },
  {
    id: 11,
    title: "거 지",
    description: "배의 운항을 돕는 일반 병사",
    image: "/role11.png",
  },
  {
    id: 12,
    title: "백성/상인",
    description: "전략을 수립하는 참모진",
    image: "/role12.png",
  },
];

export default function SelectPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const { playSound } = useButtonSound();

  const handleRoleSelect = useCallback((roleId: number) => {
    setSelectedRole(roleId);
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
    <div className="w-full min-h-screen relative flex flex-col items-center">
      <Image
        src="/bg2.webp"
        alt="background"
        fill
        className="object-cover z-0"
        priority
        unoptimized
      />

      <div className="flex flex-col items-center justify-center z-30 mt-[300px] mb-[50px] leading-[1.2] animate-fade-in">
        <div
          className="text-[#481F0E] text-[238px] font-bold text-center mb-4"
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

      {/* 4x3 그리드 카드 */}
      <div className="grid grid-cols-4 gap-6 z-30 w-[82vw] mx-auto px-4 mt-[171px] animate-fade-in-delay">
        {roles.map((role) => (
          <RoleCard
            key={role.id}
            role={role}
            isSelected={selectedRole === role.id}
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
    </div>
  );
}

// 개별 역할 카드 컴포넌트
interface RoleCardProps {
  role: Role;
  isSelected: boolean;
  onSelect: (roleId: number) => void;
}

function RoleCard({ role, isSelected, onSelect }: RoleCardProps) {
  return (
    <div className="card-container w-[400px] h-[650px] relative">
      <Card
        onClick={() => onSelect(role.id)}
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
            src={role.image}
            alt={role.title}
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
            {role.title}
          </CardTitle>
        </div>
      </Card>
    </div>
  );
}
