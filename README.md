# react-router-dom

## 1. 설치

- v7 은 조금 문제가 발생하여, v6 사용함

```bash
npm i react-router-dom@6.30.1
```

## 2. 폴더 및 파일 구조

- /src/pages 폴더 생성
- /src/pages/HomePage.tsx 파일 생성

```tsx
import React from 'react';

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {/* Hero 영역 */}
      <section className="w-full bg-indigo-600 text-white py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">환영합니다!</h1>
        <p className="text-lg">이곳은 메인 홈 화면입니다. 상단 메뉴에서 쇼핑을 즐겨주세요!</p>
      </section>

      {/* 소개 카드 */}
      <section className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8 py-16 px-6">
        <div className="bg-white p-8 rounded-2xl shadow-md text-center">
          <h3 className="text-xl font-semibold mb-2 text-indigo-600">추천 상품</h3>
          <p className="text-gray-600">이번 주 가장 인기 있는 상품을 확인해보세요.</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-md text-center">
          <h3 className="text-xl font-semibold mb-2 text-indigo-600">이벤트</h3>
          <p className="text-gray-600">다양한 할인 이벤트와 쿠폰을 만나보세요.</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-md text-center">
          <h3 className="text-xl font-semibold mb-2 text-indigo-600">회원 혜택</h3>
          <p className="text-gray-600">회원 전용 특별 혜택을 놓치지 마세요!</p>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="w-full bg-gray-800 text-gray-200 py-6 text-center">
        <p>© 2025 DDODO 쇼핑몰. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default HomePage;
```

- /src/pages/GoodsPage.tsx 파일 생성

```tsx
import React from 'react';
import GoodList from '../components/shop/GoodList';

function GoodsPage() {
  return (
    <div>
      <div>
        <GoodList />
      </div>
    </div>
  );
}

export default GoodsPage;
```

- /src/pages/CartPage.tsx 파일 생성

```tsx
import React from 'react';
import Cart from '../components/shop/Cart';

function CartPage() {
  return (
    <div>
      <div>
        <Cart />
      </div>
    </div>
  );
}

export default CartPage;
```

- /src/pages/WalletPage.tsx 파일 생성

```tsx
import React from 'react';
import Wallet from '../components/shop/Wallet';

function WalletPage() {
  return (
    <div>
      <div>
        <Wallet />
      </div>
    </div>
  );
}

export default WalletPage;
```

- /src/pages/NotFound.tsx 파일 생성

```tsx
import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {/* 큰 에러 텍스트 */}
      <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">페이지를 찾을 수 없습니다</h2>

      {/* 안내 박스 */}
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
        <p className="text-gray-600 mb-6">
          요청하신 페이지가 존재하지 않거나
          <br />
          주소가 잘못 입력된 것 같아요.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-indigo-500 text-white rounded-xl shadow hover:bg-indigo-600 transition"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
```

- App.tsx

```tsx
import React from 'react';
import { NavLink, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ShopProvider } from './features';
import CartPage from './pages/CartPage';
import GoodsPage from './pages/GoodsPage';
import HomePage from './pages/HomePage';
import NotFound from './pages/NotFound';
import WalletPage from './pages/WalletPage';

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
```
