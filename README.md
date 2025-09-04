# Supabase 인증 후 회원 추가 정보 받기

- 회원가입 후에 `profiles 테이블` 에 추가 내용 받기

## 1. `profiles 테이블` 생성

- SQL Editor 를 이용해서 진행함

```sql
-- 사용자 프로필 정보를 저장하는 테이블
-- auth.users 테이블에 데이터가 추가되면 이와 연동하여 별도로 자동 추가
create table profiles (

  -- id 컬럼은 pk
  -- uuid 는 데이터 타입으로 중복 제거
  -- references auth.users : 참조 테이블로 auth.users 를 참조함
  -- on delete cascade : 사용자 계정을 삭제할 시 자동으로 profiles 도 같이 삭제 됨
  id uuid references auth.users on delete cascade primary key,

  -- 추가 컬럼들 ( 닉네임, 아바타URL 등 )
  nickname text,
  -- avatar_url 은 사용자 이미지
  -- supabase 의 storage 에 이미지 업로드 시 해당 이미지 URL : null 값임. ( 있으면 올리고 없으면 안올리고 )
  avatar_url text,
  -- created_at : 생성 날짜
  -- timestamp with time zone : 시간대 정보를 포함한 시간
  -- default now() : 기본 값으로 현재 시간을 저장하겠다
  created_at timestamp with time zone default now()
);
```

## 2. 만약, 테이블이 추가, 컬럼 추가, 변경 등이 되었다면 ?

- npm run generate-types 실행 해주기

```bash
npm run generate-types
```

- 실행 후 생성된 `/types_db.ts` 내용을 우리 type 파일에 추가함

```ts
// newTodoType = todos
export type NewTodoType = {
  id: string;
  title: string;
  completed: boolean;
};

// 해당 작업은 수작업 : 테이블명을 바꾸지 않는 이상 하단 타입은 변경되지 않음. (제너레이트란 명령을 주면 됨)
// 해당 작업 이후 todoService.ts 가서 Promise<Todo[]> import해주기
// // Todo 목록 조회
// export const getTodos = async (): Promise<Todo[]> => {
//   try {
export type Todo = Database['public']['Tables']['todos']['Row'];
export type TodoInsert = Database['public']['Tables']['todos']['Insert'];
export type TodoUpdate = Database['public']['Tables']['todos']['Update'];

// 사용자 정보
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.4';
  };
  public: {
    Tables: {
      memos: {
        Row: {
          created_at: string;
          id: number;
          memo: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          memo?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          memo?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          id: string;
          nickname: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          id: string;
          nickname?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          id?: string;
          nickname?: string | null;
        };
        Relationships: [];
      };
      todos: {
        Row: {
          completed: boolean;
          content: string | null;
          created_at: string | null;
          id: number;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          completed?: boolean;
          content?: string | null;
          created_at?: string | null;
          id?: number;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          completed?: boolean;
          content?: string | null;
          created_at?: string | null;
          id?: number;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
```

## 3. 프로필 CRUD 를 위한 파일 구성

- `src/lib/profile.ts` 파일 생성

```ts
/**
 * 사용자 프로필 관리 ( profiles.ts 에서 관리 )
 * - 프로필 생성
 * - 프로필 정보 조회
 * - 프로필 정보 수정
 * - 프로필 정보 삭제
 *
 * 주의 사항
 * - 반드시 사용자 인증 후에만 프로필 생성
 */

import type { ProfileInsert } from '../types/todoType';
import { supabase } from './supabase';

// 사용자 프로필 생성
const createProfile = async (newUserProfile: ProfileInsert): Promise<boolean> => {
  try {
    const { error } = await supabase.from('profiles').insert([{ ...newUserProfile }]);
    if (error) {
      console.log(`프로필 추가에 실패하였습니다 : ${error.message}`);
      return false;
    }
    return true;
  } catch (error) {
    console.log(`프로필 생성 오류 : ${error}`);
    return false;
  }
};

// 사용자 프로필 조회
const getProfile = () => {};

// 사용자 프로필 수정
const updateProfile = () => {};

// 사용자 프로필 삭제
const deleteProfile = () => {};

// 사용자 프로필 이미지 업로드
const uploadAvatar = () => {};

// 내보내기 ( 하나하나 export 넣기 귀찮을 시 )
export { createProfile, getProfile, updateProfile, deleteProfile, uploadAvatar };
```

## 4. 회원 가입 시 추가 정보 내용 구성

- id(uuid), nickname (null도 가능하긴 함), avata_url(null), create_at (자동으로 들어감)
- /src/pages/SignUpPage.tsx 추가 수정

```tsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { createProfile } from '../lib/profile';
import type { ProfileInsert } from '../types/todoType';

function SignUpPage() {
  const { signUp } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [pw, setPw] = useState<string>('');

  // 추가 정보 ( 닉네임 )
  const [nickName, setNickName] = useState<string>('');
  const [msg, setMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 해당 코드 필수 : 웹브라우저 갱신 막아주기
    // 유효성 검사
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

    // 회원 가입 및 추가 정보 입력하기
    const { error, data } = await supabase.auth.signUp({
      email,
      password: pw,
      options: {
        // 회원 가입 후 이메일로 인증 확인시 리다이렉트 될 URL
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMsg(`회원가입 오류 : ${error}`);
    } else {
      // 회원가입이 성공했으므로 profiles 도 채워줌
      if (data?.user?.id) {
        // 프로필을 추가함
        const newUser: ProfileInsert = { id: data.user.id, nickname: nickName };
        const result = await createProfile(newUser);
        if (result) {
          // 프로필 추가가 성공한 경우
          setMsg(`회원 가입 및 프로필 생성 성공. 이메일을 확인 해주세요.`);
        } else {
          // 프로필 추가를 실패한 경우
          setMsg(`회원가입은 성공하였으나, 프로필 생성에 실패하였습니다.`);
        }
      } else {
        setMsg(`이메일이 발송 되었습니다. 이메일을 확인 해주세요.`);
      }
    }
  };

  return (
    <div>
      <h2>Todo Service 회원 가입</h2>
      <div className="border">
        <form onSubmit={handleSubmit}>
          <br />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="이메일"
          />
          <br />
          <br />
          {/* <button type="button">이메일 중복 확인</button> */}
          <input
            type="password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            placeholder="비밀번호"
          />
          <input
            type="text"
            value={nickName}
            onChange={e => setNickName(e.target.value)}
            placeholder="닉네임"
          />
          <br />
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

## 5. 사용자 프로필 CRUD 기능 추가

- /src/lib/profile.ts 내용 추가

```tsx
/**
 * 사용자 프로필 관리 ( profiles.ts 에서 관리 )
 * - 프로필 생성
 * - 프로필 정보 조회
 * - 프로필 정보 수정
 * - 프로필 정보 삭제
 *
 * 주의 사항
 * - 반드시 사용자 인증 후에만 프로필 생성
 */

import type { Profile, ProfileInsert, ProfileUpdate } from '../types/todoType';
import { supabase } from './supabase';

// 사용자 프로필 생성
const createProfile = async (newUserProfile: ProfileInsert): Promise<boolean> => {
  try {
    const { error } = await supabase.from('profiles').insert([{ ...newUserProfile }]);
    if (error) {
      console.log(`프로필 추가에 실패하였습니다 : ${error.message}`);
      return false;
    }
    return true;
  } catch (error) {
    console.log(`프로필 생성 오류 : ${error}`);
    return false;
  }
};

// 사용자 프로필 조회
const getProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { error, data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) {
      console.log(error.message);
      return null;
    }
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

// 사용자 프로필 수정
const updateProfile = async (editUserProfile: ProfileUpdate, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ ...editUserProfile })
      .eq('id', userId);
    if (error) {
      console.log(error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

// 사용자 프로필 삭제
const deleteProfile = async (): Promise<any> => {};

// 사용자 프로필 이미지 업로드
const uploadAvatar = async (): Promise<any> => {};

// 내보내기 ( 하나하나 export 넣기 귀찮을 시 )
export { createProfile, getProfile, updateProfile, deleteProfile, uploadAvatar };
```

## 6. 사용자 프로필 출력 페이지

- /src/pages/ProfilePage.tsx 파일 생성

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
  const { user } = useAuth();
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

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[999] w-full h-full bg-green-600 flex items-center justify-center">
        <h1 className="text-white text-xl font-bold">프로필 로딩중 ...</h1>
      </div>
    );
  }
  // error 메세지 출력하기
  if (error) {
    return (
      <div>
        <h2>프로필</h2>
        <div>{error}</div>
        <button onClick={loadProfile}>재시도</button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">회원 정보</h2>
      {/* 사용자 기본 정보 */}
      <div className="mb-6 p-4 border rounded-lg shadow-sm bg-white">
        <h3 className="text-xl font-semibold mb-2">기본 정보</h3>
        <div className="text-gray-700">이메일 : {user?.email}</div>
        <div className="text-gray-700">
          가입일: {user?.created_at && new Date(user.created_at).toLocaleString()}
        </div>
      </div>
      {/* 사용자 추가 정보 */}
      <div className="p-4 border rounded-lg shadow-sm bg-white">
        <h3 className="text-xl font-semibold mb-2">사용자 추가 정보</h3>
        <div className="text-gray-700">아이디 : {profileData?.id}</div>
        {userEdit ? (
          <>
            <div>
              닉네임 :
              <input type="text" value={nickName} onChange={e => setNickName(e.target.value)} />
            </div>
            <div className="text-gray-700">
              아바타 :
              {profileData?.avatar_url ? (
                <img src={profileData.avatar_url} />
              ) : (
                <button className="border px-1">파일 추가</button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="text-gray-700">닉네임 : {profileData?.nickname}</div>
            <div className="text-gray-700">
              아바타 :
              {profileData?.avatar_url ? (
                <img src={profileData.avatar_url} />
              ) : (
                <img
                  className="h-[30px] w-[35px]"
                  src={
                    'https://e7.pngegg.com/pngimages/867/694/png-clipart-user-profile-default-computer-icons-network-video-recorder-avatar-cartoon-maker-blue-text.png'
                  }
                />
              )}
            </div>
          </>
        )}
        <div className="text-gray-700">
          아바타 :
          {profileData?.avatar_url ? (
            <img src={profileData.avatar_url} />
          ) : (
            <button className="border px-1">파일 추가</button>
          )}
        </div>
        <div className="text-gray-700">
          가입일 :{profileData?.created_at && new Date(profileData.created_at).toLocaleString()}
        </div>
      </div>
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <div>
        {userEdit ? (
          <>
            <button onClick={saveProfile}>수정 확인</button>
            <button
              onClick={() => {
                setUserEdit(false);
                setNickName(profileData?.nickname || '');
              }}
            >
              수정 취소
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setUserEdit(true)}>정보 수정</button>
            <button>회원 탈퇴</button>
          </>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
```

## 7. Router 세팅

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
        {user && (
          <Link to="/profile" className="hover:text-blue-900 transition-colors">
            내 프로필
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
            <Route
              path="/profile"
              element={
                <Protected>
                  <ProfilePage />
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
