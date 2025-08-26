# useState

## 기본 폴더 구조 생성

- /src/components 폴더 생성
- /src/components/Counter.jsx 폴더 생성
- 실제 프로젝트에서 tsx 가 어렵다면, jsx 로 작업 후 AI에게 변환 요청해도 무방함 (추천하진 않음...)

### ts 프로젝트에서 jsx 사용하도록 설정하기

- `tsconfig.app.json` 수정

```json
{
  "compilerOptions": {
    "composite": true, // ← 프로젝트 참조 사용 시 필요
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",

    "allowJs": true,
    "checkJs": false,

    /* Linting */
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

- `.vscode 폴더의 settings.json` 수정

```json
{
  "files.autoSave": "off",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll": "explicit"
  },
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact"],
  "typescript.suggest.autoImports": true,
  "typescript.suggest.paths": true,
  "javascript.suggest.autoImports": true,
  "javascript.suggest.paths": true,

  // 워크스페이스 TS 사용(강력 권장)
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## useState 활용해 보기

```jsx
import { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);
  const add = () => {
    setCount(count + 1);
  };
  const minus = () => {
    setCount(count - 1);
  };
  const reset = () => {
    setCount(0);
  };
  return (
    <div>
      <h1>Counter : {count}</h1>
      <button onClick={add}>증가</button>
      <button onClick={minus}>감소</button>
      <button onClick={reset}>초기화</button>
    </div>
  );
};

export default Counter;
```

- 위의 코드를 tsx 로 마이그레이션 진행
- 확장자를 `tsx` 로 변경

```
const add: () => void = () => { setCount(count + 1); };
// ↓
<button onClick={() => setCount(count + 1)}>증가</button>
버튼의 onClick 안에서 **직접 setCount(count + 1)**를 쓰고 있음.

따라서 별도로 add(), minus(), reset() 함수를 만들어서 호출할 필요가 없는 거예요.

즉, 지금처럼 inline 함수를 써도 완전히 동일하게 동작합니다.
```

### 요약

- ✅ inline으로 setCount(...) 써도 문제 없음.

- ✅ 함수로 따로 만들어서 쓰는 건 가독성/재사용성 목적.

- 즉, 지금 코드에서는 기능상 필요 없어서 없어도 잘 돌아가는 것.

```tsx
import { useState } from 'react';

type CounterProps = {};
type VoidFun = () => void;

const Counter = ({}: CounterProps): JSX.Element => {
  const [count, setCount] = useState<number>(0);
  const add: () => void = () => {
    setCount(count + 1);
  };
  const minus: () => void = () => {
    setCount(count - 1);
  };
  const reset: () => void = () => {
    setCount(0);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-5xl font-bold mb-8 text-gray-800">Counter: {count}</h1>
      <div className="flex gap-4">
        <button
          onClick={() => setCount(count + 1)}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all"
        >
          증가
        </button>
        <button
          onClick={() => setCount(count - 1)}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all"
        >
          감소
        </button>
        <button
          onClick={() => setCount(0)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all"
        >
          초기화
        </button>
      </div>
    </div>
  );
};

export default Counter;
```

- 사용자 이름 편집 기능 예제

- /src/components/NameEditor.jsx 폴더 생성

```jsx
import { useState } from 'react';

const NameEditor = () => {
  const [name, setName] = useState('');
  const handleChange = e => {
    setName(e.target.value);
  };
  const handleClick = () => {
    console.log('확인');
    setName('');
  };

  return (
    <div>
      <h2>NameEditor : {name}</h2>
      <div>
        <input type="text" value={name} onChange={e => handleChange(e)} />
        <button onClick={handleClick}>확인</button>
      </div>
    </div>
  );
};

export default NameEditor;
```

- tsx 로 마이그레이션 : 확장자를 수정

