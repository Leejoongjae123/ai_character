'use client';

import { useState, useEffect, useRef } from 'react';

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const autoPlayAttempted = useRef(false);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [showPlayNotice, setShowPlayNotice] = useState(false);

  // 음악 재생 함수
  const playMusic = () => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setShowPlayNotice(false);
        })
        .catch(error => {
          setShowPlayNotice(true);
        });
    }
  };

  // 음악 일시정지 함수
  const pauseMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // 자동 재생 시도 함수
  const attemptAutoPlay = () => {
    if (audioRef.current && !autoPlayAttempted.current && isAudioLoaded) {
      // 볼륨 설정 (음소거로 시작하여 자동 재생 정책 우회)
      audioRef.current.muted = true;
      audioRef.current.volume = 0;
      
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // 자동 재생 성공 시, 음소거 해제 및 볼륨 조절
            setTimeout(() => {
              if (audioRef.current) {
                audioRef.current.muted = false;
                audioRef.current.volume = 0.1;
                // 볼륨 서서히 올리기
                const fadeInterval = setInterval(() => {
                  if (audioRef.current && audioRef.current.volume < 0.3) {
                    audioRef.current.volume += 0.05;
                  } else {
                    clearInterval(fadeInterval);
                  }
                }, 1000);
              }
            }, 500);
            setIsPlaying(true);
          })
          .catch(() => {
            // 자동 재생 실패 - 사용자에게 알림
            setShowPlayNotice(true);
            // 음소거 해제 (사용자가 재생 버튼 클릭할 때 정상 볼륨으로 재생)
            if (audioRef.current) {
              audioRef.current.muted = false;
              audioRef.current.volume = 0.3;
            }
          });
      }
      autoPlayAttempted.current = true;
    }
  };

  // 오디오 로드 완료 감지
  useEffect(() => {
    const handleAudioLoaded = () => {
      setIsAudioLoaded(true);
    };

    if (audioRef.current) {
      audioRef.current.addEventListener('loadeddata', handleAudioLoaded);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('loadeddata', handleAudioLoaded);
      }
    };
  }, []);

  // 오디오 로드 완료 후 자동 재생 시도
  useEffect(() => {
    if (isAudioLoaded) {
      attemptAutoPlay();
    }
  }, [isAudioLoaded]);

  // 페이지 가시성 변경 감지
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && audioRef.current && !audioRef.current.paused) {
        audioRef.current.play()
          .catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // 사용자 상호작용 이벤트 리스너 추가
  useEffect(() => {
    const handleInteraction = () => {
      if (audioRef.current && audioRef.current.paused) {
        playMusic();
      }
    };

    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });
    document.addEventListener('keydown', handleInteraction, { once: true });

    // 음악 반복 재생 처리
    const handleEnded = () => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        playMusic();
      }
    };

    if (audioRef.current) {
      audioRef.current.addEventListener('ended', handleEnded);
    }

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <audio 
        ref={audioRef}
        src="/bgm1.mp3" 
        loop 
        preload="auto"
      />
      
      {/* 재생 알림 */}
      {showPlayNotice && (
        <div className="absolute bottom-12 right-0 bg-black/80 text-white text-xs p-2 rounded-md mb-2 w-48">
          재생 버튼을 클릭하면 배경음악이 재생됩니다.
        </div>
      )}
      
      {/* 음악 컨트롤 버튼 */}
      <button
        onClick={isPlaying ? pauseMusic : playMusic}
        className="bg-black/70 hover:bg-black text-white p-2 rounded-full shadow-lg transition-all"
        title={isPlaying ? "음악 중지" : "음악 재생"}
      >
        {isPlaying ? (
          // 일시정지 아이콘
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        ) : (
          // 재생 아이콘
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        )}
      </button>
    </div>
  );
} 