import React, { createContext, useReducer } from 'react';
import { reducer } from './reducer';
import { initialState } from './state';
import { ShopActionType, type ShopValueType } from './types';

export const ShopContext = createContext<null | ShopValueType>(null);
export const ShopProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // dispatch 용 함수 표현식
  const addCart = (id: number) => {
    dispatch({ type: ShopActionType.ADD_CART, payload: { id } });
  };
  const removeCartOne = (id: number) => {
    dispatch({ type: ShopActionType.REMOVE_CART_ONE, payload: { id } });
  };
  const clearCart = (id: number) => {
    dispatch({ type: ShopActionType.CLEAR_CART_ITEM, payload: { id } });
  };
  const resetCart = () => {
    dispatch({ type: ShopActionType.RESET });
  };
  const buyAll = () => {
    dispatch({ type: ShopActionType.BUY_ALL });
  };

  const value: ShopValueType = {
    cart: state.cart,
    goods: state.goods,
    balance: state.balance,
    addCart,
    removeCartOne,
    clearCart,
    resetCart,
    buyAll,
  };
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};
