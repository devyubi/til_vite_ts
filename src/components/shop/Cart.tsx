import React from 'react';
import { useShop, useShopSelectors } from '../../features/shop';

const Cart = () => {
  const { balance, addCart, cart, removeCartOne, resetCart, clearCart, buyAll } = useShop();
  const { getGood, total } = useShopSelectors();
  const box: React.CSSProperties = {
    border: '2px solid #eee',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    background: '#fff',
  };
  const boxrow: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px dashed #eee',
  };

  return (
    <div style={box}>
      <h2>장바구니</h2>
      {cart.length === 0 ? (
        <p>장바구니가 비었습니다.</p>
      ) : (
        <ul>
          {cart.map(item => {
            // 제품 찾기
            const good = getGood(item.id);
            return (
              <li key={item.id} style={boxrow}>
                <div>
                  <strong>{good?.name}</strong> X {item.qty}
                  <div>
                    {good?.price.toLocaleString()} X {item.qty} =
                    {(good!.price * item.qty).toLocaleString()} 원
                  </div>
                </div>
                <span>제품명 : </span>
                <span>담은갯수 : {item.qty}</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => addCart(item.id)}>➕</button>
                  <button onClick={() => removeCartOne(item.id)}>➖</button>
                  <button onClick={() => clearCart(item.id)}>제품삭제</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <strong>총액</strong>
        <strong>{total.toLocaleString()} 원</strong>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={buyAll}>전체 구매하기</button>
        <button onClick={resetCart}>전체 삭제하기</button>
      </div>
    </div>
  );
};

export default Cart;
