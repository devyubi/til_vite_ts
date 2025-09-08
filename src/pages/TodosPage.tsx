import { useEffect, useState } from 'react';
import TodoList from '../components/todos/TodoList';
import TodoWrite from '../components/todos/TodoWrite';
import { TodoProvider } from '../contexts/TodoContext';
import type { Profile } from '../types/todoType';
import { useAuth } from '../contexts/AuthContext';
import { getProfile } from '../lib/profile';

function TodosPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  // 프로필 가져오기
  const loadProfile = async () => {
    try {
      if (user?.id) {
        const userProfile = await getProfile(user.id);
        // 방어 코드 (탈퇴한 회원이 작성하지 못하게끔)
        if (!userProfile) {
          alert('탈퇴한 회원입니다. 관리자에게 문의하세요.');
        }
        setProfile(userProfile);
      }
    } catch (error) {
      console.log('프로필 가져오기 ERROR : ', error);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <div>
      <h2>
        <strong>{profile?.nickname} </strong>님의 할 일
      </h2>
      <TodoProvider>
        <div>
          <TodoWrite />
        </div>
        <div>
          <TodoList />
        </div>
      </TodoProvider>
    </div>
  );
}

export default TodosPage;
