import { NextRequest, NextResponse } from 'next/server';

interface Params {
  jobId: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { jobId } = await params;

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // FastAPI 서버에서 작업 상태 확인
    const jobStatusResponse = await fetch(`https://7rdwvw8vpg.execute-api.ap-northeast-2.amazonaws.com/job/${jobId}`, {
      method: 'GET',
    });

    if (!jobStatusResponse.ok) {
      return NextResponse.json(
        { success: false, error: '작업 상태 확인에 실패했습니다.' },
        { status: 500 }
      );
    }

    const result = await jobStatusResponse.json();

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 