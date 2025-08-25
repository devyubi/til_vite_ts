import { useState } from 'react';

type NameEditorProps = {
  children?: React.ReactNode;
};

const NameEditor = ({}: NameEditorProps) => {
  const [name, setName] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };

  const handleClick = (): void => {
    console.log('확인:', name);
    setName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log('Enter 입력함:', name);
      setName('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mt-10 w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        NameEditor: {name || '이름을 입력하세요'}
      </h2>
      <div className="flex w-full gap-3">
        <input
          type="text"
          value={name}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="이름을 입력하세요"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <button
          onClick={handleClick}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition-all"
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default NameEditor;
