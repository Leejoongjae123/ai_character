import { useState } from 'react';
import { compressImage, getFileSizeInMB, isImageFile, CompressionOptions } from '@/utils/imageCompression';
import { toast } from '@/utils/toast';

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  originalSize?: number;
  compressedSize?: number;
  fileName?: string;
}

interface UseImageUploadOptions {
  compressionOptions?: CompressionOptions;
  autoCompress?: boolean; // 자동 압축 여부 (기본값: true)
  maxSizeBeforeCompress?: number; // 압축 전 최대 크기 (MB, 기본값: 5)
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const {
    compressionOptions = {},
    autoCompress = true,
    maxSizeBeforeCompress = 5
  } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImage = async (file: File): Promise<UploadResult> => {
    if (!isImageFile(file)) {
      const error = '이미지 파일만 업로드 가능합니다.';
      toast.error(error);
      return { success: false, error };
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let fileToUpload = file;
      const originalSizeMB = getFileSizeInMB(file);

      // 자동 압축 조건 확인
      if (autoCompress && originalSizeMB > maxSizeBeforeCompress) {
        toast.info('이미지를 압축하고 있습니다...');
        setUploadProgress(25);
        
        try {
          fileToUpload = await compressImage(file, compressionOptions);
          const compressedSizeMB = getFileSizeInMB(fileToUpload);
          
          toast.success(
            `이미지가 압축되었습니다. (${originalSizeMB.toFixed(1)}MB → ${compressedSizeMB.toFixed(1)}MB)`
          );
        } catch (compressionError) {
          toast.warning('이미지 압축에 실패했습니다. 원본 파일로 업로드합니다.');
          fileToUpload = file;
        }
      }

      setUploadProgress(50);

      // FormData 생성
      const formData = new FormData();
      formData.append('file', fileToUpload);

      setUploadProgress(75);

      // 업로드 요청
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        const error = result.error || '업로드에 실패했습니다.';
        toast.error(error);
        return { success: false, error };
      }

      setUploadProgress(100);
      toast.success('이미지가 성공적으로 업로드되었습니다!');

      return {
        success: true,
        url: result.url,
        originalSize: file.size,
        compressedSize: fileToUpload.size,
        fileName: result.fileName,
      };

    } catch (error) {
      const errorMessage = '업로드 중 오류가 발생했습니다.';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadMultipleImages = async (files: File[]): Promise<UploadResult[]> => {
    const results: UploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      toast.info(`이미지 업로드 중... (${i + 1}/${files.length})`);
      
      const result = await uploadImage(file);
      results.push(result);
      
      // 실패한 경우 중단할지 결정 (선택사항)
      if (!result.success) {
        toast.error(`${file.name} 업로드에 실패했습니다.`);
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    toast.success(`${successCount}/${files.length}개 이미지가 업로드되었습니다.`);
    
    return results;
  };

  return {
    uploadImage,
    uploadMultipleImages,
    isUploading,
    uploadProgress,
  };
} 