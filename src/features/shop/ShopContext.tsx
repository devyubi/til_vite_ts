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
