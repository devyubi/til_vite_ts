import { useState } from 'react';
import { useTodos } from '../../contexts/TodoContext';
import type { TodoInsert } from '../../types/todoType';
import { createTodo } from '../../services/todoServices';

type TodoWriteProps = {
  children?: React.ReactNode;
  handleChangePage: (page: number) => void;
};
const TodoWrite = ({ handleChangePage }: TodoWriteProps): JSX.Element => {
  // Context 를 사용함.
  const { addTodo } = useTodos();

  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setTitle(e.target.value);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  //  Supabase 에 데이터를 Insert 한다. : 비동기
  const handleSave = async (): Promise<void> => {
    if (!title.trim()) {
      alert('제목을 입력하세요.');
      return;
    }

    try {
      const newTodo = { title, content };
      // Supabase 에 데이터를 Insert 함
      // Insert 결과
      const result = await createTodo(newTodo);
      if (result) {
        // Context 에 데이터를 추가해 줌.
        addTodo(result);
        // 현재 페이지를 1 페이지로 이동
        handleChangePage(1);
      }

      // 현재 Write 컴포넌트 state 초기화
      setTitle('');
      setContent('');
    } catch (error) {
      console.log(error);
      alert('데이터 추가에 실패 하였습니다.');
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-sky-700">할 일 작성</h2>
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={e => handleChange(e)}
          onKeyDown={e => handleKeyDown(e)}
          placeholder="할 일을 입력하세요..."
          className="flex-grow rounded-lg border border-neutral-300 bg-white px-3 py-2 text-[15px] text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
        />
        <button
          onClick={handleSave}
          className="shrink-0 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-300"
        >
          등록
        </button>
      </div>
    </div>
  );
};

export default TodoWrite;
