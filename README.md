# Supabase 카카오 로그인

- 인증 환경 세팅은 자주 변경됨
- 적용 시점에 다시 꼭 확인해야함.
- 참조 자료 : https://www.youtube.com/watch?v=iWQEK8pS2kU

## 1. 카카오 인증 세팅

- https://developers.kakao.com/

### 1.1. 앱 등록

- 로그인 → 앱 메뉴 → 애플리케이션 생성
- 생성된 앱 → Web 플랫폼 등록 → 사이트 등록 → `http://localhost:5173`

### 1.2. 반드시 Rest API 키를 보관

- `95d76f941be87ae67742ce6afe5d1b45`

### 1.3. 사용 설정

- 카카오 로그인 메뉴 → 일반 → `사용 설정 활성`

### 1.4. 동의 항목

- 카카오 로그인 메뉴 → 동의항목 → 개인정보 → ` 닉네임, 프로필 사진, 카카오 계정 (이메일)` 활성화

### 1.5. Redirect URI 등록

- 카카오 로그인 메뉴 → 일반 → 리다이렉트 URI
- 例 ) `http://localhost:5173/auth/callback` ( 추후 추가 설정 필요, 창 끄지 않기! )

### 1.6. Supabase 를 위한 `Client Secret` 설정 필요

- 카카오 로그인 메뉴 → 일반 → `Client Secret 발급 후 활성화`
- 시크릿 키 꼭 보관 : `T7iQG9JHYp0c3rHRg5JIAcgb4CRxLtvE`

## 2. Supabase 인증 세팅

- supabase → 프로젝트 → Authentication → Sign In / Providers 메뉴
- 스크롤 살짝 내리면 Auth Providers 항목에서 `kakao` Disabled 버튼 클릭
- Rest API Key 와 Client Secret 입력 (보관했던 키들 입력)
- Callback URL (for OAuth) 의 내용을 반드시 보관해 둬야함. (3번째 줄)
- `https://rqckhcqnpwvkjofyetzm.supabase.co/auth/v1/callback`
- 토글 Enabled 로 설정 후 Save.
- Callback URL 을 카카오 개발자의 Redirect URI 에 추가로 저장해둠.
- 그 이후 다시 Kakao 의 리다이렉트 URI 수정 버튼 클릭 후 해당 `https://rqckhcqnpwvkjofyetzm.supabase.co/auth/v1/callback` 붙여넣기.

## 3. 카카오 회원 가입 코드 적용

- 카카오 관련 문서 : https://supabase.com/docs/guides/auth/social-login/auth-kakao

### 3.1 카카오 로그인 버튼 만들기

- /src/contexts/AuthContext.tsx 카카오 로그인 기능 추가

```tsx
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
  // 카카오 로그인 함수
  signInWithKakao: () => Promise<{ error?: string }>;
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
  // 회원 로그아웃
  const signOut: AuthContextType['signOut'] = async () => {
    await supabase.auth.signOut();
  };
  // 회원 탈퇴기능
  const deleteAccount: AuthContextType['deleteAccount'] = async () => {
    try {
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
        reason: '사용자 요청',
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
        message: '계정 삭제 요청이 완료되었습니다. 관리자 승인 후 완전히 삭제됩니다.',
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
```

- /src/components/KakaoLoginButton.tsx 생성

```tsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

// 오류 메시지를 사용한 화면에 보여줄 함수
interface KakaoLoginButtonProps {
  children?: React.ReactNode;
  onError?: (error: string) => void;
}
const KakaoLoginButton = ({ onError }: KakaoLoginButtonProps) => {
  // 카카오 로그인 사용
  const { signInWithKakao } = useAuth();
  // 카카오 로그인 실행
  const handleKakaoLogin = async () => {
    try {
      const { error } = await signInWithKakao();

      if (error && onError) {
        console.log('카카오로그인 에러 메시지 : ', error);
        onError(error);
      }
    } catch (err) {
      console.log('카카오 로그인 오류 : ', err);
    }
  };
  return (
    <button
      type="button"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: '100%',
        padding: '12px 16px',
        backgroundColor: '#fee500',
        color: '#000',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.backgroundColor = '#fdd835';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.backgroundColor = '#fee500';
      }}
      onClick={handleKakaoLogin}
    >
      {/* 카카오 아이콘 SVG */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 3C6.48 3 2 6.48 2 10.5C2 13.52 4.5 16.1 8 17.5L7 21L10.5 18.5C11.3 18.7 12.1 18.8 13 18.8C18.52 18.8 23 15.32 23 11.3C23 7.28 18.52 3.8 13 3.8C12.7 3.8 12.4 3.8 12.1 3.9C12.1 3.6 12 3.3 12 3Z"
          fill="currentColor"
        />
      </svg>
      카카오 로그인
    </button>
  );
};

export default KakaoLoginButton;
```

- /src/pages/SignUpPage.tsx 수정 (업데이트)

```tsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { createProfile } from '../lib/profile';
import type { ProfileInsert } from '../types/TodoTypes';
import KakaoLoginButton from '../components/KakaoLoginButton';

function SignUpPage() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [pw, setPw] = useState<string>('');
  // 추가 정보 (닉네임)
  const [nickName, setNickName] = useState<string>('');
  const [msg, setMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // 웹 브라우저 갱신 막기
    e.preventDefault();

    if (!email.trim()) {
      alert('이메일을 입력하세요.');
      return;
    }

    if (!pw.trim()) {
      alert('비밀번호를 입력하세요.');
      return;
    }
    if (pw.length < 6) {
      alert('비밀번호는 최소 6자 이상입니다.');
      return;
    }

    if (!nickName.trim()) {
      alert('닉네임을 입력하세요.');
      return;
    }

    // 회원가입 하기 및 추가정보 입력하기
    const { error, data } = await supabase.auth.signUp({
      email,
      password: pw,
      options: {
        // 회원 가입 후 이메일로 인증 확인시 리다이렉트 될 URL
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        // 잠시 추가정보를 보관함.
        // Supabase 에서 auth 에는 추가적인 정보를 저장하는 객체가 존재
        // 공식적인 명칭은 metadata 라고 한다.
        // 이메일 인증 후에 프로필 생성시에 사용하려고 보관
        data: { nickName: nickName },
      },
    });
    if (error) {
      setMsg(`회원가입 오류 : ${error}`);
    } else {
      setMsg(
        '회원가입이 성공했습니다. 이메일 인증 링크를 확인해주세요. 인증 완료 후 프로필이 자동으로 생성됩니다.',
      );
      // 회원가입 성공했으므로 profiles 도 채워준다.
      if (data?.user?.id) {
        // 프로필을 추가한다.
        const newUser: ProfileInsert = { id: data.user.id, nickname: nickName };
        const result = await createProfile(newUser);
        if (result) {
          // 프로필 추가가 성공한 경우
          setMsg('회원가입 및 프로필 생성 성공했습니다. 이메일 인증 링크를 확인해주세요.');
        } else {
          // 프로필 추가가 실패한 경우
          setMsg('회원가입은 성공, 프로필 생성은 실패했습니다.');
        }
      } else {
        setMsg('회원가입이 성공했습니다. 이메일 인증 링크를 확인해주세요.');
      }
    }
  };
  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Todo 서비스 회원가입</h2>
        <p className="page-subtitle">새 계정을 만들어 보세요.</p>
      </div>
      <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">이메일</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="이메일"
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="비밀번호  (최소 6자)"
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">닉네임</label>{' '}
            <input
              type="text"
              value={nickName}
              onChange={e => setNickName(e.target.value)}
              placeholder="닉네임을 입력하세요"
              required
            />
          </div>
          <button type="submit" className="btn btn-success btn-lg" style={{ width: '100%' }}>
            회원가입
          </button>
        </form>
        {/* SNS 로그인 영역 */}
        <div style={{ display: 'flex', alignItems: 'center', margin: 'var(--space-6) ' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--gray-300)' }}></div>
          <span style={{ padding: '0 var(--space-4)', fontSize: '14px' }}>또는</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--gray-300)' }}></div>
        </div>
        {/* 카카오 로그인 버튼 */}
        <KakaoLoginButton onError={error => setMsg(`카카오 로그인 오류: ${error}`)} />
        {/* 메세지 출력 */}
        {msg && (
          <p
            style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: msg.includes('성공') ? 'var(--success-50)' : '#fef2f2',
              color: msg.includes('성공') ? 'var(--success-600)' : '#dc2626',
              border: `1px solid ${msg.includes('성공') ? 'var(--success-600)' : '#dc2626'}`,
            }}
          >
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}

export default SignUpPage;
```

