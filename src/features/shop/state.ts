import type { ShopStateType } from './types';

export const initialState: ShopStateType = {
  balance: 100000,
  cart: [],
  goods: [
    { id: 1, name: '🍎', price: 1000 },
    { id: 2, name: '🍓', price: 30000 },
    { id: 3, name: '🍌', price: 500 },
    { id: 4, name: '🍫', price: 8000 },
  ],
};
