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
          // 먼저 일반적인 QR 코드 생성
          const dataUrl = await QRCode.toDataURL(value, {
            width: size,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          
          // Canvas를 사용해서 흰색 배경을 투명하게 변환
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx!.drawImage(img, 0, 0);
            
            const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // 흰색 픽셀을 투명하게 변환
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              
              // 흰색이나 거의 흰색인 픽셀을 투명하게 만듦
              if (r > 240 && g > 240 && b > 240) {
                data[i + 3] = 0; // 알파 값을 0으로 설정 (투명)
              }
            }
            
            ctx!.putImageData(imageData, 0, 0);
            const transparentDataUrl = canvas.toDataURL('image/png');
            setQrDataUrl(transparentDataUrl);
            setIsImageLoaded(false);
          };
          
          img.src = dataUrl;
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