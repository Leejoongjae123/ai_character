import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { v4 as uuidv4 } from 'uuid';

// 파일 크기 제한 (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // FormData에서 파일 추출
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
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
    
    // 파일 확장자 확인 및 WebP 처리
    const originalExt = file.name.split('.').pop();
    const isWebP = file.type === 'image/webp';
    const fileExt = isWebP ? 'webp' : originalExt;
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `photocards/${fileName}`;
    
    // 파일을 ArrayBuffer로 변환
    const fileBuffer = await file.arrayBuffer();
    
    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false, // 중복 파일명 방지
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
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 