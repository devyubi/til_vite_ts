/**
 * 로그인 한 사용자가 접근 할 수 있는 페이지 :
 * - 사용자 프로필 페이지
 * - 관리자 대시보드 페이지
 * - 개인 설정 페이지
 * - 구매 내역 페이지 등등
 */

import type { PropsWithChildren } from 'react';
import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';

const Protected: React.FC<PropsWithChildren> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // 사용자 정보가 로딩중이라면 ?
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          background: 'rgba(0,0,0,0.7)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      ></div>
    );
  }

  // 로그인하지 않은 사용자는 로그인 페이지로 강제 이동, 로그인 한 사용자는 return <div>{children}</div>;
  if (!user) {
    return <Navigate to={'/signin'} replace />;
  }
  return <div>{children}</div>;
};

export default Protected;
