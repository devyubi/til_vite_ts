# profiles 테이블에 추가 정보 시 오류 발생

- RLS 정책으로 회원이 아니면 CRUD 를 하지 못한다.

## 1. 기존 방식

- 회원가입 → profiles 에 insert 진행함 ( 오류 발생 )
- 회원가입 → 이메일 인증 → 인증 확인 → profiles 에 insert 필요

## 2. 회원가입 진행 과정 개선

- /src/pages/SignUpPage.tsx 수정

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
        // 잠시 추가 정보를 보관함
        // supabase 에서 auth 에는 추가적인 정보를 저장하는 객체가 존재함
        // 이메일 인증 후 프로필 생성시에 사용하려고 보관함
        data: { nickName: nickName }, // 공식적인 명칭 : `metadata` 라고 함
      },
    });

    if (error) {
      setMsg(`회원가입 오류 : ${error}`);
    } else {
      setMsg(
        '회원 가입이 성공했습니다. 이메일을 확인해주세요. 인증 완료 후 프로필이 자동으로 생성됩니다.',
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Todo Service 회원 가입
        </h2>
        <div className="border rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="이메일"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {/* <button type="button">이메일 중복 확인</button> */}
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="비밀번호"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              value={nickName}
              onChange={e => setNickName(e.target.value)}
              placeholder="닉네임"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {/* form 안에선 button type 지정해주기 */}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
            >
              회원가입
            </button>
          </form>
          <p
            className={`mt-4 text-sm text-center ${
              msg.includes('성공') ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {msg}
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
```

- AuthCallbackPage.tsx

```tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { ProfileInsert } from '../types/todoType';
import { createProfile } from '../lib/profile';

/**
 * - 인증 콜백 URL 처리
 * - 사용자에게 인증 진행 상태 안내
 * - 자동 인증 처리 완료 안내
 */

function AuthCallback() {
  const [msg, setMsg] = useState<string>('인증 처리 중 ...');

  // 사용자가 이메일 확인을 클릭하면 실행되는 곳
  // 인증 정보에 담겨진 nickName 을 알아내서 여기서 profiles를 insert (추가) 한다
  const handleAuthCallback = async (): Promise<void> => {
    try {
      // URL 에서 session( `웹브라우저 정보 시 사라지는 데이터 - 임시로 저장됨` ) 에 담겨진 정보를 가져온다
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setMsg(`인증 오류 : ${error.message}`);
        return;
      }
      // 인증 데이터가 존재함
      if (data.session?.user) {
        const user = data.session.user;
        // 추가적인 정보 파악 가능 (metadata 라고 함)
        const nickName = user.user_metadata.nickName;
        // 먼저 프로필이 이미 존재하는지 확인이 필요함
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        // 존재하지 않는 id 이고, 내용이 있다면 profiles 에 insert 한다
        if (!existingProfile && nickName) {
          // 프로필이 없고, 닉네임이 존재하므로 프로필 생성하기
          const newProfile: ProfileInsert = { id: user.id, nickname: nickName };
          const result = await createProfile(newProfile);
          if (result) {
            setMsg('이메일이 인증 되었습니다. 프로필 생성 성공. 홈으로 이동해주세요');
          } else {
            setMsg('이메일이 인증 되었습니다. 프로필 생성 실패 : 관리자에게 문의하세요.');
          }
        } else {
          setMsg('이미 존재하는 프로필입니다.');
        }
      } else {
        setMsg('인증 정보가 없습니다. 다시 시도 해주세요.');
      }
    } catch (err) {
      console.log(`인증 callback 처리 오류 : ${err}`);
      setMsg('인증 처리 중 오류가 발생 하였습니다.');
    }
  };

  useEffect(() => {
    // setTimeout 은 1초 뒤에 함수 실행
    const timer = setTimeout(handleAuthCallback, 1000);
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

- profile.ts

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

import type { Profile, ProfileInsert, ProfileUpdate } from '../types/todoType';
import { supabase } from './supabase';

// 사용자 프로필 생성
const createProfile = async (newUserProfile: ProfileInsert): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('profiles').insert([{ ...newUserProfile }]);
    if (error) {
      console.log(`프로필 추가에 실패하였습니다 : `, {
        message: error.message,
        detail: error.details,
        hint: error.hint,
        code: error.code,
      });
      return false;
    }
    console.log(`프로필 생성 성공 : `, data);
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
const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
  try {
    // 파일 타입 검사
    // 파일 형식 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`지원하지 않는 파일 형식입니다. 허용 형식: ${allowedTypes.join(', ')}`);
    }
    // 파일 크기 검증 (5MB 제한)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error(`파일 크기가 너무 큽니다. 최대 5MB까지 업로드 가능합니다.`);
    }

    // 기존에 아바타 이미지가 있으면 무조건 삭제부터 함.
    const result = await cleanupUserAvatars(userId);
    if (!result) {
      console.log(`파일 삭제에 실패하였습니다.`);
    }

    // 파일명이 중복되지 않도록 이름을 생성함
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // storage 에 bucket 이 존재하는지 검사
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      throw new Error(`storage 버킷 확인 실패 : ${bucketError.message}`);
    }
    // bucket 들의 목록 전달 {} 형태로 나옴. user-images 라는 이름에 업로드
    let profileImagesBucket = buckets.find(item => item.name === 'user-images');
    if (!profileImagesBucket) {
      throw new Error('user-images 버킷이 존재하지 않습니다. 버킷 생성 필요.');
    }
    // 파일 업로드 : upload(파일명, 실제파일, 옵션)
    const { data, error } = await supabase.storage.from('user-images').upload(filePath, file, {
      cacheControl: '3600', // 3600 초는 1시간. 1시간동안 파일 캐시 적용함
      upsert: false, // 동일한 파일명은 덮어씌운다
    });
    if (error) {
      throw new Error(`업로드 실패 : ${error.message}`);
    }
    // https 문자열로 주소를 알아내서 활용
    const {
      data: { publicUrl },
    } = supabase.storage.from('user-images').getPublicUrl(filePath);
    return publicUrl;
  } catch (error) {
    throw new Error(`업로드 오류가 발생했습니다. : ${error}`);
  }
};
// 아바타 이미지는 한장을 유지해야 하므로 모두 제거하는 기능이 필요함
const cleanupUserAvatars = async (userId: string): Promise<boolean> => {
  try {
    const { data, error: listError } = await supabase.storage
      .from('user-images')
      .list('avatars', { limit: 1000 });
    if (listError) {
      console.log(`목록 요청 실패 : ${listError.message}`);
    }
    // userId 에 해당하는 것만 필터링하여 삭제해야함. (아무거나 다 지우면 안되는 것 방지)
    if (data && data.length > 0) {
      const userFile = data.filter(item => item.name.startsWith(`${userId}-`));
      if (userFile && userFile.length > 0) {
        const filePath = userFile.map(item => `avatars/${item.name}`);
        const { error: removeError } = await supabase.storage.from('user-images').remove(filePath);
        if (removeError) {
          console.log(`파일 삭제 실패 : ${removeError.message}`);
          return false;
        }
        return true;
      }
    }
    return true;
  } catch (error) {
    console.log(`아바타 이미지 전체 삭제 오류 : ${error}`);
    return false;
  }
};

// 사용자 프로필 이미지 제거
const removeAvatar = async (userId: string): Promise<boolean> => {
  try {
    // 현재 로그인 한 사용자의 avatar_url 을 읽어와야함
    // 여기서 파일명을 추출함
    const profile = await getProfile(userId);
    // 사용자가 avatar_url 이 없으면
    if (!profile?.avatar_url) {
      return true; // 작업 완료
    }
    // 1. 만약 avatar_url 이 존재한다면 이름 파악, 파일 삭제
    let deleteSuccess = false;
    try {
      // url 에 파일명을 찾아야함 (url 로 변환하면 path와 파일 구분이 수월함)
      const url = new URL(profile.avatar_url);
      const pathParts = url.pathname.split('/');
      const publicIndex = pathParts.indexOf('public');
      if (publicIndex !== -1 && publicIndex + 1 < pathParts.length) {
        const bucketName = pathParts[publicIndex + 1];
        const filePath = pathParts.slice(publicIndex + 2).join('/');
        // 실제로 찾아낸 bucketName 과 filePath 로 삭제
        const { data, error } = await supabase.storage.from(bucketName).remove([filePath]);
        if (error) {
          throw new Error('파일을 찾았지만, 삭제에 실패하였습니다.');
        }
        // 파일 삭제 성공
        deleteSuccess = true;
      }
    } catch (err) {
      console.log(err);
    }

    // 2. 만약 avatar_url 을 제대로 파싱하지 못했다면?
    if (!deleteSuccess) {
      try {
        // 전체 목록을 일단 읽어옴
        const { data: files, error: listError } = await supabase.storage
          .from('user-images')
          .list('avatars', { limit: 1000 });
        if (!listError && files && files.length > 0) {
          const userFiles = files.filter(item => item.name.startsWith(`${userId}-`));
          if (userFiles.length > 0) {
            const filePath = userFiles.map(item => `avatars/${item.name}`);
            const { error } = await supabase.storage.from('user-images').remove(filePath);
            if (!error) {
              deleteSuccess = true;
            }
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

// 내보내기 ( 하나하나 export 넣기 귀찮을 시 )
export { createProfile, getProfile, updateProfile, deleteProfile, uploadAvatar, removeAvatar };
```

# 일반적 네비게이션 진행하기

- npm 써도 됨
- npm : https://www.npmjs.com/package/react-paginate
- 수업은 직접 구현 진행해봄

## 1. 구현 시나리오

- 목표 : 한 화면에 10개의 목록을 표시함
- 페이지 번호로 네비게이션 함
- 전체 개수 및 현재 페이지 정보를 출력함
- supabase 에 todos 를 이용함

## 2. 코드 구현

### 2.1 /src/service/todoService.ts

- 페이지 번호와 제한 개수를 이용해서 추출하기 함수

```ts
// 페이지 단위로 조각내서 목록 출력하기
// getTodosPaginated (페이지 번호, 10개)
// getTodosPaginated (1, 10개)
// getTodosPaginated (2, 10개)
export const getTodosPaginated = async (
  page: number = 1,
  limit: number = 10,
): Promise<{ todos: Todo[]; totalCount: number; totalPages: number; currentPage: number }> => {
  // 시작 지점 ( 만약 page = 2 라면, limit 은 10 )
  // (2-1)*10 = 10
  const from = (page - 1) * limit;
  // 제한 지점 (종료)
  // 10 + 10 - 1 = 19
  const to = from + limit - 1;

  // 전체 데이터 개수 (행row의 개수)
  const { count } = await supabase.from('todos').select('*', { count: 'exact', head: true });

  // from 부터 to 까지의 상세 데이터 가져오기
  const { data } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to);

  // 편하게 활용하기
  const totalCount = count || 0;
  // 몇 페이지인지 계산 (소수점은 올림)
  const totalPages = Math.ceil(totalCount / limit);
  return {
    todos: data || [],
    totalCount,
    totalPages,
    currentPage: page,
  };
};
```

- 전체 todoService.ts

```ts
import { supabase } from '../lib/supabase';
import type { Todo, TodoInsert, TodoUpdate } from '../types/todoType';

// 이것이 CRUD!!

// Todo 목록 조회
export const getTodos = async (): Promise<Todo[]> => {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false });
  // 실행은 되었지만, 결과가 오류이다.
  if (error) {
    throw new Error(`getTodos 오류 : ${error.message}`);
  }
  return data || [];
};
// Todo 생성
// 로그인을 하고 나면 실제로 user_id 가 이미 파악이 됨
// TodoInsert 에서 user_id : 값을 생략하는 타입을 생성
// 타입스크립트에서 Omit을 이용하면, 특정 키를 제거 할 수 있음.
export const createTodo = async (newTodo: Omit<TodoInsert, 'user_id'>): Promise<Todo | null> => {
  try {
    // 현재 로그인 한 사용자 정보 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    const { data, error } = await supabase
      .from('todos')
      .insert([{ ...newTodo, completed: false, user_id: user.id }])
      .select()
      .single();
    if (error) {
      throw new Error(`createTodo 오류 : ${error.message}`);
    }
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};
// Todo 수정
// 로그인을 하고 나면 실제로 user_id 가 이미 파악이 됨
// TodoInsert 에서 user_id : 값을 생략하는 타입을 생성
// 타입스크립트에서 Omit을 이용하면, 특정 키를 제거 할 수 있음.
export const updateTodo = async (
  id: number,
  editTitle: Omit<TodoUpdate, 'user_id'>,
): Promise<Todo | null> => {
  try {
    // 업데이트 구문 : const { data, error } = await supabase ~ .select();
    const { data, error } = await supabase
      .from('todos')
      .update({ ...editTitle, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`updateTodo 오류 : ${error.message}`);
    }

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};
// Todo 삭제
export const deleteTodo = async (id: number): Promise<void> => {
  try {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (error) {
      throw new Error(`deleteTodo 오류 : ${error.message}`);
    }
  } catch (error) {
    console.log(error);
  }
};

// Complited 토글 = 어차피 toggle도 업데이트기 때문에 굳이 만들지 않아도 되지만 수업상 만듦
export const toggleTodo = async (id: number, completed: boolean): Promise<Todo | null> => {
  return updateTodo(id, { completed });
};

// 페이지 단위로 조각내서 목록 출력하기
// getTodosPaginated (페이지 번호, 10개)
// getTodosPaginated (1, 10개)
// getTodosPaginated (2, 10개)
export const getTodosPaginated = async (
  page: number = 1,
  limit: number = 10,
): Promise<{ todos: Todo[]; totalCount: number; totalPages: number; currentPage: number }> => {
  // 시작 지점 ( 만약 page = 2 라면, limit 은 10 )
  // (2-1)*10 = 10
  const from = (page - 1) * limit;
  // 제한 지점 (종료)
  // 10 + 10 - 1 = 19
  const to = from + limit - 1;

  // 전체 데이터 개수 (행row의 개수)
  const { count } = await supabase.from('todos').select('*', { count: 'exact', head: true });

  // from 부터 to 까지의 상세 데이터 가져오기
  const { data } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to);

  // 편하게 활용하기
  const totalCount = count || 0;
  // 몇 페이지인지 계산 (소수점은 올림)
  const totalPages = Math.ceil(totalCount / limit);
  return {
    todos: data || [],
    totalCount,
    totalPages,
    currentPage: page,
  };
};
```

### 2.2 /src/contexts/TodoContext.tsx

```tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type PropsWithChildren,
} from 'react';
import type { Todo } from '../types/todoType';
// 전체 DB 가져오기
import { getTodos, getTodosPaginated } from '../services/todoServices';

/** 1) 상태 타입과 초기값: 항상 Todo[]만 유지 */
// 초기값 형태가 페이지 객체 형태로 추가됨
type TodosState = {
  todos: Todo[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
};
const initialState: TodosState = {
  todos: [],
  totalCount: 0,
  totalPages: 0,
  currentPage: 1,
};

/** 2) 액션 타입 */
enum TodoActionType {
  ADD = 'ADD',
  TOGGLE = 'TOGGLE',
  DELETE = 'DELETE',
  EDIT = 'EDIT',
  // Supabase todos 의 목록을 읽어오는 Action Type
  SET_TODOS = 'SET_TODOS',
}

// action type 정의
/** 액션들: 모두 id가 존재하는 Todo 기준 */
type AddAction = { type: TodoActionType.ADD; payload: { todo: Todo } };
type ToggleAction = { type: TodoActionType.TOGGLE; payload: { id: number } };
type DeleteAction = { type: TodoActionType.DELETE; payload: { id: number } };
type EditAction = { type: TodoActionType.EDIT; payload: { id: number; title: string } };
// Supabase 목록으로 state.todos 배열을 채워라
type SetTodosAction = {
  type: TodoActionType.SET_TODOS;
  payload: { todos: Todo[]; totalCount: number; totalPages: number; currentPage: number };
};
type TodoAction = AddAction | ToggleAction | DeleteAction | EditAction | SetTodosAction;

// 3. Reducer : 반환 타입을 명시해 주면 더 명확해짐
// action 은 {type:"문자열", payload: 재료 } 형태
function reducer(state: TodosState, action: TodoAction): TodosState {
  switch (action.type) {
    case TodoActionType.ADD: {
      const { todo } = action.payload;
      return { ...state, todos: [todo, ...state.todos] };
    }
    case TodoActionType.TOGGLE: {
      const { id } = action.payload;
      const arr = state.todos.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      );
      return { ...state, todos: arr };
    }
    case TodoActionType.DELETE: {
      const { id } = action.payload;
      const arr = state.todos.filter(item => item.id !== id);
      return { ...state, todos: arr };
    }
    case TodoActionType.EDIT: {
      const { id, title } = action.payload;
      const arr = state.todos.map(item => (item.id === id ? { ...item, title } : item));
      return { ...state, todos: arr };
    }
    // Supabase 에 목록 읽기
    case TodoActionType.SET_TODOS: {
      const { todos, totalCount, totalPages, currentPage } = action.payload;
      return { ...state, todos, totalCount, totalPages, currentPage };
    }
    default:
      return state;
  }
}

// Context 타입 : todos는 Todo[]로 고정, addTodo도 Todo를 받도록 함
// 만들어진 context 가 관리하는 value 의 모양
type TodoContextValue = {
  todos: Todo[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  addTodo: (todo: Todo) => void;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  editTodo: (id: number, editTitle: string) => void;
  loadTodos: (page: number, limit: number) => void;
};

const TodoContext = createContext<TodoContextValue | null>(null);

// 5. Provider
// type TodoProviderProps = {
//   children: React.ReactNode;
// };
// export const TodoProvider = ({ children }: TodoProviderProps) => {

// export const TodoProvider = ({ children }: React.PropsWithChildren) => {

// props 정의하기 (방법 1번 - 비추천)
// interface TodoProviderProps {
//   children?: React.ReactNode;
//   currentPage?: number;
//   limit?: number;
// }

// props 정의하기 (방법 2번 - 상속형 추천)
interface TodoProviderProps extends PropsWithChildren {
  currentPage?: number;
  limit?: number;
}

export const TodoProvider: React.FC<TodoProviderProps> = ({
  children,
  currentPage = 1,
  limit = 10,
}): JSX.Element => {
  // useReducer 로 상태 관리
  const [state, dispatch] = useReducer(reducer, initialState);

  // dispatch 를 위한 함수 표현식 모음
  // (중요) addTodo는 id가 있는 Todo만 받음
  // 새 항목 추가는: 서버 insert -> 응답으로 받은 Todo(id 포함) -> addTodo 호출
  const addTodo = (newTodo: Todo) => {
    dispatch({ type: TodoActionType.ADD, payload: { todo: newTodo } });
  };
  const toggleTodo = (id: number) => {
    dispatch({ type: TodoActionType.TOGGLE, payload: { id } });
  };
  const deleteTodo = (id: number) => {
    dispatch({ type: TodoActionType.DELETE, payload: { id } });
  };
  const editTodo = (id: number, editTitle: string) => {
    dispatch({ type: TodoActionType.EDIT, payload: { id, title: editTitle } });
  };
  // 실행시 state { todos }를 업데이트함
  // reducer 함수를 실행함
  const setTodos = (todos: Todo[], totalCount: number, totalPages: number, currentPage: number) => {
    dispatch({
      type: TodoActionType.SET_TODOS,
      payload: { todos, totalCount, totalPages, currentPage },
    });
  };
  // Supabase 의 목록 읽기 함수 표현식
  // 비동기 데이터베이스 접근
  // const loadTodos = async (): Promise<void> => {
  //   try {
  //     const result = await getTodos();
  //     setTodos(result ?? []);
  //   } catch (error) {
  //     console.error('[loadTodos] 실패:', error);
  //   }
  // };
  const loadTodos = async (page: number, limit: number): Promise<void> => {
    try {
      const result = await getTodosPaginated(page, limit);
      // 현재 페이지가 비어있고, 첫 페이지가 아니라면 이전 페이지를 출력
      if (result.todos.length === 0 && result.totalPages > 0 && page > 1) {
        const prevPageResult = await getTodosPaginated(page - 1, limit);
        setTodos(
          prevPageResult.todos,
          prevPageResult.totalCount,
          prevPageResult.totalPages,
          prevPageResult.currentPage,
        );
      } else {
        setTodos(result.todos, result.totalCount, result.totalPages, result.currentPage);
      }
    } catch (error) {
      console.log(`목록 가져오기 오류 : ${error}`);
    }
  };

  // 페이지가 바뀌면 다시 실행하도록 해야 함
  useEffect(() => {
    void loadTodos(currentPage, limit);
  }, [currentPage, limit]);

  // value 전달할 값
  const value: TodoContextValue = {
    todos: state.todos,
    totalCount: state.totalCount,
    totalPages: state.totalPages,
    currentPage: state.currentPage,
    itemsPerPage: limit,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    loadTodos,
  };
  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};

// 6. custom hook 생성
export function useTodos(): TodoContextValue {
  const ctx = useContext(TodoContext);
  if (!ctx) {
    throw new Error('context를 찾을 수 없습니다.');
  }
  return ctx; // value 를 리턴함
}
```

### 2.3 pagenation 을 위한 컴포넌트 생성

- /src/components/Pagenation.tsx 생성 (재활용 가능)

### 2.4 /src/pages/TodosPage.tsx
