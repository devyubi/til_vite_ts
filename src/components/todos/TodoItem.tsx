import { useEffect, useState } from 'react';
import type { NewTodoType } from '../../types/todoType';

type TodoItemProps = {
  todo: NewTodoType;
  toggleTodo: (id: string) => void;
  editTodo: (id: string, editTitle: string) => void;
  deleteTodo: (id: string) => void;
};

const TodoItem = ({ todo, toggleTodo, editTodo, deleteTodo }: TodoItemProps) => {
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
