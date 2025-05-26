"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { roles } from "@/app/const/role";
import { useParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const { id } = useParams();
  const [isMicActive, setIsMicActive] = useState(false);
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);

  const role = roles.find((role) => role.id === parseInt(id as string));
  console.log(role);

  // 애니메이션 variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30 
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

  return (
    <motion.div 
      className="w-full h-screen relative flex flex-col items-center justify-between"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Image
        src="/bg2.png"
        alt="background"
        fill
        className="object-cover z-0"
        priority
        unoptimized
      />

      <motion.div 
        className="flex flex-col items-center justify-center z-30 mt-[300px]"
        variants={itemVariants}
      >
        <motion.div
          className="text-[260px] font-bold text-center text-[#481F0E]"
          style={{ fontFamily: "MuseumClassic, serif" }}
          variants={itemVariants}
        >
          {role?.title}
        </motion.div>
        <motion.div
          style={{ whiteSpace: "pre-line", fontFamily: "MuseumClassic, serif" }}
          className="text-[80px] font-bold text-center text-[#481F0E]"
          variants={itemVariants}
        >
          {role?.description}
        </motion.div>
      </motion.div>

      <motion.div 
        className="relative w-[1100px] h-[1650px]"
        variants={itemVariants}
      >
        <Image
          src={role?.detail as string}
          alt="role"
          fill
          className="object-contain z-0"
          priority
          unoptimized
        />
      </motion.div>

      <motion.div 
        className="flex flex-col items-center justify-center z-30 border-[25px] border-[#D3B582] rounded-[60px] w-[1666px] h-[390px]"
        variants={itemVariants}
      >
        <motion.div 
          className="text-[79px] font-bold text-center text-[#481F0E]"
          variants={itemVariants}
        >
          캐릭터에 어떤 상황을 설정하고 싶으신가요?
        </motion.div>
        <motion.div 
          className="text-[79px] font-bold text-center text-[#481F0E]/50"
          variants={itemVariants}
        >
          예:햄버거를 먹으며 전투 지시를 하는 경상좌수사
        </motion.div>
      </motion.div>

      <motion.div 
        className="flex items-center justify-center z-30 flex-row mb-[358px] mt-[191px]"
        variants={itemVariants}
      >
        <motion.div 
          className="relative w-[387px] h-[281px] cursor-pointer"
          onClick={() => setIsMicActive(!isMicActive)}
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Image 
            src={isMicActive ? "/mic2.png" : "/mic.png"} 
            fill 
            alt="mic" 
            className="object-contain" 
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Button
            onClick={() => {
              router.push("/camera");
            }}
            className="w-[899px] h-[281px] text-[128px] text-[#451F0D] bg-[#E4BE50] border-5 border-[#471F0D] rounded-[60px] font-bold z-20"
          >
            시작하기
          </Button>
        </motion.div>
        
        <motion.div 
          className="relative w-[387px] h-[281px] cursor-pointer"
          onClick={() => setIsKeyboardActive(!isKeyboardActive)}
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Image 
            src={isKeyboardActive ? "/keyboard2.png" : "/keyboard.png"} 
            fill 
            alt="keyboard" 
            className="object-contain" 
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
