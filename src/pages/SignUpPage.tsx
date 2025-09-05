import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { createProfile } from '../lib/profile';
import type { ProfileInsert } from '../types/todoType';

function SignUpPage() {
  const { signUp } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [pw, setPw] = useState<string>('');

  // 추가 정보 ( 닉네임 )
  const [nickName, setNickName] = useState<string>('');
  const [msg, setMsg] = useState<string>('');

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
      },
    });

    if (error) {
      setMsg(`회원가입 오류 : ${error}`);
    } else {
      // 회원가입이 성공했으므로 profiles 도 채워줌
      if (data?.user?.id) {
        // 프로필을 추가함
        const newUser: ProfileInsert = { id: data.user.id, nickname: nickName };
        const result = await createProfile(newUser);
        if (result) {
          // 프로필 추가가 성공한 경우
          setMsg(`회원 가입 및 프로필 생성 성공. 이메일을 확인 해주세요.`);
        } else {
          // 프로필 추가를 실패한 경우
          setMsg(`회원가입은 성공하였으나, 프로필 생성에 실패하였습니다.`);
        }
      } else {
        setMsg(`이메일이 발송 되었습니다. 이메일을 확인 해주세요.`);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Todo Service 회원 가입
        </h2>
        <div className="border rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="이메일"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {/* <button type="button">이메일 중복 확인</button> */}
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="비밀번호"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              value={nickName}
              onChange={e => setNickName(e.target.value)}
              placeholder="닉네임"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {/* form 안에선 button type 지정해주기 */}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
            >
              회원가입
            </button>
          </form>
          <p
            className={`mt-4 text-sm text-center ${
              msg.includes('성공') ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {msg}
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