- /src/pages/SignInPage.tsx 수정 (UI 업데이트)

```tsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import KakaoLoginButton from '../components/KakaoLoginButton';

function SignInPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [pw, setPw] = useState<string>('');
  const [msg, setMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { error } = await signIn(email, pw);
    if (error) {
      setMsg(`로그인 오류 : ${error}`);
    } else {
      setMsg('로그인 성공');
      // 바로 이동시키기
      navigate('/todos');
    }
  };
  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">🗝️ 로그인페이지</h2>
        <p className="page-subtitle">계정에 로그인하시오.</p>
      </div>

      <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">이메일</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요."
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="비밀번호를 입력하세요."
              className="form-input"
              required
            />
          </div>

          <button type="submit" className="btn btn-success btn-lg" style={{ width: '100%' }}>
            로그인
          </button>
        </form>

        {/* SNS 로그인 영역 */}
        <div style={{ display: 'flex', alignItems: 'center', margin: 'var(--space-6) 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--gray-300)' }}></div>
          <span style={{ padding: '0 var(--space-4)', fontSize: '14px' }}>또는</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--gray-300)' }}></div>
        </div>

        {/* 카카오 로그인 버튼 : 오류 메시지는 사용자도 볼 수 있어야 함.*/}
        <KakaoLoginButton onError={error => setMsg(`카카오 로그인 오류 : ${error}`)} />

        {/* 메시지 출력 */}
        {msg && (
          <p
            style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: msg.includes('성공') ? 'var(--success-50)' : '#fef2f2',
              color: msg.includes('성공') ? 'var(--success-600)' : '#dc2626',
              border: `1px solid ${msg.includes('성공') ? 'var(--success-600)' : '#dc2626'}`,
            }}
          >
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}

export default SignInPage;
```

- /src/pages/AuthCallback.tsx 수정 (카카오 로그인 후 프로필 업데이트)

```tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { createProfile } from '../lib/profile';
import { useNavigate } from 'react-router-dom';
import type { ProfileInsert } from '../types/TodoTypes';

/**
 * - 인증 콜백 URL 처리
 * - 사용자에게 인증 진행 상태 안내
 * - 자동 인증 처리 완료 안내
 */
function AuthCallback() {
  const [msg, setMsg] = useState<string>('인증 처리 중 ...');

  // 카카오 로그인 시 대기 시간 테스트
  const [countDown, setCountDown] = useState(0);
  // 리다이렉트가 가능한지 아닌지 보관
  const [shouldRedirect, setShouldRedirect] = useState(false);
  // 강제로 이동하기 위한 처리
  const navigate = useNavigate();

  // 사용자가 이메일 확인 클릭하면 실행되는 곳
  // 인증 정보에 담겨진 nickname 을 알아내서 여기서 profiles 를 추가
  const handleAuthCallback = async (): Promise<void> => {
    try {
      // URL에서 세션(웹브라우저 정보시 사라지는 데이터)에 담겨진 정보를 가져옮
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setMsg(`인증 오류 : ${error.message}`);
        return;
      }
      // 인증 데이터가 존재함.
      if (data.session?.user) {
        const user = data.session.user;

        // 카카오로 로그인 했는지 확인 필요 (kakao 는 Supabase 에서 정한 글자)
        const isKakaoLogin = user.app_metadata.provider === 'kakao';

        // 추가적인 정보 파악 가능 (metadata 라고 함.)
        let nickName = user.user_metadata.nickName;

        // 카카오 로그인인 경우 카카오에서 제공하는 정보를 사용함.
        if (isKakaoLogin && !nickName) {
          nickName =
            user.app_metadata.full_name ||
            user.app_metadata.name ||
            user.email?.split('@')[0] ||
            '카카오사용자';
        }

        // 먼저 프로필이 이미 존재하는지 확인이 필요
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        // 존재하지 않는 id 이고, nickName 내용이 있다면
        // profiles 에 insert 한다.
        if (!existingProfile && nickName) {
          // 프롤필이 없고 닉네임이 존재하므로 프로필 생성하자.
          const newProfile: ProfileInsert = { id: user.id, nickname: nickName };
          const result = await createProfile(newProfile);
          if (result) {
            // 로그인 타입으로 메세지 만들기
            const loginType = isKakaoLogin ? '카카오 로그인' : '이메일 인증';
            setMsg(`🥰 ${loginType} 완료. 프로필생 생성 성공! 홈으로 이동하세요. ^^`);
            // 리다이렉트 플래그 설정
            setShouldRedirect(true);
          } else {
            const loginType = isKakaoLogin ? '카카오 로그인' : '이메일 인증';
            setMsg(`🥰 ${loginType} 인증 완료. 프로필이 생성 실패! 관리자에게 문의하세요.`);
          }
        } else {
          const loginType = isKakaoLogin ? '카카오 로그인' : '이메일 인증';
          setMsg(`🥰 ${loginType}  인증 완료. 홈으로 이동하세요. ^^`);
          // 리다이렉트 플래그 설정
          setShouldRedirect(true);
        }
      } else {
        setMsg('🥰 인증 정보 자체가 없습니다. 다시 가입해주세요.');
      }
    } catch (err) {
      console.log(`인증 콜백 함수 처리 오류 : ${err}`);
      setMsg('🥰 인증 처리 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    // setTimeout 은 1초 뒤에 함수 실행
    const timer = setTimeout(handleAuthCallback, 1000);
    // 클린업 함수
    return () => {
      clearTimeout(timer);
    };
  }, [handleAuthCallback]);

  // 리다이렉트 처리 useEffect
  useEffect(() => {
    if (shouldRedirect) {
      // 사용자 이동에 대한 테스트를 위해서.
      setCountDown(3);
      const timer = setInterval(() => {
        setCountDown(prev => {
          if (prev <= 1) {
            clearInterval(timer); // 타이머 중지 시킴
            navigate('/todos'); // 강제로 이동시킴
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // 클린업 함수
      return () => clearInterval(timer);
    }
  }, [shouldRedirect, navigate]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          padding: '32px',
          borderRadius: '8px',
          maxWidth: '448px',
          width: '100%',
          margin: '0 16px',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', color: '#1f2937' }}>
          인증 페이지
        </h2>
        <div style={{ marginBottom: '16px', color: '#374151' }}>{msg}</div>
        {/* 카운트다운 표시 */}
        {countDown && (
          <div
            style={{
              marginTop: '16px',
              padding: '16px',
              backgroundColor: '#eff6ff',
              borderRadius: '8px',
            }}
          >
            <p
              style={{
                color: '#1d4ed8',
                fontWeight: '500',
              }}
            >
              {countDown}초 후 todos 페이지로 이동합니다...
            </p>
            <div style={{ marginTop: '8px' }}>
              <div
                style={{
                  width: '100%',
                  backgroundColor: '#dbeafe',
                  borderRadius: '9999px',
                  height: '8px',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#3b82f6',
                    height: '8px',
                    borderRadius: '9999px',
                    transition: 'width 1s ease',
                    width: `${((3 - countDown) / 3) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthCallback;
```

## 4. 카카오 회원 탈퇴 코드 적용

- /src/contexts/AuthContext.tsx

```tsx
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
```

- /src/pages/ProfilePage.tsx

```tsx
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, removeAvatar, updateProfile, uploadAvatar } from '../lib/profile';
import type { Profile, ProfileUpdate } from '../types/TodoTypes';
import Loading from '../components/Loading';

