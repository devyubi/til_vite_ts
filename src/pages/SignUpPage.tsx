import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function SignUpPage() {
  const { signUp } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [pw, setPw] = useState<string>('');
  const [msg, setMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 해당 코드 필수 : 웹브라우저 갱신 막아주기

    // 회원 가입 하기
    const { error } = await signUp(email, pw);
    if (error) {
      setMsg(`회원가입 오류 : ${error}`);
    } else {
      setMsg(`이메일이 발송 되었습니다. 이메일을 확인 해주세요.`);
    }
  };
  return (
    <div>
      <h2>Todo Service 회원 가입</h2>
      <div className="border">
        <form onSubmit={handleSubmit}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
          {/* <button type="button">이메일 중복 확인</button> */}
          <input type="password" value={pw} onChange={e => setPw(e.target.value)} />
          {/* form 안에선 button type 지정해주기 */}
          <button type="submit">회원가입</button>
        </form>
        <p>{msg}</p>
      </div>
    </div>
  );
}

export default SignUpPage;
