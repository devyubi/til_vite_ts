import React from 'react';
import { useShop } from '../../features';

const Wallet = () => {
  const { balance } = useShop();

  return (
    <div
      className="
      p-6 
      bg-gradient-to-tr from-white/95 via-white/90 to-sky-100/30 
      border border-gray-200 
      rounded-xl 
      shadow-md
      backdrop-blur-sm
    "
    >
      {/* 상단 */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-800">내 지갑</h2>
        <span className="text-sm text-gray-400">💳 Wallet</span>
      </div>

      {/* 잔액 */}
      <p className="text-sm text-gray-500">사용 가능한 잔액</p>
      <p className="mt-1 text-2xl font-baold text-gray-900">{balance.toLocaleString()} 원</p>
    </div>
  );
};

export default Wallet;
