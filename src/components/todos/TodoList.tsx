import type { NewTodoType } from '../../types/todoType';
import TodoItem from './TodoItem';

export type TodoListProps = {
  todos: NewTodoType[];
  toggleTodo: (id: string) => void;
  editTodo: (id: string, editTitle: string) => void;
  deleteTodo: (id: string) => void;
};

const TodoList = ({ todos, toggleTodo, editTodo, deleteTodo }: TodoListProps) => {
  return (
    <div>
      <h2>TodoList</h2>
      <ul>
        {todos.map((item: any) => (
          <TodoItem
            key={item.id}
            todo={item}
            toggleTodo={toggleTodo}
            editTodo={editTodo}
            deleteTodo={deleteTodo}
          />
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
