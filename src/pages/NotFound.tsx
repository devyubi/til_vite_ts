import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {/* 큰 에러 텍스트 */}
      <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">페이지를 찾을 수 없습니다</h2>

      {/* 안내 박스 */}
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
        <p className="text-gray-600 mb-6">
          요청하신 페이지가 존재하지 않거나
          <br />
          주소가 잘못 입력된 것 같아요.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-indigo-500 text-white rounded-xl shadow hover:bg-indigo-600 transition"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
