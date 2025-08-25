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
