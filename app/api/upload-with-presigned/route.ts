import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const uploadUrl = formData.get('uploadUrl') as string | null;
    
    if (!file || !uploadUrl) {
      return NextResponse.json(
        { success: false, error: '파일 또는 업로드 URL이 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    // 파일을 ArrayBuffer로 변환
    const fileBuffer = await file.arrayBuffer();
    
    // presigned URL에 직접 PUT 요청
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: fileBuffer,
      headers: {
        'Content-Type': file.type,
        'Content-Length': file.size.toString(),
      },
    });
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      return NextResponse.json(
        { success: false, error: `업로드 실패: ${uploadResponse.status} - ${errorText}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: '업로드 완료',
      status: uploadResponse.status
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: `서버 오류가 발생했습니다: ${error}` },
      { status: 500 }
    );
  }
} 