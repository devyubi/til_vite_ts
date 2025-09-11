# Infinity Scroll Loof List

- 스크롤 시 추가 목록 구현 ( UI가 SNS 서비스에 좋음 )
- 무한하게 진행되는 ( 스크롤 내리면 계속 보여지는 ) 스크롤 바

## 1. /src/services/todoService.ts

- 무한 스크롤 todos 목록 조회 기능 추가

- todoService.ts

```ts
// 무한 스크롤 todo 목록 조회
export const getTodosInfinity = async (
  offset: number = 0,
  limit: number = 5,
): Promise<{ todos: Todo[]; hasMore: boolean; totalCount: number }> => {
  try {
    // 전체 todos 의 Row 개수
    const { count, error: countError } = await supabase
      .from('todos')
      .select('*', { count: 'exact', head: true });
    if (countError) {
      throw new Error(`getTodosInfinity count 오류 : ${countError.message}`);
    }

    // 무한 스크롤 데이터 조회
    const { data, error: limitError } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (limitError) {
      throw new Error(`getTodosInfinite limit 오류 : ${limitError.message}`);
    }
    // 전체 개수
    const totalCount = count || 0;

    // 앞으로 더 가져올 데이터가 있는지?
    const hasMore = offset + limit < totalCount;

    // 최종 값을 리턴함
    return {
      todos: data || [],
      hasMore,
      totalCount,
    };
  } catch (error) {
    console.log(`getTodosInfinite 오류 : ${error}`);
    throw new Error(`getTodosInfinite 오류 : ${error}`);
  }
};
```

- todoService.ts 전체코드

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

// 무한 스크롤 todo 목록 조회
export const getTodosInfinity = async (
  offset: number = 0,
  limit: number = 5,
): Promise<{ todos: Todo[]; hasMore: boolean; totalCount: number }> => {
  try {
    // 전체 todos 의 Row 개수
    const { count, error: countError } = await supabase
      .from('todos')
      .select('*', { count: 'exact', head: true });
    if (countError) {
      throw new Error(`getTodosInfinity count 오류 : ${countError.message}`);
    }

    // 무한 스크롤 데이터 조회
    const { data, error: limitError } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (limitError) {
      throw new Error(`getTodosInfinite limit 오류 : ${limitError.message}`);
    }
    // 전체 개수
    const totalCount = count || 0;

    // 앞으로 더 가져올 데이터가 있는지?
    const hasMore = offset + limit < totalCount;

    // 최종 값을 리턴함
    return {
      todos: data || [],
      hasMore,
      totalCount,
    };
  } catch (error) {
    console.log(`getTodosInfinite 오류 : ${error}`);
    throw new Error(`getTodosInfinite 오류 : ${error}`);
  }
};
```

## 2. 상태 관리 ( Context State )

- 별도로 구성해서 진행해봄
- /src/contexts/InfinityScrollContext.tsx

- 첫번째 : 초기값 세팅

```tsx
import type { Todo } from '../types/todoType';

// 1. 초기값
type InfinityScrollState = {
  todos: Todo[];
  hasMore: boolean;
  totalCount: number;
  loading: boolean;
  loadingMore: boolean;
};

const initialState: InfinityScrollState = {
  todos: [],
  hasMore: false,
  totalCount: 0,
  loading: false,
  loadingMore: false,
};
```

- 2번째 : Action types 정의

```tsx
// 2. Action 타입 정의
enum InfinityScrollActionType {
  SET_TODOS = 'SET_TODOS',
  SET_LOADING = 'SET_LOADING',
  SET_LOADING_MORE = 'SET_LOADING_MORE',
  APPEND_TODOS = 'APPEND_TODOS',
  ADD_TODO = 'ADD_TODO',
  TOGGLE_TODO = 'TOGGLE_TODO',
  DELETE_TODO = 'DELETE_TODO',
  EDIT_TODO = 'EDIT_TODO',
  RESET = 'RESET',
}

