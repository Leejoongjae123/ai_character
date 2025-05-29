import { NextRequest, NextResponse } from 'next/server';
import { SpeechClient } from '@google-cloud/speech';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json({ error: '오디오 파일이 필요합니다.' }, { status: 400 });
    }

    // 파일을 버퍼로 변환
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBytes = Buffer.from(arrayBuffer);

    // Google Cloud Speech 클라이언트 초기화
    const speechClient = new SpeechClient();
    
    // 음성 인식 요청 설정
    const request = {
      audio: {
        content: audioBytes.toString('base64'),
      },
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'ko-KR',
      },
    };

    // 음성 인식 수행
    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      ?.map(result => result.alternatives?.[0]?.transcript)
      .filter(Boolean)
      .join('\n');

    return NextResponse.json({ text: transcription || '' });
  } catch (error) {
    console.log('음성 인식 오류:', error);
    return NextResponse.json({ error: '음성 인식 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 웹 브라우저 내장 SpeechRecognition API 사용을 위한 더미 라우트
// 실제 구현은 클라이언트 사이드에서 진행
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ message: 'Speech recognition is handled client-side' });
} 