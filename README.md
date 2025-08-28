# Context API / useReducer 예제

- 쇼핑몰 장바구니, 잔액 관리

## 1. 폴더 및 파일 구조

- /src/contexts/shop 폴더 생성
- /src/contexts/shop/ShopContext.tsx 파일 생성

```tsx
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
```

- /src/components/shop 폴더 생성
- /src/components/shop/GoodList.tsx 파일 생성

```tsx
import React from 'react';
import { useShop } from '../../contexts/shop/ShopContext';

const GoodList = () => {
  const { goods, addCart } = useShop();
  return (
    <div>
      <h2>GoodList</h2>
      <ul>
        {goods.map(item => (
          <li key={item.id}>
            <span>제품명 : {item.name}</span>
            <span>가격 : {item.price} 원</span>
            <button onClick={() => addCart(item.id)}>담기</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GoodList;
```

- /src/components/shop/Cart.tsx 파일 생성

```tsx
import React from 'react';
import { useShop } from '../../contexts/shop/ShopContext';

const Cart = () => {
  const { balance, cart, removeCartOne, resetCart, clearCart, buyAll } = useShop();
  return (
    <div>
      <h2>장바구니</h2>
      <ul>
        {cart.map(item => (
          <li key={item.id}>
            <span>제품명:생략</span>
            <span>구매수:{item.qty}</span>
            <button onClick={() => removeCartOne(item.id)}>한개 줄이기</button>
            <button onClick={() => clearCart(item.id)}>제품취소</button>
          </li>
        ))}
      </ul>
      <button onClick={buyAll}>전체 구매하기</button>
      <button onClick={resetCart}>전체 취소하기</button>
    </div>
  );
};

export default Cart;
```

- /src/components/shop/Wallet.tsx 파일 생성

```tsx
import React from 'react';
import { useShop } from '../../contexts/shop/ShopContext';

const Wallet = () => {
  const { balance } = useShop();
  return <div>Wallet : {balance}</div>;
};

export default Wallet;
```

- App.tsx

```tsx
import React from 'react';
import GoodList from './components/shop/GoodList';
import Cart from './components/shop/Cart';
import Wallet from './components/shop/Wallet';
import { ShopProvider } from './contexts/shop/ShopContext';

function App() {
  return (
    <div>
      <h1>나의 가게</h1>
      <ShopProvider>
        <div>
          <GoodList />
          <Cart />
          <Wallet />
        </div>
      </ShopProvider>
    </div>
  );
}

export default App;
```

## 최종 css + 기능 수정 버전

- App.tsx

```tsx
import React from 'react';
import GoodList from './components/shop/GoodList';
import Cart from './components/shop/Cart';
import Wallet from './components/shop/Wallet';
import { ShopProvider } from './contexts/shop/ShopContext';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* 상단 헤더 */}
      <header className="bg-white shadow-md py-4 mb-8">
        <h1 className="text-center text-3xl font-bold text-gray-800">유비두비's 쇼핑몰</h1>
      </header>

      {/* 컨텐츠 */}
      <ShopProvider>
        <main className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 상품 리스트 */}
          <section className="md:col-span-2">
            <GoodList />
          </section>

          {/* 장바구니 + 지갑 */}
          <aside className="space-y-6">
            <Cart />
            <Wallet />
          </aside>
        </main>
      </ShopProvider>
    </div>
  );
}

export default App;
```

- Cart.tsx

```tsx
import React from 'react';
import { useShop, useShopSelectors } from '../../contexts/shop/ShopContext';

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
```

- ShopContext.tsx

```tsx
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
    { id: 4, name: '초콜릿', price: 1000 },
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
function calcTotal(cart: CartType[], goods: GoodType[]): number {
  return cart.reduce((sum, c) => {
    const good = goods.find(g => g.id === c.id);
    return good ? sum + good.price * c.qty : sum;
  }, 0);
}

// 2. reducer
function reducer(state: ShopStateType, action: ShopAction): ShopStateType {
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

// 6. 추가 custom hook

export function useShopSelectors() {
  const { cart, goods } = useShop();
  // 제품 한개 정보 찾기
  const getGood = (id: number) => goods.find(item => item.id === id);
  // 총 금액
  const total = calcTotal(cart, goods);
  // 되돌려줌
  return { getGood, total };
}
```

