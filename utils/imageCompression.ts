export interface CompressionOptions {
  quality?: number; // 0-1 사이의 값, 기본값 0.8
  maxWidth?: number; // 최대 너비, 기본값 1920
  maxHeight?: number; // 최대 높이, 기본값 1080
  outputFormat?: 'webp' | 'jpeg'; // 출력 형식, 기본값 webp
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    quality = 0.8,
    maxWidth = 1920,
    maxHeight = 1080,
    outputFormat = 'webp'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // 원본 이미지 크기
      let { width, height } = img;

      // 비율을 유지하면서 최대 크기에 맞춤
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      // 캔버스 크기 설정
      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error('Canvas context를 생성할 수 없습니다.'));
        return;
      }

      // 이미지를 캔버스에 그리기
      ctx.drawImage(img, 0, 0, width, height);

      // WebP 또는 JPEG로 압축
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('이미지 압축에 실패했습니다.'));
            return;
          }

          // 압축된 파일 생성
          const compressedFile = new File(
            [blob],
            `compressed_${Date.now()}.${outputFormat}`,
            {
              type: `image/${outputFormat}`,
              lastModified: Date.now(),
            }
          );

          resolve(compressedFile);
        },
        `image/${outputFormat}`,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('이미지를 로드할 수 없습니다.'));
    };

    // 파일을 이미지로 로드
    img.src = URL.createObjectURL(file);
  });
}

export function getFileSizeInMB(file: File): number {
  return file.size / (1024 * 1024);
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
} 