import React from 'react';
import { useShop } from '../../features/hooks/useShop';
import { motion, AnimatePresence } from 'framer-motion';

const GoodList = () => {
  const { goods, addCart } = useShop();

  return (
    <div className="mx-auto max-w-5xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      {/* 제목 */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">상품 리스트</h2>
        <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600">
          총 {goods.length}개
        </span>
      </div>

      {/* 상품 그리드 */}
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence initial={false}>
          {goods.map(item => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              className="group flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 transition hover:bg-neutral-50"
            >
              {/* 상품 정보 */}
              <div>
                <span className="block text-[15px] font-medium text-neutral-900">{item.name}</span>
                <span className="mt-1 block text-sm text-neutral-600">
                  가격: {item.price.toLocaleString()} 원
                </span>
              </div>

              {/* 담기 버튼 */}
              <button
                onClick={() => addCart(item.id)}
                className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                장바구니 담기
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
};

export default GoodList;
