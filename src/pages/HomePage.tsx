import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center">
      {/* Hero 영역 */}
      <section className="w-full border-b border-sky-100 bg-gradient-to-b from-white via-sky-50 to-white py-20 text-center">
        <motion.h1
          className="text-4xl font-bold mb-4 text-neutral-900"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20 }}
        >
          환영합니다!
        </motion.h1>
        <motion.p
          className="text-lg text-neutral-600"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, type: 'spring', stiffness: 220, damping: 20 }}
        >
          이곳은 메인 홈 화면입니다. 상단 메뉴바엔 나의 할 일을 등록하실 수 있습니다!
        </motion.p>
      </section>

      {/* 소개 카드 */}
      <section className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 py-16 px-6">
        <Link to="/goods" className="focus:outline-none">
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-white p-8 rounded-2xl border border-neutral-200 text-center shadow-sm transition hover:bg-sky-50/40 hover:border-sky-300 focus:ring-2 focus:ring-sky-300"
          >
            <h3 className="text-xl font-semibold mb-2 text-sky-700">추천 상품</h3>
            <p className="text-neutral-600">이번 주 가장 인기 있는 상품을 확인해보세요.</p>
          </motion.div>
        </Link>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="bg-white p-8 rounded-2xl border border-neutral-200 text-center shadow-sm"
        >
          <h3 className="text-xl font-semibold mb-2 text-sky-700">이벤트</h3>
          <p className="text-neutral-600">다양한 할인 이벤트와 쿠폰을 만나보세요.</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="bg-white p-8 rounded-2xl border border-neutral-200 text-center shadow-sm"
        >
          <h3 className="text-xl font-semibold mb-2 text-sky-700">회원 혜택</h3>
          <p className="text-neutral-600">회원 전용 특별 혜택을 놓치지 마세요!</p>
        </motion.div>
      </section>

      {/* 푸터 */}
      <footer className="w-full border-t border-neutral-200 bg-white text-neutral-500 py-6 text-center">
        <p>© 2025 DDODO 쇼핑몰. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;
