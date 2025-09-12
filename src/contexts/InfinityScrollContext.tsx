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
