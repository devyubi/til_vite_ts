import { useState } from 'react';
import type { Todo } from '../../types/todoType';
import { useTodos } from '../../contexts/TodoContext';
// 알리아스를 이용함 updateTodo as updateTodoService, toggleTodo as toggleTodoService, deleteTodo as deleteTodoService
import {
  updateTodo as updateTodoService,
  toggleTodo as toggleTodoService,
  deleteTodo as deleteTodoService,
} from '../../services/todoServices';

type TodoItemProps = {
  todo: Todo;
  index: number;
};

const TodoItem = ({ todo, index }: TodoItemProps) => {
  const { toggleTodo, editTodo, deleteTodo, currentPage, itemsPerPage, totalCount } = useTodos();
  // 순서 번호 매기기
  const globalIndex = totalCount - ((currentPage - 1) * itemsPerPage + index);

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
  const handleToggle = async (): Promise<void> => {
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
    <div className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded transition">
      {/* 출력 번호 */}
      <span>{globalIndex}</span>
      {isEdit ? (
        <div className="flex items-center space-x-2 w-full">
          <input
            type="text"
            value={editTitle}
            onChange={e => handleChangeTitle(e)}
            onKeyDown={e => handleKeyDown(e)}
            className="flex-grow border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleEditSave}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            저장
          </button>
          <button
            onClick={handleEditCancel}
            className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
          >
            취소
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={handleToggle}
              className="h-4 w-4 text-blue-500"
            />
            <span className={`${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
              {todo.title}
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEdit(true)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              삭제
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoItem;
