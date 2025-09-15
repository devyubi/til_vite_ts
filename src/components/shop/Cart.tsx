import React from 'react';
import { useShop, useShopSelectors } from '../../features';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="mx-auto max-w-3xl">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">내 카트</h2>
          <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600">
            총 {cart.length}개
          </span>
        </div>

        <ul className="space-y-0 divide-y divide-neutral-200">
          {cart.length === 0 ? (
            <li className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-5 py-10 text-center text-sm text-neutral-600">
              장바구니가 비어있습니다.
            </li>
          ) : (
            <AnimatePresence initial={false}>
              {cart.map(item => {
                const good = getGood(item.id);
                return (
                  <motion.li
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                    className="flex items-center justify-between px-5 py-4 hover:bg-neutral-50"
                  >
                    <div className="flex flex-col">
                      <span className="text-[15px] font-medium text-neutral-900">{good?.name}</span>
                      <span className="mt-0.5 text-sm text-neutral-600">
                        가격: {(good?.price! * item.qty).toLocaleString()} 원
                      </span>
                    </div>

                    {/* 수량 컨트롤 */}
                    <div className="ml-6 flex items-center gap-2">
                      {/* - 버튼 */}
                      <button
                        onClick={() => removeCartOne(item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-700 transition hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-300"
                      >
                        -
                      </button>

                      {/* 수량 입력 */}
                      <input
                        type="number"
                        value={item.qty}
                        min={0}
                        onChange={e => handleQtyChange(item.id, e.target.value)}
                        className="w-14 appearance-none rounded-lg border border-neutral-300 bg-white px-2 py-1.5 text-center text-[15px] text-neutral-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                          [&::-webkit-inner-spin-button]:appearance-none
                          [&::-webkit-outer-spin-button]:appearance-none
                          [-moz-appearance:textfield]"
                      />

                      {/* + 버튼 */}
                      <button
                        onClick={() => addCart(item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      >
                        +
                      </button>

                      {/* 삭제 버튼 */}
                      <button
                        onClick={() => clearCart(item.id)}
                        className="ml-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300"
                      >
                        삭제
                      </button>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          )}
        </ul>

        {/* 총 금액 표시 */}
        {cart.length > 0 && (
          <div className="mt-6 text-right text-lg font-semibold text-neutral-900">
            총 합계: <span className="align-middle text-blue-700">{total.toLocaleString()} 원</span>
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="mt-6 flex justify-between gap-3">
          <button
            onClick={buyAll}
            className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            전체 구매하기
          </button>
          <button
            onClick={resetCart}
            className="flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-300"
          >
            전체 취소하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
