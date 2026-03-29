import { useState } from 'react';
import type { Todo } from '../../types/todoType';
import { useTodos } from '../../contexts/TodoContext';
// 알리아스를 이용함   updateTodo as updateTodoService, toggleTodo as toggleTodoService, deleteTodo as deleteTodoService
import {
  updateTodo as updateTodoService,
  toggleTodo as toggleTodoService,
  deleteTodo as deleteTodoService,
} from '../../services/todoServices';

type TodoItemProps = {
  todo: Todo;
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
  // 비동기로 DB에 update 한다
  const handleEditSave = async (): Promise<void> => {
    if (!editTitle.trim()) {
      alert('제목을 입력하세요.');
      return;
    }

    try {
      // DB 의 내용 업데이트
      const result = await updateTodoService(todo.id, { title: editTitle });

      if (result) {
        // context 의 state.todos 의 항목 1개의 타이틀 수정
        editTodo(todo.id, editTitle);
        setIsEdit(false);
      }
    } catch (error) {
      console.log('데이터 업데이트에 실패하였습니다.');
    }
  };
  const handleEditCancel = () => {
    setEditTitle(todo.title);
    setIsEdit(false);
  };

  // 비동기 통신으로 toggle 업데이트
  const handdleToggle = async (): Promise<void> => {
    try {
      // DB 의 completed 가 업데이트가 되었다면, 성공 시 Todo 타입 리턴
      const result = await toggleTodoService(todo.id, !todo.completed);
      if (result) {
        // context 의  state.todos 의 1개 항목 completed 업데이트
        toggleTodo(todo.id);
      }
    } catch (error) {
      console.log('데이터 토글에 실패하였습니다.', error);
    }
  };

  // DB 의 데이터 delete
  const handleDelete = async (): Promise<void> => {
    // DB 삭제
    try {
      await deleteTodoService(todo.id);
      // state 삭제기능
      deleteTodo(todo.id);
    } catch (error) {
      console.log('삭제에 실패하였습니다.', error);
    }
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
          <input type="checkbox" checked={todo.completed} onChange={handdleToggle} />
          <span>{todo.title}</span>
          <button onClick={() => setIsEdit(true)}>수정</button>
          <button onClick={handleDelete}>삭제</button>
        </>
      )}
    </li>
  );
};

export default TodoItem;
