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
export function useInfinityScroll(): InfinityScrollContextValue {
  const ctx = useContext(InfinityScrollContext);
  if (!ctx) {
    throw new Error('InfinityScrollContext가 없습니다.');
  }
  return ctx;
}
