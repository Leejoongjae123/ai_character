'use client';

import { useRef, useState } from 'react';
import { useImageUpload } from '@/lib/hooks/useImageUpload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Image as ImageIcon, X } from 'lucide-react';

interface ImageUploaderProps {
  onUploadComplete?: (url: string) => void;
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
}

export function ImageUploader({ 
  onUploadComplete, 
  multiple = false, 
  maxFiles = 5,
  className = '' 
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const { uploadImage, uploadMultipleImages, isUploading, uploadProgress } = useImageUpload({
    compressionOptions: {
      quality: 0.8,
      maxWidth: 1920,
      maxHeight: 1080,
      outputFormat: 'webp'
    },
    autoCompress: true,
    maxSizeBeforeCompress: 5 // 5MB 이상일 때 자동 압축
  });

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    if (multiple) {
      const limitedFiles = fileArray.slice(0, maxFiles);
      const results = await uploadMultipleImages(limitedFiles);
      const successUrls = results
        .filter(result => result.success && result.url)
        .map(result => result.url!);
      
      setUploadedImages(prev => [...prev, ...successUrls]);
      successUrls.forEach(url => onUploadComplete?.(url));
    } else {
      const result = await uploadImage(fileArray[0]);
      if (result.success && result.url) {
        setUploadedImages([result.url]);
        onUploadComplete?.(result.url);
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          이미지 업로드
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 업로드 영역 */}
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">
            {isUploading ? '업로드 중...' : '이미지를 선택하거나 드래그하세요'}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            JPG, PNG, GIF, WebP 파일 지원 (자동 WebP 압축)
          </p>
          <Badge variant="secondary" className="mb-2">
            5MB 이상 자동 압축
          </Badge>
          {multiple && (
            <p className="text-xs text-gray-400">
              최대 {maxFiles}개 파일까지 선택 가능
            </p>
          )}
        </div>

        {/* 진행률 표시 */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>업로드 진행률</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* 업로드된 이미지 미리보기 */}
        {uploadedImages.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">업로드된 이미지</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {uploadedImages.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`업로드된 이미지 ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 숨겨진 파일 입력 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
} 