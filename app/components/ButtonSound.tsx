'use client';

import { useRef, useState, useEffect } from 'react';

export function useButtonSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // 컴포넌트가 마운트될 때 오디오 요소 생성
  useEffect(() => {
    audioRef.current = new Audio('/button.mp3');
    audioRef.current.preload = 'auto';
    
    // 컴포넌트가 언마운트될 때 오디오 요소 정리
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      // 오디오 요소를 처음부터 재생하기 위해 currentTime 초기화
      audioRef.current.currentTime = 0;
      // 볼륨 설정
      audioRef.current.volume = 0.8;
      // 효과음 재생
      audioRef.current.play().catch(error => {
        console.log('효과음 재생에 실패했습니다.');
      });
    }
  };

  return { playSound };
} 