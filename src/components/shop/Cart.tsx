import React from 'react';
import { useShop, useShopSelectors } from '../../features';

const Cart = () => {
  const { cart, addCart, removeCartOne, clearCart, resetCart, buyAll } = useShop();
  const { getGood, total } = useShopSelectors();

  // 수량 직접 입력 함수
  const handleQtyChange = (id: number, value: string) => {
    const qty = Number(value);

    // 빈 값이나 NaN이면 0 처리
    const newQty = isNaN(qty) ? 0 : qty;

    // 현재 장바구니 아이템 찾기
    const existItem = cart.find(item => item.id === id);
    if (!existItem) return;

    const diff = newQty - existItem.qty;

    if (diff > 0) {
      for (let i = 0; i < diff; i++) addCart(id);
    } else if (diff < 0) {
      for (let i = 0; i < Math.abs(diff); i++) removeCartOne(id);
    }

    // 0 입력 시 삭제하지 않고 그대로 0 표시
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">내 카트 🛒</h2>

      <ul className="space-y-4">
        {cart.length === 0 ? (
          <li className="text-gray-400 text-center py-8 border rounded-lg">
            장바구니가 비어있습니다.
          </li>
        ) : (
          cart.map(item => {
            const good = getGood(item.id);
            return (
              <li
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800">{good?.name}</span>
                  <span className="text-sm text-gray-600">
                    가격: {(good?.price! * item.qty).toLocaleString()} 원
                  </span>
                </div>

                {/* 수량 컨트롤 */}
                <div className="flex items-center gap-2">
                  {/* - 버튼 */}
                  <button
                    onClick={() => removeCartOne(item.id)}
                    className="w-8 h-8 flex items-center justify-center bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    -
                  </button>

                  {/* 수량 입력 */}
                  <input
                    type="number"
                    value={item.qty}
                    min={0}
                    onChange={e => handleQtyChange(item.id, e.target.value)}
                    className="
    w-12 text-center border rounded-lg bg-white text-gray-800
    appearance-none
    [&::-webkit-inner-spin-button]:appearance-none
    [&::-webkit-outer-spin-button]:appearance-none
    -moz-appearance:textfield
  "
                  />

                  {/* + 버튼 */}
                  <button
                    onClick={() => addCart(item.id)}
                    className="w-8 h-8 flex items-center justify-center bg-blue-200 text-blue-700 rounded-lg hover:bg-blue-300 transition"
                  >
                    +
                  </button>

                  {/* 삭제 버튼 */}
                  <button
                    onClick={() => clearCart(item.id)}
                    className="px-2 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                  >
                    삭제
                  </button>
                </div>
              </li>
            );
          })
        )}
      </ul>

      {/* 총 금액 표시 */}
      {cart.length > 0 && (
        <div className="mt-6 text-right font-semibold text-lg text-gray-800">
          총 합계: <span className="text-green-600">{total.toLocaleString()} 원</span>
        </div>
      )}

      {/* 하단 버튼 */}
      <div className="flex justify-between mt-6">
        <button
          onClick={buyAll}
          className="flex-1 mr-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          전체 구매하기
        </button>
        <button
          onClick={resetCart}
          className="flex-1 ml-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
        >
          전체 취소하기
        </button>
      </div>
    </div>
  );
};

export default Cart;
