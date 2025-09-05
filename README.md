# Supabase 회원 탈퇴

- 기본 제공되는 탈퇴 기능
  - `supabase.auth.admin.deleteUser()`
  - 관리자 전용 ( 서버에서만 실행됨 )
  - react 는 클라이언트 즉, 웬브라우저 전용이라서 실행 불가
  - 보안상 위험 : 실수로 지울 가능성
  - 복구 불가
- 탈퇴 기능
  - 사용자 비활성
  - 30일 후 삭제가 일반적으로 진행됨

## 1. React 에서는 관리자가 수작업으로 삭제

- profiles 및 사용자가 등록한 테이블에서 제거 진행
- 사용자 삭제 수작업 실행
- `탈퇴 신청한 사용자 목록을 관리할 테이블`이 필요함

## 2. DB 테이블 생성 및 업데이트 진행

- 탈퇴 신청 사용자 테이블 ( SQL Editor )

```sql
-- 탈퇴 신청한 사용자 목록 테이블
CREATE TABLE account_deletion_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- PK, 중복이 되지 않는 ID 생성 ( DEFAULT gen_random_uuid() )
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- auth.users(id) 가 삭제 되면, 같이 삭제해줌 ( 관리자가 수작업으로 삭제하면 같이 삭제됨 )
  user_email TEXT NOT NULL, -- 탈퇴 신청자의 email 을 담아둠
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 신청한 날짜
  reason TEXT, -- 사유
  -- status : 현재 탈퇴 신청 진행 상태
  -- 기본은 Pending (default값으로) : 처리중
  -- 탈퇴 승인 approved : 승인
  -- 탈퇴 거부 rejected : 거절
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,  -- 관리자가 메세지를 남겨서 승인 / 거절 사유 등을 기록함
  processed_at TIMESTAMP WITH TIME ZONE, -- 요청을 처리한 시간
  processed_by UUID REFERENCES auth.users(id) -- 요청을 처리한 관리자 ID
);
```

```sql
-- Supabase Dashboard에서 실행
CREATE TABLE account_deletion_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES auth.users(id)
);
```

## 3. dummy 회원 가입 시키기

- https://tmailor.com/ko/
- 5명 정도 가입 시켜봄

## 4. 관리자와 일반 회원을 구분함

- `실제 관리자 이메일` 을 설정하고 진행

```tsx
const isAdmin = user?.email === 'lynn9702@naver.com'; // 관리자 이메일 입력
```

- App.tsx

```tsx
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AuthCallbackPage from './pages/AuthCallbackPage';
import HomePage from './pages/HomePage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import TodosPage from './pages/TodosPage';
import Protected from './contexts/Protected';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

const TopBar = () => {
  const { signOut, user } = useAuth();
  // 관리자인 경우 메뉴 추가로 출력하기
  // isAdmin 에는 boolean 임. ( true / false )
  const isAdmin = user?.email === 'lynn9702@naver.com'; // 관리자 이메일 입력
  return (
    <nav className="bg-blue-400 text-white px-6 py-4 flex justify-between items-center">
      {/* 로고 또는 홈 */}
      <Link to="/" className="text-lg font-bold hover:text-blue-900 transition-colors">
        홈
      </Link>

      {/* 메뉴 링크 */}
      <div className="flex space-x-4">
        {user ? (
          <>
            <Link to="/todos" className="hover:text-blue-900 transition-colors">
              할 일
            </Link>
            <Link to="/profile" className="hover:text-blue-900 transition-colors">
              내 프로필
            </Link>
            <button onClick={signOut} className="hover:text-blue-900 transition-colors">
              로그아웃
            </button>
            {isAdmin && (
              <Link to="/admin" className="hover:text-blue-900 transition-colors">
                관리자
              </Link>
            )}
          </>
        ) : (
          // 로그인 안 했을 때
          <Link to="/signin" className="hover:text-blue-900 transition-colors">
            로그인
          </Link>
        )}
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
            <Route
              path="/profile"
              element={
                <Protected>
                  <ProfilePage />
                </Protected>
              }
            />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
```

## 5. 관리자 페이지 생성 및 라우터 세팅

- /src/pages/AdminPage.tsx

```tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { DeleteRequest, DeleteRequestUpdate } from '../types/TodoType';

function AdminPage() {
  // ts 자리
  const { user } = useAuth();
  // 삭제 요청 DB 목록 관리
  const [deleteRequests, setDeleteRequests] = useState<DeleteRequest[]>([]);
  // 로딩창
  const [loading, setLoading] = useState(true);

  // 관리자 확인
  const isAdmin = user?.email === 'tarolong@naver.com';
  useEffect(() => {
    console.log(user?.email);
    console.log(user?.id);
    console.log(user);
  }, [user]);

  // 컴포넌트가 완료가 되었을 때, isAdmin 을 체크 후 실행
  useEffect(() => {
    if (isAdmin) {
      // 회원 탈퇴 신청자 목록을 파악
      loadDeleteMember();
    }
  }, [isAdmin]);

  // 탈퇴 신청자 목록 파악 테이터 요청
  const loadDeleteMember = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('account_deletion_requests')
        .select('*')
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });

      if (error) {
        console.log(`삭제 목록 요청 에러 : ${error.message}`);
        return;
      }

      // 삭제 요청 목록 보관
      setDeleteRequests(data || []);
    } catch (err) {
      console.log('삭제 요청 목록 오류', err);
    } finally {
      setLoading(false);
    }
  };
  // 탈퇴 승인
  const approveDelete = async (id: string, updateUser: DeleteRequestUpdate): Promise<void> => {
    try {
      const { error } = await supabase
        .from('account_deletion_requests')
        .update({ ...updateUser, status: 'approved' })
        .eq('id', id);
      if (error) {
        console.log(`탈퇴 업데이트 오류 : ${error.message}`);
        return;
      }

      alert(`사용자 ${id}의 계정이 삭제가 승인되었습니다. \n\n 관리자님 수동으로 삭제하세요.`);

      // 목록 다시 읽기
      loadDeleteMember();
    } catch (err) {
      console.log('탈퇴승인 오류 : ', err);
    }
  };

  // 탈퇴 거절
  const rejectDelete = async (id: string, updateUser: DeleteRequestUpdate): Promise<void> => {
    try {
      const { error } = await supabase
        .from('account_deletion_requests')
        .update({ ...updateUser, status: 'rejected' })
        .eq('id', id);

      if (error) {
        console.log(`탈퇴 업데이트 오류 : ${error.message}`);
        return;
      }

      alert(`사용자 ${id}의 계정이 삭제가 거부되었습니다.`);

      // 목록 다시 읽기
      loadDeleteMember();
    } catch (err) {
      console.log('탈퇴거절 오류 : ', err);
    }
  };

  // 1. 관리자 아이디가 불일치라면
  if (!isAdmin) {
    return (
      <div>
        <h1>접근 권한이 없습니다.</h1>
        <p>관리자 페이지에 접근할 수 없습니다.</p>
      </div>
    );
  }
  // 2. 로딩중 이라면
  if (loading) {
    return <div>로딩중...</div>;
  }

  // tsx 자리
  return (
    <div>
      <h1>관리자 페이지</h1>
      <div>
        {deleteRequests.length === 0 ? (
          <p>대기 중인 삭제 요청이 없습니다.</p>
        ) : (
          <div>
            {deleteRequests.map(item => (
              <div key={item.id}>
                <div>
                  <h3>사용자: {item.user_email}</h3>
                  <span>대기 중</span>
                </div>
                <div>
                  <p>사용자 ID : {item.user_id}</p>
                  <p>요청시간 : {item.requested_at}</p>
                  <p>사유 : {item.reason}</p>
                </div>
                <div>
                  <button onClick={() => approveDelete(item.id, item)}>승인</button>
                  <button onClick={() => rejectDelete(item.id, item)}>거절</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
```

### 5.2 라우터 적용

- App.tsx

