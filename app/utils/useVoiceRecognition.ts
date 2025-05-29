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
  const recognitionRef = useRef<SpeechRecognition | null>(null);

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
    recognition.continuous = false;
    recognition.interimResults = true;
    
    // 음성 인식 결과 처리
    recognition.onresult = (event) => {
      const lastResult = event.results[event.resultIndex];
      const transcript = lastResult[0].transcript;
      
      setTranscript(transcript);
      
      if (lastResult.isFinal) {
        setIsProcessing(false);
      }
    };
    
    // 음성 인식 종료 처리
    recognition.onend = () => {
      setIsRecording(false);
      setIsProcessing(false);
    };
    
    // 음성 인식 오류 처리
    recognition.onerror = (event) => {
      console.log('음성 인식 오류:', event);
      setIsRecording(false);
      setIsProcessing(false);
      
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
    };
  }, [isRecording]);

  const startRecording = () => {
    if (!recognitionRef.current) return;
    
    setIsProcessing(true);
    setIsRecording(true);
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      toast({
        title: "음성 인식 오류",
        description: "음성 인식을 시작할 수 없습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
      setIsRecording(false);
      setIsProcessing(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
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
    toggleRecording,
    startRecording,
    stopRecording,
    setTranscript,
  };
} 