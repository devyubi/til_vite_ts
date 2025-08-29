import React from 'react';

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {/* Hero 영역 */}
      <section className="w-full bg-indigo-600 text-white py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">환영합니다!</h1>
        <p className="text-lg">이곳은 메인 홈 화면입니다. 상단 메뉴에서 쇼핑을 즐겨주세요!</p>
      </section>

      {/* 소개 카드 */}
      <section className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 py-16 px-6">
        <div className="bg-white p-8 rounded-2xl shadow-md text-center">
          <h3 className="text-xl font-semibold mb-2 text-indigo-600">추천 상품</h3>
          <p className="text-gray-600">이번 주 가장 인기 있는 상품을 확인해보세요.</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-md text-center">
          <h3 className="text-xl font-semibold mb-2 text-indigo-600">이벤트</h3>
          <p className="text-gray-600">다양한 할인 이벤트와 쿠폰을 만나보세요.</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-md text-center">
          <h3 className="text-xl font-semibold mb-2 text-indigo-600">회원 혜택</h3>
          <p className="text-gray-600">회원 전용 특별 혜택을 놓치지 마세요!</p>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="w-full bg-gray-800 text-gray-200 py-6 text-center">
        <p>© 2025 DDODO 쇼핑몰. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;
