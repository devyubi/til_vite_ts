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

const TopBar = () => {
  const { signOut, user } = useAuth();
  // 관리자인 경우 메뉴 추가로 출력하기
  // isAdmin 에는 boolean 임. ( true / false )
  const isAdmin = user?.email === 'lynn9702@naver.com'; // 관리자 이메일 입력
  return (
    <nav className="bg-blue-400 text-white px-6 py-4 flex justify-between items-center">
      {/* 로고 또는 홈 */}
      <Link to="/" className="text-lg font-bold hover:text-blue-900 transition-colors">
        홈
      </Link>

      {/* 메뉴 링크 */}
      <div className="flex space-x-4">
        {user ? (
          <>
            <Link to="/todos" className="hover:text-blue-900 transition-colors">
              할 일
            </Link>
            <Link to="/todos-infinite" className="hover:text-blue-900 transition-colors">
              무한 스크롤 할 일
            </Link>
            <Link to="/profile" className="hover:text-blue-900 transition-colors">
              내 프로필
            </Link>
            <button onClick={signOut} className="hover:text-blue-900 transition-colors">
              로그아웃
            </button>
            {isAdmin && (
              <Link to="/admin" className="hover:text-blue-900 transition-colors">
                관리자
              </Link>
            )}
          </>
        ) : (
          // 로그인 안 했을 때
          <Link to="/signin" className="hover:text-blue-900 transition-colors">
            로그인
          </Link>
        )}
      </div>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <div>
        <Router>
          <TopBar />
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
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
