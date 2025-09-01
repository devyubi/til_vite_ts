import React from 'react';
import { NavLink, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ShopProvider } from './features';
import CartPage from './pages/CartPage';
import GoodsPage from './pages/GoodsPage';
import HomePage from './pages/HomePage';
import NotFound from './pages/NotFound';
import WalletPage from './pages/WalletPage';
import Calendar from './pages/Calendar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-md px-6 py-3 flex justify-center gap-6">
          <NavLink
            to={`/`}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-md font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-blue-500 text-white shadow'
                  : 'text-gray-600 hover:text-blue-500 hover:bg-gray-100'
              }`
            }
          >
            홈
          </NavLink>
          <NavLink
            to={`/goods`}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-md font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-blue-500 text-white shadow'
                  : 'text-gray-600 hover:text-blue-500 hover:bg-gray-100'
              }`
            }
          >
            상품 목록
          </NavLink>
          <NavLink
            to={`/cart`}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-md font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-blue-500 text-white shadow'
                  : 'text-gray-600 hover:text-blue-500 hover:bg-gray-100'
              }`
            }
          >
            장바구니
          </NavLink>
          <NavLink
            to={`/wallet`}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-md font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-blue-500 text-white shadow'
                  : 'text-gray-600 hover:text-blue-500 hover:bg-gray-100'
              }`
            }
          >
            내 지갑
          </NavLink>
        </nav>
        {/* 상단 헤더 */}
        <header className="bg-white shadow-md py-4 mb-8">
          <h1 className="text-center text-3xl font-bold text-gray-800">유비두비's 쇼핑몰</h1>
        </header>
        <Calendar />
        {/* 컨텐츠 */}
        <ShopProvider>
          <div>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/goods" element={<GoodsPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/wallet" element={<NotFound />} />
            </Routes>
          </div>
        </ShopProvider>
      </div>
    </Router>
  );
}

export default App;
