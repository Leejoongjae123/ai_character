import { useState, useEffect, useRef } from 'react';
import { toast } from "@/components/ui/use-toast";

// 브라우저 SpeechRecognition API 타입 정의
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

// 브라우저별 SpeechRecognition 객체 타입
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export function useVoiceRecognition() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20); // 남은 시간 (초)
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null); // 최대 20초 타이머
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null); // 카운트다운 타이머
  const isManualStopRef = useRef(false); // 수동으로 중지했는지 확인

  // 타이머들을 정리하는 함수
  const clearAllTimers = () => {
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
      maxTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  // 음성 인식 초기화
  useEffect(() => {
    // 브라우저 지원 확인
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({
        title: "음성 인식 미지원",
        description: "이 브라우저는 음성 인식을 지원하지 않습니다. Chrome을 사용해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    // 음성 인식 객체 생성
    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.continuous = true; // 계속해서 음성을 인식하도록 설정
    recognition.interimResults = true;
    
    // 음성 인식 결과 처리
    recognition.onresult = (event) => {
      const { results, resultIndex } = event;
      const lastResult = results[resultIndex];
      const firstAlternative = lastResult[0];
      const { transcript } = firstAlternative;
      
      setTranscript(transcript);
      
      // isFinal이어도 20초 동안 계속 녹음 유지하므로 isProcessing을 false로 하지 않음
    };
    
    // 음성 인식 종료 처리
    recognition.onend = () => {
      // 수동으로 중지한 경우나 20초가 지난 경우에만 완전 중지
      if (isManualStopRef.current || timeLeft <= 0) {
        setIsRecording(false);
        setIsProcessing(false);
        clearAllTimers();
        setTimeLeft(20); // 시간 초기화
        isManualStopRef.current = false;
      } else {
        // 자동으로 끝났지만 20초가 아직 남았다면 다시 시작
        try {
          recognition.start();
        } catch (error) {
          // 재시작 실패 시 완전 중지
          setIsRecording(false);
          setIsProcessing(false);
          clearAllTimers();
          setTimeLeft(20);
        }
      }
    };
    
    // 음성 인식 오류 처리
    recognition.onerror = (event) => {
      setIsRecording(false);
      setIsProcessing(false);
      clearAllTimers();
      setTimeLeft(20); // 시간 초기화
      
      toast({
        title: "음성 인식 오류",
        description: "음성을 인식하는 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      if (recognitionRef.current && isRecording) {
        recognitionRef.current.stop();
      }
      clearAllTimers();
    };
  }, [isRecording]);

  const startRecording = () => {
    if (!recognitionRef.current) {
      return;
    }
    
    setIsProcessing(true);
    setIsRecording(true);
    setTimeLeft(20);
    isManualStopRef.current = false; // 녹음 시작 시 수동 중지 플래그 초기화
    
    try {
      recognitionRef.current.start();
      
      // 최대 20초 타이머 시작
      maxTimeoutRef.current = setTimeout(() => {
        toast({
          title: "음성 인식 종료",
          description: "최대 녹음 시간(20초)에 도달했습니다.",
        });
        isManualStopRef.current = true; // 20초 타이머로 인한 중지도 수동 중지로 처리
        if (recognitionRef.current && isRecording) {
          recognitionRef.current.stop();
        }
      }, 20000);
      
      // 카운트다운 타이머 시작 (1초마다)
      countdownIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      toast({
        title: "음성 인식 오류",
        description: "음성 인식을 시작할 수 없습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
      setIsRecording(false);
      setIsProcessing(false);
      clearAllTimers();
      setTimeLeft(20);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      isManualStopRef.current = true; // 수동 중지 플래그 설정
      recognitionRef.current.stop();
    }
    clearAllTimers();
    setTimeLeft(20); // 시간 초기화
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return {
    isRecording,
    transcript,
    isProcessing,
    timeLeft,
    toggleRecording,
    startRecording,
    stopRecording,
    setTranscript,
  };
} 