type SetLoadingAction = { type: InfinityScrollActionType.SET_LOADING; payload: boolean };
type SetLoadingMoreAction = { type: InfinityScrollActionType.SET_LOADING_MORE; payload: boolean };
type SetTodosAction = {
  type: InfinityScrollActionType.SET_TODOS;
  payload: { todos: Todo[]; hasMore: boolean; totalCount: number };
};
type AppendTodosAction = {
  type: InfinityScrollActionType.APPEND_TODOS;
  payload: { todos: Todo[]; hasMore: boolean };
};
type AddAction = {
  type: InfinityScrollActionType.ADD_TODO;
  payload: { todo: Todo };
};
type ToggleAction = {
  type: InfinityScrollActionType.TOGGLE_TODO;
  payload: { id: number };
};
type DeleteAction = {
  type: InfinityScrollActionType.DELETE_TODO;
  payload: { id: number };
};
type EditAction = {
  type: InfinityScrollActionType.EDIT_TODO;
  payload: { id: number; title: string };
};
type ResetAction = {
  type: InfinityScrollActionType.RESET;
};

type InfinityScrollAction =
  | SetLoadingAction
  | SetLoadingMoreAction
  | SetTodosAction
  | AppendTodosAction
  | AddAction
  | ToggleAction
  | DeleteAction
  | EditAction
  | ResetAction;