- GoodList.tsx

```tsx
import React from 'react';
import { useShop } from '../../contexts/shop/ShopContext';

const GoodList = () => {
  const { goods, addCart } = useShop();

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      {/* 제목 */}
      <h2 className="text-2xl font-bold mb-6 text-gray-800">상품 리스트 📦</h2>

      {/* 상품 그리드 */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {goods.map(item => (
          <li
            key={item.id}
            className="border rounded-xl p-4 bg-gray-50 hover:shadow-lg transition flex flex-col justify-between"
          >
            {/* 상품 정보 */}
            <div>
              <span className="block text-lg font-semibold text-gray-800">{item.name}</span>
              <span className="block mt-1 text-gray-600">
                가격: {item.price.toLocaleString()} 원
              </span>
            </div>

            {/* 담기 버튼 */}
            <button
              onClick={() => addCart(item.id)}
              className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              장바구니 담기
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GoodList;
```

- Wallet.tsx

```tsx
import React from 'react';
import { useShop } from '../../contexts/shop/ShopContext';

const Wallet = () => {
  const { balance } = useShop();

  return (
    <div
      className="
      p-6 
      bg-gradient-to-tr from-white/95 via-white/90 to-sky-100/30 
      border border-gray-200 
      rounded-xl 
      shadow-md
      backdrop-blur-sm
    "
    >
      {/* 상단 */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-800">내 지갑</h2>
        <span className="text-sm text-gray-400">💳 Wallet</span>
      </div>

      {/* 잔액 */}
      <p className="text-sm text-gray-500">사용 가능한 잔액</p>
      <p className="mt-1 text-2xl font-baold text-gray-900">{balance.toLocaleString()} 원</p>
    </div>
  );
};

export default Wallet;
```

## 2. 실전 파일 분리하기

### 2.1. 폴더 및 파일 구조

- 기능별로 분리한다면 contexts 말고 `features (기능)` 폴더로
- `/src/features` 폴더 생성
- `/src/features/shop` 폴더 생성
- `/src/features/shop/types.ts` 파일 생성

```ts
// 장바구니 아이템 Type
export type CartType = { id: number; name?: string; qty: number }; // qty = quantity : 몇개를 담았는지

// 제품 아이템 Type
export type GoodType = {
  id: number;
  name: string;
  price: number;
};

// ShopStateType
export type ShopStateType = {
  balance: number;
  cart: CartType[];
  goods: GoodType[];
};

// Action Type (constant.ts - 상수 타입으로 옮겨줘도 됨.)
export enum ShopActionType {
  ADD_CART = 'ADD_CART',
  REMOVE_CART_ONE = 'REMOVE_CART',
  CLEAR_CART_ITEM = 'CLEAR_CART',
  BUY_ALL = 'BUY_ALL',
  RESET = 'RESET',
}

export type ShopActionAddCart = { type: ShopActionType.ADD_CART; payload: { id: number } };
export type ShopActionRemoveCart = {
  type: ShopActionType.REMOVE_CART_ONE;
  payload: { id: number };
};
export type ShopActionClearCart = { type: ShopActionType.CLEAR_CART_ITEM; payload: { id: number } };
export type ShopActionBuyAll = { type: ShopActionType.BUY_ALL }; // payload 필요 없음
export type ShopActionReset = { type: ShopActionType.RESET }; // payload 필요 없음
export type ShopAction =
  | ShopActionAddCart
  | ShopActionRemoveCart
  | ShopActionClearCart
  | ShopActionBuyAll
  | ShopActionReset;

// Context 의 value Type
export type ShopValueType = {
  cart: CartType[];
  goods: GoodType[];
  balance: number;
  addCart: (id: number) => void;
  removeCartOne: (id: number) => void;
  clearCart: (id: number) => void;
  buyAll: () => void;
  resetCart: () => void;
};
```

- `/src/features/shop/state.ts` 파일 생성

```ts
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
```

- `/src/features/shop/utils.ts` 파일 생성

