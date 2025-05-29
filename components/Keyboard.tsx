"use client";

import React from "react";
import { cn } from "@/lib/utils";

type KeyProps = {
  children: React.ReactNode;
  className?: string;
  width?: number; // 너비 비율 (1 = 기본 크기)
  height?: number; // 높이 비율 (1 = 기본 크기)
  onClick?: () => void;
  value?: string; // 키를 누를 때 전달되는 값
  subText?: string; // 키 상단에 표시될 작은 텍스트 (Shift 키 등에서 사용)
};

const Key: React.FC<KeyProps> = ({ 
  children, 
  className, 
  width = 1, 
  height = 1,
  onClick,
  value,
  subText
}) => {
  return (
    <button
      className={cn(
        "relative bg-white border border-gray-300 rounded-md font-medium text-sm md:text-base flex items-center justify-center",
        "shadow-[inset_0_-2px_0_rgba(0,0,0,0.2),0_1px_4px_rgba(0,0,0,0.1)]",
        "active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2),0_0_1px_rgba(0,0,0,0.1)]",
        "active:translate-y-0.5 transition-all focus:outline-none",
        className
      )}
      style={{ 
        width: `${width * 3}rem`,
        height: `${height * 3}rem`,
        backgroundImage: "linear-gradient(to bottom, #ffffff, #f5f5f5)"
      }}
      onClick={onClick}
    >
      {subText && (
        <span className="absolute top-1 left-1.5 text-[0.6rem] text-gray-500">
          {subText}
        </span>
      )}
      {children}
    </button>
  );
};

type KeyboardProps = {
  onKeyPress?: (key: string) => void;
  className?: string;
};

