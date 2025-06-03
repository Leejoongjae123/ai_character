"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { roles } from "@/app/const/role";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useButtonSound } from "@/app/components/ButtonSound";
import { useVoiceRecognition } from "@/app/utils/useVoiceRecognition";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useAudioStore } from "@/app/store/useAudioStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// 한글 조합을 위한 유틸리티 함수들
const CHOSUNG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const JUNGSUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
const JONGSUNG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

// 복합 모음 조합 규칙
const JUNGSUNG_COMBINATIONS: { [key: string]: string } = {
  'ㅗㅏ': 'ㅘ',
  'ㅗㅐ': 'ㅙ',
  'ㅗㅣ': 'ㅚ',
  'ㅜㅓ': 'ㅝ',
  'ㅜㅔ': 'ㅞ',
  'ㅜㅣ': 'ㅟ',
  'ㅡㅣ': 'ㅢ'
};

// 복합 자음 조합 규칙
const JONGSUNG_COMBINATIONS: { [key: string]: string } = {
  'ㄱㅅ': 'ㄳ',
  'ㄴㅈ': 'ㄵ',
  'ㄴㅎ': 'ㄶ',
  'ㄹㄱ': 'ㄺ',
  'ㄹㅁ': 'ㄻ',
  'ㄹㅂ': 'ㄼ',
  'ㄹㅅ': 'ㄽ',
  'ㄹㅌ': 'ㄾ',
  'ㄹㅍ': 'ㄿ',
  'ㄹㅎ': 'ㅀ',
  'ㅂㅅ': 'ㅄ'
};

// 문자가 한글인지 확인
const isHangul = (char: string): boolean => {
  const code = char.charCodeAt(0);
  return code >= 0xAC00 && code <= 0xD7A3;
};

// 문자가 자음인지 확인
const isChosung = (char: string): boolean => {
  return CHOSUNG.includes(char);
};

// 문자가 모음인지 확인
const isJungsung = (char: string): boolean => {
  return JUNGSUNG.includes(char);
};

// 한글 문자를 초성, 중성, 종성으로 분해
const decomposeHangul = (char: string): [number, number, number] => {
  const code = char.charCodeAt(0) - 0xAC00;
  const chosung = Math.floor(code / 588);
  const jungsung = Math.floor((code % 588) / 28);
  const jongsung = code % 28;
  return [chosung, jungsung, jongsung];
};

// 초성, 중성, 종성을 조합하여 한글 문자 생성
const composeHangul = (chosung: number, jungsung: number, jongsung: number): string => {
  const code = 0xAC00 + (chosung * 588) + (jungsung * 28) + jongsung;
  return String.fromCharCode(code);
};

// 한글 조합 처리 함수
const processKoreanInput = (currentText: string, newChar: string): string => {
  if (!currentText) {
    return newChar;
  }

  const lastChar = currentText[currentText.length - 1];
  const beforeText = currentText.slice(0, -1);

  // 마지막 문자가 한글이 아닌 경우
  if (!isHangul(lastChar) && !isChosung(lastChar) && !isJungsung(lastChar)) {
    return currentText + newChar;
  }

  // 새 입력이 자음인 경우
  if (isChosung(newChar)) {
    // 마지막 문자가 완성된 한글인 경우
    if (isHangul(lastChar)) {
      const [cho, jung, jong] = decomposeHangul(lastChar);
      
      if (jong === 0) {
        // 종성이 없는 경우 종성 추가
        const newJongsungIndex = JONGSUNG.indexOf(newChar);
        if (newJongsungIndex !== -1) {
          return beforeText + composeHangul(cho, jung, newJongsungIndex);
        }
      } else {
        // 이미 종성이 있는 경우
        const currentJong = JONGSUNG[jong];
        const combinationKey = currentJong + newChar;
        const combinedJong = JONGSUNG_COMBINATIONS[combinationKey];
        
        if (combinedJong) {
          // 복합 종성 조합 가능한 경우
          const newJongsungIndex = JONGSUNG.indexOf(combinedJong);
          if (newJongsungIndex !== -1) {
            return beforeText + composeHangul(cho, jung, newJongsungIndex);
          }
        } else {
          // 복합 종성 조합이 불가능한 경우, 종성을 분리하여 새로운 글자 시작
          const newLastChar = composeHangul(cho, jung, 0);
          return beforeText + newLastChar + newChar;
        }
      }
    }
    
    // 마지막 문자가 미완성 자음인 경우 그대로 추가
    return currentText + newChar;
  }

  // 새 입력이 모음인 경우
  if (isJungsung(newChar)) {
    // 마지막 문자가 자음인 경우 (초성)
    if (isChosung(lastChar)) {
      const chosungIndex = CHOSUNG.indexOf(lastChar);
      const jungsungIndex = JUNGSUNG.indexOf(newChar);
      if (chosungIndex !== -1 && jungsungIndex !== -1) {
        return beforeText + composeHangul(chosungIndex, jungsungIndex, 0);
      }
    }
    
    // 마지막 문자가 완성된 한글인 경우
    if (isHangul(lastChar)) {
      const [cho, jung, jong] = decomposeHangul(lastChar);
      
      // 종성이 있는 경우, 종성을 초성으로 하는 새 글자 시작
      if (jong > 0) {
        const jongChar = JONGSUNG[jong];
        const newChosungIndex = CHOSUNG.indexOf(jongChar);
        const newJungsungIndex = JUNGSUNG.indexOf(newChar);
        
        if (newChosungIndex !== -1 && newJungsungIndex !== -1) {
          const newLastChar = composeHangul(cho, jung, 0);
          const newChar2 = composeHangul(newChosungIndex, newJungsungIndex, 0);
          return beforeText + newLastChar + newChar2;
        }
      } else {
        // 복합 모음 조합 시도
        const currentJung = JUNGSUNG[jung];
        const combinationKey = currentJung + newChar;
        const combinedJung = JUNGSUNG_COMBINATIONS[combinationKey];
        
        if (combinedJung) {
          const newJungsungIndex = JUNGSUNG.indexOf(combinedJung);
          if (newJungsungIndex !== -1) {
            return beforeText + composeHangul(cho, newJungsungIndex, jong);
          }
        }
      }
    }
    
    return currentText + newChar;
  }

  // 새 입력이 일반 문자인 경우
  return currentText + newChar;
};

