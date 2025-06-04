import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 고유한 파일명 생성
    const fileName = `${uuidv4()}.png`;
    const filePath = `photocards/${fileName}`;
    
    // presigned URL 생성 (업로드용)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .createSignedUploadUrl(filePath, {
        upsert: true
      });
    
    if (uploadError) {
      return NextResponse.json(
        { success: false, error: uploadError.message },
        { status: 500 }
      );
    }
    
    // 공개 URL 생성 (QR 코드용)
    const { data: urlData } = await supabase.storage
      .from('images')
      .getPublicUrl(filePath);
    
    return NextResponse.json({
      success: true,
      uploadUrl: uploadData.signedUrl,
      publicUrl: urlData.publicUrl,
      fileName: fileName,
      filePath: filePath,
      token: uploadData.token
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 