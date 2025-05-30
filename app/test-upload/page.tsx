'use client';

import { useState } from 'react';
import { ImageUploader } from '@/components/ImageUploader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TestUploadPage() {
  const [singleImageUrl, setSingleImageUrl] = useState<string>('');
  const [multipleImageUrls, setMultipleImageUrls] = useState<string[]>([]);

  const handleSingleUpload = (url: string) => {
    setSingleImageUrl(url);
  };

  const handleMultipleUpload = (url: string) => {
    setMultipleImageUrls(prev => [...prev, url]);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">이미지 업로드 테스트</h1>
        <p className="text-gray-600">
          WebP 자동 압축 기능이 포함된 이미지 업로드를 테스트해보세요
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 단일 이미지 업로드 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">단일 이미지 업로드</h2>
          <ImageUploader
            onUploadComplete={handleSingleUpload}
            multiple={false}
          />
          
          {singleImageUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">업로드 결과</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <img
                    src={singleImageUrl}
                    alt="업로드된 이미지"
                    className="w-full max-w-md mx-auto rounded-lg border"
                  />
                  <div className="text-sm text-gray-600 break-all">
                    <strong>URL:</strong> {singleImageUrl}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 다중 이미지 업로드 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">다중 이미지 업로드</h2>
          <ImageUploader
            onUploadComplete={handleMultipleUpload}
            multiple={true}
            maxFiles={5}
          />
          
          {multipleImageUrls.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  업로드 결과
                  <Badge variant="secondary">
                    {multipleImageUrls.length}개
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {multipleImageUrls.map((url, index) => (
                    <div key={index} className="space-y-2">
                      <img
                        src={url}
                        alt={`업로드된 이미지 ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <div className="text-xs text-gray-600 break-all">
                        {url}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 기능 설명 */}
      <Card>
        <CardHeader>
          <CardTitle>주요 기능</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-green-600">✅ 자동 압축</h3>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• 5MB 이상 파일 자동 WebP 압축</li>
                <li>• 최대 1920x1080 해상도로 리사이즈</li>
                <li>• 80% 품질로 압축하여 용량 최적화</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-blue-600">🚀 향상된 업로드</h3>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• 드래그 앤 드롭 지원</li>
                <li>• 실시간 진행률 표시</li>
                <li>• 다중 파일 업로드</li>
                <li>• 미리보기 및 삭제 기능</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 