export default function Home() {
  const router = useRouter();
  const { id } = useParams();
  const [isMicActive, setIsMicActive] = useState(false);
  const [situation, setSituation] = useState('');
  const [showPromptContent, setShowPromptContent] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInput, setModalInput] = useState('');
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [isCapsLock, setIsCapsLock] = useState(false);
  const [isKoreanMode, setIsKoreanMode] = useState(true);
  const [isKeyboardPressed, setIsKeyboardPressed] = useState(false);
  const { playSound } = useButtonSound();
  const { setMuted } = useAudioStore();
  const { 
    isRecording, 
    transcript, 
    isProcessing, 
    toggleRecording,
    setTranscript
  } = useVoiceRecognition();

  const role = roles.find((role) => role.id === parseInt(id as string));

  // 한글 키보드 레이아웃
  const koreanLayout = {
    row1: ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
    row2: ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ', '[', ']', '\\'],
    row3: ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ', ';', "'"],
    row4: ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ', ',', '.', '/']
  };

  const koreanShiftLayout = {
    row1: ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+'],
    row2: ['ㅃ', 'ㅉ', 'ㄸ', 'ㄲ', 'ㅆ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅒ', 'ㅖ', '{', '}', '|'],
    row3: ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ', ':', '"'],
    row4: ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ', '<', '>', '?']
  };

  // 영어 키보드 레이아웃
  const englishLayout = {
    row1: ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
    row2: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    row3: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
    row4: ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
  };

  const englishShiftLayout = {
    row1: ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+'],
    row2: ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}', '|'],
    row3: ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ':', '"'],
    row4: ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?']
  };

  // 현재 레이아웃 가져오기
  const getCurrentLayout = () => {
    if (isKoreanMode) {
      return (isShiftPressed || isCapsLock) ? koreanShiftLayout : koreanLayout;
    } else {
      return (isShiftPressed || isCapsLock) ? englishShiftLayout : englishLayout;
    }
  };

  // 음성 인식 결과를 상황 설명으로 설정
  useEffect(() => {
    if (transcript) {
      setSituation(transcript);
      setShowPromptContent(true);
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
      if (situation) {
        setShowPromptContent(true);
      }
    }
  };

  // 키보드 버튼 클릭 처리
  const handleKeyboardClick = () => {
    playSound();
    setModalInput(situation);
    setIsKeyboardPressed(true);
    setIsModalOpen(true);
  };

  // 키 입력 처리 (한글 조합 로직 적용)
  const handleKeyPress = (key: string) => {
    if (key === 'BACKSPACE') {
      setModalInput(prev => prev.slice(0, -1));
    } else if (key === 'SPACE') {
      setModalInput(prev => prev + ' ');
    } else if (key === 'ENTER') {
      setModalInput(prev => prev + '\n');
    } else if (key === 'SHIFT') {
      setIsShiftPressed(!isShiftPressed);
    } else if (key === 'CAPS') {
      setIsCapsLock(!isCapsLock);
    } else if (key === 'KOREAN') {
      setIsKoreanMode(!isKoreanMode);
    } else {
      // 한글 모드일 때 한글 조합 로직 적용
      if (isKoreanMode && (isChosung(key) || isJungsung(key))) {
        setModalInput(prev => processKoreanInput(prev, key));
      } else {
        setModalInput(prev => prev + key);
      }
      
      // Shift가 눌려있었다면 해제 (CapsLock이 아닌 경우)
      if (isShiftPressed && !isCapsLock) {
        setIsShiftPressed(false);
      }
    }
  };

  // 모달에서 확인 버튼 클릭 처리
  const handleModalConfirm = () => {
    setSituation(modalInput);
    setShowPromptContent(true);
    setIsModalOpen(false);
    setIsKeyboardPressed(false);
    toast({
      title: "입력 완료",
      description: "상황이 설정되었습니다.",
    });
  };

  // 모달에서 취소 버튼 클릭 처리
  const handleModalCancel = () => {
    setModalInput('');
    setIsModalOpen(false);
    setIsKeyboardPressed(false);
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

  const layout = getCurrentLayout();

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

      <div className="flex flex-col items-center justify-center z-30 mt-[300px]">
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

      <div className="relative w-[1100px] h-[1650px]">
        <Image
          src={role?.detail as string}
          alt="role"
          fill
          className="object-contain z-0"
          priority
          unoptimized
        />
      </div>

      <div className="prompt flex flex-col items-center justify-center z-30 border-[25px] border-[#D3B582] rounded-[60px] w-[1666px] h-[390px] relative">
        {showPromptContent ? (
          <>
            {!situation ? (
              <>
                <div className="text-[79px] font-bold text-center text-[#481F0E]">
                  캐릭터에 어떤 상황을 설정하고 싶으신가요?
                </div>
                <div className="text-[79px] font-bold text-center text-[#481F0E]/50">
                  예: 햄버거를 먹으며 전투 지시를 하는 경상좌수사
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-[100px] font-bold text-center text-[#481F0E]">
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

      <div className="flex items-center justify-center z-30 flex-row mb-[358px] mt-[191px] gap-8">
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

        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setIsKeyboardPressed(false);
          }
        }}>
          <DialogTrigger asChild>
            <Button
              onClick={handleKeyboardClick}
              className="relative w-[387px] h-[281px] p-0 bg-transparent hover:bg-transparent border-none"
            >
              <Image 
                src={isKeyboardPressed ? "/keyboard2.png" : "/keyboard.png"}
                fill 
                alt="keyboard" 
                className="object-contain" 
              />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[95vw] h-[39vh] max-h-[95vh] overflow-hidden bg-[#F5E6D3] border-[#D3B582] border-4">
            <DialogHeader>
              <DialogTitle className="text-[120px] font-bold text-[#481F0E] text-center">
                상황 입력
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex flex-col gap-4 py-4 h-full">
              {/* 텍스트 입력 영역 */}
              <Textarea
                value={modalInput}
                onChange={(e) => setModalInput(e.target.value)}
                placeholder="캐릭터에 설정할 상황을 입력해주세요..."
                className="h-[120px] bg-white border-[#D3B582] border-2 text-[#481F0E] placeholder:text-[#481F0E]/50 resize-none"
                style={{ 
                  fontSize: '60px', 
                  lineHeight: '1.2',
                  padding: '20px'
                }}
              />
              
              {/* 커스텀 키보드 */}
              <div className="flex-1 bg-[#F5E6D3] rounded-lg p-4 border-2 border-[#D3B582] flex flex-col gap-2">
                {/* 첫 번째 줄 */}
                <div className="flex gap-1 flex-1">
                  {layout.row1.map((key, index) => (
                    <button
                      key={index}
                      onClick={() => handleKeyPress(key)}
                      className="flex-1 min-h-[78px] bg-[#E4BE50] hover:bg-[#D4AE40] active:bg-[#C49E30] border border-[#471F0D] rounded text-[#471F0D] font-bold text-[78px] flex items-center justify-center"
                    >
                      {key}
                    </button>
                  ))}
                  <button
                    onClick={() => handleKeyPress('BACKSPACE')}
                    className="w-24 min-h-[78px] bg-[#E74C3C] hover:bg-[#C0392B] border border-[#471F0D] rounded text-white font-bold text-[52px] flex items-center justify-center"
                  >
                    ⌫
                  </button>
                </div>

                {/* 두 번째 줄 */}
                <div className="flex gap-1 flex-1">
                  <button className="w-20 min-h-[78px] bg-[#E4BE50] hover:bg-[#D4AE40] border border-[#471F0D] rounded text-[#471F0D] font-bold text-[39px] flex items-center justify-center">
                    Tab
                  </button>
                  {layout.row2.map((key, index) => (
                    <button
                      key={index}
                      onClick={() => handleKeyPress(key)}
                      className="flex-1 min-h-[78px] bg-[#E4BE50] hover:bg-[#D4AE40] active:bg-[#C49E30] border border-[#471F0D] rounded text-[#471F0D] font-bold text-[78px] flex items-center justify-center"
                    >
                      {key}
                    </button>
                  ))}
                </div>

                {/* 세 번째 줄 */}
                <div className="flex gap-1 flex-1">
                  <button
                    onClick={() => handleKeyPress('CAPS')}
                    className={`w-24 min-h-[78px] border border-[#471F0D] rounded font-bold text-[39px] flex items-center justify-center ${
                      isCapsLock 
                        ? 'bg-[#C49E30] text-white' 
                        : 'bg-[#E4BE50] hover:bg-[#D4AE40] text-[#471F0D]'
                    }`}
                  >
                    Caps
                  </button>
                  {layout.row3.map((key, index) => (
                    <button
                      key={index}
                      onClick={() => handleKeyPress(key)}
                      className="flex-1 min-h-[78px] bg-[#E4BE50] hover:bg-[#D4AE40] active:bg-[#C49E30] border border-[#471F0D] rounded text-[#471F0D] font-bold text-[78px] flex items-center justify-center"
                    >
                      {key}
                    </button>
                  ))}
                  <button
                    onClick={() => handleKeyPress('ENTER')}
                    className="w-24 min-h-[78px] bg-[#E4BE50] hover:bg-[#D4AE40] border border-[#471F0D] rounded text-[#471F0D] font-bold text-[52px] flex items-center justify-center"
                  >
                    ⏎
                  </button>
                </div>

                {/* 네 번째 줄 */}
                <div className="flex gap-1 flex-1">
                  <button
                    onClick={() => handleKeyPress('SHIFT')}
                    className={`w-28 min-h-[78px] border border-[#471F0D] rounded font-bold text-[39px] flex items-center justify-center ${
                      isShiftPressed 
                        ? 'bg-[#C49E30] text-white' 
                        : 'bg-[#E4BE50] hover:bg-[#D4AE40] text-[#471F0D]'
                    }`}
                  >
                    Shift
                  </button>
                  {layout.row4.map((key, index) => (
                    <button
                      key={index}
                      onClick={() => handleKeyPress(key)}
                      className="flex-1 min-h-[78px] bg-[#E4BE50] hover:bg-[#D4AE40] active:bg-[#C49E30] border border-[#471F0D] rounded text-[#471F0D] font-bold text-[78px] flex items-center justify-center"
                    >
                      {key}
                    </button>
                  ))}
                  <button
                    onClick={() => handleKeyPress('SHIFT')}
                    className={`w-28 min-h-[78px] border border-[#471F0D] rounded font-bold text-[39px] flex items-center justify-center ${
                      isShiftPressed 
                        ? 'bg-[#C49E30] text-white' 
                        : 'bg-[#E4BE50] hover:bg-[#D4AE40] text-[#471F0D]'
                    }`}
                  >
                    Shift
                  </button>
                </div>

                {/* 다섯 번째 줄 (스페이스바 등) */}
                <div className="flex gap-1 flex-1">
                  <button
                    onClick={() => handleKeyPress('KOREAN')}
                    className={`w-24 min-h-[78px] border border-[#471F0D] rounded font-bold text-[52px] flex items-center justify-center ${
                      isKoreanMode 
                        ? 'bg-[#C49E30] text-white' 
                        : 'bg-[#E4BE50] hover:bg-[#D4AE40] text-[#471F0D]'
                    }`}
                  >
                    {isKoreanMode ? '한' : 'A'}
                  </button>
                  <button
                    onClick={() => handleKeyPress('SPACE')}
                    className="flex-1 min-h-[78px] bg-[#E4BE50] hover:bg-[#D4AE40] active:bg-[#C49E30] border border-[#471F0D] rounded text-[#471F0D] font-bold text-[52px] flex items-center justify-center"
                  >
                    Space
                  </button>
                </div>
              </div>
            </div>
            
            {/* 버튼 영역 */}
            <div className="flex justify-center gap-4 mt-4">
              <Button
                onClick={handleModalCancel}
                variant="outline"
                className="w-1/5 h-[120px] text-[80px] font-bold text-[#481F0E] bg-white border-[#D3B582] border-2 hover:bg-[#F5E6D3]"
                style={{ fontFamily: "Noto Sans KR, sans-serif" }}
              >
                취소
              </Button>
              <Button
                onClick={handleModalConfirm}
                className="w-1/5 h-[120px] text-[80px] font-bold text-[#451F0D] bg-[#E4BE50] border-[#471F0D] border-2 hover:bg-[#D4AE40]"
                style={{ fontFamily: "Noto Sans KR, sans-serif" }}
              >
                확인
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 