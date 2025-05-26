"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<number | null>(null);

  const roles = [
    { id: 1, title: "경상좌수사", description: "조선 수군을 이끄는 지휘관", image: "/role1.png" },
    { id: 2, title: "첨사", description: "대포를 다루는 전문가", image: "/role2.png" },
    { id: 3, title: "사수", description: "활을 다루는 숙련된 병사", image: "/role3.png" },
    { id: 4, title: "사 졸", description: "검술에 능한 근접 전투 병사", image: "/role4.png" },
    { id: 5, title: "화 포 수", description: "바다를 읽는 항해 전문가", image: "/role5.png" },
    { id: 6, title: "격 군", description: "부상병을 치료하는 의료진", image: "/role6.png" },
    { id: 7, title: "나 장", description: "배의 기계를 관리하는 기술자", image: "/role7.png" },
    { id: 8, title: "화 약 장", description: "적의 동향을 파악하는 정찰 전문가", image: "/role8.png" },
    { id: 9, title: "의 원", description: "신호와 통신을 담당하는 병사", image: "/role9.png" },
    { id: 10, title: "취 사 병", description: "물자 보급을 담당하는 병사", image: "/role10.png" },
    { id: 11, title: "거 지", description: "배의 운항을 돕는 일반 병사", image: "/role11.png" },
    { id: 12, title: "백성/상인", description: "전략을 수립하는 참모진", image: "/role12.png" },
  ];

  // 애니메이션 variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const titleVariants = {
    hidden: { 
      opacity: 0, 
      y: -50 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="w-full min-h-screen relative flex flex-col items-center">
      <Image
        src="/bg2.png"
        alt="background"
        fill
        className="object-cover z-0"
        priority
        unoptimized
      />

      <motion.div 
        className="flex flex-col items-center justify-center z-30 mt-[300px] mb-[50px] leading-[1.2]"
        variants={titleVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="text-[#481F0E] text-[238px] font-bold text-center mb-4"
          style={{ fontFamily: "MuseumClassic, serif" }}
          variants={itemVariants}
        >
          역할 선택하기
        </motion.div>
        <motion.div
          className="text-[#471F0D] text-[80px] font-bold text-center tracking-[-0.06em]"
          style={{ fontFamily: "MuseumClassic, serif" }}
          variants={itemVariants}
        >
          한 번의 터치로, 당신은 조선의 수군이 됩니다.
        </motion.div>
      </motion.div>

      {/* 4x3 그리드 카드 */}
      <motion.div 
        className="grid grid-cols-4 gap-6 z-30 w-[82vw] mx-auto px-4 mt-[171px]"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {roles.map((role, index) => (
          <motion.div
            key={role.id}
            variants={cardVariants}
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Card 
              onClick={() => setSelectedRole(role.id)}
              className={`w-[400px] h-[650px] bg-transparent border-[13px] ${
                selectedRole === role.id 
                  ? 'border-[#E4BE50] shadow-[0_0_30px_rgba(228,190,80,0.8)]' 
                  : 'border-[#D2B582]'
              } rounded-[80px] cursor-pointer transition-all duration-200 hover:bg-transparent backdrop-blur-sm flex flex-col overflow-hidden justify-between p-0 gap-0`}
            > 
              {/* 이미지 영역 - 나머지 공간을 모두 차지 */}
              <div className="flex-1 relative overflow-hidden">
                <Image
                  src={role.image}
                  alt={role.title}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              
              {/* 네임택 영역 - 122px 고정 높이 */}
              <div className={`h-[122px] ${
                selectedRole === role.id 
                  ? 'bg-[#E4BE50]' 
                  : 'bg-[#D2B582]'
              } flex flex-col items-center justify-center border-[#471F0D] transition-all duration-200`}>
                <CardTitle 
                  className="text-[#471F0D] text-[66px] font-bold text-center"
                  style={{ fontFamily: "MuseumClassic, serif" }}
                >
                  {role.title}
                </CardTitle>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        className="flex flex-col items-center justify-center z-30 mb-[100px] mt-[145px]"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.6, 
          delay: 1.5,
          ease: "easeOut"
        }}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            onClick={() => {
              if (selectedRole) {
                router.push(`/character/${selectedRole}`);
              }
            }} 
            disabled={!selectedRole}
            className={`w-[1341px] h-[281px] text-[128px] font-bold z-20 rounded-[60px] border-4 border-[#471F0D] transition-all duration-200 ${
              selectedRole 
                ? 'text-[#451F0D] bg-[#E4BE50] hover:bg-[#E4BE50]/90 cursor-pointer' 
                : 'text-[#8B7355] bg-[#A8956B] cursor-not-allowed opacity-50'
            }`}
          >
            선택완료
          </Button>
        </motion.div>
        <motion.div 
          className="flex flex-col items-center justify-center z-30 text-[48px] text-black font-bold mt-[85px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            duration: 0.6, 
            delay: 1.8,
            ease: "easeOut"
          }}
        >
          <p>얼굴을 인식하여 조선 수군으로 변신합니다.</p>
          <p>생성된 이미지는 포토카드로 제작할 수 있습니다.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
