import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { createProfile } from '../lib/profile';
import type { ProfileInsert } from '../types/TodoTypes';

function SignUpPage() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [pw, setPw] = useState<string>('');
  // 추가 정보 (닉네임)
  const [nickName, setNickName] = useState<string>('');
  const [msg, setMsg] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // 웹 브라우저 갱신 막기
    e.preventDefault();

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

    // 회원가입 하기 및 추가정보 입력하기
    const { error, data } = await supabase.auth.signUp({
      email,
      password: pw,
      options: {
        // 회원 가입 후 이메일로 인증 확인시 리다이렉트 될 URL
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        // 잠시 추가정보를 보관함.
        // Supabase 에서 auth 에는 추가적인 정보를 저장하는 객체가 존재
        // 공식적인 명칭은 metadata 라고 한다.
        // 이메일 인증 후에 프로필 생성시에 사용하려고 보관
        data: { nickName: nickName },
      },
    });
    if (error) {
      setMsg(`회원가입 오류 : ${error}`);
    } else {
      setMsg(
        '회원가입이 성공했습니다. 이메일 인증 링크를 확인해주세요. 인증 완료 후 프로필이 자동으로 생성됩니다.',
      );
      // 회원가입 성공했으므로 profiles 도 채워준다.
      if (data?.user?.id) {
        // 프로필을 추가한다.
        const newUser: ProfileInsert = { id: data.user.id, nickname: nickName };
        const result = await createProfile(newUser);
        if (result) {
          // 프로필 추가가 성공한 경우
          setMsg('회원가입 및 프로필 생성 성공했습니다. 이메일 인증 링크를 확인해주세요.');
        } else {
          // 프로필 추가가 실패한 경우
          setMsg('회원가입은 성공, 프로필 생성은 실패했습니다.');
        }
      } else {
        setMsg('회원가입이 성공했습니다. 이메일 인증 링크를 확인해주세요.');
      }
    }
  };
  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Todo 서비스 회원가입</h2>
        <p className="page-subtitle">새 계정을 만들어 보세요.</p>
      </div>
      <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">이메일</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="이메일"
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="비밀번호  (최소 6자)"
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">닉네임</label>{' '}
            <input
              type="text"
              value={nickName}
              onChange={e => setNickName(e.target.value)}
              placeholder="닉네임을 입력하세요"
              required
            />
          </div>
          <button type="submit" className="btn btn-success btn-lg" style={{ width: '100%' }}>
            회원가입
          </button>
        </form>
        {/* 메세지 출력 */}
        {msg && (
          <p
            style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: msg.includes('성공') ? 'var(--success-50)' : '#fef2f2',
              color: msg.includes('성공') ? 'var(--success-600)' : '#dc2626',
              border: `1px solid ${msg.includes('성공') ? 'var(--success-600)' : '#dc2626'}`,
            }}
          >
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}

export default SignUpPage;
