import { useContext } from 'react';
import { ShopContext } from '../shop/ShopContext';

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) {
    throw new Error('Shop context 가 생성되지 않았습니다.');
  }
  return ctx;
}
