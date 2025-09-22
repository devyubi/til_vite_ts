import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { createProfile } from '../lib/profile';
import { useNavigate } from 'react-router-dom';
import type { ProfileInsert } from '../types/TodoTypes';

/**
 * - 인증 콜백 URL 처리
 * - 사용자에게 인증 진행 상태 안내
 * - 자동 인증 처리 완료 안내
 */
function AuthCallback() {
  const [msg, setMsg] = useState<string>('인증 처리 중 ...');

  // 카카오 로그인 시 대기 시간 테스트
  const [countDown, setCountDown] = useState(0);
  // 리다이렉트가 가능한지 아닌지 보관
  const [shouldRedirect, setShouldRedirect] = useState(false);
  // 강제로 이동하기 위한 처리
  const navigate = useNavigate();

  // 사용자가 이메일 확인 클릭하면 실행되는 곳
  // 인증 정보에 담겨진 nickname 을 알아내서 여기서 profiles 를 추가
  const handleAuthCallback = async (): Promise<void> => {
    try {
      // URL에서 세션(웹브라우저 정보시 사라지는 데이터)에 담겨진 정보를 가져옮
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setMsg(`인증 오류 : ${error.message}`);
        return;
      }
      // 인증 데이터가 존재함.
      if (data.session?.user) {
        const user = data.session.user;

        // 카카오로 로그인 했는지 확인 필요 (kakao 는 Supabase 에서 정한 글자)
        const isKakaoLogin = user.app_metadata.provider === 'kakao';

        // 추가적인 정보 파악 가능 (metadata 라고 함.)
        let nickName = user.user_metadata.nickName;

        // 카카오 로그인인 경우 카카오에서 제공하는 정보를 사용함.
        if (isKakaoLogin && !nickName) {
          nickName =
            user.app_metadata.full_name ||
            user.app_metadata.name ||
            user.email?.split('@')[0] ||
            '카카오사용자';
        }

        // 먼저 프로필이 이미 존재하는지 확인이 필요
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        // 존재하지 않는 id 이고, nickName 내용이 있다면
        // profiles 에 insert 한다.
        if (!existingProfile && nickName) {
          // 프롤필이 없고 닉네임이 존재하므로 프로필 생성하자.
          const newProfile: ProfileInsert = { id: user.id, nickname: nickName };
          const result = await createProfile(newProfile);
          if (result) {
            // 로그인 타입으로 메세지 만들기
            const loginType = isKakaoLogin ? '카카오 로그인' : '이메일 인증';
            setMsg(`🥰 ${loginType} 완료. 프로필생 생성 성공! 홈으로 이동하세요. ^^`);
            // 리다이렉트 플래그 설정
            setShouldRedirect(true);
          } else {
            const loginType = isKakaoLogin ? '카카오 로그인' : '이메일 인증';
            setMsg(`🥰 ${loginType} 인증 완료. 프로필이 생성 실패! 관리자에게 문의하세요.`);
          }
        } else {
          const loginType = isKakaoLogin ? '카카오 로그인' : '이메일 인증';
          setMsg(`🥰 ${loginType}  인증 완료. 홈으로 이동하세요. ^^`);
          // 리다이렉트 플래그 설정
          setShouldRedirect(true);
        }
      } else {
        setMsg('🥰 인증 정보 자체가 없습니다. 다시 가입해주세요.');
      }
    } catch (err) {
      console.log(`인증 콜백 함수 처리 오류 : ${err}`);
      setMsg('🥰 인증 처리 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    // setTimeout 은 1초 뒤에 함수 실행
    const timer = setTimeout(handleAuthCallback, 1000);
    // 클린업 함수
    return () => {
      clearTimeout(timer);
    };
  }, [handleAuthCallback]);

  // 리다이렉트 처리 useEffect
  useEffect(() => {
    if (shouldRedirect) {
      // 사용자 이동에 대한 테스트를 위해서.
      setCountDown(3);
      const timer = setInterval(() => {
        setCountDown(prev => {
          if (prev <= 1) {
            clearInterval(timer); // 타이머 중지 시킴
            navigate('/todos'); // 강제로 이동시킴
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // 클린업 함수
      return () => clearInterval(timer);
    }
  }, [shouldRedirect, navigate]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          padding: '32px',
          borderRadius: '8px',
          maxWidth: '448px',
          width: '100%',
          margin: '0 16px',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px', color: '#1f2937' }}>
          인증 페이지
        </h2>
        <div style={{ marginBottom: '16px', color: '#374151' }}>{msg}</div>
        {/* 카운트다운 표시 */}
        {countDown && (
          <div
            style={{
              marginTop: '16px',
              padding: '16px',
              backgroundColor: '#eff6ff',
              borderRadius: '8px',
            }}
          >
            <p
              style={{
                color: '#1d4ed8',
                fontWeight: '500',
              }}
            >
              {countDown}초 후 todos 페이지로 이동합니다...
            </p>
            <div style={{ marginTop: '8px' }}>
              <div
                style={{
                  width: '100%',
                  backgroundColor: '#dbeafe',
                  borderRadius: '9999px',
                  height: '8px',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#3b82f6',
                    height: '8px',
                    borderRadius: '9999px',
                    transition: 'width 1s ease',
                    width: `${((3 - countDown) / 3) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthCallback;
