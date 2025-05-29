"use client";

import { useState } from "react";
import Keyboard from "@/components/Keyboard";

export default function KeyboardDemo() {
  const [inputValue, setInputValue] = useState("");

  const handleKeyPress = (key: string) => {
    if (key === 'backspace') {
      setInputValue(prev => prev.slice(0, -1));
    } else if (key === 'shift' || key === 'capslock' || key === 'ctrl' || key === 'alt' || key === 'win' || key === 'fn') {
      // 특수 키는 처리하지 않음
    } else if (key === 'enter') {
      setInputValue(prev => prev + "\n");
    } else {
      setInputValue(prev => prev + key);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">키보드 데모</h1>
      
      <div className="w-full max-w-3xl mb-8">
        <div className="bg-white rounded-lg shadow-lg p-4 min-h-32 mb-4">
          <textarea
            className="w-full h-32 resize-none border-none focus:outline-none p-2 text-gray-700"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="여기에 텍스트가 표시됩니다..."
          />
        </div>
        
        <Keyboard onKeyPress={handleKeyPress} />
      </div>
      
      <p className="text-sm text-gray-600 mt-6 text-center">
        실제 키보드와 유사한 디자인으로 만들어진 가상 키보드입니다.<br />
        키 사이 공간은 투명하게 처리되었습니다.
      </p>
    </div>
  );
} 