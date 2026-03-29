import type { ShopStateType } from './types';

// 초기값 상태
export const initialState: ShopStateType = {
  balance: 100000,
  cart: [],
  goods: [
    { id: 1, name: '사과', price: 1300 },
    { id: 2, name: '딸기', price: 30000 },
    { id: 3, name: '바나나', price: 5000 },
    { id: 4, name: '초콜릿', price: 1000 },
  ],
};
