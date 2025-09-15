import { useTodos } from '../../contexts/TodoContext';
import type { Todo } from '../../types/todoType';
import TodoItem from './TodoItem';

export type TodoListProps = {};

const TodoList = ({}: TodoListProps) => {
  const { todos } = useTodos();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h2 className="text-2xl font-bold text-blue-600 mb-4">Todo List</h2>
      <ul className="bg-white shadow-md rounded-lg divide-y divide-gray-200">
        {todos.length === 0 ? (
          <li className="p-4 text-gray-500 text-center">할 일이 없습니다.</li>
        ) : (
          todos.map((item: Todo, index: number) => (
            <li key={item.id} className="p-4 hover:bg-gray-50 transition">
              <TodoItem todo={item} key={item.id} index={index} />
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default TodoList;
