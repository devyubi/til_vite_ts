import TodoList from './components/todos/TodoList';
import TodoWrite from './components/todos/TodoWrite';
import { TodoProvider } from './contexts/TodoContext';

function App() {
  return (
    <div>
      <h1>Todo Service</h1>
      <TodoProvider>
        <TodoWrite />
        <TodoList />
      </TodoProvider>
    </div>
  );
}

export default App;
