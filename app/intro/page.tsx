"use client"
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();

  // 애니메이션 variants 정의
  const fadeInUp = {
    hidden: { 
      opacity: 0, 
      y: 60 
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

  const textStagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.5
      }
    }
  };

  const textLine = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="w-full h-screen relative flex flex-col items-center justify-between">
      <Image
        src="/bg2.webp"
        alt="background"
        fill
        className="object-cover z-0"
        priority
        unoptimized
      />

      <motion.div 
        className="flex flex-col items-center justify-center z-30 mt-[300px]"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <motion.div
          className="text-[260px] font-bold text-center text-[#481F0E]"
          style={{ fontFamily: "MuseumClassic, serif" }}
          variants={fadeInUp}
        >
          AI 수군 변신소
        </motion.div>
      </motion.div>

      <motion.div 
        className="flex flex-col items-center justify-between z-20 w-[1735px] h-[2825px] rounded-[100px] bg-[#471F0D]/10 mb-[354px] relative pt-[149px] pb-[96px]"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div 
          className="text-[90px] font-bold text-[#471F0D]"
          variants={textStagger}
        >
          <motion.p variants={textLine}>
            <motion.span variants={textLine}>울산 외황강 끝자락에 자리한</motion.span>
            <br />
            <motion.span variants={textLine}>경상좌수영성은,</motion.span>
            <br />
            <motion.span variants={textLine}>조선 수군이 왜군으로부터</motion.span>
            <br />
            <motion.span variants={textLine}>우리 땅을 지키던 최전선이었습니다.</motion.span>
            <br />
            <br />
          
            <motion.span variants={textLine}>지금은 성터만 남았지만,</motion.span>
            <br />
            <motion.span variants={textLine}>그 자리에 수군으로 변신한</motion.span>
            <br />
            <motion.span variants={textLine}>당신이 선다면, 경상좌수영성은</motion.span>
            <br />
            <motion.span variants={textLine}>다시 살아납니다.</motion.span>
            <br /><br />

            <motion.span variants={textLine}>AI를 통해</motion.span>
            <br />
            <motion.span variants={textLine}>조선 수군이 된</motion.span>
            <br />
            <motion.span variants={textLine}>당신,</motion.span>
            <br />
            <motion.span variants={textLine}>다시 한 번 동해를</motion.span>
            <br />
            <motion.span variants={textLine}>지켜주세요.</motion.span>
            <br /><br />
          </motion.p>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Button
            onClick={() => {
              router.push("/select");
            }}
            className="w-[1536px] h-[281px] text-[128px] text-[#451F0D] bg-[#E4BE50] border-5 border-[#471F0D] rounded-[60px] font-bold z-20"
          >
            수군으로 변신하기
          </Button>
        </motion.div>

        <motion.img 
          src="/jss.png" 
          alt="jss" 
          className="absolute bottom-[30px] right-0 -z-10 w-[1000px] aspect-[1103/1655]"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            duration: 1, 
            delay: 2,
            ease: "easeOut" 
          }}
        />
      </motion.div>
    </div>
  );
}
