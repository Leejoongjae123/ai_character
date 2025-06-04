"use client";
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeComponentProps {
  value: string;
  size?: number;
  className?: string;
  onReady?: () => void;
}

export default function QRCodeComponent({ 
  value, 
  size = 200, 
  className = "",
  onReady
}: QRCodeComponentProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    const generateQR = async () => {
      try {
        if (value) {
          const dataUrl = await QRCode.toDataURL(value, {
            width: size,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          setQrDataUrl(dataUrl);
          setIsImageLoaded(false); // 새 QR 코드 생성 시 로드 상태 초기화
        }
      } catch (error) {
        console.log('QR 코드 생성 오류:', error);
      }
    };

    generateQR();
  }, [value, size]);

  // 이미지 로드 완료 시 onReady 콜백 호출
  const handleImageLoad = () => {
    setIsImageLoaded(true);
    if (onReady) {
      // 이미지가 완전히 렌더링될 때까지 약간의 지연 추가
      setTimeout(() => {
        onReady();
      }, 100);
    }
  };

  if (!qrDataUrl) {
    return (
      <div 
        className={`flex items-center justify-center bg-white ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="text-sm text-gray-500">QR 생성 중...</div>
      </div>
    );
  }

  return (
    <img 
      src={qrDataUrl}
      alt="QR Code"
      className={className}
      style={{ width: size, height: size }}
      crossOrigin="anonymous"
      onLoad={handleImageLoad}
      onError={() => {
        console.log('QR 코드 이미지 로드 실패');
      }}
    />
  );
} 