/**
 * 주요 기능
 * - 사용자 세션관리
 * - 로그인, 회원가입, 로그아웃
 * - 사용자 인증 정보 상태 변경 감시
 * - 전역 인증 상태를 컴포넌트에 반영
 */

import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { supabase } from '../lib/supabase';

// 1. 인증 Context Type
type AuthContextType = {
  // 현재 사용자의 세션 정보 ( 로그인 상태, 토큰 )
  session: Session | null;
  // 현재 로그인 된 사용자 정보
  user: User | null;
  // 회원 가입 함수 - 개발자가 직접 수기 작성 ( 사용자의 이메일, 비밀번호를 받음 ) : 비동기라서 Promise 로 들어옴
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  // 회원 로그인 함수 - 개발자가 직접 수기 작성 ( 사용자의 이메일, 비밀번호를 받음 ) : 비동기라서 Promise 로 들어옴
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  // 회원 로그아웃
  signOut: () => Promise<void>;
  // 회원 정보 로딩 상태
  loading: boolean;
};

// 2. 인증 Context 생성 ( 인증 기능을 Children들 Component 에서 활용하게 해줌 )
const AuthContext = createContext<AuthContextType | null>(null);

// 3. 인증 Context Provider
export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // 현재 사용자 세션
  const [session, setSession] = useState<Session | null>(null);
  // 현재 로그인한 사용자 정보
  const [user, setUser] = useState<User | null>(null);
  // 로딩 상태 추가 : 초기 실행시 loading 시킴, true
  const [loading, setLoading] = useState<boolean>(true);

  // 실행이 되자마자 ( 초기 세션 ) 로드 및 인증 상태 변경 감시 ( 새로고침을 하던 뭘 하던 바로 작동되게끔 )
  useEffect(() => {
    // 세션을 초기에 로딩을 한 후 처리함
    const loadSession = async () => {
      try {
        setLoading(true); // 로딩중. 해당 코드는 굳이 안적어도 됨

        const { data } = await supabase.auth.getSession();
        setSession(data.session ? data.session : null);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.log(error);
      } finally {
        // finally : 성공해도 실행, 실패해도 실행 ( 과정이 끝나면 무조건 로딩완료함 )
        setLoading(false);
      }
    };
    loadSession();

    // // 기존 세션이 있는지 확인
    // supabase.auth.getSession().then(({ data }) => {
    //   setSession(data.session ? data.session : null);
    //   setUser(data.session?.user ?? null);
    // });

    // 인증상태 변경 이벤트를 체크함 ( 로그인, 로그아웃 , 토큰 갱신 등의 이벤트 실시간 감시 )
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });
    // Component 가 제거 되면, 이벤트 체크 해제함 : cleanUp ( return () => {} << 이렇게 생김 )
    return () => {
      // 이벤트 감시 해제
      data.subscription.unsubscribe();
    };
  }, []);

  // 회원 가입 (이메일, 비밀번호)
  const signUp: AuthContextType['signUp'] = async (email, password) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // 회원 가입 후 이메일로 인증 확인 시 리다이렉트 될 URL
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      return { error: error.message };
    }
    // 우리는 이메일 확인을 활성화 시켰음
    // 이메일 확인 후 인증 전까지는 아무것도 넘어오지 않음
    return {};
  };

  // 회원 로그인 (이메일, 비밀번호)
  const signIn: AuthContextType['signIn'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password, options: {} });
    if (error) {
      return { error: error.message };
    }
    return {};
  };
  // 회원 로그아웃
  const signOut: AuthContextType['signOut'] = async () => {
    await supabase.auth.signOut();
  };

  const value: AuthContextType = { signUp, signOut, signIn, user, session, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// const {signUp, signIn, signOut, user, session} = useAuth()
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('AuthContext 가 없습니다.');
  }
  return ctx;
};
