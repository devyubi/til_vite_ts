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

```tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { InfinityScrollProvider, useInfinityScroll } from '../contexts/InfinityScrollContext';
import type { Profile } from '../types/todoType';
import { getProfile } from '../lib/profile';

// 용서하세요. 입력창 컴포넌트임다 컴포넌트라 const
const InfinityTodoWrite = () => {
  const { addTodo, loadingInitialTodos } = useInfinityScroll();

  const [title, setTitle] = useState('');
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };
  const handleSave = async (): Promise<void> => {
    if (!title.trim()) {
      alert('제목을 입력하세요');
      return;
    }
    try {
      // 새 할 일 추가
      await addTodo(title);
      // 다시 데이터를 로딩함
      await loadingInitialTodos();
      setTitle('');
    } catch (error) {
      console.log('등록에 오류가 발생 : ', error);
      alert(`등록에 오류가 발생 : ${error}`);
    }
  };

  return (
    <div>
      <h2>할 일 작성</h2>
      <div>
        <input
          type="text"
          value={title}
          onChange={e => handleChange(e)}
          onKeyDown={e => handleKeyDown(e)}
          placeholder="할 일을 입력 해주세요."
          className="border"
        />
        <button onClick={handleSave}>등록</button>
      </div>
    </div>
  );
};

// 용서하세요..ㅋㅋ 목록 컴포넌트
const InfinityTodoList = () => {
  const { loading, todos, totalCount, editTodo, toggleTodo, deleteTodo, loadingInitialTodos } =
    useInfinityScroll();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  // 사용자 프로필 가져오기
  useEffect(() => {
    const loadProifle = async () => {
      if (user?.id) {
        const userProfile = await getProfile(user.id);
        setProfile(userProfile);
      }
    };
    loadProifle();
  }, [user?.id]);

  // 번호 계산 함수 (최신글이 높은 번호를 가지도록)
  const getGlobalIndex = (index: number) => {
    // 무한 스크롤 시에 계산해서 번호 출력
    const globalIndex = totalCount - index;
    // console.log(
    //   `번호 계산 - index : ${index}, totalCount : ${totalCount}, globalIndex: ${globalIndex}`,
    // );
    return globalIndex;
  };

  // 날짜 포맷팅 함수 ( 자주 쓰여서 유틸 폴더 만들어서 관리해도 좋음 )
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '날짜 없음';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 수정 상태 관리
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');

  // 수정 시작
  const handleEditStart = (todo: any) => {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  };

  // 수정 취소
  const handleEditCancel = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  // 수정 저장
  const handleEditSave = async (id: number) => {
    if (!editingTitle.trim()) {
      alert('제목을 입력하세요.');
      return;
    }
    try {
      editTodo(id, editingTitle);
      setEditingId(null);
      setEditingTitle('');
    } catch (error) {
      console.log(error);
      alert('수정에 실패했습니다.');
    }
  };

  const handleToggle = async (id: number) => {
    try {
      // Context 의 state 를 업데이트함
      await toggleTodo(id);
    } catch (error) {
      console.log('토글 실패 :', error);
      alert('상태 변경에 실패하였습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        // id 를 삭제
        await deleteTodo(id);
        // 삭제 이후 번호를 갱신해서 정리해줌
        await loadingInitialTodos();
      } catch (error) {
        console.log('삭제에 실패하였습니다.');
        alert('삭제에 실패하였습니다.');
      }
    }
  };

  if (loading) {
    return <div>데이터 로딩중...</div>;
  }
  return (
    <div>
      <h3>
        TodoList (무한스크롤){profile?.nickname && <span>{profile.nickname} 님의 할 일</span>}
        {todos.length === 0 ? (
          <p>등록된 할 일이 없습니다.</p>
        ) : (
          <div>
            <ul>
              {todos.map((item, index) => (
                <li key={item.id}>
                  {/* 번호 표시 */}
                  <span>{getGlobalIndex(index)}</span>
                  {/* 체크 박스 */}
                  <input
                    type="checkbox"
                    checked={item.completed}
                    className="border"
                    onChange={() => handleToggle(item.id)}
                  />
                  {/* 제목과 날짜 출력 */}
                  <div>
                    {editingId === item.id ? (
                      <input
                        className="border"
                        type="text"
                        value={editingTitle}
                        onChange={e => setEditingTitle(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            handleEditSave(item.id);
                          } else if (e.key === 'Escape') {
                            handleEditCancel();
                          }
                        }}
                      />
                    ) : (
                      <span>{item.title}</span>
                    )}

                    <span>작성일 : {formatDate(item.created_at)}</span>
                  </div>
                  {/* 버튼들 */}
                  {editingId === item.id ? (
                    <>
                      <button onClick={() => handleEditSave(item.id)} className="border">
                        저장
                      </button>
                      <button onClick={handleEditCancel} className="border">
                        취소
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditStart(item)} className="border">
                        수정
                      </button>
                      <button className="border" onClick={() => handleDelete(item.id)}>
                        삭제
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </h3>
    </div>
  );
};

function TodosInfinityPage() {
  return (
    <div>
      <InfinityScrollProvider itemsPerPage={5}>
        <div>
          <h1>무한 스크롤 Todo 목록</h1>
          <div>
            <InfinityTodoWrite />
          </div>
          <div>
            <InfinityTodoList />
          </div>
        </div>
      </InfinityScrollProvider>
    </div>
  );
}

export default TodosInfinityPage;
```

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

