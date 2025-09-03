# Supabase Auth

- Auth : 인증
- https://supabase.com/dashboard/project/rqckhcqnpwvkjofyetzm/editor/17327?schema=public

## 1. Auth 메뉴 확인

- 왼쪽 아이콘 중 `Authentication` 선택

### 1.1 User Table 확인

- 회원에 대한 테이블명은 미리 생성이 되어있음
- `Users` 라는 테이블이 이미 존재함
- 회원가입을 하게 되면 `Users 테이블에 자동으로 추가`가 됨

### 1.2 Sign In / Providers 메뉴

- Auth Providers : 회원가입할 수 있는 여러가지 항목을 미리 제공함
- `Email 항목` 이 활성화 되어 있는지 확인

### 1.3 Email 메뉴 확인

- SMTP ( Simple Mail Transfer Protocol ) : 인터넷에서 이메일을 보내고 받는 데 사용되는 통신 프로토콜
  - 단순 메일 전송 프로토콜
  - 예 ) http : HyperText Transfer Protocol
  - 예) ftp : file Transfer Protocol
- Supabase 에는 이메일 인증을 테스트만 제공함 ( 1시간에 3번만 사용 가능, 그래서 SMTP 서버 구축 필요 )
- 추후 SMTP 서버 구축 또는 Google Service, `resend.com` 로 무료로 활용 가능
  - resend.com 을 가장 많이 활용함, 혹은 구글/카카오 로그인 제일 많이 활용
- Confirm signip 탭 : 회원가입 시 전달되는 인증메일 제목, 내용을 작성함

### 1.4 URL Configuration ※ 중요 ※

- Site URL : http://localhost:3000 번에서 `http://localhost:5173` 로 변경함 ( 추후 Vercel 주소로 변경 예정 )
- Redirect URLs : `http://localhost:5173`, `http://localhost:3000` 등으로 입력. ( 이것도 추후 Vercel 주소도 입력 )

- 여기까지 Auth 환경설정 끝

---

## 2. Auth 적용하기

- /src/lib/supabase.ts

```ts
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
```

## 3. Auth 인증 정보 관리 ( 전역에서 Session 관리 )

- /src/Contexts/AuthContext.tsx

```tsx
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
};

// 2. 인증 Context 생성 ( 인증 기능을 Children들 Component 에서 활용하게 해줌 )
const AuthContext = createContext<AuthContextType | null>(null);

// 3. 인증 Context Provider
export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // 현재 사용자 세션
  const [session, setSession] = useState<Session | null>(null);
  // 현재 로그인한 사용자 정보
  const [user, setUser] = useState<User | null>(null);

  // 실행이 되자마자 ( 초기 세션 ) 로드 및 인증 상태 변경 감시 ( 새로고침을 하던 뭘 하던 바로 작동되게끔 )
  useEffect(() => {
    // 기존 세션이 있는지 확인
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ? data.session : null);
      setUser(data.session?.user ?? null);
    });
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

  return (
    <AuthContext.Provider value={{ signUp, signOut, signIn, user, session }}>
      {children}
    </AuthContext.Provider>
  );
};

// const {signUp, signIn, signOut, user, session} = useAuth()
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('AuthContext 가 없습니다.');
  }
  return ctx;
};
```

- App.tsx

```tsx
import TodoList from './components/todos/TodoList';
import TodoWrite from './components/todos/TodoWrite';
import { AuthProvider } from './contexts/AuthContext';
import { TodoProvider } from './contexts/TodoContext';

function App() {
  return (
    <AuthProvider>
      <div>
        <h1>Todo Service</h1>
        <TodoProvider>
          <TodoWrite />
          <TodoList />
        </TodoProvider>
      </div>
    </AuthProvider>
  );
}

export default App;
```

## 4. 회원 가입 폼 만들기

- /src/pages/SignUpPage.tsx 파일 생성

```tsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function SignUpPage() {
  const { signUp } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [pw, setPw] = useState<string>('');
  const [msg, setMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 해당 코드 필수 : 웹브라우저 갱신 막아주기

    // 회원 가입 하기
    const { error } = await signUp(email, pw);
    if (error) {
      setMsg(`회원가입 오류 : ${error}`);
    } else {
      setMsg(`이메일이 발송 되었습니다. 이메일을 확인 해주세요.`);
    }
  };
  return (
    <div>
      <h2>Todo Service 회원 가입</h2>
      <div className="border">
        <form onSubmit={handleSubmit}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
          {/* <button type="button">이메일 중복 확인</button> */}
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} />
          {/* form 안에선 button type 지정해주기 */}
          <button type="submit">회원가입</button>
        </form>
        <p>{msg}</p>
      </div>
    </div>
  );
}

export default SignUpPage;
```

## 5. 로그인 폼 만들기

- /src/pages/SignInPage.tsx

```tsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function SignInPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [pw, setPw] = useState<string>('');
  const [msg, setMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 해당 코드 필수 : 웹브라우저 갱신 막아주기

    const { error } = await signIn(email, pw);
    if (error) {
      setMsg(`로그인 오류 : ${error}`);
    } else {
      setMsg(`로그인이 성공하였습니다.`);
    }
  };
  return (
    <div>
      <h2>로그인</h2>
      <div>
        <form onSubmit={handleSubmit}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} />
          <button type="submit">로그인</button>
        </form>
        <p>{msg}</p>
      </div>
    </div>
  );
}

export default SignInPage;
```

