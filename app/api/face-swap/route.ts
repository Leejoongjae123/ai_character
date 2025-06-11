import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { faceImageUrl, characterId } = await request.json();

    if (!faceImageUrl || !characterId) {
      return NextResponse.json(
        { success: false, error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 캐릭터 이미지 URL 생성
    const baseImageUrl = `https://www.ulsanai.kr/result/result${characterId}.webp`;

    // FastAPI 서버에 얼굴 스왑 요청
    const faceSwapResponse = await fetch('https://7rdwvw8vpg.execute-api.ap-northeast-2.amazonaws.com/face-swap-with-cartoon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base_image_url: baseImageUrl,
        face_image_url: faceImageUrl,
      }),
    });

    if (!faceSwapResponse.ok) {
      return NextResponse.json(
        { success: false, error: '얼굴 스왑 요청에 실패했습니다.' },
        { status: 500 }
      );
    }

    const result = await faceSwapResponse.json();

    return NextResponse.json({
      success: true,
      jobId: result.job_id,
      message: result.message,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 