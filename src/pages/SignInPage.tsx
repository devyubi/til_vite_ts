import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function SignInPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>('');
  const [pw, setPw] = useState<string>('');
  const [msg, setMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 해당 코드 필수 : 웹브라우저 갱신 막아주기

    const { error } = await signIn(email, pw);
    if (error) {
      setMsg(`로그인 오류 : ${error}`);
    } else {
      setMsg(`로그인이 성공하였습니다.`);
      navigate('/'); // 로그인 성공 시 홈으로 이동
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 px-4 flex items-center justify-center">
      <motion.div
        className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      >
        <h2 className="mb-6 text-center text-2xl font-bold tracking-tight text-neutral-900">
          로그인
        </h2>
        <div className="rounded-xl border border-neutral-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="이메일"
              autoComplete="email"
              autoFocus
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 text-[15px] text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="비밀번호"
              autoComplete="current-password"
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 text-[15px] text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              로그인
            </button>
          </form>
          <p
            className={`mt-4 text-center text-sm ${
              msg.includes('성공') ? 'text-green-600' : 'text-red-600'
            }`}
            aria-live="polite"
          >
            {msg}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default SignInPage;
