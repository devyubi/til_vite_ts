/**
 * 주요기능
 *  - 사용자 세션관리
 *  - 로그인/회원가입/로그아웃
 *  - 사용자 인증 정보상태 변경 감시
 *  - 전역 인증 상태를 컴포넌트에 반영
 */

import type { Session, User } from '@supabase/supabase-js';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { supabase } from '../lib/supabase';
import type { DeleteRequestInsert } from '../types/TodoTypes';

// 1. 인증 컨텍스트 타입
type AuthContextType = {
  // 현재 사용자의 세션정보 (로그인 상태, 토큰)
  session: Session | null;
  // 현재 로그인 된 사용자 정보
  user: User | null;
  // 회원가입 함수(이메일, 비밀번호) : 비동기
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  // 회원 로그인 함수(이메일, 비밀번호) : 비동기
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  // 이메일 중복 확인 함수
  checkEmailExists: (email: string) => Promise<{ exist: boolean; error?: string }>;
  // 카카오 로그인 함수
  signInWithKakao: () => Promise<{ error?: string }>;
  // 카카오 계정 연동 해제 함수 (회원 탈퇴)
  unlinkKakaoAccount: () => Promise<{ error?: string; success?: boolean; message?: string }>;
  // 회원 로그아웃
  signOut: () => Promise<void>;
  // 회원정보 로딩 상태
  loading: boolean;
  // 회원 탈퇴 기능
  deleteAccount: () => Promise<{ error?: string; success?: boolean; message?: string }>;
};
// 2. 인증 컨텍스트 생성 (인증 기능을 컴포넌트에서 활용하게 해줌.)
const AuthContext = createContext<AuthContextType | null>(null);

