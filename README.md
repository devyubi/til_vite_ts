# 프로젝트 초기 기본 설정

- main.tsx

```tsx
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
```

- index.css (tailwind 설치 했을 때)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 글꼴 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=Noto+Sans:wght@400;500;700&display=swap');
:root {
  font-family: 'Noto Sans KR', 'Noto Sans', sans-serif;
}
body {
  font-family: 'Noto Sans KR', 'Noto Sans', sans-serif;
}
:root {
  --app-max-w: 720px;
}

/* 기본 html, body */
html,
body,
#root {
  height: 100%;
}

/* 전체 body 색상 지정해줌 (container) */
body {
  @apply bg-gray-50;
  @apply transition-colors duration-300; /* 다크 모드 전환 부드럽게 */
}

.container-app {
  @apply mx-auto max-w-[var(--app-max-w)] px-4;
}

/* 테마 변수 */
/* Light (기본) */
:root {
  --bg: 0 0% 98%;
  --fg: 222 47% 11%;
  --surface: 0 0% 100%;
  --border: 220 13% 91%;
  --primary: 245 83% 60%; /* 보라 */
  --primary-fg: 0 0% 100%;
}

/* Dark */
.theme-dark {
  --bg: 222 47% 7%;
  --fg: 210 40% 96%;
  --surface: 222 47% 11%;
  --border: 217 19% 27%;
  --primary: 245 83% 60%;
  --primary-fg: 0 0% 100%;
}

/* Ocean */
.theme-ocean {
  --bg: 200 60% 97%;
  --fg: 210 24% 20%;
  --surface: 200 50% 99%;
  --border: 206 15% 85%;
  --primary: 200 90% 45%; /* 파랑 */
  --primary-fg: 0 0% 100%;
}

/* High Contrast */
.theme-hc {
  --bg: 0 0% 100%;
  --fg: 0 0% 0%;
  --surface: 0 0% 100%;
  --border: 0 0% 0%;
  --primary: 62 100% 50%; /* 노랑 */
  --primary-fg: 0 0% 0%;
}
```

# 컴포넌트 생성

## 1. 함수 형태

- App.tsx `rfce`

```tsx
function App(): JSX.Element {
  return <div>App</div>;
}

export default App;
```

## 2. 표현식 형태

- App.tsx `rafce`

```tsx
const App = (): JSX.Element => {
  return <div>App</div>;
};

export default App;
```

- 컴포넌트 생성 및 활용

```tsx
const Sample = (): JSX.Element => {
  return <div>샘플입니다.</div>;
};

const App = (): JSX.Element => {
  return (
    <div>
      <h1>App</h1>
      <Sample></Sample>
    </div>
  );
};

export default App;
```

## 3. children 요소를 배치 시 오류 발생

- 문제 코드 (children 오류)

```tsx
// children : 타입이 없어서 오류가 발생함
const Sample = ({ children }): JSX.Element => {
  return <div>샘플입니다.</div>;
};

const App = (): JSX.Element => {
  return (
    <div>
      <h1>App</h1>
      <Sample>
        <h2>자식입니다.</h2>
      </Sample>
    </div>
  );
};

export default App;
```

- 문제 해결 (children 타입 없는 오류 해결 1) : ※ 추천하지 않음 ※

```tsx
// React.FC 에 React 가 가지고 있는 children props 를 사용한다고 명시
const Sample: React.FC<React.PropsWithChildren> = ({ children }): JSX.Element => {
  return <div>샘플입니다.</div>;
};

const App = (): JSX.Element => {
  return (
    <div>
      <h1>App</h1>
      <Sample>
        <h2>자식입니다.</h2>
      </Sample>
    </div>
  );
};

export default App;
```

- 문제 해결 (children 타입 없는 오류 해결 2) : ※ 적극 추천 - props 에 대해서 일관성 유지 ※

```tsx
type SampleProps = {
  children?: React.ReactNode;
};

const Sample = ({ children }: SampleProps): JSX.Element => {
  return <div>{children}</div>;
};

const App = (): JSX.Element => {
  return (
    <div>
      <h1>App</h1>
      <Sample>
        <h2>자식입니다.</h2>
      </Sample>
    </div>
  );
};

export default App;
```

- 최종 모양 ( : JSX.Element 제거)

```tsx
type SampleProps = {
  children?: React.ReactNode;
};

const Sample = ({ children }: SampleProps) => {
  return <div>{children}</div>;
};

const App = (): JSX.Element => {
  return (
    <div>
      <h1>App</h1>
      <Sample>
        <h2>자식입니다.</h2>
      </Sample>
    </div>
  );
};

export default App;
```

- 향후 컴포넌트는 JSX.Element 와 Props 타입을 작성하자

```tsx
type SampleProps = {
  Children?: React.ReactNode;
  age: number;
  nickName: string;
};

const Sample = ({ age, nickName }: SampleProps) => {
  return (
    <div>
      나이는 {age}살, 별명이 {nickName} 인 샘플입니다.
    </div>
  );
};

const App = () => {
  return (
    <div>
      <h1>App</h1>
      <Sample age={28} nickName="문유비" />
    </div>
  );
};

export default App;
```
