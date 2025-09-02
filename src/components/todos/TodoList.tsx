import { useTodos } from '../../contexts/TodoContext';
import type { Todo } from '../../types/todoType';
import TodoItem from './TodoItem';

export type TodoListProps = {};

const TodoList = ({}: TodoListProps) => {
  const { todos } = useTodos();

  return (
    <div>
      <h2>TodoList</h2>
      <ul>
        {todos.map((item: Todo) => (
          <TodoItem key={item.id} todo={item} />
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
