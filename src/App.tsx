import { useState } from 'react';
import TodoWrite from './components/todos/TodoWrite';
import TodoList from './components/todos/TodoList';
import type { NewTodoType } from './types/todoType';

// 초기 값
const initialTodos: NewTodoType[] = [
  { id: '1', title: '할일 1', completed: false },
  { id: '2', title: '할일 2', completed: true },
  { id: '3', title: '할일 3', completed: false },
];

// todos 에 마우스 커서 올려보고 타입 안맞으면 useState<NewTodoType[]>(initialTodos) 적어주기
// 맞으면 안적어도 됨.
function App() {
  const [todos, setTodos] = useState(initialTodos);
  // todos 업데이트 하기
  const addTodo = (newTodo: NewTodoType) => {
    setTodos([newTodo, ...todos]);
  };
  // todo completed 토글하기
  const toggleTodo = (id: string) => {
    const arr = todos.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item,
    );
    setTodos(arr);
  };
  // todo 삭제하기
  const deleteTodo = (id: string) => {
    const arr = todos.filter(item => item.id !== id);
    setTodos(arr);
  };
  // todo 수정하기
  const editTodo = (id: string, editTitle: string) => {
    const arr = todos.map(item => (item.id === id ? { ...item, title: editTitle } : item));
    setTodos(arr);
  };

  return (
    <div>
      <h1>할일 웹서비스</h1>
      <div>
        <TodoWrite addTodo={addTodo} />
        <TodoList
          todos={todos}
          toggleTodo={toggleTodo}
          editTodo={editTodo}
          deleteTodo={deleteTodo}
        />
      </div>
    </div>
  );
}

export default App;
