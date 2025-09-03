import TodoList from '../components/todos/TodoList';
import TodoWrite from '../components/todos/TodoWrite';
import { TodoProvider } from '../contexts/TodoContext';

function TodosPage() {
  return (
    <div>
      <h2>할 일</h2>
      <TodoProvider>
        <div>
          <TodoWrite />
        </div>
        <div>
          <TodoList />
        </div>
      </TodoProvider>
    </div>
  );
}

export default TodosPage;
