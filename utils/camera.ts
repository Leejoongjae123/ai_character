import { v4 as uuidv4 } from 'uuid';

// 비디오에서 사진을 캡처하는 함수
export const capturePhotoFromVideo = (videoElement: HTMLVideoElement): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        reject(new Error('Canvas context를 생성할 수 없습니다'));
        return;
      }

      // 비디오 크기에 맞춰 캔버스 설정
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      // 비디오 프레임을 캔버스에 그리기 (좌우 반전 해제)
      context.scale(-1, 1);
      context.drawImage(videoElement, -canvas.width, 0, canvas.width, canvas.height);

      // 캔버스를 Blob으로 변환
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('사진 캡처에 실패했습니다'));
        }
      }, 'image/jpeg', 0.9);
    } catch (error) {
      reject(error);
    }
  });
};

// UUID 기반 파일명 생성
export const generatePhotoFileName = (): string => {
  const uuid = uuidv4();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `photo_${uuid}_${timestamp}.jpg`;
};

// Blob을 Data URL로 변환 (미리보기용)
export const blobToDataURL = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}; 