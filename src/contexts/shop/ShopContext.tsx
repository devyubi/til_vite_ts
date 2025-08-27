import React, { createContext, useContext, useReducer } from 'react';

// 1-1
type CartType = { id: number; name?: string; qty: number }; // qty = quantity : 몇개를 담았는지

type GoodType = {
  id: number;
  name: string;
  price: number;
};

type ShopStateType = {
  balance: number;
  cart: CartType[];
  goods: GoodType[];
};

// 1. 초기값
const initialState: ShopStateType = {
  balance: 100000,
  cart: [],
  goods: [
    { id: 1, name: '사과', price: 1300 },
    { id: 2, name: '딸기', price: 30000 },
    { id: 3, name: '바나나', price: 5000 },
    { id: 4, name: '쪼꼬', price: 1000 },
  ],
};

// 2-1 enum 을 활용하여 Shop 의 Action Type 를 정의함
enum ShopActionType {
  ADD_CART = 'ADD_CART',
  REMOVE_CART_ONE = 'REMOVE_CART',
  CLEAR_CART_ITEM = 'CLEAR_CART',
  BUY_ALL = 'BUY_ALL',
  RESET = 'RESET',
}

// 2-2 Action type 정의
type ShopActionAddCart = { type: ShopActionType.ADD_CART; payload: { id: number } };
type ShopActionRemoveCart = { type: ShopActionType.REMOVE_CART_ONE; payload: { id: number } };
type ShopActionClearCart = { type: ShopActionType.CLEAR_CART_ITEM; payload: { id: number } };
type ShopActionBuyAll = { type: ShopActionType.BUY_ALL }; // payload 필요 없음
type ShopActionReset = { type: ShopActionType.RESET }; // payload 필요 없음
type ShopAction =
  | ShopActionAddCart
  | ShopActionRemoveCart
  | ShopActionClearCart
  | ShopActionBuyAll
  | ShopActionReset;

// 2-3 장바구니 전체 금액 계산하기 (calcCart) - 하단 함수가 `순수 함수`
function calcCart(nowState: ShopStateType): number {
  // useReducer (값을 누적해주는 함수) 아님. react 의 reduce 함수임.
  const total = nowState.cart.reduce((sum, 장바구니제품) => {
    // id를 이용해서 제품 상세 정보 찾기
    const good = nowState.goods.find(g => g.id === 장바구니제품.id);
    if (good) {
      return sum + good.price * 장바구니제품.qty; // 반드시 return
    }
    return sum; // good이 없으면 그대로 반환
  }, 0);

  return total;
}

// 2. reducer
function reducer(state: ShopStateType, action: ShopAction): ShopStateType {
  switch (action.type) {
    case ShopActionType.ADD_CART: {
      const { id } = action.payload; // { id } = 제품의 ID
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

    case ShopActionType.CLEAR_CART_ITEM: {
      // 담겨진 제품 중에 장바구니에서 제거하기
      const { id } = action.payload;
      const arr = state.cart.filter(item => item.id !== id);
      return { ...state, cart: arr };
    }

    case ShopActionType.BUY_ALL: {
      // 총 금액 계산
      const total = calcCart(state);
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

// 3-1
type ShopValueType = {
  cart: CartType[];
  goods: GoodType[];
  balance: number;
  addCart: (id: number) => void;
  removeCartOne: (id: number) => void;
  clearCart: (id: number) => void;
  buyAll: () => void;
  resetCart: () => void;
};

// 3. context
const ShopContext = createContext<ShopValueType | null>(null);

// 4. provider
// export const ShopProvider = ({ children }: React.PropsWithChildren) => {
export const ShopProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // 4-1. dispatch 용 함수 표현식
  const addCart = (id: number) => {
    dispatch({ type: ShopActionType.ADD_CART, payload: { id } });
  };
  const removeCartOne = (id: number) => {
    dispatch({ type: ShopActionType.REMOVE_CART_ONE, payload: { id } });
  };
  const clearCart = (id: number) => {
    dispatch({ type: ShopActionType.CLEAR_CART_ITEM, payload: { id } });
  };
  const buyAll = () => {
    dispatch({ type: ShopActionType.BUY_ALL });
  };
  const resetCart = () => {
    dispatch({ type: ShopActionType.RESET });
  };

  const value: ShopValueType = {
    cart: state.cart,
    goods: state.goods,
    balance: state.balance,
    addCart,
    removeCartOne,
    clearCart,
    buyAll,
    resetCart,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

// 5. custom hook
export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) {
    throw new Error('Shop context 가 생성되지 않았습니다.');
  }
  return ctx;
}