```tsx
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AuthCallbackPage from './pages/AuthCallbackPage';
import HomePage from './pages/HomePage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import TodosPage from './pages/TodosPage';
import Protected from './contexts/Protected';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

const TopBar = () => {
  const { signOut, user } = useAuth();
  // 관리자인 경우 메뉴 추가로 출력하기
  // isAdmin 에는 boolean 임. ( true / false )
  const isAdmin = user?.email === 'lynn9702@naver.com'; // 관리자 이메일 입력
  return (
    <nav className="bg-blue-400 text-white px-6 py-4 flex justify-between items-center">
      {/* 로고 또는 홈 */}
      <Link to="/" className="text-lg font-bold hover:text-blue-900 transition-colors">
        홈
      </Link>

      {/* 메뉴 링크 */}
      <div className="flex space-x-4">
        {user ? (
          <>
            <Link to="/todos" className="hover:text-blue-900 transition-colors">
              할 일
            </Link>
            <Link to="/profile" className="hover:text-blue-900 transition-colors">
              내 프로필
            </Link>
            <button onClick={signOut} className="hover:text-blue-900 transition-colors">
              로그아웃
            </button>
            {isAdmin && (
              <Link to="/admin" className="hover:text-blue-900 transition-colors">
                관리자
              </Link>
            )}
          </>
        ) : (
          // 로그인 안 했을 때
          <Link to="/signin" className="hover:text-blue-900 transition-colors">
            로그인
          </Link>
        )}
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
            <Route
              path="/profile"
              element={
                <Protected>
                  <ProfilePage />
                </Protected>
              }
            />
            <Route
              path="/admin"
              element={
                <Protected>
                  <AdminPage />
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

## 6. 회원 탈퇴 기능

### 6.1 AuthContext 기능 업데이트

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
import type { DeleteRequestInsert } from '../types/todoType';

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
  // 회원 탈퇴 기능
  deleteAccount: () => Promise<{ error?: string; success?: boolean; message?: string }>;
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

  // 회원 탈퇴 기능
  const deleteAccount: AuthContextType['deleteAccount'] = async () => {
    try {
      // 기존에 사용한 데이터들을 먼저 정리한다
      const { error: profileError } = await supabase.from('profiles').delete().eq('id', user?.id);
      if (profileError) {
        console.log('프로필 삭제 실패', profileError.message);
        return { error: '프로필 삭제에 실패했습니다.' };
      }

      // 탈퇴 신청 데이터 추가
      // account_deletion_requests 에 Pending 으로 Insert 함
      const deleteInfo: DeleteRequestInsert = {
        user_email: user?.email as string,
        user_id: user?.id,
        reason: '사용자 요청',
        status: 'pending',
      };
      const { error: deleteRequestsError } = await supabase
        .from('account_deletion_requests')
        .insert([{ ...deleteInfo }]);

      if (deleteRequestsError) {
        console.log('탈퇴 목록 추가에 실패', deleteRequestsError.message);
        return { error: '탈퇴 목록 추가에 실패했습니다.' };
      }

      // 강제 로그아웃 시켜줌
      await signOut();

      return {
        success: true,
        message: '계정 삭제가 요청되었습니다. 관리자 승인 후 완전히 삭제됩니다.',
      };
    } catch (err) {
      console.log('탈퇴 요청 기능 오류 : ', err);
      return { error: '계정 탈퇴 처리 중 오류가 발생하였습니다.' };
    }
  };

  const value: AuthContextType = { signUp, signOut, signIn, user, session, loading, deleteAccount };

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
```

### 6.2 ProfilePage 업데이트

- ProfilePage.tsx

