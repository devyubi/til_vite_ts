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
