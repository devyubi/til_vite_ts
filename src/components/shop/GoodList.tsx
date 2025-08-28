import React from 'react';
import { useShop } from '../../features/hooks/useShop';

const GoodList = () => {
  const { goods, addCart } = useShop();

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      {/* 제목 */}
      <h2 className="text-2xl font-bold mb-6 text-gray-800">상품 리스트 📦</h2>

      {/* 상품 그리드 */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {goods.map(item => (
          <li
            key={item.id}
            className="border rounded-xl p-4 bg-gray-50 hover:shadow-lg transition flex flex-col justify-between"
          >
            {/* 상품 정보 */}
            <div>
              <span className="block text-lg font-semibold text-gray-800">{item.name}</span>
              <span className="block mt-1 text-gray-600">
                가격: {item.price.toLocaleString()} 원
              </span>
            </div>

            {/* 담기 버튼 */}
            <button
              onClick={() => addCart(item.id)}
              className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              장바구니 담기
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GoodList;
