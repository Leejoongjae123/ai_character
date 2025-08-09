import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // messages 테이블의 총 개수를 먼저 조회
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true });

    if (!count || count === 0) {
      return NextResponse.json({
        message: '경상좌수영 수군 출전 준비 완료!'
      });
    }

    // 0부터 count-1까지의 임의의 숫자 생성
    const randomOffset = Math.floor(Math.random() * count);

    // 임의의 offset을 사용하여 하나의 메시지를 가져옴
    const { data, error } = await supabase
      .from('messages')
      .select('messages')
      .range(randomOffset, randomOffset)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch message' },
        { status: 500 }
      );
    }

    // 데이터가 없으면 기본 메시지 반환
    if (!data) {
      return NextResponse.json({
        message: '경상좌수영 수군 출전 준비 완료!'
      });
    }

    return NextResponse.json({
      message: data.messages || '경상좌수영 수군 출전 준비 완료!'
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
