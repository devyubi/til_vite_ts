import { useState } from 'react';
import { useTodos } from '../../contexts/TodoContext';
import type { TodoInsert } from '../../types/todoType';
import { createTodo } from '../../services/todoServices';

type TodoWriteProps = {
  children?: React.ReactNode;
};
const TodoWrite = ({}: TodoWriteProps): JSX.Element => {
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
      const newTodo: TodoInsert = { title, content };
      // Supabase 에 데이터를 Insert 함
      // Insert 결과
      const result = await createTodo(newTodo);
      if (result) {
        // Context 에 데이터를 추가해 줌.
        addTodo(result);
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
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-blue-600 mb-4">할 일 작성</h2>
      <div className="flex space-x-2">
        <input
          type="text"
          value={title}
          onChange={e => handleChange(e)}
          onKeyDown={e => handleKeyDown(e)}
          placeholder="할 일을 입력하세요..."
          className="flex-grow border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
        >
          등록
        </button>
      </div>
    </div>
  );
};

export default TodoWrite;
