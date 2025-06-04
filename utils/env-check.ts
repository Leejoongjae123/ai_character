// 환경 변수 검증 유틸리티

export interface EnvCheckResult {
  isValid: boolean;
  missing: string[];
  present: string[];
}

export function checkRequiredEnvVars(): EnvCheckResult {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  const missing: string[] = [];
  const present: string[] = [];

  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      missing.push(varName);
    } else {
      present.push(varName);
    }
  });

  return {
    isValid: missing.length === 0,
    missing,
    present
  };
}

export function logEnvStatus(): void {
  const result = checkRequiredEnvVars();
  
  console.log('=== 환경 변수 상태 ===');
  console.log('설정된 변수:', result.present);
  console.log('누락된 변수:', result.missing);
  console.log('상태:', result.isValid ? '✅ 정상' : '❌ 문제 있음');
  
  if (!result.isValid) {
    console.error('누락된 환경 변수가 있습니다:', result.missing);
  }
}

// 클라이언트 측에서 사용할 수 있는 환경 변수 체크
export function checkClientEnvVars(): EnvCheckResult {
  if (typeof window === 'undefined') {
    // 서버 사이드에서는 process.env 사용
    return checkRequiredEnvVars();
  }

  // 클라이언트 사이드에서는 NEXT_PUBLIC_ 변수만 접근 가능
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  const missing: string[] = [];
  const present: string[] = [];

  requiredVars.forEach(varName => {
    // 클라이언트에서는 window 객체를 통해 확인
    const value = (window as any).__NEXT_DATA__?.env?.[varName] || 
                  process.env[varName];
    
    if (!value || value.trim() === '') {
      missing.push(varName);
    } else {
      present.push(varName);
    }
  });

  return {
    isValid: missing.length === 0,
    missing,
    present
  };
} 