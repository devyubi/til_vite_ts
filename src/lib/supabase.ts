import { createClient } from '@supabase/supabase-js';

// CRA 의 환경 변수 호출과는 형식이 다름. (meta)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// 회원 인증 Auth 기능 추가하기
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 웹브라우저에 탭이 열려 있는 동안 로그인 인증 토큰(글자) 자동 갱신
    autoRefreshToken: true, // false 일 경우 자동으로 로그아웃이 됨
    // 사용자 세션 정보를 localStorage 에 저장해서 웹브라우저 새로고침 시에도 로그인 유지
    persistSession: true,
    // URL 인증 세션을 파악해서 Auth 로그인 등의 콜백을 처리한다
    detectSessionInUrl: true,
  },
});
