import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const token = formData.get('token') as string | null;
    const filePath = formData.get('filePath') as string | null;
    
    if (!file || !token || !filePath) {
      return NextResponse.json(
        { success: false, error: '파일, 토큰 또는 파일 경로가 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Supabase의 uploadToSignedUrl 메서드 사용
    const { data, error } = await supabase.storage
      .from('images')
      .uploadToSignedUrl(filePath, token, file);
    
    if (error) {
      return NextResponse.json(
        { success: false, error: `업로드 실패: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: '업로드 완료',
      data: data
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 