- InfinityContext.tsx

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
import {
  getTodosInfinity,
  updateTodo,
  deleteTodo as updateDeletedServiceTodo,
  toggleTodo as updateServiceToggTodo,
  createTodo,
} from '../services/todoServices';
import { supabase } from '../lib/supabase';

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
  addTodo: (title: string) => Promise<void>;
  toggleTodo: (id: number) => Promise<void>;
  deleteTodo: (id: number) => Promise<void>;
  editTodo: (id: number, title: string) => Promise<void>;
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
  const addTodo = async (title: string): Promise<void> => {
    try {
      const result = await createTodo({ title });
      if (!result) {
        console.log('글 등록에 실패 하였습니다.');
        return;
      }
      // DB 업데이트 후 State 업데이트
      dispatch({ type: InfinityScrollActionType.ADD_TODO, payload: { todo: result } });
    } catch (error) {
      console.log(`새 Todo 등록 오류 : ${error}`);
    }
  };
  // Todo 토글
  const toggleTodo = async (id: number): Promise<void> => {
    try {
      // 현재 전달 된 id 에 해당하는 todo 항목의 completed 를 파악한다.
      const currentTodo = state.todos.find(item => item.id === id);
      if (!currentTodo) {
        console.log('Todo 를 찾지 못했습니다. :', id);
        return;
      }
      const result = await updateServiceToggTodo(id, !currentTodo.completed);
      if (result) {
        // DB 업데이트 후 state 업데이트
        dispatch({ type: InfinityScrollActionType.TOGGLE_TODO, payload: { id } });
      } else {
        console.log('할 일 상태 업데이트 실패');
      }
    } catch (error) {
      console.log(`상태 변경 오류 : ${error}`);
    }
  };
  // Todo 삭제
  const deleteTodo = async (id: number): Promise<void> => {
    try {
      await updateDeletedServiceTodo(id);
      // DB 업데이트 후 state 처리
      dispatch({ type: InfinityScrollActionType.DELETE_TODO, payload: { id } });
    } catch (error) {
      console.log(`삭제 오류 : ${error}`);
    }
  };
  // Todo 수정
  const editTodo = async (id: number, title: string): Promise<void> => {
    try {
      const updatedTodo = await updateTodo(id, { title });
      if (updatedTodo) {
        // 아래는 그냥 state 만 업데이트함. (실제 DB에 업데이트 하고 => state 업데이트 과정이 필요함.)
        dispatch({ type: InfinityScrollActionType.EDIT_TODO, payload: { id, title } });
      } else {
        console.log('업데이트에 실패하였습니다.');
      }
    } catch (error) {
      console.log(`업데이트 오류 : ${error}`);
    }
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
export function useInfinityScroll(): InfinityScrollContextValue {
  const ctx = useContext(InfinityScrollContext);
  if (!ctx) {
    throw new Error('InfinityScrollContext가 없습니다.');
  }
  return ctx;
}
```

## 6. 무한 스크롤 구현

- IntersectionObserver 를 이용함
- `웹브라우저에 내장` 된 API 중 하나임
- 요소 즉, 대상이 되는 태그(element)가
  - viewport(화면에 보이는 영역),
  - 또는 특정 스크롤 영역과 교차(intersect)하는지 감시하는 도구임.
  - intersect 는 DOM 요소가 화면에 보이거나, 사라지게 하는 등 을 말함
- `스크롤 이벤트를 사용하지 않고도 자동으로 화면에 보이는 순간을 체크`할 수 있음.

### 6.1 기본 문법

```js
const observer = new IntersectionObserver((entries, observer) => {
  // entries: 관찰 중인 모든 요소의 교차 상태 목록
  // observer: 지금 만든 옵저버 자기 자신
});

// 특정 DOM 요소 관찰 시작
observer.observe(domElement);

// 관찰 해제
observer.unobserve(domElement);

// 모든 관찰 중지
observer.disconnect();
```

### 6.2 예제

- `<div id="target"></div>`

```js
const target = document.getElementById('target');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log('화면에 보임!', entry);
    } else {
      console.log('화면에서 나감!', entry);
    }
  });
});

observer.observe(target);
```

### 6.3 옵션

```js
const options = {
  root: null, // 관찰 기준 영역 (null이면 브라우저 뷰포트)
  rootMargin: '0px', // root 바깥쪽 여백 (미리 감지하고 싶을 때 '200px' 같은 값)
  threshold: 0.5, // 요소가 50% 보였을 때만 트리거
};

const observer = new IntersectionObserver(callback, options);
```

## 7. 무한 스크롤 구현

- https://www.npmjs.com/package/react-infinite-scroll-component
- https://blog.itcode.dev/posts/2024/07/22/react-component-infinite-scroll
- https://goddino.tistory.com/entry/react-react-infinite-scroll-component-%EC%82%AC%EC%9A%A9%EB%B2%95-ft-%EB%AC%B4%ED%95%9C-%EC%8A%A4%ED%81%AC%EB%A1%A4

### 7.1. npm 설치

```bash
npm i react-infinite-scroll-component
```