```tsx
/**
 * 사용자 프로필 페이지
 * - 기본 정보 표시
 * - 정보 수정
 * - 회원 탈퇴 기능 : 반드시 확인을 거치고 진행해야함
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateProfile } from '../lib/profile';
import type { Profile, ProfileUpdate } from '../types/todoType';

function ProfilePage() {
  // 회원 기본 정보
  const { user, deleteAccount } = useAuth();
  // 데이터 가져오는 동안의 로딩
  const [loading, setLoading] = useState<boolean>(true);
  // 사용자 프로필
  const [profileData, setProfileData] = useState<Profile | null>(null);
  // Error 메세지
  const [error, setError] = useState<string>('');
  // 회원 정보 수정
  const [userEdit, setUserEdit] = useState<boolean>(false);
  // 회원 닉네임 보관
  const [nickName, setNickName] = useState<string>('');

  // 사용자 프로필 정보 가져오기
  const loadProfile = async () => {
    if (!user?.id) {
      // 사용자의 id 가 없으면 중지
      setError('사용자의 정보를 찾을 수 없습니다.');
      setLoading(false);
      return;
    }
    try {
      // 사용자 정보를 가져오기 ( null 일 수도 있음 )
      const tempData = await getProfile(user?.id);
      if (!tempData) {
        // null 일 경우
        setError('사용자의 프로필 정보를 찾을 수 없습니다.');
        return;
      }

      // 사용자 정보가 있을 경우
      setNickName(tempData.nickname || '');
      setProfileData(tempData);
    } catch (error) {
      console.log(error);
      setError('사용자의 프로필 정보 호출 오류');
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

    try {
      const tempUpdateData: ProfileUpdate = { nickname: nickName };
      const success = await updateProfile(tempUpdateData, user.id);
      if (!success) {
        console.log('프로필 업데이트에 실패하였습니다.');
        return;
      }

      loadProfile();
    } catch (err) {
      console.log('프로필 업데이트 오류', err);
    } finally {
      setUserEdit(false);
    }
  };

  // 회원탈퇴
  const handleDeleteUser = () => {
    const message: string = '계정을 완전히 삭제하시겠습니까? 복구가 불가능 합니다.';
    let isConfirm = false;
    isConfirm = confirm(message);

    if (isConfirm) {
      deleteAccount();
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[999] w-full h-full bg-sky-400 flex items-center justify-center">
        <h1 className="text-white text-xl font-bold">프로필 로딩중 ...</h1>
      </div>
    );
  }
  // error 메세지 출력하기
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h2 className="text-2xl font-bold mb-4">프로필</h2>
        <div className="mb-4 text-red-600">{error}</div>
        <button
          onClick={loadProfile}
          className="px-4 py-2 bg-blue-200 text-white rounded-lg hover:bg-blue-300 transition-colors"
        >
          재시도
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-blue-700">회원 정보</h2>
      {/* 사용자 기본 정보 */}
      <div className="mb-6 p-6 border rounded-lg shadow bg-white">
        <h3 className="text-xl font-semibold mb-4">기본 정보</h3>
        <div className="text-gray-700 mb-2">이메일 : {user?.email}</div>
        <div className="text-gray-700">
          가입일: {user?.created_at && new Date(user.created_at).toLocaleString()}
        </div>
      </div>
      {/* 사용자 추가 정보 */}
      <div className="p-6 border rounded-lg shadow bg-white">
        <h3 className="text-xl font-semibold mb-4">사용자 추가 정보</h3>
        <div className="text-gray-700 mb-2">아이디 : {profileData?.id}</div>
        {userEdit ? (
          <>
            <div className="mb-4">
              닉네임 :
              <input
                type="text"
                value={nickName}
                onChange={e => setNickName(e.target.value)}
                className="ml-2 px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <div className="text-gray-700 mb-4">
              아바타 :
              {profileData?.avatar_url ? (
                <img src={profileData.avatar_url} className="h-9 w-10 rounded-full mt-2" />
              ) : (
                <button className="ml-2 px-2 py-1 border rounded-lg hover:bg-gray-100">
                  파일 추가
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="text-gray-700 mb-4">닉네임 : {profileData?.nickname}</div>
            <div className="text-gray-700 mb-4">
              아바타 :
              {profileData?.avatar_url ? (
                <img src={profileData.avatar_url} className="h-16 w-16 rounded-full mt-2" />
              ) : (
                <img
                  className="h-16 w-16 rounded-full mt-2"
                  src={
                    'https://e7.pngegg.com/pngimages/867/694/png-clipart-user-profile-default-computer-icons-network-video-recorder-avatar-cartoon-maker-blue-text.png'
                  }
                />
              )}
            </div>
          </>
        )}
        <div className="text-gray-700 mb-4">
          가입일 : {profileData?.created_at && new Date(profileData.created_at).toLocaleString()}
        </div>
      </div>
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <div className="mt-6 flex gap-3">
        {userEdit ? (
          <>
            <button
              onClick={saveProfile}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              수정 확인
            </button>
            <button
              onClick={() => {
                setUserEdit(false);
                setNickName(profileData?.nickname || '');
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              수정 취소
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setUserEdit(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              정보 수정
            </button>
            <button
              onClick={handleDeleteUser}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              회원 탈퇴
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
```
