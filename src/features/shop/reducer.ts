import { initialState } from './state';
import { ShopActionType, type CartType, type ShopAction, type ShopStateType } from './types';
import { calcTotal } from './utils';

export function reducer(state: ShopStateType, action: ShopAction): ShopStateType {
  switch (action.type) {
    case ShopActionType.ADD_CART: {
      const { id } = action.payload; // { id } = 제품의 ID, 1개 빼줄 제품의 ID
      const existGood = state.cart.find(item => item.id === id);
      let arr: CartType[] = [];
      if (existGood) {
        // qty 증가
        arr = state.cart.map(item => (item.id === id ? { ...item, qty: item.qty + 1 } : item));
      } else {
        // state.cart 에 새 제품 추가, qty 는 1개
        arr = [...state.cart, { id, qty: 1 }];
      }
      return { ...state, cart: arr };
    }

    case ShopActionType.REMOVE_CART_ONE: {
      const { id } = action.payload; // 1개 빼줄 제품의 ID
      const existGood = state.cart.find(item => item.id === id);
      if (!existGood) {
        // 제품이 없을 경우
        return state;
      }
      let arr: CartType[] = [];
      if (existGood.qty > 1) {
        // 제품이 2개 이상이면 수량 -1
        arr = state.cart.map(item => (item.id === id ? { ...item, qty: item.qty - 1 } : item));
      } else {
        // 제품이 1개 담겼음 → 장바구니에서 삭제
        arr = state.cart.filter(item => item.id !== id);
      }
      return { ...state, cart: arr };
    }

    // 장바구니 추가/삭제 만약, 0이 되어버리면 삭제 버튼 외엔 삭제 되지 않게끔. 0으로 출력(?)
    case ShopActionType.REMOVE_CART_ONE: {
      const { id } = action.payload;
      const existItem = state.cart.find(item => item.id === id);
      if (!existItem) return state;

      // 수량 -1, 단 0 이하로는 떨어지지 않음
      const arr = state.cart.map(item =>
        item.id === id ? { ...item, qty: Math.max(item.qty - 1, 0) } : item,
      );

      return { ...state, cart: arr };
    }

    case ShopActionType.BUY_ALL: {
      // 총 금액 계산
      const total = calcTotal(state.cart, state.goods);
      if (total > state.balance) {
        alert('잔액이 부족합니다. 잔액을 확인 해주세요');
        return state;
      }
      return { ...state, balance: state.balance - total, cart: [] };
    }

    case ShopActionType.RESET: {
      return initialState; // initialState 에 값이 비어있어서 이렇게 넣어줘도 됨
    }

    default:
      return state;
  }
}
