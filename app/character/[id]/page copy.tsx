"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { roles } from "@/app/const/role";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useButtonSound } from "@/app/components/ButtonSound";
import { useVoiceRecognition } from "@/app/utils/useVoiceRecognition";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useAudioStore } from "@/app/store/useAudioStore";
import { useKeyboardStore } from "@/app/store/useKeyboardStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import Hangul from "hangul-js";

export default function Home() {
  const router = useRouter();
  const { id } = useParams();
  const [isMicActive, setIsMicActive] = useState(false);
  const [situation, setSituation] = useState('');
  const [showPromptContent, setShowPromptContent] = useState(true);
  const keyboardRef = useRef(null);
  const { playSound } = useButtonSound();
  const { setMuted } = useAudioStore();
  const { 
    isRecording, 
    transcript, 
    isProcessing, 
    toggleRecording,
    setTranscript
  } = useVoiceRecognition();
  console.log('situation:', situation)

  // Zustand 키보드 스토어 사용
  const {
    isOpen: showVirtualKeyboard,
    inputBuffer,
    isKorean,
    openKeyboard,
    closeKeyboard,
    setInputBuffer,
    toggleLanguage,
    resetKeyboard
  } = useKeyboardStore();

  const role = roles.find((role) => role.id === parseInt(id as string));

  // 음성 인식 결과를 상황 설명으로 설정
  useEffect(() => {
    if (transcript) {
      setSituation(transcript);
      setShowPromptContent(true); // 음성이 인식되면 다시 내용 표시
    }
  }, [transcript]);

  // 음성 인식 상태에 따라 배경 음악 음소거 처리
  useEffect(() => {
    setMuted(isRecording);
  }, [isRecording, setMuted]);

  // 마이크 아이콘 클릭 처리
  const handleMicClick = () => {
    playSound();
    setIsMicActive(!isMicActive);
    
    // 가상 키보드가 열려있으면 닫기
    if (showVirtualKeyboard) {
      closeKeyboard();
    }
    
    // 녹음 시작 시 prompt 내용 숨기기
    if (!isRecording) {
      setShowPromptContent(false);
      toggleRecording();
      toast({
        title: "녹음 시작",
        description: "말씀해주세요. 음성을 인식합니다.",
      });
    } else {
      toggleRecording();
      toast({
        title: "녹음 중지",
        description: "음성 인식을 중지했습니다.",
      });
      // 녹음 중지 시 내용이 있으면 표시
      if (situation) {
        setShowPromptContent(true);
      }
    }
  };

  // 키보드 버튼 클릭 처리
  const handleKeyboardClick = () => {
    playSound();
    
    // 마이크가 활성화되어 있으면 비활성화
    if (isMicActive || isRecording) {
      setIsMicActive(false);
      if (isRecording) {
        toggleRecording();
      }
    }
    
    // 키보드 모달 열기 - 현재 상황을 초기값으로 설정
    openKeyboard(situation || '');
  };

  // 한글 조합 처리
  const handleKeyPress = (button: string) => {
    console.log("Pressed button:", button); // 디버깅용
    
    // 엔터 키 처리 - 가능한 모든 형태의 엔터 키를 감지
    const isEnterKey = 
      button === "{enter}" || 
      button === "enter" || 
      button === "Enter" ||
      button === "{Enter}" ||
      button.toLowerCase().includes("enter") ||
      button === "\n" ||
      button === "\r" ||
      button === "\r\n" ||
      button === "완료";
    
    if (isEnterKey) {
      // 이벤트 전파 중단을 위해 즉시 처리
      handleEnterKey();
      return; // 함수 조기 종료
    } else if (button === "{bksp}" || button === "backspace" || button.includes("bksp") || button === "지우기") {
      // 백스페이스 키 처리
      if (inputBuffer.length > 0) {
        if (isKorean) {
          const newBuffer = Hangul.disassemble(inputBuffer);
          if (newBuffer.length > 0) {
            newBuffer.pop();
            const newText = Hangul.assemble(newBuffer);
            setInputBuffer(newText);
          }
        } else {
          const newText = inputBuffer.slice(0, -1);
          setInputBuffer(newText);
        }
      }
    } else if (button === "{space}" || button === " " || button.includes("space") || button === "공백") {
      // 스페이스 키 처리
      const newText = inputBuffer + " ";
      setInputBuffer(newText);
    } else if (button === "한영" || button === "{shift}") {
      // 한영 전환
      toggleLanguage();
      toast({
        title: isKorean ? "영어 입력" : "한글 입력",
        description: isKorean ? "영어 입력 모드로 전환되었습니다." : "한글 입력 모드로 전환되었습니다.",
      });
    } else if (button.length === 1 || (button.length > 1 && !button.startsWith("{"))) {
      // 문자 입력 처리
      if (isKorean) {
        // 한글 입력 처리
        const newBuffer = Hangul.disassemble(inputBuffer + button);
        const newText = Hangul.assemble(newBuffer);
        setInputBuffer(newText);
      } else {
        // 영어 입력 처리
        const newText = inputBuffer + button;
        setInputBuffer(newText);
      }
    }
  };

  // 엔터 키 처리를 별도 함수로 분리
  const handleEnterKey = () => {
    // 입력된 상황이 있으면 상황으로 설정
    if (inputBuffer.trim() !== '') {
      setSituation(inputBuffer);
      setTranscript(inputBuffer);
    }
    
    // 모달 닫기
    closeKeyboard();
    setShowPromptContent(true);
  };

  // 키 릴리즈 처리 (추가 안전장치)
  const handleKeyReleased = (button: string) => {
    // 완료 버튼의 경우 릴리즈에서도 처리하지 않음 (중복 방지)
    if (button === "완료") {
      return;
    }
  };

  // 모달 닫기 처리
  const handleModalClose = (open: boolean) => {
    if (!open) {
      closeKeyboard();
      // 입력된 내용이 있으면 상황으로 설정
      if (inputBuffer.trim() !== '') {
        setSituation(inputBuffer);
        setTranscript(inputBuffer);
      }
      setShowPromptContent(true);
    }
  };

  // 입력완료 버튼 클릭 처리
  const handleCompleteClick = () => {
    if (!situation.trim()) {
      toast({
        title: "입력 필요",
        description: "상황을 입력해주세요.",
      });
      return;
    }
    
    playSound();
    setTimeout(() => {
      router.push(`/camera?character=${id}&situation=${encodeURIComponent(situation)}`);
    }, 300);
  };

  return (
    <div 
      className="w-full h-screen relative flex flex-col items-center justify-between"
    >
      <Image
        src="/bg2.webp"
        alt="background"
        fill
        className="object-cover z-0"
        priority
        unoptimized
      />

      <div 
        className="flex flex-col items-center justify-center z-30 mt-[300px]"
      >
        <div
          className="text-[260px] font-bold text-center text-[#481F0E]"
          style={{ fontFamily: "MuseumClassic, serif" }}
        >
          {role?.title}
        </div>
        <div
          style={{ whiteSpace: "pre-line", fontFamily: "MuseumClassic, serif" }}
          className="text-[80px] font-bold text-center text-[#481F0E]"
        >
          {role?.description}
        </div>
      </div>

      <div 
        className="relative w-[1100px] h-[1650px]"
      >
        <Image
          src={role?.detail as string}
          alt="role"
          fill
          className="object-contain z-0"
          priority
          unoptimized
        />
      </div>

      <div 
        className="prompt flex flex-col items-center justify-center z-30 border-[25px] border-[#D3B582] rounded-[60px] w-[1666px] h-[390px] relative"
      >
        {showPromptContent ? (
          <>
            {!situation ? (
              <>
                <div 
                  className="text-[79px] font-bold text-center text-[#481F0E]"
                >
                  캐릭터에 어떤 상황을 설정하고 싶으신가요?
                </div>
                <div 
                  className="text-[79px] font-bold text-center text-[#481F0E]/50"
                >
                  예: 햄버거를 먹으며 전투 지시를 하는 경상좌수사
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div 
                  className="text-[100px] font-bold text-center text-[#481F0E] "
                >
                  {situation}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <Loader2 className="w-40 h-40 animate-spin text-[#481F0E]" />
          </div>
        )}
      </div>

      <div 
        className="flex items-center justify-center z-30 flex-row mb-[358px] mt-[191px]"
      >
        <div 
          className="relative w-[387px] h-[281px] cursor-pointer"
          onClick={handleMicClick}
        >
          <Image 
            src={isRecording ? "/mic2.png" : "/mic.png"} 
            fill 
            alt="mic" 
            className="object-contain" 
          />
        </div>
        
        <div>
          <Button
            onClick={handleCompleteClick}
            disabled={!situation.trim()}
            className={`w-[899px] h-[281px] text-[128px] font-bold z-20 rounded-[60px] border-5 ${
              situation.trim()
                ? "text-[#451F0D] bg-[#E4BE50] border-[#471F0D] hover:bg-[#D4AE40]"
                : "text-[#451F0D]/50 bg-[#E4BE50]/50 border-[#471F0D]/50 cursor-not-allowed"
            }`}
          >
            입력완료
          </Button>
        </div>
        
        <Button
          onClick={handleKeyboardClick}
          className="relative w-[387px] h-[281px] p-0 bg-transparent hover:bg-transparent border-none"
        >
          <Image 
            src="/keyboard.png"
            fill 
            alt="keyboard" 
            className="object-contain" 
          />
        </Button>
      </div>

      {/* 키보드 모달 */}
      <Dialog open={showVirtualKeyboard} onOpenChange={handleModalClose}>
        <DialogContent className="max-w-[1400px] w-[90vw] max-h-[80vh] bg-[#D3B582] border-[#471F0D] border-4">
          <DialogHeader>
            <DialogTitle className="text-center text-[40px] font-bold text-[#481F0E]" style={{ fontFamily: "MuseumClassic, serif" }}>
              {isKorean ? "한글 입력" : "영어 입력"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* 입력 미리보기 */}
            <div className="bg-[#E4BE50] border-[#471F0D] border-2 rounded-lg p-4 min-h-[80px] flex items-center">
              <div className="text-[32px] font-bold text-[#481F0E] w-full" style={{ fontFamily: "MuseumClassic, serif" }}>
                {inputBuffer || "여기에 입력된 내용이 표시됩니다..."}
              </div>
            </div>
            
            {/* 키보드 */}
            <div className="keyboard-container">
              <Keyboard
                keyboardRef={r => (keyboardRef.current = r)}
                layoutName="default"
                onChange={() => {}}
                onKeyPress={handleKeyPress}
                onKeyReleased={handleKeyReleased}
                theme="hg-theme-default hg-layout-default modal-keyboard"
                layout={{
                  default: isKorean ? [
                    "1 2 3 4 5 6 7 8 9 0",
                    "ㅂ ㅈ ㄷ ㄱ ㅅ ㅛ ㅕ ㅑ ㅐ ㅔ",
                    "ㅁ ㄴ ㅇ ㄹ ㅎ ㅗ ㅓ ㅏ ㅣ",
                    "ㅋ ㅌ ㅊ ㅍ ㅠ ㅜ ㅡ",
                    "한영 공백 지우기 완료"
                  ] : [
                    "1 2 3 4 5 6 7 8 9 0",
                    "q w e r t y u i o p",
                    "a s d f g h j k l",
                    "z x c v b n m",
                    "한영 공백 지우기 완료"
                  ]
                }}
                buttonTheme={[
                  {
                    class: "modal-keyboard-btn",
                    buttons: "완료 지우기 공백 한영"
                  }
                ]}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .modal-keyboard {
          width: 100%;
          font-family: "MuseumClassic", serif;
          border-radius: 20px;
          padding: 15px;
          background-color: transparent;
        }
        .modal-keyboard .hg-button {
          height: 80px !important;
          font-size: 28px !important;
          background-color: #E4BE50 !important;
          color: #481F0E !important;
          border: 2px solid #471F0D !important;
          border-radius: 10px !important;
          margin: 3px !important;
          font-weight: bold !important;
        }
        .modal-keyboard .hg-button:hover {
          background-color: #D4AE40 !important;
        }
        .modal-keyboard .modal-keyboard-btn {
          background-color: #481F0E !important;
          color: #E4BE50 !important;
        }
        .modal-keyboard .modal-keyboard-btn:hover {
          background-color: #5A2A1A !important;
        }
      `}</style>
    </div>
  );
}
