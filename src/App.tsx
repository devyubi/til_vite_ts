import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AuthCallbackPage from './pages/AuthCallbackPage';
import HomePage from './pages/HomePage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import TodosPage from './pages/TodosPage';
import Protected from './contexts/Protected';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import TodosInfinitePage from './pages/TodosInfinityPage';
import { motion } from 'framer-motion';

const TopBar = () => {
  const { signOut, user } = useAuth();
  // 관리자인 경우 메뉴 추가로 출력하기
  // isAdmin 에는 boolean 임. ( true / false )
  const isAdmin = user?.email === 'lynn9702@naver.com'; // 관리자 이메일 입력
  return (
    <motion.header
      className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 20 }}
    >
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        {/* 로고 또는 홈 */}
        <Link
          to="/"
          className="text-sm font-semibold text-neutral-900 transition-colors hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-md px-1"
        >
          홈
        </Link>

        {/* 메뉴 링크 */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/todos"
                className="text-sm text-neutral-700 transition-colors hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-300 rounded-md px-2 py-1"
              >
                할 일
              </Link>
              <Link
                to="/todos-infinite"
                className="text-sm text-neutral-700 transition-colors hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-300 rounded-md px-2 py-1"
              >
                무한 스크롤 할 일
              </Link>
              <Link
                to="/profile"
                className="text-sm text-neutral-700 transition-colors hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-300 rounded-md px-2 py-1"
              >
                내 프로필
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-sm text-neutral-700 transition-colors hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-300 rounded-md px-2 py-1"
                >
                  관리자
                </Link>
              )}
              <button
                onClick={signOut}
                className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-300"
              >
                로그아웃
              </button>
            </>
          ) : (
            // 로그인 안 했을 때
            <>
              <Link
                to="/signin"
                className="text-sm text-neutral-700 transition-colors hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-300 rounded-md px-2 py-1"
              >
                로그인
              </Link>
              <Link
                to="/signup"
                className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </nav>
    </motion.header>
  );
};

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-neutral-50">
        <Router>
          <TopBar />
          <motion.main
            className="mx-auto max-w-5xl px-4 py-6"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
          >
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              {/* Protected 로 감싸주기 */}
              <Route
                path="/todos"
                element={
                  <Protected>
                    <TodosPage />
                  </Protected>
                }
              />
              <Route
                path="/todos-infinite"
                element={
                  <Protected>
                    <TodosInfinitePage />
                  </Protected>
                }
              />
              <Route
                path="/profile"
                element={
                  <Protected>
                    <ProfilePage />
                  </Protected>
                }
              />
              <Route
                path="/admin"
                element={
                  <Protected>
                    <AdminPage />
                  </Protected>
                }
              />
            </Routes>
          </motion.main>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
