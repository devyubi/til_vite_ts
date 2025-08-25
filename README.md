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