```tsx
import { useState } from 'react';

type NameEditorProps = {
  children?: React.ReactNode;
};
const NameEditor = ({}: NameEditorProps): JSX.Element => {
  const [name, setName] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log('Enter 입력함.');
      setName('');
    }
  };
  const handleClick = (): void => {
    console.log('확인');
    setName('');
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
        />{' '}
        <button onClick={handleClick}>확인</button>
      </div>
    </div>
  );
};

export default NameEditor;
```

- /src/components/User.jsx 생성

```jsx
import { useState } from 'react';

const User = () => {
  const [user, setUser] = useState({ name: '홍길동', age: 10 });
  const handleClick = () => {
    setUser({ ...user, age: user.age + 1 });
  };
  return (
    <div>
      <h2>
        {' '}
        User : {user.name}님의 나이는 {user.age}살입니다.
      </h2>
      <div>
        <button onClick={handleClick}>나이 증가</button>
      </div>
    </div>
  );
};

export default User;
```

- tsx 로 마이그레이션

```tsx
import { useEffect, useState } from 'react';
type UserProps = {
  children?: React.ReactNode;
  name: string;
  age: number;
};
export type UserType = {
  name: string;
  age: number;
};

const User = ({ name, age }: UserProps): JSX.Element => {
  const [user, setUser] = useState<UserType | null>(null);
  const handleClick = (): void => {
    if (user) {
      setUser({ ...user, age: user.age + 1 });
    }
  };
  useEffect(() => {
    setUser({ name, age });
  }, []);
  return (
    <div>
      <h2>
        User :{' '}
        {user ? (
          <span>
            {user.name}님의 나이는 {user.age}살 입니다.
          </span>
        ) : (
          '사용자 정보가 없습니다.'
        )}
      </h2>
      <div>
        <button onClick={handleClick}>나이 증가</button>
      </div>
    </div>
  );
};

export default User;
```

- App.tsx

```tsx
import Counter from './components/Counter';
import NameEditor from './components/NameEditor';
import User from './components/User';

function App() {
  return (
    <div>
      <h1>App</h1>
      <Counter />
      <NameEditor />
      <User name="문유비" age={10} />
    </div>
  );
}

export default App;
```

## todos 만들기

### 1. 파일 구조

- src/component/todos 폴더 생성
- src/component/todos/TodoList.jsx 파일 생성

```jsx
import TodoItem from './TodoItem';

const TodoList = ({ todos, toggleTodo, editTodo, deleteTodo }) => {
  return (
    <div>
      <h2>TodoList</h2>
      <ul>
        {todos.map(item => (
          <TodoItem
            key={item.id}
            todo={item}
            toggleTodo={toggleTodo}
            editTodo={editTodo}
            deleteTodo={deleteTodo}
          />
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
```

- src/component/todos/TodoWrite.jsx 파일 생성

```jsx
import { useState } from 'react';

const TodoWrite = ({ addTodo }) => {
  const [title, setTitle] = useState('');

  const handleChange = e => {
    setTitle(e.target.value);
  };
  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      // 저장
      handleSave();
    }
  };
  const handleSave = () => {
    if (title.trim()) {
      // 업데이트
      const newTodo = { id: Date.now.toString(), title: title, completed: false };
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
```

- src/component/todos/TododItem.jsx 파일 생성

```jsx
import { useEffect, useState } from 'react';

const TodoItem = ({ todo, toggleTodo, editTodo, deleteTodo }) => {
  // 수정중인지
  const [isEdit, setIsEdit] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const handleChangeTitle = e => {
    setEditTitle(e.target.value);
  };
  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      handleEditSave();
    }
  };
  const handleEditSave = () => {
    if (editTitle.trim()) {
      editTodo(todo.id, editTitle);
      setEditTitle('');
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
```

- App.jsx

