import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type PropsWithChildren,
} from 'react';
import type { Todo } from '../types/todoType';
// 전체 DB 가져오기
import { getTodos } from '../services/todoServices';

/** 1) 상태 타입과 초기값: 항상 Todo[]만 유지 */
type TodosState = {
  todos: Todo[];
};
const initialState: TodosState = {
  todos: [],
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
type SetTodosAction = { type: TodoActionType.SET_TODOS; payload: { todos: Todo[] } };
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
      const { todos } = action.payload;
      return { ...state, todos };
    }
    default:
      return state;
  }
}

// Context 타입 : todos는 Todo[]로 고정, addTodo도 Todo를 받도록 함
// 만들어진 context 가 관리하는 value 의 모양
type TodoContextValue = {
  todos: Todo[];
  addTodo: (todo: Todo) => void;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  editTodo: (id: number, editTitle: string) => void;
};

const TodoContext = createContext<TodoContextValue | null>(null);

// 5. Provider
// type TodoProviderProps = {
//   children: React.ReactNode;
// };
// export const TodoProvider = ({ children }: TodoProviderProps) => {

// export const TodoProvider = ({ children }: React.PropsWithChildren) => {

export const TodoProvider: React.FC<PropsWithChildren> = ({ children }): JSX.Element => {
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
  const setTodos = (todos: Todo[]) => {
    dispatch({ type: TodoActionType.SET_TODOS, payload: { todos } });
  };
  // Supabase 의 목록 읽기 함수 표현식
  // 비동기 데이터베이스 접근
  const loadTodos = async (): Promise<void> => {
    try {
      const result = await getTodos();
      setTodos(result ?? []);
    } catch (error) {
      console.error('[loadTodos] 실패:', error);
    }
  };
  useEffect(() => {
    void loadTodos();
  }, []);

  // value 전달할 값
  const value: TodoContextValue = {
    todos: state.todos,
    addTodo,
    toggleTodo,
    deleteTodo,
    editTodo,
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