```

- 3번째 : reducer 함수 만들기

```tsx
// 3. Reducer 함수
function reducer(state: InfinityScrollState, action: InfinityScrollAction): InfinityScrollState {
  switch (action.type) {
    case InfinityScrollActionType.SET_LOADING:
      return { ...state, loading: action.payload };
    case InfinityScrollActionType.SET_LOADING_MORE:
      return { ...state, loadingMore: action.payload };
    case InfinityScrollActionType.SET_TODOS:
      return {
        ...state,
        todos: action.payload.todos,
        hasMore: action.payload.hasMore,
        totalCount: action.payload.totalCount,
        loading: false,
        loadingMore: false,
      };
    case InfinityScrollActionType.APPEND_TODOS:
      // 추가
      return {
        ...state,
        todos: [...action.payload.todos, ...state.todos],
        hasMore: action.payload.hasMore,
        loadingMore: false,
      };
    case InfinityScrollActionType.ADD_TODO:
      return {
        ...state,
        todos: [action.payload.todo, ...state.todos],
        totalCount: state.totalCount + 1,
      };
    case InfinityScrollActionType.TOGGLE_TODO:
      return {
        ...state,
        todos: state.todos.map(item =>
          item.id === action.payload.id ? { ...item, completed: !item.completed } : item,
        ),
      };
    case InfinityScrollActionType.DELETE_TODO:
      return {
        ...state,
        todos: state.todos.filter(item => item.id !== action.payload.id),
      };
    case InfinityScrollActionType.EDIT_TODO:
      return {
        ...state,
        todos: state.todos.map(item =>
          item.id === action.payload.id ? { ...item, title: action.payload.title } : item,
        ),
      };
    case InfinityScrollActionType.RESET:
      return initialState;
    default:
      return state;
  }
}
```

- 4번째 : Context 생성

```tsx
// 4. Context 생성
type InfinityScrollContextValue = {
  todos: Todo[];
  hasMore: boolean;
  totalCount: number;
  loading: boolean;
  loadingMore: boolean;
  loadingInitialTodos: () => Promise<void>;
  loadMoreTodos: () => Promise<void>;
  addTodo: (todo: Todo) => void;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  editTodo: (id: number, title: string) => void;
  reset: () => void;
};
const InfiniteScrollContext = createContext<InfinityScrollContextValue | null>(null);
```

- 5번째 : Provider 만들기

```tsx
// 5. Provider 생성
// interface InfinityScrollProviderProps {
//   children?: React.ReactNode;
//   itemsPerPage: number;
// }
interface InfinityScrollProviderProps extends PropsWithChildren {
  itemsPerPage?: number;
}
export const InfinityScrollProvider: React.FC<InfinityScrollProviderProps> = ({
  children,
  itemsPerPage = 5,
}) => {
  // ts 자리
  // useReducer 를 활용
  const [state, dispatch] = useReducer(reducer, initialState);

  // 초기 데이터 로드
  const loadingInitialTodos = async (): Promise<void> => {
    try {
      // 초기 로딩 활성화 시켜줌
      dispatch({ type: InfinityScrollActionType.SET_LOADING, payload: true });
      const result = await getTodosInfinity(0, itemsPerPage);
      console.log(
        '초기 로드 된 데이터',
        result.todos.map(item => ({
          id: item.id,
          title: item.title,
          created_at: item.created_at,
          user_id: item.user_id,
        })),
      );

      dispatch({
        type: InfinityScrollActionType.SET_TODOS,
        payload: { todos: result.todos, hasMore: result.hasMore, totalCount: result.totalCount },
      });
    } catch (error) {
      console.log(`초기 데이터 로드 실패 : ${error}`);
      dispatch({ type: InfinityScrollActionType.SET_LOADING, payload: false });
    }
  };

  // 데이터 더보기 기능
  const loadMoreTodos = async (): Promise<void> => {
    try {
      dispatch({ type: InfinityScrollActionType.SET_LOADING_MORE, payload: true });
      const result = await getTodosInfinity(state.todos.length, itemsPerPage);
      console.log(
        '추가 로드 된 데이터',
        result.todos.map(item => ({
          id: item.id,
          title: item.title,
          created_at: item.created_at,
          user_id: item.user_id,
        })),
      );

      dispatch({
        type: InfinityScrollActionType.APPEND_TODOS,
        payload: { todos: result.todos, hasMore: result.hasMore },
      });
    } catch (error) {
      console.log(`추가 데이터 로드 실패 : ${error}`);
      dispatch({ type: InfinityScrollActionType.SET_LOADING_MORE, payload: false });
    }
  };

  // Todo 추가
  const addTodo = (todo: Todo): void => {
    dispatch({ type: InfinityScrollActionType.ADD_TODO, payload: { todo } });
  };
  // Todo 토글
  const toggleTodo = (id: number): void => {
    dispatch({ type: InfinityScrollActionType.TOGGLE_TODO, payload: { id } });
  };
  // Todo 삭제
  const deleteTodo = (id: number): void => {
    dispatch({ type: InfinityScrollActionType.DELETE_TODO, payload: { id } });
  };
  // Todo 수정
  const editTodo = (id: number, title: string): void => {
    dispatch({ type: InfinityScrollActionType.EDIT_TODO, payload: { id, title } });
  };
  // Context 상태 초기화
  const reset = (): void => {
    dispatch({ type: InfinityScrollActionType.RESET });
  };

  // 최초 실행시 데이터 로드
  useEffect(() => {
    loadingInitialTodos();
  }, []);

  const value: InfinityScrollContextValue = {
    todos: state.todos,
    hasMore: state.hasMore,
    totalCount: state.totalCount,
    loading: state.loading,
    loadingMore: state.loadingMore,
    loadingInitialTodos,
    loadMoreTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    reset,
  };

  // tsx 자리
  return <InfinityScrollContext.Provider value={value}>{children}</InfinityScrollContext.Provider>;
};
```

- 6번째 : Custom Hook

```tsx
// 6. 커스텀 훅
export function useInfinityScrollTodos(): InfinityScrollContextValue {
  const ctx = useContext(InfinityScrollContext);
  if (!ctx) {
    throw new Error('InfinityScrollContext가 없습니다.');
  }
  return ctx;
}
```

## 3. 전체 코드

- 전체 InfinityScrollContext.tsx

```tsx
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  type PropsWithChildren,
} from 'react';
import type { Todo } from '../types/todoType';
import { getTodosInfinity } from '../services/todoServices';

// 1. 초기값
type InfinityScrollState = {
  todos: Todo[];
  hasMore: boolean;
  totalCount: number;
  loading: boolean;
  loadingMore: boolean;
};

const initialState: InfinityScrollState = {
  todos: [],
  hasMore: false,
  totalCount: 0,
  loading: false,
  loadingMore: false,
};