## 6. TodoPage 생성

- 목적 : 인증이 안된 사용자는 할 일 작성 못하게끔 만드려고함.
- /src/pages/TodosPage.tsx 파일 생성

```tsx
import TodoList from '../components/todos/TodoList';
import TodoWrite from '../components/todos/TodoWrite';
import { TodoProvider } from '../contexts/TodoContext';

function TodosPage() {
  return (
    <div>
      <h2>할 일</h2>
      <TodoProvider>
        <div>
          <TodoWrite />
        </div>
        <div>
          <TodoList />
        </div>
      </TodoProvider>
    </div>
  );
}

export default TodosPage;
```

## 7. 인증 페이지

- /src/pages/AuthCallback.tsx

```tsx
import React, { useEffect, useState } from 'react';

/**
 * - 인증 콜백 URL 처리
 * - 사용자에게 인증 진행 상태 안내
 * - 자동 인증 처리 완료 안내
 */

function AuthCallback() {
  const [msg, setMsg] = useState<string>('인증 처리 중 ...');
  useEffect(() => {
    const timer = setTimeout(() => {
      setMsg('이메일 인증 완료. 홈으로 이동해주세요');
    }, 1500);

    // 클린업 함수
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div>
      <h2>인증 페이지</h2>
      <div>{msg}</div>
    </div>
  );
}

export default AuthCallback;
```

## 8. Router 구성하기 ( 메뉴 구성하기 )

- App.tsx

```tsx
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthCallbackPage from './pages/AuthCallbackPage';
import HomePage from './pages/HomePage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import TodosPage from './pages/TodosPage';

const TopBar = () => {
  const { signOut, user } = useAuth();
  return (
    <nav className="bg-blue-400 text-white px-6 py-4 flex justify-between items-center">
      {/* 로고 또는 홈 */}
      <Link to="/" className="text-lg font-bold hover:text-yellow-300 transition-colors">
        홈
      </Link>

      {/* 메뉴 링크 */}
      <div className="flex space-x-4">
        {user && (
          <Link to="/todos" className="hover:text-yellow-300 transition-colors">
            할 일
          </Link>
        )}
        {!user && (
          <Link to="/signup" className="hover:text-yellow-300 transition-colors">
            회원가입
          </Link>
        )}
        {!user && (
          <Link to="/signin" className="hover:text-yellow-300 transition-colors">
            로그인
          </Link>
        )}
        {user && <button onClick={signOut}>로그아웃</button>}
      </div>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <div>
        <h1>Todo Service</h1>
        <Router>
          <TopBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/todos" element={<TodosPage />} />
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
```

## 9. 인증 ( Auth ) 에 따라서 라우터 처리하기

- 인증된 사용자 ( 로그인 사용자 허가 ) 페이지 처리하기
- /src/components/Protected.tsx 파일 생성

```tsx
/**
 * 로그인 한 사용자가 접근 할 수 있는 페이지 :
 * - 사용자 프로필 페이지
 * - 관리자 대시보드 페이지
 * - 개인 설정 페이지
 * - 구매 내역 페이지 등등
 */

import type { PropsWithChildren } from 'react';
import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';

const Protected: React.FC<PropsWithChildren> = ({ children }) => {
  const { user } = useAuth();
  // 로그인하지 않은 사용자는 로그인 페이지로 강제 이동, 로그인 한 사용자는 return <div>{children}</div>;
  if (!user) {
    return <Navigate to={'/signin'} replace />;
  }
  return <div>{children}</div>;
};

export default Protected;
```

## 10. App.tsx 에 Protected 사용하기

- App.tsx

```tsx
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthCallbackPage from './pages/AuthCallbackPage';
import HomePage from './pages/HomePage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import TodosPage from './pages/TodosPage';
import Protected from './contexts/Protected';

const TopBar = () => {
  const { signOut, user } = useAuth();
  return (
    <nav className="bg-blue-400 text-white px-6 py-4 flex justify-between items-center">
      {/* 로고 또는 홈 */}
      <Link to="/" className="text-lg font-bold hover:text-blue-900 transition-colors">
        홈
      </Link>

      {/* 메뉴 링크 */}
      <div className="flex space-x-4">
        {user && (
          <Link to="/todos" className="hover:text-blue-900 transition-colors">
            할 일
          </Link>
        )}
        {!user && (
          <Link to="/signup" className="hover:text-blue-900 transition-colors">
            회원가입
          </Link>
        )}
        {!user && (
          <Link to="/signin" className="hover:text-blue-900 transition-colors">
            로그인
          </Link>
        )}
        {user && <button onClick={signOut}>로그아웃</button>}
      </div>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <div>
        <h1>Todo Service</h1>
        <Router>
          <TopBar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            {/* Protected 로 감싸주기 */}
            <Route
              path="/todos"
              element={
                <Protected>
                  <TodosPage />
                </Protected>
              }
            />
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
```

## 11. 새로 고침을 하거나, 직접 주소를 입력 할 경우에도 사용자 정보 유지하기

- 유지는 되고 있으나, React 에서 처리 순서가 늦음
- AuthContext 에 loadding 이라는 처리를 진행해 주고, 활용함
- AuthContext.tsx

```tsx
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
};
```

## 12. Protected 에 loading 값 활용하기
