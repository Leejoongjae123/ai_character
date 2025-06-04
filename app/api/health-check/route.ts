import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { checkRequiredEnvVars, logEnvStatus } from '@/utils/env-check';

export async function GET(request: NextRequest) {
  try {
    // 환경 변수 체크
    const envCheck = checkRequiredEnvVars();
    logEnvStatus();

    if (!envCheck.isValid) {
      return NextResponse.json({
        status: 'error',
        message: '환경 변수가 누락되었습니다',
        envCheck,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Supabase 연결 테스트
    const supabase = await createClient();
    
    // Storage 버킷 접근 테스트
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      return NextResponse.json({
        status: 'error',
        message: 'Supabase Storage 연결 실패',
        error: bucketsError.message,
        envCheck,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // images 버킷 존재 확인
    const imagesBucket = buckets?.find(bucket => bucket.name === 'images');
    
    if (!imagesBucket) {
      return NextResponse.json({
        status: 'warning',
        message: 'images 버킷을 찾을 수 없습니다',
        availableBuckets: buckets?.map(b => b.name) || [],
        envCheck,
        timestamp: new Date().toISOString()
      }, { status: 200 });
    }

    // presigned URL 생성 테스트
    const testPath = `test/health-check-${Date.now()}.txt`;
    const { data: signedData, error: signedError } = await supabase.storage
      .from('images')
      .createSignedUploadUrl(testPath, { upsert: true });

    if (signedError) {
      return NextResponse.json({
        status: 'error',
        message: 'presigned URL 생성 실패',
        error: signedError.message,
        envCheck,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'healthy',
      message: '모든 시스템이 정상 작동 중입니다',
      envCheck,
      supabase: {
        connected: true,
        bucketsCount: buckets?.length || 0,
        imagesBucketExists: true,
        presignedUrlGeneration: true
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('헬스 체크 에러:', error);
    
    return NextResponse.json({
      status: 'error',
      message: '헬스 체크 중 오류가 발생했습니다',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 