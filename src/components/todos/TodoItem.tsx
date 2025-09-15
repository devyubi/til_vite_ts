import { useState } from 'react';
import type { Todo } from '../../types/todoType';
import { useTodos } from '../../contexts/TodoContext';
// 알리아스를 이용함 updateTodo as updateTodoService, toggleTodo as toggleTodoService, deleteTodo as deleteTodoService
import {
  updateTodo as updateTodoService,
  toggleTodo as toggleTodoService,
  deleteTodo as deleteTodoService,
} from '../../services/todoServices';
import { motion } from 'framer-motion';

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
    <motion.div
      className="group grid grid-cols-[3rem_1fr_auto] items-center gap-4 px-5 py-4 transition-colors hover:bg-neutral-50"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
    >
      {/* 출력 번호 */}
      <span className="select-none text-center text-sm font-medium text-neutral-500 tabular-nums">
        {globalIndex}
      </span>

      {isEdit ? (
        <div className="col-span-2 flex w-full items-center gap-2">
          <input
            type="text"
            value={editTitle}
            onChange={e => handleChangeTitle(e)}
            onKeyDown={e => handleKeyDown(e)}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-[15px] text-neutral-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          <button
            onClick={handleEditSave}
            className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            저장
          </button>
          <button
            onClick={handleEditCancel}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-300"
          >
            취소
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={handleToggle}
              className="h-5 w-5 rounded border-neutral-300 accent-blue-600"
            />
            <span className={todo.completed ? 'text-neutral-400 line-through' : 'text-neutral-900'}>
              {todo.title}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setIsEdit(true)}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-300"
            >
              수정
            </button>
            <button
              onClick={handleDelete}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              삭제
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default TodoItem;
