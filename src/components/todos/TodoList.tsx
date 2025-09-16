import React from 'react';
import { useTodos } from '../../contexts/TodoContext';
import TodoItem from './TodoItem';
import type { Todo } from '../../types/TodoTypes';

type TodoListProps = {};

const TodoList = ({}: TodoListProps): JSX.Element => {
  const { todos } = useTodos();
  return (
    <div>
      <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--gray-800)' }}>할일목록</h3>
      <ul>
        {todos.map((item: Todo, index: number) => (
          <TodoItem key={item.id} todo={item} index={index} />
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