```jsx
import { useState } from 'react';
import TodoList from './components/todos/TodoList';
import TodoWrite from './components/todos/TodoWrite';

// 초기 값
const initialTodos = [
  { id: '1', title: '할일 1', completed: false },
  { id: '2', title: '할일 2', completed: true },
  { id: '3', title: '할일 3', completed: false },
];

function App() {
  const [todos, setTodos] = useState(initialTodos);
  // todos 업데이트 하기
  const addTodo = newTodo => {
    setTodos([newTodo, ...todos]);
  };
  // todo completed 토글하기
  const toggleTodo = id => {
    const arr = todos.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item,
    );
    setTodos(arr);
  };
  // todo 삭제하기
  const deleteTodo = id => {
    const arr = todos.filter(item => item.id !== id);
    setTodos(arr);
  };
  // todo 수정하기
  const editTodo = (id, editTitle) => {
    const arr = todos.map(item => (item.id === id ? { ...item, title: editTitle } : item));
    setTodos(arr);
  };

  return (
    <div>
      <h1>할일 웹서비스</h1>
      <div>
        <TodoWrite addTodo={addTodo} />
        <TodoList
          todos={todos}
          toggleTodo={toggleTodo}
          editTodo={editTodo}
          deleteTodo={deleteTodo}
        />
      </div>
    </div>
  );
}

export default App;
```

### 2. ts 마이그레이션

- /src/types 폴더 생성
- /src/types/TodoTypes.ts 폴더 생성

```ts
// newTodoType = todos
export type NewTodoType = {
  id: string;
  title: string;
  completed: boolean;
};
```

- App.tsx (main.tsx에서 다시 import 하고 새로고침해야함)

```tsx
import { useState } from 'react';
import TodoWrite from './components/todos/TodoWrite';
import TodoList from './components/todos/TodoList';
import type { NewTodoType } from './types/todoType';

// 초기 값
const initialTodos: NewTodoType[] = [
  { id: '1', title: '할일 1', completed: false },
  { id: '2', title: '할일 2', completed: true },
  { id: '3', title: '할일 3', completed: false },
];

// todos 에 마우스 커서 올려보고 타입 안맞으면 useState<NewTodoType[]>(initialTodos) 적어주기
// 맞으면 안적어도 됨.
function App() {
  const [todos, setTodos] = useState(initialTodos);
  // todos 업데이트 하기
  const addTodo = (newTodo: NewTodoType) => {
    setTodos([newTodo, ...todos]);
  };
  // todo completed 토글하기
  const toggleTodo = (id: string) => {
    const arr = todos.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item,
    );
    setTodos(arr);
  };
  // todo 삭제하기
  const deleteTodo = (id: string) => {
    const arr = todos.filter(item => item.id !== id);
    setTodos(arr);
  };
  // todo 수정하기
  const editTodo = (id: string, editTitle: string) => {
    const arr = todos.map(item => (item.id === id ? { ...item, title: editTitle } : item));
    setTodos(arr);
  };

  return (
    <div>
      <h1>할일 웹서비스</h1>
      <div>
        <TodoWrite addTodo={addTodo} />
        <TodoList
          todos={todos}
          toggleTodo={toggleTodo}
          editTodo={editTodo}
          deleteTodo={deleteTodo}
        />
      </div>
    </div>
  );
}

export default App;
```

- TodoItem.tsx

```tsx
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
```

- TodoList.tsx

```tsx
import type { NewTodoType } from '../../types/todoType';
import TodoItem from './TodoItem';

export type TodoListProps = {
  todos: NewTodoType[];
  toggleTodo: (id: string) => void;
  editTodo: (id: string, editTitle: string) => void;
  deleteTodo: (id: string) => void;
};

const TodoList = ({ todos, toggleTodo, editTodo, deleteTodo }: TodoListProps) => {
  return (
    <div>
      <h2>TodoList</h2>
      <ul>
        {todos.map((item: any) => (
          <TodoItem
            key={item.id}
            todo={item}
            toggleTodo={toggleTodo}
            editTodo={editTodo}
            deleteTodo={deleteTodo}
          />
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
```

- TodoWrite.tsx

```tsx
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
```
