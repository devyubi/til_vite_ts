# Context API 와 useReducer

- useState 를 대체하고, props 를 줄여보자

## 1. 기본 폴더 구성 및 파일 구조

- /src/contexts 폴더 생성
- /src/contexts/TodoContext.jsx 생성

```jsx
import { createContext, useContext, useReducer } from 'react';

// 1. 초기값
const initialState = {
  todos: [],
};
// 2. 리듀서
// action 은 {type:"문자열", payload: 재료 } 형태
function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { todo } = action.payload;
      return { ...state, todos: [todo, ...state.todos] };
    }
    case 'TOGGLE': {
      const { id } = action.payload;
      const arr = state.todos.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      );
      return { ...state, todos: arr };
    }
    case 'DELETE': {
      const { id } = action.payload;
      const arr = state.todos.filter(item => item.id !== id);
      return { ...state, todos: arr };
    }
    case 'EDIT': {
      const { id, title } = action.payload;
      const arr = state.todos.map(item => (item.id === id ? { ...item, title } : item));
      return { ...state, todos: arr };
    }
    default:
      return state;
  }
}
// 3. context 생성
const TodoContext = createContext();
// 4. provider 생성
export const TodoProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // dispatch 를 위한 함수 표현식 모음
  const addTodo = newTodo => {
    dispatch({ type: 'ADD', payload: { todo: newTodo } });
  };
  const toggleTodo = id => {
    dispatch({ type: 'TOGGLE', payload: { id } });
  };
  const deleteTodo = id => {
    dispatch({ type: 'DELETE', payload: { id } });
  };
  const editTodo = (id, editTitle) => {
    dispatch({ type: 'EDIT', payload: { id, title: editTitle } });
  };

  // value 전달할 값
  const value = {
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
  return ctx;
}
```

- App.tsx

```tsx
import TodoList from './components/todos/TodoList';
import TodoWrite from './components/todos/TodoWrite';
import { TodoProvider } from './contexts/TodoContext';

function App() {
  return (
    <div>
      <h1>할일 웹서비스</h1>
      <TodoProvider>
        <div>
          <TodoWrite />
          <TodoList />
        </div>
      </TodoProvider>
    </div>
  );
}

export default App;
```

- TodoWrite.tsx

```tsx
import { useState } from 'react';
import { useTodos } from '../../contexts/TodoContext';

type TodoWriteProps = {
  // children 이 있을 경우는 적지만, 없을 경우 굳이 안적어도 됨. (수업이라 적음)
  children?: React.ReactNode;
};

const TodoWrite = ({}: TodoWriteProps) => {
  const [title, setTitle] = useState('');
  // context 사용
  const { addTodo } = useTodos();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // 저장
      handleSave();
    }
  };
  const handleSave = () => {
    if (title.trim()) {
      // 업데이트
      const newTodo = { id: Date.now().toString(), title: title, completed: false };
      addTodo(newTodo);
      setTitle('');
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
        />
        <button onClick={handleSave}>등록</button>
      </div>
    </div>
  );
};

export default TodoWrite;
```

- TodoList.tsx

```tsx
import { useTodos } from '../../contexts/TodoContext';
import TodoItem from './TodoItem';

export type TodoListProps = {};

const TodoList = ({}: TodoListProps) => {
  const { todos } = useTodos();

  return (
    <div>
      <h2>TodoList</h2>
      <ul>
        {todos.map((item: any) => (
          <TodoItem key={item.id} todo={item} />
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
```

- TodoItem.tsx

```tsx
import { useState } from 'react';
import { useTodos } from '../../contexts/TodoContext';
import type { NewTodoType } from '../../types/todoType';

type TodoItemProps = {
  todo: NewTodoType;
};

const TodoItem = ({ todo }: TodoItemProps) => {
  const { toggleTodo, editTodo, deleteTodo } = useTodos();

  // 수정중인지

  const [isEdit, setIsEdit] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditTitle(e.target.value);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleEditSave();
    }
  };
  const handleEditSave = () => {
    if (editTitle.trim()) {
      editTodo(todo.id, editTitle);
      setIsEdit(false);
    }
  };
  const handleEditCancel = () => {
    setEditTitle(todo.title);
    setIsEdit(false);
  };
  return (
    <li>
      {isEdit ? (
        <>
          <input
            type="text"
            value={editTitle}
            onChange={e => handleChangeTitle(e)}
            onKeyDown={e => handleKeyDown(e)}
          />
          <button onClick={handleEditSave}>저장</button>
          <button onClick={handleEditCancel}>취소</button>
        </>
      ) : (
        <>
          <input type="checkbox" checked={todo.completed} onChange={() => toggleTodo(todo.id)} />
          <span>{todo.title}</span>
          <button onClick={() => setIsEdit(true)}>수정</button>
          <button onClick={() => deleteTodo(todo.id)}>삭제</button>
        </>
      )}
    </li>
  );
};

export default TodoItem;
```

## 2. TodoContext.jsx => ts 마이그레이션

- 확장자 `tsx` 로 변경 ( import 다시 실행 )

```tsx
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
```
