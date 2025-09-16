import React, { useState } from 'react';
import { useTodos } from '../../contexts/TodoContext';
import type { TodoInsert } from '../../types/TodoTypes';
import { createTodo } from '../../services/todoService';

type TodoWriteProps = {
  children?: React.ReactNode;
  handleChangePage: (page: number) => void;
};

const TodoWrite = ({ handleChangePage }: TodoWriteProps) => {
  // Context 사용함
  const { addTodo } = useTodos();

  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  // 데이터가 추가 되고 있는지의 상태
  const [saving, setSaving] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  // Supabase 에 데이터를 Insert 한다. : 비동기
  const handleSave = async (): Promise<void> => {
    if (!title.trim()) {
      alert('제목을 입력하세요.');
      return;
    }
    try {
      // 현재 추가중
      setSaving(true);

      const newTodo = { title, content };
      // Supabase 에 데이터를 Insert 함
      // Insert 결과로 추가가 된 TOdo 형태를 받아옴
      const result = await createTodo(newTodo);
      if (result) {
        // Context 에 Todo 타입 데이터를 추가해줌.
        addTodo(result);
        // 현재 페이지를 1페이지로 이동
        handleChangePage(1);
      }
      // 현재 Write 컴포넌트 state 초기화
      setTitle('');
      setContent('');
    } catch (error) {
      console.log(error);
      alert('데이터 추가에 실패하였습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // 엔터시 저장
      handleSave();
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: 'var(--space-4)', color: 'var(--gray-800)' }}>🎈 할일 작성</h2>
      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <input
          type="text"
          value={title}
          onChange={e => handleChange(e)}
          onKeyDown={e => handleKeyDown(e)}
          className="form-input"
          style={{ flex: 1 }}
          placeholder="새로운 할 일을 추가해 주세요."
        />
        <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
          {saving ? '🥬 등록중...' : '등록'}
        </button>
      </div>
    </div>
  );
};

export default TodoWrite;
