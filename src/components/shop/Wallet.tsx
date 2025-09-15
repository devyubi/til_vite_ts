import React from 'react';
import { useShop } from '../../features';
import { motion } from 'framer-motion';

const Wallet = () => {
  const { balance } = useShop();

  return (
    <motion.div
      className="mx-auto max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
    >
      {/* 상단 */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">내 지갑</h2>
        <span className="rounded-full border border-neutral-200 px-2.5 py-1 text-xs text-neutral-600">
          Wallet
        </span>
      </div>

      {/* 잔액 */}
      <p className="text-sm text-neutral-600">사용 가능한 잔액</p>
      <p className="mt-1 text-2xl font-bold text-neutral-900">{balance.toLocaleString()} 원</p>
    </motion.div>
  );
};

export default Wallet;