/**
 * 사용자 프로필 페이지
 * - 기본 정보 표시
 * - 정보 수정
 * - 회원탈퇴 기능 : 확인을 거치고 진행하도록
 */
function ProfilePage() {
  // 회원 기본 정보 (카카오 회원 탈퇴 추가)
  const { user, deleteAccount, unlinkKakaoAccount } = useAuth();
  // 데이터 가져오는 동안의 로딩
  const [loading, setLoading] = useState<boolean>(true);
  // 사용자 프로필
  const [profileData, setProfileData] = useState<Profile | null>(null);
  // 에러 메시지
  const [error, setError] = useState<string>('');
  // 회원 정보 수정
  const [edit, setEdit] = useState<boolean>(false);
  // 회원 닉네임 보관
  const [nickName, setNickName] = useState<string>('');

  // 사용자 아바타 이미지를 위한 상태관리
  // 이미지 업로드 상태 표현
  const [uploading, setUploading] = useState<boolean>(false);
  // 미리보기 이미지 url (문자열)
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  // 실제 파일 (바이너리)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // 사용자가 새로운 이미지 선택시 즉, 편집 중인 경우 원본 URL 보관용 문자열
  const [originalAvatarUrl, setOriginalAvartarUrl] = useState<string | null>(null);
  // 이미지 제거 요청 상태(그러나, 실제 file 제거는 수정확인 버튼 눌렀을 때 처리)
  const [imageRemovalRequest, setImageRemovalReauest] = useState<boolean>(false);
  // input type="file" 태그 참조
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 사용자 프로필 정보 가져오기
  const loadProfile = async () => {
    if (!user?.id) {
      // 사용자의 id 가 없으면 중지
      setError('사용자 정보를 찾을 수 없습니다.');
      setLoading(false);
      return;
    }
    try {
      // 사용자 정보 가져오기 ( null 일수도 있다. )
      const tempData = await getProfile(user?.id);

      if (!tempData) {
        // null 이라면
        setError('사용자 프로필 정보를 찾을 수 없습니다.');
        return;
      }
      // 사용자 정보가 있다.
      setNickName(tempData.nickname || '');
      setProfileData(tempData);
    } catch (err) {
      console.log(err);
      setError('사용자 프로필 호출 오류!!!');
    } finally {
      setLoading(false);
    }
  };

  // 프로필 데이터 업데이트
  const saveProfile = async () => {
    if (!user) {
      return;
    }
    if (!profileData) {
      return;
    }
    // 여러개가 업로드 되면 안됨
    setLoading(true);

    try {
      let imgUrl = originalAvatarUrl; // 원본 이미지 URL
      // 아바타이미지 제거라면
      if (imageRemovalRequest) {
        // storage 에 실제 이미지를 제거함.
        const success = await removeAvatar(user.id);
        if (success) {
          imgUrl = null;
        } else {
          alert('이미지 제거에 실패했습니다. 기존 이미지가 유지 됩니다.');
        }
      } else if (selectedFile) {
        // 새로운 이미지가 업로드 된다면
        const uploadedImageUrl = await uploadAvatar(selectedFile, user.id);
        if (uploadedImageUrl) {
          // 실제로 업로드 완료 후 전달받은 URL 문자열을 보관함.
          // profiles 테이블에 avatar_url 에 넣어줄 문자열
          imgUrl = uploadedImageUrl;
        } else {
          alert('이미지 업로드에 실패했습니다. 닉네임만 저장합니다.');
        }
      }

      // 실제로 업데이트 진행 부분
      const tempUpdateData: ProfileUpdate = { nickname: nickName, avatar_url: imgUrl };

      const success = await updateProfile(tempUpdateData, user.id);
      if (!success) {
        console.log('프로필 업데이트에 실패하였습니다.');
        return;
      }
      // 업데이트 성공시 초기화 진행
      setPreviewImage(null);
      setSelectedFile(null);
      setImageRemovalReauest(false);
      setOriginalAvartarUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await loadProfile();
      alert('프로필이 성공적으로 업데이트 되었습니다.');
    } catch (err) {
      console.log('프로필 업데이트 오류', err);
    } finally {
      setEdit(false);
    }
  };

  // 카카오 계정 연동 해제 (회원 탈퇴)
  const handleUnlinkKakao = async () => {
    const message =
      '카카오 계정 연동을 해제 하시겠습니까? \n\n 연동 해제 후 카카오로 다시 로그인이 불가능 합니다.';
    const isConfirm = confirm(message);

    if (isConfirm) {
      const result = await unlinkKakaoAccount();
      if (result.success) {
        alert(result.message);
        // 연동 해제 후 로그아웃 처리
        window.location.href = '/signin';
      } else if (result.error) {
        alert(`연동 해제 실패: ${result.error}`);
      }
    }
  };

  // 회원탈퇴
  const handleDeleteUser = () => {
    // 카카오 로그인 사용자인지 확인
    const isKakaoUser = user?.app_metadata.provider === 'kakao';

    const message: string = isKakaoUser
      ? '😥 카카오 계정 연동이 해제됩니다. 계정을 삭제하시겠습니까? \n\n 복구가 불가능합니다.'
      : '😥 계정을 완전히 삭제하시겠습니까? \n\n 복구가 불가능합니다.';
    let isConfirm = false;
    isConfirm = confirm(message);

    if (isConfirm) {
      deleteAccount();
    }
  };

  // 이미지 파일 선택 처리(미리보기)
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    // 파일 형식 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert(`지원하지 않는 파일 형식입니다. 허용 형식: ${allowedTypes.join(', ')}`);
      return;
    }

    // 파일 크기 검증 (5MB 제한)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert(`파일 크기가 너무 큽니다. 최대 5MB까지 업로드 가능합니다.`);
      return;
    }

    // 미리보기 생성 (파일을 글자로 변환한 것..)
    const reader = new FileReader();
    reader.onload = e => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setSelectedFile(file);
    // 새 이미지 선택 시 이미지 제거 요청 상태 초기화
    setImageRemovalReauest(false);
  };
  // 이미지 파일 선택 취소
  const handleCancelUpload = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 이미지 제거 처리
  const handleRemoveImage = () => {
    const ok = confirm('프로필 이미지를 제거하시겠습니까?');
    if (!ok) {
      return;
    }
    // 즉시 제거하지 않습니다.
    // 제거하라는 상태만 별도로 관리함.
    setImageRemovalReauest(true);
    setPreviewImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return <Loading message="프로필 정보를 불러오는 중 ..." size="lg" />;
  }
  // error 메시지 출력하기
  if (error) {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <h2 className="page-title">⚠️ 프로필 오류</h2>
        <div style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-4)' }}>{error}</div>
        <button onClick={loadProfile} className="btn btn-primary">
          재시도
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">👤 회원정보</h2>
        <p className="page-subtitle">개인 정보를 확인하고 수정하세요.</p>
      </div>
      {/* 사용자 기본 정보 섹션 */}
      <div className="card">
        <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--gray--800)' }}>📧 기본 정보</h3>

        {/* 로그인 방식 표시 */}
        <div className="form-group">
          <label className="form-label">로그인 방식</label>
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor:
                user?.app_metadata?.provider === 'kakao' ? '#FEE500' : 'var(--gray-50)',
              borderRadius: 'var(--radius-md)',
              color: user?.app_metadata?.provider === 'kakao' ? '#000000' : 'var(--gray-700)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
            }}
          >
            {user?.app_metadata?.provider === 'kakao' ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3C6.48 3 2 6.48 2 10.5C2 13.52 4.5 16.1 8 17.5L7 21L10.5 18.5C11.3 18.7 12.1 18.8 13 18.8C18.52 18.8 23 15.32 23 11.3C23 7.28 18.52 3.8 13 3.8C12.7 3.8 12.4 3.8 12.1 3.9C12.1 3.6 12 3.3 12 3Z"
                    fill="currentColor"
                  />
                </svg>
                카카오 로그인
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                    fill="currentColor"
                  />
                </svg>
                이메일 로그인
              </>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">이메일</label>
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--gray-50)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--gray-700)',
            }}
          >
            {user?.email}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">가입일</label>
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--gray-50)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--gray-700)',
            }}
          >
            {user?.created_at && new Date(user.created_at).toLocaleString()}
          </div>
        </div>
      </div>
      {/* 사용자 추가정보 */}
      <div className="card">
        <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--gray--800)' }}>
          👤 사용자 추가 정보
        </h3>
        <div className="form-group">
          <label className="form-label">아이디</label>
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--gray-50)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--gray-700)',
            }}
          >
            {profileData?.id}
          </div>
        </div>
        {edit ? (
          <>
            <div className="form-group">
              <label className="form-label">닉네임</label>
              <input
                type="text"
                value={nickName}
                onChange={e => setNickName(e.target.value)}
                className="form-input"
                placeholder="닉네임을 입력하세요."
              />
            </div>
            <div className="form-group">
              <label className="form-label">아바타 편집</label>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                {previewImage ? (
                  <div style={{ textAlign: 'center' }}>
                    <img
                      src={previewImage}
                      style={{
                        width: '120px',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '50%',
                        border: '3px solid var(--primary-500)',
                        boxShadow: 'var(--shadow-md)',
                      }}
                    />
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--primary-600)',
                        marginTop: 'var(--space-2)',
                        fontWeight: 'bold',
                      }}
                    >
                      새로운 이미지 미리보기
                    </p>
                  </div>
                ) : imageRemovalRequest ? (
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: '120px',
                        height: '120px',
                        backgroundColor: 'var(--gray-50)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '3px dashed #dc3545',
                        margin: '0 auto',
                      }}
                    >
                      <div
                        style={{
                          textAlign: 'center',
                          fontSize: '11px',
                          color: '#dc3545',
                          fontWeight: 'bold',
                        }}
                      >
                        이미지 제거됨
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: '12px',
                        color: '#dc3545',
                        marginTop: 'var(--space-2)',
                        fontWeight: 'bold',
                      }}
                    >
                      이미지가 제거되었습니다
                    </p>
                  </div>
                ) : originalAvatarUrl ? (
                  <div style={{ textAlign: 'center' }}>
                    <img
                      src={originalAvatarUrl}
                      alt="현재 아바타"
                      style={{
                        width: '120px',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '50%',
                        border: '3px solid var(--success-500)',
                        boxShadow: 'var(--shadow-md)',
                      }}
                    />
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--success-600)',
                        marginTop: 'var(--space-2)',
                        fontWeight: 'bold',
                      }}
                    >
                      현재 아바타
                    </p>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: '120px',
                        height: '120px',
                        backgroundColor: 'var(--gray-50)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '3px dashed var(--gray-400)',
                        margin: '0 auto',
                      }}
                    >
                      <div
                        style={{
                          textAlign: 'center',
                          fontSize: '11px',
                          color: 'var(--gray-500)',
                          fontWeight: 'bold',
                        }}
                      >
                        이미지 없음
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'var(--gray-500)',
                        marginTop: 'var(--space-2)',
                      }}
                    >
                      아바타 이미지를 설정해보세요
                    </p>
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageSelect}
                />
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      display: 'flex',
                      gap: 'var(--space-3)',
                      justifyContent: 'center',
                      flexWrap: 'wrap',
                      marginBottom: 'var(--space-4)',
                    }}
                  >
                    <button
                      className={`btn ${uploading ? 'btn-secondary' : 'btn-primary'}`}
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploading ? '업로드 중...' : '이미지 선택'}
                    </button>

                    {previewImage && (
                      <button
                        className={`btn btn-secondary`}
                        disabled={uploading}
                        onClick={handleCancelUpload}
                      >
                        취소
                      </button>
                    )}

                    {!previewImage && !imageRemovalRequest && originalAvatarUrl && (
                      <button
                        className="btn"
                        style={{
                          backgroundColor: uploading ? 'var(--gray-300)' : '#dc3545',
                          color: 'white',
                        }}
                        onClick={handleRemoveImage}
                      >
                        {uploading ? '처리 중...' : '이미지 제거'}
                      </button>
                    )}

                    {imageRemovalRequest && (
                      <button
                        disabled={uploading}
                        className={`btn ${uploading ? 'btn-secondary' : 'btn-success'}`}
                        onClick={() => {
                          setImageRemovalReauest(false);
                        }}
                      >
                        제거 취소
                      </button>
                    )}
                  </div>
                </div>
                <p
                  style={{
                    fontSize: '12px',
                    color: 'var(--gray-500)',
                    marginTop: 'var(--space-2)',
                    textAlign: 'center',
                  }}
                >
                  지원 형식 : JPEG, PNG, GIF (최대 5MB)
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label">닉네임</label>
              <div
                style={{
                  padding: 'var(--space-3)',
                  backgroundColor: 'var(--gray-50)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--gray-700)',
                }}
              >
                {profileData?.nickname || '닉네임이 설정되지 않았습니다'}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">🖼️ 아바타</label>
              <div style={{ textAlign: 'center' }}>
                {profileData?.avatar_url ? (
                  <img
                    src={profileData.avatar_url}
                    alt="프로필 이미지"
                    style={{
                      width: '120px',
                      height: '120px',
                      objectFit: 'cover',
                      borderRadius: '50%',
                      border: '3px solid var(--success-500)',
                      boxShadow: 'var(--shadow-md)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '120px',
                      height: '120px',
                      backgroundColor: 'var(--gray-50)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '3px dashed var(--gray-400)',
                      margin: '0 auto',
                    }}
                  >
                    <div style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: 'bold' }}>
                      이미지 없음
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <div className="form-group">
          <label className="form-label">가입일</label>
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--gray-50)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--gray-700)',
            }}
          >
            {profileData?.created_at && new Date(profileData.created_at).toLocaleString()}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 'var(--space-3)',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        {edit ? (
          <>
            <button
              className={`btn btn-lg ${uploading ? 'btn-secondary' : 'btn-primary'}`}
              disabled={uploading}
              onClick={saveProfile}
            >
              {uploading ? '저장 중...' : '수정확인'}
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => {
                setEdit(false);
                setNickName(profileData?.nickname || '');
                setPreviewImage(null);
                setSelectedFile(null);
                setImageRemovalReauest(false);
                setOriginalAvartarUrl(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            >
              수정취소
            </button>
          </>
        ) : (
          <>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => {
                setEdit(true);
                // 편집 시작 시 원본 이미지 URL 저장
                setOriginalAvartarUrl(profileData?.avatar_url || null);
                setImageRemovalReauest(false);
              }}
            >
              정보수정
            </button>
            {/* 카카오 사용자에게만 연동 해제 버튼 표시 */}
            {user?.app_metadata?.provider === 'kakao' && (
              <button
                className="btn btn-warning btn-lg"
                onClick={handleUnlinkKakao}
                style={{ backgroundColor: '#FEE500', color: '#000000', border: 'none' }}
              >
                🔗 카카오 연동 해제
              </button>
            )}

            <button className="btn btn-danger btn-lg" onClick={handleDeleteUser}>
              {user?.app_metadata?.provider === 'kakao' ? '카카오 연동 해제 & 탈퇴' : '회원탈퇴'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
```

## 5. 회원 가입 시 이메일 또는 카카오 이메일 중복 처리 방지

- /src/contexts/AuthContext.tsx 업데이트 (이메일 중복 확인 기능 추가)

```tsx

```