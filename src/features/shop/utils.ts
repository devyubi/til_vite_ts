import type { CartType, GoodType } from './types';

// 2-3 장바구니 전체 금액 계산하기 (calcCart) - 하단 함수가 `순수 함수`
// function calcCart(nowState: ShopStateType): number {
// useReducer (값을 누적해주는 함수) 아님. react 의 reduce 함수임.
// const total = nowState.cart.reduce((sum, 장바구니제품) => {
// id를 이용해서 제품 상세 정보 찾기
// const good = nowState.goods.find(g => g.id === 장바구니제품.id);
// if (good) {
//   return sum + good.price * 장바구니제품.qty; // 반드시 return
// }
// return sum; // good이 없으면 그대로 반환
//   }, 0);
//   return total;
// }
// cart, goods 만 필요하므로 타입을 좁힘
export function calcTotal(cart: CartType[], goods: GoodType[]): number {
  return cart.reduce((sum, c) => {
    const good = goods.find(g => g.id === c.id);
    return good ? sum + good.price * c.qty : sum;
  }, 0);
}
