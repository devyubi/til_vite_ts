import { useState } from 'react';
import type { NewTodoType } from '../../types/todoType';

type TodoWriteProps = {
  // children 이 있을 경우는 적지만, 없을 경우 굳이 안적어도 됨. (수업이라 적음)
  children?: React.ReactNode;
  addTodo: (newTodo: NewTodoType) => void;
};

const TodoWrite = ({ addTodo }: TodoWriteProps) => {
  const [title, setTitle] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // 저장
      handleSave();
    }
  };
  const handleSave = () => {
    if (title.trim()) {
      // 업데이트
      const newTodo = { id: Date.now().toString(), title: title, completed: false };
      addTodo(newTodo);
      setTitle('');
    }
  };

  return (
    <div>
      <h2>할 일 작성</h2>
      <div>
        <input
          type="text"
          value={title}
          onChange={e => handleChange(e)}
          onKeyDown={e => handleKeyDown(e)}
        />
        <button onClick={handleSave}>등록</button>
      </div>
    </div>
  );
};

export default TodoWrite;
