'use client'

import { useEffect, useState, memo } from "react";

interface CountdownOverlayProps {
  isCountingDown: boolean;
  onCountdownComplete: () => void;
}

const CountdownOverlayInner = ({ isCountingDown, onCountdownComplete }: CountdownOverlayProps) => {
  const [countdown, setCountdown] = useState(1);

  useEffect(() => {
    if (isCountingDown) {
      setCountdown(1);
      
      const timers: NodeJS.Timeout[] = [];
      
      // 1초 후 2로 변경
      timers.push(setTimeout(() => setCountdown(2), 1000));
      
      // 2초 후 3으로 변경
      timers.push(setTimeout(() => setCountdown(3), 2000));
      
      // 3초 후 카운트다운 완료
      timers.push(setTimeout(() => {
        onCountdownComplete();
      }, 3000));
      
      return () => {
        timers.forEach(timer => clearTimeout(timer));
      };
    }
  }, [isCountingDown, onCountdownComplete]);

  if (!isCountingDown || countdown > 3) {
    return null;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
      <div className="text-[400px] font-bold text-white z-40 animate-pulse drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]">
        {countdown}
      </div>
    </div>
  );
};

export const CountdownOverlay = memo(CountdownOverlayInner);
