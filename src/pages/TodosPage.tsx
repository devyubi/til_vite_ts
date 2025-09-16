import { useEffect, useState } from 'react';
import TodoList from '../components/todos/TodoList';
import TodoWrite from '../components/todos/TodoWrite';
import { TodoProvider, useTodos } from '../contexts/TodoContext';
import type { Profile } from '../types/TodoTypes';
import { useAuth } from '../contexts/AuthContext';
import { getProfile } from '../lib/profile';
import Pagination from '../components/Pagination';

// 컴포넌트
interface TodosContentProps {
  currentPage: number;
  itemsPerPage: number;
  handleChangePage: (page: number) => void;
}
const TodosContent = ({ currentPage, itemsPerPage, handleChangePage }: TodosContentProps) => {
  const { totalCount, totalPages } = useTodos();
  return (
    <div>
      <div>
        {/* 새 글 등록시 1페이지로 이동후 목록 새로고침 */}
        <TodoWrite handleChangePage={handleChangePage} />
      </div>
      <div>
        <TodoList />
      </div>
      <div>
        <Pagination
          totalCount={totalCount}
          totalPages={totalPages}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          handleChangePage={handleChangePage}
        />
      </div>
    </div>
  );
};

function TodosPage() {
  const { user } = useAuth();
  // 페이지네이션 관련
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  // const itemsPerPage = 10;
  // 페이지 변경 핸들러
  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  const [profile, setProfile] = useState<Profile | null>(null);

  // 프로필 가져오기
  const loadProfile = async () => {
    try {
      if (user?.id) {
        const userProfile = await getProfile(user.id);
        if (!userProfile) {
          alert('탈퇴한 회원입니다. 관리자에게 요청하세요.');
        }
        setProfile(userProfile);
      }
    } catch (error) {
      console.log('프로필 가져오기 Error : ', error);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">🎆 할 일 관리</h2>
        {profile?.nickname && <p className="page-subtitle">{profile.nickname}님의 Todo 관리</p>}할
        일
      </div>
      <TodoProvider currentPage={currentPage} limit={itemsPerPage}>
        <TodosContent
          handleChangePage={handleChangePage}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
        />
      </TodoProvider>
    </div>
  );
}

export default TodosPage;