// 2. Action 타입 정의
enum InfinityScrollActionType {
  SET_TODOS = 'SET_TODOS',
  SET_LOADING = 'SET_LOADING',
  SET_LOADING_MORE = 'SET_LOADING_MORE',
  APPEND_TODOS = 'APPEND_TODOS',
  ADD_TODO = 'ADD_TODO',
  TOGGLE_TODO = 'TOGGLE_TODO',
  DELETE_TODO = 'DELETE_TODO',
  EDIT_TODO = 'EDIT_TODO',
  RESET = 'RESET',
}

type SetLoadingAction = { type: InfinityScrollActionType.SET_LOADING; payload: boolean };
type SetLoadingMoreAction = { type: InfinityScrollActionType.SET_LOADING_MORE; payload: boolean };
type SetTodosAction = {
  type: InfinityScrollActionType.SET_TODOS;
  payload: { todos: Todo[]; hasMore: boolean; totalCount: number };
};
type AppendTodosAction = {
  type: InfinityScrollActionType.APPEND_TODOS;
  payload: { todos: Todo[]; hasMore: boolean };
};
type AddAction = {
  type: InfinityScrollActionType.ADD_TODO;
  payload: { todo: Todo };
};
type ToggleAction = {
  type: InfinityScrollActionType.TOGGLE_TODO;
  payload: { id: number };
};
type DeleteAction = {
  type: InfinityScrollActionType.DELETE_TODO;
  payload: { id: number };
};
type EditAction = {
  type: InfinityScrollActionType.EDIT_TODO;
  payload: { id: number; title: string };
};
type ResetAction = {
  type: InfinityScrollActionType.RESET;
};

type InfinityScrollAction =
  | SetLoadingAction
  | SetLoadingMoreAction
  | SetTodosAction
  | AppendTodosAction
  | AddAction
  | ToggleAction
  | DeleteAction
  | EditAction
  | ResetAction;

// 3. Reducer 함수

function reducer(state: InfinityScrollState, action: InfinityScrollAction): InfinityScrollState {
  switch (action.type) {
    case InfinityScrollActionType.SET_LOADING:
      return { ...state, loading: action.payload };
    case InfinityScrollActionType.SET_LOADING_MORE:
      return { ...state, loadingMore: action.payload };
    case InfinityScrollActionType.SET_TODOS:
      return {
        ...state,
        todos: action.payload.todos,
        hasMore: action.payload.hasMore,
        totalCount: action.payload.totalCount,
        loading: false,
        loadingMore: false,
      };
    case InfinityScrollActionType.APPEND_TODOS:
      // 추가
      return {
        ...state,
        todos: [...action.payload.todos, ...state.todos],
        hasMore: action.payload.hasMore,
        loadingMore: false,
      };
    case InfinityScrollActionType.ADD_TODO:
      return {
        ...state,
        todos: [action.payload.todo, ...state.todos],
        totalCount: state.totalCount + 1,
      };
    case InfinityScrollActionType.TOGGLE_TODO:
      return {
        ...state,
        todos: state.todos.map(item =>
          item.id === action.payload.id ? { ...item, completed: !item.completed } : item,
        ),
      };
    case InfinityScrollActionType.DELETE_TODO:
      return {
        ...state,
        todos: state.todos.filter(item => item.id !== action.payload.id),
      };
    case InfinityScrollActionType.EDIT_TODO:
      return {
        ...state,
        todos: state.todos.map(item =>
          item.id === action.payload.id ? { ...item, title: action.payload.title } : item,
        ),
      };
    case InfinityScrollActionType.RESET:
      return initialState;
    default:
      return state;
  }
}

// 4. Context 생성
type InfinityScrollContextValue = {
  todos: Todo[];
  hasMore: boolean;
  totalCount: number;
  loading: boolean;
  loadingMore: boolean;
  loadingInitialTodos: () => Promise<void>;
  loadMoreTodos: () => Promise<void>;
  addTodo: (todo: Todo) => void;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  editTodo: (id: number, title: string) => void;
  reset: () => void;
};
const InfinityScrollContext = createContext<InfinityScrollContextValue | null>(null);

