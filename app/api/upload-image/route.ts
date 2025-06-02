import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { v4 as uuidv4 } from 'uuid';

// 파일 크기 제한 (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // FormData에서 파일 및 기존 URL 추출
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const existingUrl = formData.get('existingUrl') as string | null;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: '파일이 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    // 파일 크기 확인
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          success: false, 
          error: `파일 크기가 너무 큽니다. 최대 ${MAX_FILE_SIZE / (1024 * 1024)}MB까지 업로드 가능합니다.` 
        },
        { status: 413 }
      );
    }

    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: '이미지 파일만 업로드 가능합니다.' },
        { status: 400 }
      );
    }
    
    let filePath: string;
    let fileName: string;
    
    // 기존 URL이 있으면 해당 파일 경로 추출, 없으면 새 파일명 생성
    if (existingUrl) {
      // 기존 URL에서 파일 경로 추출
      const url = new URL(existingUrl);
      const pathParts = url.pathname.split('/');
      // URL 구조: /storage/v1/object/public/images/photocards/filename.ext
      const filePathIndex = pathParts.findIndex(part => part === 'photocards');
      if (filePathIndex !== -1 && filePathIndex < pathParts.length - 1) {
        fileName = pathParts[filePathIndex + 1];
        filePath = `photocards/${fileName}`;
      } else {
        // 파일 경로를 추출할 수 없는 경우 새 파일명 생성
        const originalExt = file.name.split('.').pop();
        const isWebP = file.type === 'image/webp';
        const fileExt = isWebP ? 'webp' : originalExt;
        fileName = `${uuidv4()}.${fileExt}`;
        filePath = `photocards/${fileName}`;
      }
    } else {
      // 새 파일명 생성
      const originalExt = file.name.split('.').pop();
      const isWebP = file.type === 'image/webp';
      const fileExt = isWebP ? 'webp' : originalExt;
      fileName = `${uuidv4()}.${fileExt}`;
      filePath = `photocards/${fileName}`;
    }
    
    // 파일을 ArrayBuffer로 변환
    const fileBuffer = await file.arrayBuffer();
    
    // Supabase Storage에 업로드 (기존 파일이 있으면 덮어쓰기)
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true, // 기존 파일이 있으면 덮어쓰기
      });
    
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    
    // 공개 URL 생성
    const { data: urlData } = await supabase.storage
      .from('images')
      .getPublicUrl(filePath);
    
    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      originalSize: file.size,
      compressedSize: file.size, // 클라이언트에서 압축된 경우
      fileName: fileName,
      isOverwrite: !!existingUrl, // 덮어쓰기 여부
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 