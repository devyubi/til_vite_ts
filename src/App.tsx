import React from 'react';
import GoodList from './components/shop/GoodList';
import Cart from './components/shop/Cart';
import Wallet from './components/shop/Wallet';
import { ShopProvider } from './features';

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