// 5. Provider 생성
// interface InfinityScrollProviderProps {
//   children?: React.ReactNode;
//   itemsPerPage: number;
// }
interface InfinityScrollProviderProps extends PropsWithChildren {
  itemsPerPage?: number;
}
export const InfinityScrollProvider: React.FC<InfinityScrollProviderProps> = ({
  children,
  itemsPerPage = 5,
}) => {
  // ts 자리
  // useReducer 를 활용
  const [state, dispatch] = useReducer(reducer, initialState);

  // 초기 데이터 로드
  const loadingInitialTodos = async (): Promise<void> => {
    try {
      // 초기 로딩 활성화 시켜줌
      dispatch({ type: InfinityScrollActionType.SET_LOADING, payload: true });
      const result = await getTodosInfinity(0, itemsPerPage);
      console.log(
        '초기 로드 된 데이터',
        result.todos.map(item => ({
          id: item.id,
          title: item.title,
          created_at: item.created_at,
          user_id: item.user_id,
        })),
      );

      dispatch({
        type: InfinityScrollActionType.SET_TODOS,
        payload: { todos: result.todos, hasMore: result.hasMore, totalCount: result.totalCount },
      });
    } catch (error) {
      console.log(`초기 데이터 로드 실패 : ${error}`);
      dispatch({ type: InfinityScrollActionType.SET_LOADING, payload: false });
    }
  };

  // 데이터 더보기 기능
  const loadMoreTodos = async (): Promise<void> => {
    try {
      dispatch({ type: InfinityScrollActionType.SET_LOADING_MORE, payload: true });
      const result = await getTodosInfinity(state.todos.length, itemsPerPage);
      console.log(
        '추가 로드 된 데이터',
        result.todos.map(item => ({
          id: item.id,
          title: item.title,
          created_at: item.created_at,
          user_id: item.user_id,
        })),
      );

      dispatch({
        type: InfinityScrollActionType.APPEND_TODOS,
        payload: { todos: result.todos, hasMore: result.hasMore },
      });
    } catch (error) {
      console.log(`추가 데이터 로드 실패 : ${error}`);
      dispatch({ type: InfinityScrollActionType.SET_LOADING_MORE, payload: false });
    }
  };

  // Todo 추가
  const addTodo = (todo: Todo): void => {
    dispatch({ type: InfinityScrollActionType.ADD_TODO, payload: { todo } });
  };
  // Todo 토글
  const toggleTodo = (id: number): void => {
    dispatch({ type: InfinityScrollActionType.TOGGLE_TODO, payload: { id } });
  };
  // Todo 삭제
  const deleteTodo = (id: number): void => {
    dispatch({ type: InfinityScrollActionType.DELETE_TODO, payload: { id } });
  };
  // Todo 수정
  const editTodo = (id: number, title: string): void => {
    dispatch({ type: InfinityScrollActionType.EDIT_TODO, payload: { id, title } });
  };
  // Context 상태 초기화
  const reset = (): void => {
    dispatch({ type: InfinityScrollActionType.RESET });
  };

  // 최초 실행시 데이터 로드
  useEffect(() => {
    loadingInitialTodos();
  }, []);

  const value: InfinityScrollContextValue = {
    todos: state.todos,
    hasMore: state.hasMore,
    totalCount: state.totalCount,
    loading: state.loading,
    loadingMore: state.loadingMore,
    loadingInitialTodos,
    loadMoreTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
    reset,
  };

  // tsx 자리
  return <InfinityScrollContext.Provider value={value}>{children}</InfinityScrollContext.Provider>;
};

// 6. 커스텀 훅
export function useInfinityScrollTodos(): InfinityScrollContextValue {
  const ctx = useContext(InfinityScrollContext);
  if (!ctx) {
    throw new Error('InfinityScrollContext가 없습니다.');
  }
  return ctx;
}
```

## 4. 활용

- /src/pages/TodosInfinityPage.tsx 생성

## 5. Router 추가

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
import TodosInfinityPage from './pages/TodosInfinityPage';

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
            <Link to="/todos-infinity" className="hover:text-blue-900 transition-colors">
              무한 스크롤 할 일
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
              path="/todos-infinity"
              element={
                <Protected>
                  <TodosInfinityPage />
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
