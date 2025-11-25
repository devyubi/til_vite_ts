import { useState } from 'react';

type NameEditorProps = {
  children?: React.ReactNode;
};

function NameEditor({ children }: NameEditorProps): JSX.Element {
  const [name, setName] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };
  const handleSave = () => {
    setName('');
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log('Enter 입력');
    }
  };

  return (
    <div>
      <h2>NameEditor : {name}</h2>
      <div>
        <input
          type="text"
          value={name}
          onChange={e => handleChange(e)}
          onKeyDown={e => handleKeyDown(e)}
        />
        <button onClick={handleSave}>확인</button>
      </div>
    </div>
  );
}

export default NameEditor;
