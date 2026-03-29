import { calcTotal } from '../shop/utils';
import { useShop } from './useShop';

export function useShopSelectors() {
  const { cart, goods } = useShop();
  // 제품 한개 정보 찾기
  const getGood = (id: number) => goods.find(item => item.id === id);
  // 총 금액
  const total = calcTotal(cart, goods);
  // 되돌려줌
  return { getGood, total };
}
