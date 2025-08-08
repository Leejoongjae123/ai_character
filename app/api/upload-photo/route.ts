import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // FormData에서 파일과 파일명 추출
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;
    
    if (!file || !fileName) {
      return NextResponse.json(
        { error: '파일 또는 파일명이 누락되었습니다' },
        { status: 400 }
      );
    }

    // 파일을 ArrayBuffer로 변환
    const fileBuffer = await file.arrayBuffer();
    
    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from('pictures')
      .upload(fileName, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (error) {
      return NextResponse.json(
        { error: '파일 업로드에 실패했습니다', details: error.message },
        { status: 500 }
      );
    }

    // 업로드된 파일의 공개 URL 생성
    const { data: urlData } = supabase.storage
      .from('pictures')
      .getPublicUrl(fileName);

    // camera_history 테이블에 URL 저장
    const { error: historyError } = await supabase
      .from('camera_history')
      .insert({
        url: urlData.publicUrl
      });

    if (historyError) {
      // 히스토리 저장 실패해도 업로드는 성공으로 처리
      // 로그만 남기고 계속 진행
    }

    return NextResponse.json({
      success: true,
      fileName: fileName,
      path: data.path,
      publicUrl: urlData.publicUrl
    });

  } catch (error) {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 