```ts
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
```

- `/src/features/shop/reducer.ts` 파일 생성

```ts
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
```

- `/src/features/shop/ShopContext.tsx` 파일 생성

```tsx
import React, { createContext, useReducer } from 'react';
import { ShopActionType, type ShopValueType } from './types';
import { reducer } from './reducer';
import { initialState } from './state';

export const ShopContext = createContext<ShopValueType | null>(null);

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
```

- `/src/features/shop/useShopSelectors.ts` 파일 생성

```ts
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
```

- App.tsx

```tsx
import React from 'react';
import GoodList from './components/shop/GoodList';
import Cart from './components/shop/Cart';
import Wallet from './components/shop/Wallet';
import { ShopProvider } from './features/shop/ShopContext';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* 상단 헤더 */}
      <header className="bg-white shadow-md py-4 mb-8">
        <h1 className="text-center text-3xl font-bold text-gray-800">유비두비's 쇼핑몰</h1>
      </header>

      {/* 컨텐츠 */}
      <ShopProvider>
        <main className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 상품 리스트 */}
          <section className="md:col-span-2">
            <GoodList />
          </section>

          {/* 장바구니 + 지갑 */}
          <aside className="space-y-6">
            <Cart />
            <Wallet />
          </aside>
        </main>
      </ShopProvider>
    </div>
  );
}

export default App;
```

- GoodList.tsx

```tsx
import React from 'react';
import { useShop } from '../../features/hooks/useShop';

const GoodList = () => {
  const { goods, addCart } = useShop();

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      {/* 제목 */}
      <h2 className="text-2xl font-bold mb-6 text-gray-800">상품 리스트 📦</h2>

      {/* 상품 그리드 */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {goods.map(item => (
          <li
            key={item.id}
            className="border rounded-xl p-4 bg-gray-50 hover:shadow-lg transition flex flex-col justify-between"
          >
            {/* 상품 정보 */}
            <div>
              <span className="block text-lg font-semibold text-gray-800">{item.name}</span>
              <span className="block mt-1 text-gray-600">
                가격: {item.price.toLocaleString()} 원
              </span>
            </div>

            {/* 담기 버튼 */}
            <button
              onClick={() => addCart(item.id)}
              className="mt-4 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              장바구니 담기
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GoodList;
```

- Cart.tsx

```tsx
import React from 'react';
import { useShopSelectors } from '../../features/hooks/useShopSelectors';
import { useShop } from '../../features/hooks/useShop';

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
```

- Wallet.tsx

```tsx
import React from 'react';
import { useShop } from '../../features/hooks/useShop';

const Wallet = () => {
  const { balance } = useShop();

  return (
    <div
      className="
      p-6 
      bg-gradient-to-tr from-white/95 via-white/90 to-sky-100/30 
      border border-gray-200 
      rounded-xl 
      shadow-md
      backdrop-blur-sm
    "
    >
      {/* 상단 */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-800">내 지갑</h2>
        <span className="text-sm text-gray-400">💳 Wallet</span>
      </div>

      {/* 잔액 */}
      <p className="text-sm text-gray-500">사용 가능한 잔액</p>
      <p className="mt-1 text-2xl font-baold text-gray-900">{balance.toLocaleString()} 원</p>
    </div>
  );
};

export default Wallet;
```

### 2.2 `Barrel (배럴) 파일` 활용하기

- 여러 모듈에서 내보낸 것들을 모아서 하나의 파일에서 다시 내보내는 패턴
- 주로` index.js`나 `index.ts`로 파일명을 정한다
- 즉, `대표 파일`이라고 함

- /src/features/index.ts 파일 생성

```ts
export * from './shop/types';
// 아래의 경우는 충돌 발생 소지 있음.
export { initialState } from './shop/state';
export { calcTotal } from './shop/utils';
// 아래의 경우 역시 충돌 발생 소지 있음.
export { reducer } from './shop/reducer';
export { ShopContext, ShopProvider } from './shop/ShopContext';
export { useShop } from './hooks/useShop';
export { useShopSelectors } from './hooks/useShopSelectors';
```

- 해당 파일에 export 모아두기
