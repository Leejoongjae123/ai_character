'use client';

import { useEffect, useRef } from 'react';

export default function IntroMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      // 볼륨 설정
      audioRef.current.volume = 0.5;
      
      // 자동 재생 시도
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('자동 재생이 허용되지 않았습니다.');
        });
      }
    }
    
    // 컴포넌트가 언마운트될 때 오디오 정지
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  return (
    <audio 
      ref={audioRef}
      src="/intro.wav" 
      preload="auto"
    />
  );
} 