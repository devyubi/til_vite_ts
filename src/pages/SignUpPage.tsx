import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

function SignUpPage() {
  const { signUp } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [pw, setPw] = useState<string>('');

  // 추가 정보 ( 닉네임 )
  const [nickName, setNickName] = useState<string>('');
  const [msg, setMsg] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 해당 코드 필수 : 웹브라우저 갱신 막아주기
    // 유효성 검사
    if (!email.trim()) {
      alert('이메일을 입력하세요.');
      return;
    }

    if (!pw.trim()) {
      alert('비밀번호를 입력하세요.');
      return;
    }
    if (pw.length < 6) {
      alert('비밀번호는 최소 6자 이상입니다.');
      return;
    }

    if (!nickName.trim()) {
      alert('닉네임을 입력하세요.');
      return;
    }

    // 회원 가입 및 추가 정보 입력하기
    const { error, data } = await supabase.auth.signUp({
      email,
      password: pw,
      options: {
        // 회원 가입 후 이메일로 인증 확인시 리다이렉트 될 URL
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        // 잠시 추가 정보를 보관함
        // supabase 에서 auth 에는 추가적인 정보를 저장하는 객체가 존재함
        // 이메일 인증 후 프로필 생성시에 사용하려고 보관함
        data: { nickName: nickName }, // 공식적인 명칭 : `metadata` 라고 함
      },
    });

    if (error) {
      setMsg(`회원가입 오류 : ${error}`);
    } else {
      setMsg(
        '회원 가입이 성공했습니다. 이메일을 확인해주세요. 인증 완료 후 프로필이 자동으로 생성됩니다.',
      );
      // 회원가입 성공 시 로그인 페이지로 이동
      navigate('/signin');
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
          Todo Service 회원 가입
        </h2>
        <div className="rounded-xl border border-neutral-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="이메일"
              autoComplete="email"
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 text-[15px] text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            {/* <button type="button">이메일 중복 확인</button> */}
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="비밀번호"
              autoComplete="new-password"
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 text-[15px] text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            <input
              type="text"
              value={nickName}
              onChange={e => setNickName(e.target.value)}
              placeholder="닉네임"
              className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 text-[15px] text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
            {/* form 안에선 button type 지정해주기 */}
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              회원가입
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

export default SignUpPage;
