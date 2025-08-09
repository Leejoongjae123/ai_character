"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, useRef, useCallback } from "react";
import QRCodeComponent from "@/components/QRCode";
import { useButtonSound } from "@/app/components/ButtonSound";
import { roles } from "@/app/const/role";
import domtoimage from "dom-to-image-more";
import { toast } from "@/components/ui/use-toast";
import { MessageResponse } from "./types";

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
  const [qrCodeUrl, setQrCodeUrl] = useState(""); // QR 코드에 표시될 URL
  const [uploadUrl, setUploadUrl] = useState(""); // presigned 업로드 URL
  const [uploadToken, setUploadToken] = useState(""); // 업로드 토큰
  const [filePath, setFilePath] = useState(""); // 파일 경로 추가
  const [isImageUploadComplete, setIsImageUploadComplete] = useState(false); // 단일 상태로 변경
  const [isQrReady, setIsQrReady] = useState(false); // QR 코드 준비 상태 추가
  const [showQrInCard, setShowQrInCard] = useState(false); // 포토카드에 QR 표시 여부
  const [debugInfo, setDebugInfo] = useState<string[]>([]); // 디버깅 정보
  const [isPrinting, setIsPrinting] = useState(false); // 출력 상태 추가
  const [randomMessage, setRandomMessage] = useState<string>(""); // 랜덤 메시지 상태
  const { playSound } = useButtonSound();
  const searchParams = useSearchParams();
  const characterId = searchParams.get("character");
  const imageParam = searchParams.get("image");
  const resultImageParam = searchParams.get("resultImage");
  const photoCardRef = useRef<HTMLDivElement>(null);
  const fullScreenRef = useRef<HTMLDivElement>(null);

  // 랜덤 메시지 가져오기 함수
  const fetchRandomMessage = async () => {
    try {
      const response = await fetch('/api/messages/random');
      if (response.ok) {
        const data: MessageResponse = await response.json();
        setRandomMessage(data.message);
      }
    } catch (error) {
      // 에러 발생 시 기본 메시지 유지
      setRandomMessage("경상좌수영 수군 출전 준비 완료!");
    }
  };

  // 출력 상태를 localStorage에서 확인하고 복원
  useEffect(() => {
    const printingState = localStorage.getItem('isPrinting');
    const printingStartTime = localStorage.getItem('printingStartTime');
    
    if (printingState === 'true' && printingStartTime) {
      const startTime = parseInt(printingStartTime);
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;
      
      // 60초가 지나지 않았다면 출력 상태 유지
      if (elapsedTime < 60000) {
        setIsPrinting(true);
        
        // 남은 시간만큼 타이머 설정
        const remainingTime = 60000 - elapsedTime;
        setTimeout(() => {
          setIsPrinting(false);
          localStorage.removeItem('isPrinting');
          localStorage.removeItem('printingStartTime');
        }, remainingTime);
      } else {
        // 60초가 지났다면 상태 정리
        localStorage.removeItem('isPrinting');
        localStorage.removeItem('printingStartTime');
      }
    }
  }, []);

  // 디버깅 정보 추가 함수
  const addDebugInfo = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const debugMessage = `[${timestamp}] ${message}`;
    console.log(debugMessage);
    setDebugInfo(prev => [...prev.slice(-4), debugMessage]); // 최근 5개만 유지
  }, []);

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

  // 랜덤 메시지 로드
  useEffect(() => {
    fetchRandomMessage();
  }, []);

  // 이미지 파라미터가 있으면 QR 코드 URL 업데이트 및 상태 설정
  useEffect(() => {
    if (imageParam) {
      addDebugInfo(`이미지 파라미터 감지: ${imageParam}`);
      setQrCodeUrl(imageParam);
      setShowQrInCard(true);
    } else if (resultImageParam) {
      addDebugInfo(`결과 이미지 파라미터 감지: ${resultImageParam}`);
      // resultImageParam이 있어도 QR 코드 URL은 설정하지 않음 (새로 생성해야 함)
      setShowQrInCard(true);
      // isImageUploadComplete를 true로 설정하지 않음 - 새로운 포토카드를 업로드해야 함
    }
  }, [imageParam, resultImageParam]);

  // 페이지 로드 시 이미지가 아직 캡처되지 않았고 이미지 파라미터도 없는 경우 자동으로 프로세스 시작
  useEffect(() => {
    const autoStart = async () => {
      // 이미 프로세스가 시작되었거나 이미지 파라미터가 있는 경우 실행하지 않음
      // resultImageParam이 있는 경우에는 새로운 포토카드를 생성해야 하므로 프로세스 실행
      if (isImageUploadComplete || imageParam) return;
      
      addDebugInfo('자동 프로세스 시작 준비');
      // 렌더링이 완전히 끝난 후 실행하기 위해 충분한 지연 추가
      const timer = setTimeout(() => {
        addDebugInfo('자동 프로세스 시작');
        generatePresignedUrlAndCapture();
      }, 2000);
      
      return () => clearTimeout(timer);
    };
    
    // DOM이 준비된 후 실행
    // resultImageParam이 있어도 새로운 포토카드를 생성해야 하므로 조건에서 제외
    if (photoCardRef.current && !isImageUploadComplete && !imageParam) {
      autoStart();
    }
  }, [isImageUploadComplete, imageParam]); // resultImageParam 의존성 제거

  // 2단계: 이미지 캡처 및 업로드
  const captureAndUploadImage = useCallback(async () => {
    try {
      addDebugInfo('이미지 캡처 시작');
      setIsLoading(true);
      
      // photo-card 요소만 캡처
      const targetElement = photoCardRef.current;
      
      if (!targetElement) {
        addDebugInfo('캡처 대상 요소를 찾을 수 없음');
        return;
      }
      
      // 렌더링이 완전히 끝날 때까지 대기
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addDebugInfo('DOM to Image 변환 시작');
      // dom-to-image-more를 사용해서 이미지 생성
      const dataUrl = await domtoimage.toPng(targetElement, {
        quality: 1.0,
        bgcolor: '#ffffff',
        width: 1594,
        height: 2543,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        },
        // 이미지 캡처 품질 향상을 위한 옵션
        cacheBust: true
      });
      
      addDebugInfo('이미지 변환 완료, 업로드 준비');
      
      // dataURL을 Blob으로 변환
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // 파일 객체 생성
      const file = new File([blob], 'photo-card.png', { type: 'image/png' });
      
      // FormData 생성
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadUrl', uploadUrl);
      
      addDebugInfo(`업로드 시작 - 파일 크기: ${file.size} bytes, 업로드 URL 길이: ${uploadUrl.length}`);
      
      // presigned URL을 사용해서 이미지 업로드 (재시도 로직 추가)
      let uploadResult;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          const uploadResponse = await fetch('https://u90nizmnql.execute-api.ap-northeast-2.amazonaws.com/upload-with-presigned', {
            method: 'POST',
            body: formData,
          });
          
          addDebugInfo(`업로드 시도 ${retryCount + 1}: 응답 상태 ${uploadResponse.status}`);
          
          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            addDebugInfo(`업로드 응답 에러: ${errorText}`);
          }
          
          uploadResult = await uploadResponse.json();
          
          if (uploadResult.success) {
            addDebugInfo('이미지 업로드 성공');
            return;
          } else {
            addDebugInfo(`업로드 실패 (시도 ${retryCount + 1}): ${uploadResult.error}`);
          }
          
          break;
        } catch (networkError) {
          retryCount++;
          addDebugInfo(`업로드 네트워크 에러 (시도 ${retryCount}): ${networkError instanceof Error ? networkError.message : 'Unknown error'}`);
          
          if (retryCount < maxRetries) {
            addDebugInfo(`${2000 * retryCount}ms 후 재시도...`);
            await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
          }
        }
      }
      
      if (!uploadResult?.success) {
        addDebugInfo(`모든 업로드 시도 실패 (${maxRetries}회)`);
        // 실패해도 일단 완료 상태로 설정 (사용자 경험을 위해)
        setIsImageUploadComplete(true);
      }
      
    } catch (error) {
      addDebugInfo(`이미지 캡처 및 업로드 에러: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // 에러가 발생해도 완료 상태로 설정 (사용자 경험을 위해)
    } finally {
      setIsLoading(false);
      setIsImageUploadComplete(true);
    }
  }, [uploadUrl, addDebugInfo]);

  // QR 코드가 준비된 후 이미지 캡처 및 업로드
  useEffect(() => {
    // 이미 완료된 경우 실행하지 않음
    if (isImageUploadComplete) {
      return;
    }
    console.log("qrCodeUrl:", qrCodeUrl);
    
    if (qrCodeUrl) {
      addDebugInfo(`QR 코드 준비 완료, 이미지 캡처 시작 - isLoading: ${isLoading}`);
      
      captureAndUploadImage();
    }
  }, [qrCodeUrl]); // captureAndUploadImage 의존성 제거

  // QR 코드 준비 완료 콜백
  const handleQrReady = () => {
    addDebugInfo('QR 코드 렌더링 완료');
    setIsQrReady(true);
    
    // 대체 트리거: useEffect가 실행되지 않는 경우를 대비해 직접 호출
    if (!isImageUploadComplete && qrCodeUrl) {
      setTimeout(() => {
        addDebugInfo('대체 트리거 실행 - 직접 이미지 캡처 호출');
        captureAndUploadImage();
      }, 2000);
    }
  };

  // QR 코드 URL이 변경될 때 준비 상태 초기화
  useEffect(() => {
    if (qrCodeUrl) {
      setIsQrReady(false);
      addDebugInfo(`QR 코드 URL 설정: ${qrCodeUrl.substring(0, 50)}...`);
    }
  }, [qrCodeUrl]);

  // 1단계: presigned URL 생성 및 QR 코드 설정
  const generatePresignedUrlAndCapture = async () => {
    try {
      addDebugInfo('presigned URL 생성 시작');
      setIsLoading(true);
      
      // presigned URL 생성 요청
      const response = await fetch('/api/generate-presigned-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      addDebugInfo(`API 응답 상태: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        addDebugInfo(`API 응답 에러: ${errorText}`);
        return;
      }
      
      const result = await response.json();
      
      if (result.success) {
        addDebugInfo(`presigned URL 생성 성공: ${result.publicUrl.substring(0, 50)}...`);
        
        // 상태 업데이트
        setQrCodeUrl(result.publicUrl);
        setUploadUrl(result.uploadUrl);
        setUploadToken(result.token);
        setFilePath(result.filePath);
        setShowQrInCard(true);
        
        // URL 파라미터에 이미지 URL 추가
        const currentUrl = window.location.href;
        const url = new URL(currentUrl);
        url.searchParams.set('image', result.publicUrl);
        
        // 현재 페이지를 새 URL로 대체
        window.history.replaceState({}, '', url.toString());
        
        addDebugInfo('QR 코드 렌더링 대기 중');
        
      } else {
        addDebugInfo(`presigned URL 생성 에러: ${result.error}`);
      }
    } catch (error) {
      addDebugInfo(`presigned URL 생성 네트워크 에러: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransform = () => {
    playSound();
    
    // 출력 상태를 즉시 설정하고 localStorage에 저장
    setIsPrinting(true);
    const startTime = Date.now();
    localStorage.setItem('isPrinting', 'true');
    localStorage.setItem('printingStartTime', startTime.toString());
    
    // 상태 업데이트가 확실히 반영된 후 프린트 실행
    setTimeout(() => {
      handlePrint();
    }, 100);
    
    // 60초 후 출력 상태 해제
    setTimeout(() => {
      setIsPrinting(false);
      localStorage.removeItem('isPrinting');
      localStorage.removeItem('printingStartTime');
    }, 60000);
  };

  const handleGoHome = () => {
    playSound();
    setTimeout(() => {
      router.push("/");
    }, 300);
  };
  

  // 모든 프로세스가 완료되었는지 확인
  const isAllProcessComplete = isImageUploadComplete;

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

  // 디버깅을 위한 상태 표시
  const getStatusMessage = () => {
    return isImageUploadComplete ? '완료!' : '이미지 업로드중...';
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
              size: 245px 386px;
              margin: 0;
              padding: 0;
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
            }
            
            .print-container {
              width: 100%;
              height: 100%;
            }
            
            .print-page {
              width: 245px;
              height: 386px;
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
              background: white;
            }
            
            .print-page:last-child {
              page-break-after: avoid;
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
            
            .card-image.back {
              transform: scaleX(-1) scaleY(-1);
            }
            
            .page-info {
              position: absolute;
              top: 5px;
              right: 5px;
              font-size: 12px;
              color: #666;
              background: rgba(255,255,255,0.9);
              padding: 3px 8px;
              border-radius: 4px;
              z-index: 10;
            }
            
            /* 인쇄 시 스타일 */
            @media print {
              .page-info {
                display: none !important;
              }
              
              html, body {
                width: 100% !important;
                height: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
                overflow: visible !important;
              }
              
              .print-container {
                width: 100% !important;
                height: auto !important;
              }
              
              .print-page {
                width: 245px !important;
                height: 386px !important;
                margin: 0 !important;
                padding: 0 !important;
                page-break-after: always !important;
                page-break-inside: avoid !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
              }
              
              .print-page:last-child {
                page-break-after: auto !important;
              }
              
              .card-image {
                width: 100% !important;
                height: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                object-fit: cover !important;
                max-width: none !important;
                max-height: none !important;
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
                max-width: 350px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                z-index: 1000;
                line-height: 1.4;
              }
              
              .print-instruction h3 {
                margin: 0 0 10px 0;
                font-size: 16px;
                font-weight: bold;
              }
              
              .print-instruction ul {
                margin: 0;
                padding-left: 20px;
              }
              
              .print-instruction li {
                margin-bottom: 5px;
              }
            }
          </style>
        </head>
        <body>          
          <div class="print-container">
            <!-- 첫 번째 페이지 (앞면) -->
            <div class="print-page">
              <div class="page-info">앞면 - Page 1</div>
              <img src="${qrCodeUrl}" alt="포토카드 앞면" class="card-image" crossorigin="anonymous" />
            </div>
            
            <!-- 두 번째 페이지 (뒷면) -->
            <div class="print-page">
              <div class="page-info">뒷면 - Page 2</div>
              <img src="/back.jpg" alt="포토카드 뒷면" class="card-image back" crossorigin="anonymous" />
            </div>
          </div>
          
          <script>
            // 모든 이미지가 로드된 후 자동 인쇄 실행
            let loadedCount = 0;
            const images = document.querySelectorAll('img');
            const totalImages = images.length;
            
            function checkAllLoaded() {
              loadedCount++;
              console.log('이미지 로드됨:', loadedCount + '/' + totalImages);
              
              if (loadedCount === totalImages) {
                console.log('모든 이미지 로드 완료, 인쇄 시작');
                setTimeout(() => {
                  window.print();
                }, 1000);
              }
            }
            
            images.forEach((img, index) => {
              if (img.complete && img.naturalHeight !== 0) {
                console.log('이미지 ' + (index + 1) + ' 이미 로드됨');
                checkAllLoaded();
              } else {
                img.onload = () => {
                  console.log('이미지 ' + (index + 1) + ' 로드 완료');
                  checkAllLoaded();
                };
                img.onerror = () => {
                  console.log('이미지 ' + (index + 1) + ' 로드 실패');
                  checkAllLoaded();
                };
              }
            });
            
            // 안전장치: 5초 후에도 인쇄가 시작되지 않으면 강제 실행
            setTimeout(() => {
              if (loadedCount < totalImages) {
                console.log('타임아웃으로 인한 강제 인쇄 실행');
                window.print();
              }
            }, 5000);
            
            // 인쇄 창 닫기 이벤트 처리
            window.addEventListener('afterprint', () => {
              setTimeout(() => {
                window.close();
              }, 1000);
            });
            
            // ESC 키로 창 닫기
            document.addEventListener('keydown', (e) => {
              if (e.key === 'Escape') {
                window.close();
              }
            });
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

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
            {qrCodeUrl ? (
              <QRCodeComponent 
                value={qrCodeUrl} 
                size={380}
                className="rounded-lg border-none"
                onReady={handleQrReady}
              />
            ) : (
              <div className="w-[380px] h-[380px] bg-white flex items-center justify-center">
                <div className="text-[24px] text-gray-400">QR 준비중</div>
              </div>
            )}
          </div>
          
          <div
            className="absolute inset-0"
          >
            <img
              src={resultImageParam || character?.result || ""}
              alt={character?.title || "role1"}
              
              className="object-cover w-[1348px] h-[2050px]"
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
                <div className="text-[90px] font-bold text-[#481F0E] leading-tight text-center px-10">
                  {randomMessage}
                </div>
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
        {!isImageUploadComplete ? (
          <div className="flex flex-col items-center gap-4">
            <div className="text-[128px] text-[#451F0D] font-bold">
              이미지 업로드중...
            </div>
          </div>
        ) : isPrinting ? (
          <div className="flex flex-col items-center gap-4">
            <div className="text-[128px] text-[#451F0D] font-bold">
              출력 중입니다. 잠시만 기다려 주세요.
            </div>
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
    <Suspense fallback={<div className="w-full h-screen flex items-center justify-center text-[64px]"></div>}>
      <CompletePageContent />
    </Suspense>
  );
}
