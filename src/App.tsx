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