const Keyboard: React.FC<KeyboardProps> = ({ 
  onKeyPress, 
  className 
}) => {
  const handleKeyPress = (key: string) => {
    if (onKeyPress) {
      onKeyPress(key);
    }
  };

  // 키보드 행 정의
  const row1 = [
    { key: '`', subText: '~', value: '`' },
    { key: '1', subText: '!', value: '1' },
    { key: '2', subText: '@', value: '2' },
    { key: '3', subText: '#', value: '3' },
    { key: '4', subText: '$', value: '4' },
    { key: '5', subText: '%', value: '5' },
    { key: '6', subText: '^', value: '6' },
    { key: '7', subText: '&', value: '7' },
    { key: '8', subText: '*', value: '8' },
    { key: '9', subText: '(', value: '9' },
    { key: '0', subText: ')', value: '0' },
    { key: '-', subText: '_', value: '-' },
    { key: '=', subText: '+', value: '=' },
    { key: '⌫', value: 'backspace', width: 2 }
  ];

  const row2 = [
    { key: 'Tab', value: 'tab', width: 1.5 },
    { key: 'Q', value: 'q' },
    { key: 'W', value: 'w' },
    { key: 'E', value: 'e' },
    { key: 'R', value: 'r' },
    { key: 'T', value: 't' },
    { key: 'Y', value: 'y' },
    { key: 'U', value: 'u' },
    { key: 'I', value: 'i' },
    { key: 'O', value: 'o' },
    { key: 'P', value: 'p' },
    { key: '[', subText: '{', value: '[' },
    { key: ']', subText: '}', value: ']' },
    { key: '\\', subText: '|', value: '\\', width: 1.5 }
  ];

  const row3 = [
    { key: 'Caps', value: 'capslock', width: 1.75 },
    { key: 'A', value: 'a' },
    { key: 'S', value: 's' },
    { key: 'D', value: 'd' },
    { key: 'F', value: 'f' },
    { key: 'G', value: 'g' },
    { key: 'H', value: 'h' },
    { key: 'J', value: 'j' },
    { key: 'K', value: 'k' },
    { key: 'L', value: 'l' },
    { key: ';', subText: ':', value: ';' },
    { key: "'", subText: '"', value: "'" },
    { key: 'Enter', value: 'enter', width: 2.25 }
  ];

  const row4 = [
    { key: 'Shift', value: 'shift', width: 2.25 },
    { key: 'Z', value: 'z' },
    { key: 'X', value: 'x' },
    { key: 'C', value: 'c' },
    { key: 'V', value: 'v' },
    { key: 'B', value: 'b' },
    { key: 'N', value: 'n' },
    { key: 'M', value: 'm' },
    { key: ',', subText: '<', value: ',' },
    { key: '.', subText: '>', value: '.' },
    { key: '/', subText: '?', value: '/' },
    { key: 'Shift', value: 'shift', width: 2.75 }
  ];

  const row5 = [
    { key: 'Ctrl', value: 'ctrl', width: 1.25 },
    { key: 'Win', value: 'win', width: 1.25 },
    { key: 'Alt', value: 'alt', width: 1.25 },
    { key: ' ', value: ' ', width: 6.25 },
    { key: 'Alt', value: 'alt', width: 1.25 },
    { key: 'Fn', value: 'fn', width: 1.25 },
    { key: 'Ctrl', value: 'ctrl', width: 1.25 }
  ];

  const row6 = [
    { key: '←', value: 'left', width: 1 },
    { key: '↑', value: 'up', width: 1 },
    { key: '↓', value: 'down', width: 1 },
    { key: '→', value: 'right', width: 1 }
  ];

  return (
    <div 
      className={cn(
        "w-full max-w-5xl mx-auto p-2 select-none rounded-xl", 
        "bg-transparent backdrop-blur-sm",
        className
      )}
      style={{
        background: 'rgba(240, 240, 240, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className="grid gap-1.5 bg-transparent">
        {/* 첫 번째 줄 - 숫자 및 특수 문자 */}
        <div className="flex gap-1 justify-center">
          {row1.map((item) => (
            <Key 
              key={`${item.key}-${item.value}`} 
              width={item.width} 
              onClick={() => handleKeyPress(item.value)}
              className={
                item.key === '⌫' ? 'bg-gray-50 text-gray-700' : 'text-gray-700'
              }
              subText={item.subText}
            >
              {item.key}
            </Key>
          ))}
        </div>

        {/* 두 번째 줄 */}
        <div className="flex gap-1 justify-center">
          {row2.map((item) => (
            <Key 
              key={`${item.key}-${item.value}`} 
              width={item.width} 
              onClick={() => handleKeyPress(item.value)}
              className={
                item.key === 'Tab' || item.key === '\\' ? 'bg-gray-50 text-gray-700' : 'text-gray-700'
              }
              subText={item.subText}
            >
              {item.key}
            </Key>
          ))}
        </div>

        {/* 세 번째 줄 */}
        <div className="flex gap-1 justify-center">
          {row3.map((item) => (
            <Key 
              key={`${item.key}-${item.value}`} 
              width={item.width} 
              onClick={() => handleKeyPress(item.value)}
              className={
                item.key === 'Caps' || item.key === 'Enter' ? 'bg-gray-50 text-gray-700' : 'text-gray-700'
              }
              subText={item.subText}
            >
              {item.key}
            </Key>
          ))}
        </div>

        {/* 네 번째 줄 */}
        <div className="flex gap-1 justify-center">
          {row4.map((item) => (
            <Key 
              key={`${item.key}-${item.value}-${item.width}`} 
              width={item.width} 
              onClick={() => handleKeyPress(item.value)}
              className="bg-gray-50 text-gray-700"
              subText={item.subText}
            >
              {item.key}
            </Key>
          ))}
        </div>

        {/* 다섯 번째 줄 - 특수 키 및 스페이스바 */}
        <div className="flex gap-1 justify-center">
          {row5.map((item) => (
            <Key 
              key={`${item.key}-${item.value}-${item.width}`} 
              width={item.width} 
              onClick={() => handleKeyPress(item.value)}
              className={
                item.key === ' ' ? 'bg-white text-gray-700' : 'bg-gray-50 text-gray-700'
              }
              subText={item.subText}
            >
              {item.key === ' ' ? '' : item.key}
            </Key>
          ))}
        </div>

        {/* 여섯 번째 줄 - 방향키 */}
        <div className="flex gap-1 justify-center mt-2">
          <div className="flex-1"></div>
          <div className="flex gap-1">
            {row6.map((item) => (
              <Key 
                key={`${item.key}-${item.value}`} 
                width={item.width} 
                onClick={() => handleKeyPress(item.value)}
                className="bg-gray-50 text-gray-700"
              >
                {item.key}
              </Key>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Keyboard; 