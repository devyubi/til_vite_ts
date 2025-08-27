import React, { createContext, useContext, useReducer, type PropsWithChildren } from 'react';
import type { NewTodoType } from '../types/todoType';

type TodosState = {
  todos: NewTodoType[];
};

// 1. 초기값
const initialState: TodosState = {
  todos: [],
};

enum TodoActionType {
  ADD = 'ADD',
  TOGGLE = 'TOGGLE',
  DELETE = 'DELETE',
  EDIT = 'EDIT',
}

// action type 정의
type AddAction = { type: 'ADD'; payload: { todo: NewTodoType } };
type ToggleAction = { type: 'TOGGLE'; payload: { id: string } };
type DeleteAction = { type: 'DELETE'; payload: { id: string } };
type EditAction = { type: 'EDIT'; payload: { id: string; title: string } };
type TodoAction = AddAction | ToggleAction | DeleteAction | EditAction;

// 2. 리듀서
// action 은 {type:"문자열", payload: 재료 } 형태
function reducer(state: TodosState, action: TodoAction) {
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
    default:
      return state;
  }
}
// 3. context 생성
// 만들어진 context 가 관리하는 value 의 모양
type TodoContextValue = {
  todos: NewTodoType[];
  addTodo: (todo: NewTodoType) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  editTodo: (id: string, editTitle: string) => void;
};

const TodoContext = createContext<TodoContextValue | null>(null);

// 4. provider 생성
// type TodoProviderProps = {
//   children: React.ReactNode;
// };
// export const TodoProvider = ({ children }: TodoProviderProps) => {

// export const TodoProvider = ({ children }: React.PropsWithChildren) => {

export const TodoProvider: React.FC<PropsWithChildren> = ({ children }): JSX.Element => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // dispatch 를 위한 함수 표현식 모음
  const addTodo = (newTodo: NewTodoType) => {
    dispatch({ type: TodoActionType.ADD, payload: { todo: newTodo } });
  };
  const toggleTodo = (id: string) => {
    dispatch({ type: TodoActionType.TOGGLE, payload: { id } });
  };
  const deleteTodo = (id: string) => {
    dispatch({ type: TodoActionType.DELETE, payload: { id } });
  };
  const editTodo = (id: string, editTitle: string) => {
    dispatch({ type: TodoActionType.EDIT, payload: { id, title: editTitle } });
  };

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

// 5. custom hook 생성
export function useTodos() {
  const ctx = useContext(TodoContext);
  if (!ctx) {
    throw new Error('context를 찾을 수 없습니다.');
  }
  return ctx; // value 를 리턴함
}
