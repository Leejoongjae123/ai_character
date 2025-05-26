"use client"
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/intro");
  };

  // 애니메이션 variants 정의
  const fadeInUp = {
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

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  return (
    <div className="w-full h-screen relative flex flex-col items-center justify-between">
      <Image 
        src="/bg.png" 
        alt="background" 
        fill 
        className="object-cover z-0" 
        priority
        unoptimized
        onClick={handleClick}
      />
      
      <motion.div 
        className="flex flex-col items-center justify-center z-30 mt-[190px]"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="text-black text-[220px] font-bold text-center" 
          style={{ fontFamily: 'MuseumClassic, serif' }}
          variants={fadeInUp}
        >
          동해를 지켜라!
        </motion.div>
        <motion.div 
          className="text-black text-[260px] font-bold text-center" 
          style={{ fontFamily: 'MuseumClassic, serif' }}
          variants={fadeInUp}
        >
          AI 수군 변신소
        </motion.div>
      </motion.div>

      <motion.div 
        className="flex flex-col items-center justify-center z-30 mb-[100px]" 
        style={{ fontFamily: 'MuseumClassic, serif' }}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={fadeInUp}>
          <Button 
            className="w-[1536px] h-[281px] text-[128px] text-[#451F0D] bg-[#E4BE50] border-5 border-[#471F0D] rounded-[60px] font-bold hover:bg-[#D4AE40] transition-colors duration-200"
            
          >
            화면을 눌러주세요
          </Button>
        </motion.div>
        
        <motion.div 
          className="text-[48px] text-black drop-shadow-lg mt-[100px] mb-[200px] font-bold"
          variants={fadeInUp}
        >
          <p className="text-center">얼굴을 인식하여 조선 수군으로 변신합니다.</p>
          <p className="text-center">생성된 이미지는 포토카드로 제작할 수 있습니다.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
