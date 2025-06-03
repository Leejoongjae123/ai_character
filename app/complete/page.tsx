"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, useRef } from "react";
import QRCodeComponent from "@/components/QRCode";
import { useButtonSound } from "@/app/components/ButtonSound";
import { roles } from "@/app/const/role";
import domtoimage from "dom-to-image-more";
import { toast } from "@/components/ui/use-toast";

function CompletePageContent() {
  const router = useRouter();
  const [isMicActive, setIsMicActive] = useState(false);
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showCharacter, setShowCharacter] = useState(false);
  const [skill1Value, setSkill1Value] = useState(0);
  const [skill2Value, setSkill2Value] = useState(0);
  const [character, setCharacter] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageCaptured, setIsImageCaptured] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(""); // 기본 QR 코드 URL
  const [needsSecondCapture, setNeedsSecondCapture] = useState(false); // QR 반영 후 재캡처 필요 여부
  const [isFirstUploadComplete, setIsFirstUploadComplete] = useState(false); // 첫 번째 업로드 완료 여부
  const [isSecondUploadComplete, setIsSecondUploadComplete] = useState(false); // 두 번째 업로드 완료 여부
  const { playSound } = useButtonSound();
  const searchParams = useSearchParams();
  const characterId = searchParams.get("character");
  const imageParam = searchParams.get("image");
  const photoCardRef = useRef<HTMLDivElement>(null);
  const fullScreenRef = useRef<HTMLDivElement>(null);

  // 컴포넌트 마운트 시 역할 정보 및 랜덤 값 생성
  useEffect(() => {
    if (characterId) {
      const selectedCharacter = roles.find(role => role.id === parseInt(characterId));
      
      if (selectedCharacter) {
        setCharacter(selectedCharacter);
        
        // 스킬 값 설정 (min과 max 사이의 랜덤 값)
        const randomSkill1 = Math.floor(
          Math.random() * (selectedCharacter.skill1.max - selectedCharacter.skill1.min + 1) + 
          selectedCharacter.skill1.min
        );
        
        const randomSkill2 = Math.floor(
          Math.random() * (selectedCharacter.skill2.max - selectedCharacter.skill2.min + 1) + 
          selectedCharacter.skill2.min
        );
        
        setSkill1Value(randomSkill1);
        setSkill2Value(randomSkill2);
      } else {
        // 기본값 설정 (캐릭터를 찾지 못한 경우)
        setSkill1Value(Math.floor(Math.random() * 201 + 100)); // 100~300 사이의 랜덤 값
        setSkill2Value(Math.floor(Math.random() * 201 + 100)); // 100~300 사이의 랜덤 값
      }
    } else {
      // characterId가 없는 경우 기본값 설정
      setSkill1Value(Math.floor(Math.random() * 201 + 100)); // 100~300 사이의 랜덤 값
      setSkill2Value(Math.floor(Math.random() * 201 + 100)); // 100~300 사이의 랜덤 값
    }
  }, [characterId]);

  // 이미지 파라미터가 있으면 QR 코드 URL 업데이트 및 상태 설정
  useEffect(() => {
    if (imageParam) {
      setQrCodeUrl(imageParam);
      setIsImageCaptured(true);
      setIsFirstUploadComplete(true);
      setIsSecondUploadComplete(true); // 이미 완성된 이미지가 있다면 모든 업로드 완료로 간주
    }
  }, [imageParam]);

  // 페이지 로드 시 이미지가 아직 캡처되지 않았고 이미지 파라미터도 없는 경우 자동으로 캡처 및 업로드
  useEffect(() => {
    const autoCapture = async () => {
      // 이미지가 이미 캡처되었거나 이미지 파라미터가 이미 있는 경우 실행하지 않음
      if (isImageCaptured || imageParam) return;
      
      // 렌더링이 완전히 끝난 후 실행하기 위해 약간의 지연 추가
      const timer = setTimeout(() => {
        captureAndUploadImage();
      }, 2000); // 2초로 늘려서 QR 코드가 완전히 렌더링되도록 함
      
      return () => clearTimeout(timer);
    };
    
    // DOM이 준비된 후 실행
    if (photoCardRef.current && !isImageCaptured && !imageParam) {
      autoCapture();
    }
  }, [imageParam, isImageCaptured]);

  // QR 코드가 업데이트된 후 두 번째 캡처 실행
  useEffect(() => {
    if (needsSecondCapture && qrCodeUrl && !isLoading) {
      const timer = setTimeout(() => {
        captureAndUploadImageSecond();
      }, 2000); // QR 코드가 완전히 렌더링될 때까지 대기
      
      return () => clearTimeout(timer);
    }
  }, [needsSecondCapture, qrCodeUrl, isLoading]);

  // 화면 전체를 이미지로 변환하고 Supabase에 업로드하는 함수 (첫 번째 캡처)
  const captureAndUploadImage = async () => {
    try {
      setIsLoading(true);
      
      // photo-card 요소만 캡처
      const targetElement = photoCardRef.current;
      
      if (!targetElement) return;
      
      // QR 코드가 완전히 렌더링될 때까지 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // dom-to-image-more를 사용해서 이미지 생성
      const dataUrl = await domtoimage.toPng(targetElement, {
        quality: 1.0,
        bgcolor: '#ffffff',
        width: 1594,
        height: 2543,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });
      
      // dataURL을 Blob으로 변환
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // 파일 객체 생성
      const file = new File([blob], 'photo-card.png', { type: 'image/png' });
      
      // FormData 생성
      const formData = new FormData();
      formData.append('file', file);
      
      // API 엔드포인트로 이미지 업로드 요청
      const uploadResponse = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
      
      const result = await uploadResponse.json();
      
      if (result.success) {
        // 업로드 성공 시 QR 코드 URL 업데이트
        const imageUrl = result.url;
        setQrCodeUrl(imageUrl);
        
        // URL 파라미터에 이미지 URL 추가
        const currentUrl = window.location.href;
        const url = new URL(currentUrl);
        url.searchParams.set('image', imageUrl);
        
        // 현재 페이지를 새 URL로 대체
        router.push(url.toString());
        
        // 이미지가 캡처되었음을 표시
        setIsImageCaptured(true);
        setIsFirstUploadComplete(true);
        
        // 두 번째 캡처가 필요함을 표시
        setNeedsSecondCapture(true);
        
        // 성공 토스트 메시지 표시
 
      } else {
        console.log("에러")
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // QR 코드가 반영된 후 두 번째 캡처 (기존 URL에 덮어쓰기)
  const captureAndUploadImageSecond = async () => {
    try {
      setIsLoading(true);
      
      // photo-card 요소만 캡처
      const targetElement = photoCardRef.current;
      
      if (!targetElement) return;
      
      // QR 코드가 완전히 렌더링될 때까지 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // dom-to-image-more를 사용해서 이미지 생성
      const dataUrl = await domtoimage.toPng(targetElement, {
        quality: 1.0,
        bgcolor: '#ffffff',
        width: 1594,
        height: 2543,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });
      
      // dataURL을 Blob으로 변환
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // 파일 객체 생성
      const file = new File([blob], 'photo-card.png', { type: 'image/png' });
      
      // FormData 생성
      const formData = new FormData();
      formData.append('file', file);
      formData.append('existingUrl', qrCodeUrl); // 기존 URL을 전달하여 덮어쓰기
      
      // API 엔드포인트로 이미지 업로드 요청 (덮어쓰기)
      const uploadResponse = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
      
      const result = await uploadResponse.json();
      
      if (result.success) {
        // 두 번째 캡처 완료
        setNeedsSecondCapture(false);
        setIsSecondUploadComplete(true);
        
        
      } else {
        console.log("에러")
      }
    } catch (error) {
      console.log(error);
      
    } finally {
      setIsLoading(false);
    }
  };

  // 프린트 기능 추가 - 양면 인쇄
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      return;
    }

    if (!qrCodeUrl) {
      return;
    }

    // 양면 인쇄용 HTML 생성
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>포토카드 양면 출력</title>
          <meta charset="utf-8">
          <style>
            @page {
              size: 250px 395px;
              margin: 0;
              padding: 0;
              marks: crop cross;
            }
            
            @page :first {
              /* 첫 페이지 (앞면) 스타일 */
            }
            
            @page :nth(2) {
              /* 두 번째 페이지 (뒷면) 스타일 */
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              background: white;
              font-family: Arial, sans-serif;
              overflow: hidden;
            }
            
            .print-page {
              width: 245px;
              height: 390px;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              page-break-after: always;
              page-break-inside: avoid;
              box-sizing: border-box;
              position: relative;
              overflow: hidden;
            }
            
            .print-page:last-child {
              page-break-after: auto;
            }
            
            .card-image {
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
              object-fit: cover;
              border: none;
              outline: none;
              display: block;
            }
            
            .page-info {
              position: absolute;
              top: 2px;
              right: 2px;
              font-size: 12px;
              color: #666;
              background: rgba(255,255,255,0.8);
              padding: 2px 6px;
              border-radius: 3px;
            }
            
            /* 인쇄 시에만 보이는 스타일 */
            @media print {
              .page-info {
                display: none;
              }
              
              * {
                margin: 0 !important;
                padding: 0 !important;
              }
              
              html, body {
                width: 100% !important;
                height: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
                overflow: hidden;
              }
              
              .print-page {
                width: 245px !important;
                height: 390px !important;
                margin: 0 !important;
                padding: 0 !important;
              }
              
              .card-image {
                width: 100% !important;
                height: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                object-fit: cover !important;
              }
            }
            
            /* 화면에서만 보이는 안내 메시지 */
            @media screen {
              .print-instruction {
                position: fixed;
                top: 20px;
                left: 20px;
                background: #007bff;
                color: white;
                padding: 15px;
                border-radius: 8px;
                font-size: 14px;
                max-width: 300px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                z-index: 1000;
              }
              
              .print-instruction h3 {
                margin: 0 0 10px 0;
                font-size: 16px;
              }
              
              .print-instruction ul {
                margin: 0;
                padding-left: 20px;
              }
            }
          </style>
        </head>
        <body>
          
          <!-- 앞면 (1페이지) -->
          <div class="print-page">
            <div class="page-info">앞면</div>
            <img src="${qrCodeUrl}" alt="포토카드 앞면" class="card-image" />
          </div>
          
          <!-- 뒷면 (2페이지) -->
          <div class="print-page">
            <div class="page-info">뒷면</div>
            <img src="/back.jpg" alt="포토카드 뒷면" class="card-image" />
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    // 이미지 로드 대기 및 프린트 실행
    printWindow.onload = () => {
      const images = printWindow.document.querySelectorAll('img');
      let loadedImages = 0;
      
      const checkAllImagesLoaded = () => {
        loadedImages++;
        if (loadedImages === images.length) {
          setTimeout(() => {
            printWindow.print();
            // 인쇄 창을 바로 닫지 않고 사용자가 설정할 시간을 줌
            setTimeout(() => {
              printWindow.close();
            }, 3000);
          }, 500);
        }
      };
      
      images.forEach(img => {
        if (img.complete) {
          checkAllImagesLoaded();
        } else {
          img.onload = checkAllImagesLoaded;
          img.onerror = checkAllImagesLoaded;
        }
      });
      
      // 이미지가 없는 경우를 대비한 폴백
      if (images.length === 0) {
        setTimeout(() => {
          printWindow.print();
          setTimeout(() => {
            printWindow.close();
          }, 3000);
        }, 500);
      }
    };
  };

  const handleTransform = () => {
    playSound();
    handlePrint();
  };

  const handleGoHome = () => {
    playSound();
    setTimeout(() => {
      router.push("/");
    }, 300);
  };

  // 모든 업로드가 완료되었는지 확인
  const isAllUploadsComplete = isFirstUploadComplete && isSecondUploadComplete;

  useEffect(() => {
    if (isCountingDown && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isCountingDown && countdown === 0) {
      setShowCharacter(true);
      setTimeout(() => {
        router.push("/complete");
      }, 2000); // 캐릭터를 2초간 보여준 후 이동
    }
  }, [isCountingDown, countdown, router]);

  return (
    <div ref={fullScreenRef} className="w-full h-screen relative flex flex-col items-center justify-between">
      <Image
        src="/bg2.webp"
        alt="background"
        fill
        className="object-cover z-0"
        priority
        unoptimized
      />

      <div 
        className="flex flex-col items-center justify-center z-30 mt-[300px]"
      >
        <div
          className="text-[190px] font-bold text-center text-[#481F0E]"
          style={{ fontFamily: "MuseumClassic, serif" }}
        >
          "출전 준비 완료"
        </div>
      </div>

      <div 
        ref={photoCardRef}
        className="photo-card w-[1594px] h-[2543px] border-[10px] border-black z-20 rounded-[50px] flex flex-col items-center justify-between bg-[url('/bg2_cropped.webp')] bg-cover bg-center rounded-[50px]"
      >
        <div
          className="text-[170px] font-bold text-center text-[#481F0E] mt-[60px]"
          style={{ fontFamily: "MuseumClassic, serif" }}
        >
          {character?.title || "경상좌수사"}
        </div>
        
        <div 
          className="w-[1368px] h-[2070px] border-[10px] border-black z-20 rounded-[50px] mb-[100px] relative overflow-hidden flex flex-col items-center justify-end"
        >
          <div 
            className="qrcode absolute bottom-0 right-0 w-[460px] h-[460px] bg-white z-30 border-l-[10px] border-t-[10px] border-black rounded-tl-[50px] flex items-center justify-center"
          >
            <QRCodeComponent 
              value={qrCodeUrl} 
              size={380}
              className="rounded-lg border-none"
            />
          </div>
          
          <div
            className="absolute inset-0"
          >
            <img
              src={character?.result || ""}
              alt={character?.title || "role1"}
              
              className="object-contain w-[1348px] h-[2050px]"
            />
          </div>
          
          <div className="relative w-full h-[290px]">
            {/* 검정색 윗 테두리를 가진 겹친 div */}
            <div 
              className="absolute top-0 left-0 w-full h-[290px] border-t-[10px] border-black z-25"
            />

            <div 
              className="w-full h-[290px] z-20 bg-[#E4BE50] flex flex-row border-none relative"
            >
              {/* 네임택 위 텍스트 */}
              <div 
                className="absolute w-[814px] h-[298px] z-30 flex flex-col items-center justify-center bg-[#FFE7BB] rounded-[130px] border-[10px] border-black"
                style={{ 
                  top: '-350px',
                  left: '32.5%',
                  transform: 'translateX(-50%)',
                  fontFamily: "MuseumClassic, serif"
                }}
              >
                <p className="text-[95px] font-bold text-[#481F0E] leading-tight">
                  경상좌수영 수군
                </p>
                <p className="text-[95px] font-bold text-[#481F0E] leading-tight">
                  출전 준비 완료!
                </p>
              </div>
              
                

              <div
                className="flex-1 bg-[#E4BE50] flex flex-col items-center justify-center py-[100px] gap-y-0 border-none"
                style={{ fontFamily: "MuseumClassic, serif" }}
              >
                <p className="text-[69px] font-bold text-black leading-[150%] border-none">
                  {character?.skill1?.name || "지도력"}
                </p>
                <p className="text-[134px] font-bold text-black leading-none border-none">
                  {skill1Value} 
                </p>
              </div>
              
              {/* 구분선 */}
              <div className="flex flex-col items-center justify-center bg-[#E4BE50] border-none">
                <div className="w-[10px] h-[250px] bg-black my-[20px]"></div>
              </div>

              <div
                className="flex-1 bg-[#E4BE50] flex flex-col items-center justify-center py-[100px] gap-y-0 border-none"
                style={{ fontFamily: "MuseumClassic, serif" }}
              >
                <p className="text-[69px] font-bold text-black leading-[150%] border-none">
                  {character?.skill2?.name || "결단력"}
                </p>
                <p className="text-[134px] font-bold text-black leading-none border-none">
                  {skill2Value}
                </p>
              </div>
              <div className="w-[460px]"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div 
        className="button-container flex items-center justify-center z-30 flex-row mb-[358px] gap-x-24"
      >
        {!isAllUploadsComplete ? (
          <div className="text-[128px] text-[#451F0D] font-bold">
            이미지 업로드 중...
          </div>
        ) : (
          <>
            <div>
              <Button
                onClick={handleTransform}
                className="w-[752px] h-[281px] text-[128px] text-[#451F0D] bg-[#E4BE50] border-5 border-[#471F0D] rounded-[60px] font-bold z-20"
              >
                출력하기
              </Button>
            </div>
            
            <div>
              <Button
                onClick={handleGoHome}
                className="w-[752px] h-[281px] text-[128px] text-[#451F0D] bg-[#E4BE50] border-5 border-[#471F0D] rounded-[60px] font-bold z-20"
              >
                처음으로
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="w-full h-screen flex items-center justify-center text-[64px]">로딩 중...</div>}>
      <CompletePageContent />
    </Suspense>
  );
}
