"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const [isMicActive, setIsMicActive] = useState(false);
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showWhiteCircle, setShowWhiteCircle] = useState(false);

  const handleTransform = () => {
    setIsCountingDown(true);
    setCountdown(3);
  };

  useEffect(() => {
    if (isCountingDown && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isCountingDown && countdown === 0) {
      setShowWhiteCircle(true);
      setTimeout(() => {
        router.push("/complete");
      }, 2000); // 하얀 원을 2초간 보여준 후 이동
    }
  }, [isCountingDown, countdown, router]);

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

  const cameraVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 1,
        ease: "easeOut",
        delay: 0.5
      }
    }
  };

  const countdownVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.5
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 1.2,
      transition: {
        duration: 0.3
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
        <div
          className="text-[260px] font-bold text-center text-[#481F0E]"
          style={{ fontFamily: "MuseumClassic, serif" }}
        >
          사진 촬영
        </div>
      </motion.div>

      <motion.div 
        className="relative w-[1225px] aspect-square"
        variants={itemVariants}
      >
        {/* 회색 원 또는 하얀 원 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-full h-full rounded-full transition-colors duration-1000 ${showWhiteCircle ? 'bg-white' : 'bg-[#D9D9D9]'}`}></div>
        </div>

        {/* 카메라 이미지 또는 카운트다운 */}
        <div className="absolute inset-0 flex items-center justify-center">
          {!isCountingDown && !showWhiteCircle && (
            <motion.div
              variants={cameraVariants}
              initial="hidden"
              animate="visible"
            >
              <Image
                src="/camera.png"
                alt="camera"
                width={441}
                height={337}
                className="z-10"
                unoptimized
              />
            </motion.div>
          )}

          {isCountingDown && countdown > 0 && (
            <motion.div 
              className="text-[400px] font-bold text-white z-10"
              variants={countdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              key={countdown}
            >
              {countdown}
            </motion.div>
          )}
        </div>

        {/* 사각형 귀퉁이 꺾쇠 표시 */}
        {/* 왼쪽 위 */}
        <motion.div 
          className="absolute top-0 left-0 w-[200px] h-[200px]"
          initial={{ opacity: 0, x: -20, y: -20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <div className="absolute top-0 left-0 w-[200px] h-[10px] bg-[#B8B8B8]"></div>
          <div className="absolute top-0 left-0 w-[10px] h-[200px] bg-[#B8B8B8]"></div>
        </motion.div>

        {/* 오른쪽 위 */}
        <motion.div 
          className="absolute top-0 right-0 w-[200px] h-[200px]"
          initial={{ opacity: 0, x: 20, y: -20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
        >
          <div className="absolute top-0 right-0 w-[200px] h-[10px] bg-[#B8B8B8]"></div>
          <div className="absolute top-0 right-0 w-[10px] h-[200px] bg-[#B8B8B8]"></div>
        </motion.div>

        {/* 왼쪽 아래 */}
        <motion.div 
          className="absolute bottom-0 left-0 w-[200px] h-[200px]"
          initial={{ opacity: 0, x: -20, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <div className="absolute bottom-0 left-0 w-[200px] h-[10px] bg-[#B8B8B8]"></div>
          <div className="absolute bottom-0 left-0 w-[10px] h-[200px] bg-[#B8B8B8]"></div>
        </motion.div>

        {/* 오른쪽 아래 */}
        <motion.div 
          className="absolute bottom-0 right-0 w-[200px] h-[200px]"
          initial={{ opacity: 0, x: 20, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.6, delay: 1.3 }}
        >
          <div className="absolute bottom-0 right-0 w-[200px] h-[10px] bg-[#B8B8B8]"></div>
          <div className="absolute bottom-0 right-0 w-[10px] h-[200px] bg-[#B8B8B8]"></div>
        </motion.div>
      </motion.div>

      <motion.div 
        className="flex flex-col items-center justify-center z-30 border-[25px] border-[#D3B582] rounded-[60px] w-[1666px] h-[390px] mt-[100px]"
        variants={itemVariants}
      >
        <div className="text-[79px] font-bold text-center text-[#481F0E]">
          정면을 바라보고 얼굴굴 전체가
        </div>
        <div className="text-[79px] font-bold text-center text-[#481F0E]">
          잘 보이도록 촬영해주세요
        </div>
      </motion.div>

      <motion.div 
        className="flex items-center justify-center z-30 flex-row mb-[358px]"
        variants={itemVariants}
      >
        <Button
          onClick={handleTransform}
          disabled={isCountingDown || showWhiteCircle}
          className="w-[1523px] h-[281px] text-[128px] text-[#451F0D] bg-[#E4BE50] border-5 border-[#471F0D] rounded-[60px] font-bold z-20 disabled:opacity-50"
        >
          수군으로 변신하기
        </Button>
      </motion.div>
    </motion.div>
  );
}
