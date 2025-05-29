import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { v4 as uuidv4 } from 'uuid';

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
    
    // 파일 확장자 확인
    const fileExt = file.name.split('.').pop();
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
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 