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
  const isRecordingRef = useRef(false); // 현재 녹음 상태를 ref로 추적
  const accumulatedTranscriptRef = useRef(''); // 누적된 음성인식 결과

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

  // 음성 인식 초기화 (마운트 시 한 번만 실행)
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
      let finalTranscript = accumulatedTranscriptRef.current;
      let interimTranscript = '';

      // 모든 결과를 처리하여 최종 텍스트와 임시 텍스트 분리
      for (let i = resultIndex; i < results.length; i++) {
        const result = results[i];
        const transcript = result[0].transcript;
        
        if (result.isFinal) {
          // 최종 결과는 누적된 텍스트에 추가
          finalTranscript += transcript + ' ';
          accumulatedTranscriptRef.current = finalTranscript;
        } else {
          // 임시 결과는 별도로 관리
          interimTranscript += transcript;
        }
      }

      // 화면에 표시할 텍스트는 누적된 최종 텍스트 + 현재 임시 텍스트
      const displayText = finalTranscript + interimTranscript;
      setTranscript(displayText);
    };
    
    // 음성 인식 종료 처리
    recognition.onend = () => {
      // 수동으로 중지한 경우나 20초가 지난 경우에만 완전 중지
      setTimeLeft(prev => {
        if (isManualStopRef.current || prev <= 0) {
          setIsRecording(false);
          isRecordingRef.current = false; // ref도 함께 업데이트
          setIsProcessing(false);
          clearAllTimers();
          isManualStopRef.current = false;
          // 녹음 완전 종료 시 누적된 텍스트를 최종 텍스트로 설정
          const finalText = accumulatedTranscriptRef.current.trim();
          if (finalText) {
            setTranscript(finalText);
          }
          return 20; // 시간 초기화
        } else {
          // 자동으로 끝났지만 20초가 아직 남았다면 다시 시작 (누적 텍스트는 유지)
          try {
            recognition.start();
          } catch (error) {
            // 재시작 실패 시 완전 중지
            setIsRecording(false);
            isRecordingRef.current = false; // ref도 함께 업데이트
            setIsProcessing(false);
            clearAllTimers();
            // 재시작 실패 시에도 누적된 텍스트를 최종 텍스트로 설정
            const finalText = accumulatedTranscriptRef.current.trim();
            if (finalText) {
              setTranscript(finalText);
            }
            return 20;
          }
          return prev;
        }
      });
    };
    
    // 음성 인식 오류 처리
    recognition.onerror = (event) => {
      setIsRecording(false);
      isRecordingRef.current = false; // ref도 함께 업데이트
      setIsProcessing(false);
      clearAllTimers();
      setTimeLeft(20); // 시간 초기화
      
      // 오류 발생 시에도 누적된 텍스트가 있다면 유지
      const finalText = accumulatedTranscriptRef.current.trim();
      if (finalText) {
        setTranscript(finalText);
      }
      
      toast({
        title: "음성 인식 오류",
        description: "음성을 인식하는 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      clearAllTimers();
    };
  }, []); // 의존성 배열을 빈 배열로 변경하여 마운트 시 한 번만 실행

  const startRecording = () => {
    if (!recognitionRef.current) {
      return;
    }
    
    setIsProcessing(true);
    setIsRecording(true);
    isRecordingRef.current = true; // ref도 함께 업데이트
    setTimeLeft(20);
    isManualStopRef.current = false; // 녹음 시작 시 수동 중지 플래그 초기화
    
    // 새로운 녹음 시작 시 누적 텍스트 초기화
    accumulatedTranscriptRef.current = '';
    setTranscript('');
    
    try {
      recognitionRef.current.start();
      
      // 최대 20초 타이머 시작
      maxTimeoutRef.current = setTimeout(() => {
        toast({
          title: "음성 인식 종료",
          description: "최대 녹음 시간(20초)에 도달했습니다.",
        });
        isManualStopRef.current = true; // 20초 타이머로 인한 중지도 수동 중지로 처리
        if (recognitionRef.current && isRecordingRef.current) {
          recognitionRef.current.stop();
        }
      }, 20000);
      
      // 카운트다운 타이머 시작 (1초마다)
      countdownIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // 카운트다운이 끝나면 자동으로 녹음 중지
            setTimeout(() => {
              if (recognitionRef.current && isRecordingRef.current) {
                isManualStopRef.current = true;
                recognitionRef.current.stop();
              }
            }, 0);
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
      isRecordingRef.current = false; // ref도 함께 업데이트
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
    setIsRecording(false);
    isRecordingRef.current = false; // ref도 함께 업데이트
    clearAllTimers();
    setTimeLeft(20); // 시간 초기화
    
    // 수동 중지 시에도 누적된 텍스트를 최종 텍스트로 설정
    const finalText = accumulatedTranscriptRef.current.trim();
    if (finalText) {
      setTranscript(finalText);
    }
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