// 3. 인증 컨텍스트 프로바이더
export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // 현재 사용자 세션
  const [session, setSession] = useState<Session | null>(null);
  // 현재 로그인한 사용자 정보
  const [user, setUser] = useState<User | null>(null);
  // 로딩 상태 추가 : 초기 실행시 로딩 상태, true
  const [loading, setLoading] = useState<boolean>(true);

  // 초기 세션 로드 및 인증 상태 변경 감시
  useEffect(() => {
    // 세션을 초기에 로딩한 후 처리 한다.
    const loadSession = async () => {
      try {
        setLoading(true); // 로딩중
        const { data } = await supabase.auth.getSession();
        setSession(data.session ? data.session : null);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.log(error);
      } finally {
        // 로딩 완료
        setLoading(false);
      }
    };
    loadSession();
    // // 기존 세션이 있는지 확인
    // supabase.auth.getSession().then(({ data }) => {
    //   setSession(data.session ? data.session : null);
    //   setUser(data.session?.user ?? null);
    // });

    // 인증상태 변경 이벤트를 체크(로그인, 로그아웃, 토큰 갱신 등의 이벤트 실시간 감시)
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });
    // 컴포넌트가 제거되면 이벤트 체크 해제 : cleanUp
    return () => {
      // 이벤트 감시 해제.
      data.subscription.unsubscribe();
    };
  }, []);
  // 회원 가입 함수
  const signUp: AuthContextType['signUp'] = async (email, password) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // 회원가입 후 이메일로 인증 확인시 리다이렉트 될 URL
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      return { error: error.message };
    }
    // 이메일 확인을 활성화 시킴
    // 이메일 확인 후 인증 전까지는 아무것도 넘어오지 않는다.
    return {};
  };
  // 회원 로그인 함수
  const signIn: AuthContextType['signIn'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password, options: {} });
    if (error) {
      return { error: error.message };
    }
    return {};
  };
  // 카카오 로그인 함수
  const signInWithKakao: AuthContextType['signInWithKakao'] = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      // 로그인 실행 후 이동 옵션
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    // 오류 발생 시 체크 해보기
    if (error) {
      return { error: error.message };
    }
    console.log('카카오 로그인 성공', data);
    return {};
  };
  // 이메일 중복 확인 함수
  // - 회원 가입 시 이메일을 먼저 파악 후, 회원가입 시도
  // - 결과에 따라서 메에지를 다양하게 출력을 한다; 라는 시나리오
  // - 좀 위험한 것은 error.message를 문자열로 비교한 것이 좀 불안함
  const checkEmailExists: AuthContextType['checkEmailExists'] = async (email: string) => {
    try {
      // 1번 방법 : supabase Auth 에서 이메일 중복 확인
      // - 일단 가짜 데이터로 회원가입을 시도 후, 그 결과로 이메일 존재를 확인하기
      // - 이메일이 존재하지만, 비밀번호가 틀린 경우
      // - 이메일이 존재하지 않는 경우
      const { data, error } = await supabase.auth.signUp({
        email,
        password: 'dummy Password 입니다.', // 더미 비밀번호로 로그인 시도
        options: {
          data: {
            temp_check: true, // 임시 확인용 플래그
          },
        },
      });
      if (error) {
        // 이메일이 존재하지만 비밀번호가 틀린경우
        if (
          error.message.includes('already registered') ||
          error.message.includes('User already registered') ||
          error.message.includes('already been registered') ||
          error.message.includes('already exists')
        ) {
          return { exist: true }; // 이미 존재하는 계정 즉, 이메일이다.
        }

        // 또 다른 오류인 경우
        if (data.user) {
          await supabase.auth.signOut(); // 다른 오류라면 로그아웃을 시켜버림
        }
        return { exist: false }; // 존재하지 않는 이메일입니다.
      }
      return { exist: false };
    } catch (err) {
      console.log('이메일 중복 확인 오류 :', err);
      return { exist: false, error: '이메일 중복 확인 중 오류가 발생했습니다.' };
    }
  };

  // 회원 로그아웃
  const signOut: AuthContextType['signOut'] = async () => {
    await supabase.auth.signOut();
  };
  // 카카오 계정 연동 해제 함수 (회원 탈퇴)
  const unlinkKakaoAccount: AuthContextType['unlinkKakaoAccount'] = async () => {
    try {
      // 카카오 로그인 사용자인지 확인
      if (user?.app_metadata.provider !== 'kakao') {
        return { error: '카카오 로그인 사용자가 아닙니다.' };
      }
      // supabase 에서 카카오 계정 연동 해제
      // 사용자의 카카오 identity 찾기
      const kakaoIdentity = user.identities?.find(item => item.provider === 'kakao');
      if (!kakaoIdentity) {
        return { error: '카카오 계정 연동 정보를 찾을 수 없습니다.' };
      }
      // 사용자의 카카오 identity 찾기 성공
      const { error } = await supabase.auth.unlinkIdentity(kakaoIdentity);
      if (error) {
        console.log('카카오 계정 연동 해제 실패 :', error.message);
        return { error: '카카오 계정 연동 해제에 실패 하였습니다.' };
      }
      // 계정 해제에 성공 시
      return {
        success: true,
        message: '카카오 계정 연동이 해제 되었습니다. 다시 로그인 해주세요.',
      };
    } catch (err) {
      console.log(`카카오 계정 연동 해제 오류:`, err);
      return { error: '카카오 계정 연동 해제 중 오류가 발생 했습니다.' };
    }
  };
  // 회원 탈퇴기능 (카카오 회원탈퇴 기능 추가)
  const deleteAccount: AuthContextType['deleteAccount'] = async () => {
    try {
      // 카카오 로그인 사용자 인지 확인
      const isKakaoUser = user?.app_metadata.provider === 'kakao';
      // 기존에 사용한 데이터들을 먼저 정리한다.
      const { error: profileError } = await supabase.from('profiles').delete().eq('id', user?.id);
      if (profileError) {
        console.log('프로필 삭제 실패 : ', profileError.message);
        return { error: '프로필 삭제에 실패했습니다.' };
      }

      // 탈퇴 신청 데이터 추가
      // account_deletion_requests 에 Pending 으로 Insert 한다.
      // 등록할 삭제 데이터
      const deleteInfo: DeleteRequestInsert = {
        user_email: user?.email as string,
        user_id: user?.id,
        reason: isKakaoUser ? '카카오 회원 탈퇴 요청' : '사용자 요청',
        status: 'pending',
      };
      const { error: deleteRequestError } = await supabase
        .from('account_deletion_requests')
        .insert([{ ...deleteInfo }]);

      if (deleteRequestError) {
        console.log('탈퇴 목록 추가 실패 : ', deleteRequestError.message);
        return { error: '탈퇴 목록 추가에 실패했습니다.' };
      }

      // 만약 SMTP 서버 구축이 가능하다면 관리자에게 이메일 전송하는 자리

      // 로그아웃 시킴
      await signOut();

      return {
        success: true,
        message: isKakaoUser
          ? '카카오 계정 연동이 해제 되었습니다. 계정 삭제가 요청되었습니다.'
          : '계정 삭제 요청이 완료되었습니다. 관리자 승인 후 완전히 삭제됩니다.',
      };
    } catch (err) {
      console.log('탈퇴 요청 기능 오류 : ', err);
      return { error: '계정 탈퇴 처리 중 오류가 발생하였습니다' };
    }
  };

  const value: AuthContextType = {
    signUp,
    signIn,
    signInWithKakao,
    checkEmailExists,
    unlinkKakaoAccount,
    signOut,
    user,
    session,
    loading,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// const {} = useAuth;
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('AuthContext 가 없습니다.');
  }
  return ctx;
};
