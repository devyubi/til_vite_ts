import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Profile } from '../types/todoType';
import { getProfile } from '../lib/profile';
import InfiniteScroll from 'react-infinite-scroll-component';
import { InfiniteScrollProvider, useInfiniteScroll } from '../contexts/InfinityScrollContext';

// 용서하세요. 입력창 컴포넌트임다 컴포넌트라 const
const InfiniteTodoWrite = () => {
  const { addTodo, loadingInitialTodos } = useInfiniteScroll();

  const [title, setTitle] = useState('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };
  const handleSave = async (): Promise<void> => {
    if (!title.trim()) {
      alert('제목을 입력하세요');
      return;
    }
    try {
      // 새 할 일 추가
      await addTodo(title);
      // 다시 데이터를 로딩함
      await loadingInitialTodos();
      setTitle('');
    } catch (error) {
      console.log('등록에 오류가 발생 : ', error);
      alert(`등록에 오류가 발생 : ${error}`);
    }
  };

  return (
    <div>
      <h2>할 일 작성</h2>
      <div>
        <input
          type="text"
          value={title}
          onChange={e => handleChange(e)}
          onKeyDown={e => handleKeyDown(e)}
          placeholder="할 일을 입력 해주세요."
          className="border"
        />
        <button onClick={handleSave}>등록</button>
      </div>
    </div>
  );
};

// 용서하세요..ㅋㅋ 목록 컴포넌트
const InfiniteTodoList = () => {
  const {
    loading,
    loadingMore,
    loadMoreTodos,
    hasMore,
    todos,
    totalCount,
    editTodo,
    toggleTodo,
    deleteTodo,
    loadingInitialTodos,
  } = useInfiniteScroll();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  // 사용자 프로필 가져오기
  useEffect(() => {
    const loadProifle = async () => {
      if (user?.id) {
        const userProfile = await getProfile(user.id);
        setProfile(userProfile);
      }
    };
    loadProifle();
  }, [user?.id]);

  // 번호 계산 함수 (최신글이 높은 번호를 가지도록)
  const getGlobalIndex = (index: number) => {
    // 무한 스크롤 시에 계산해서 번호 출력
    const globalIndex = totalCount - index;
    return globalIndex;
  };

  // 날짜 포맷팅 함수 ( 자주 쓰여서 유틸 폴더 만들어서 관리해도 좋음 )
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '날짜 없음';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 수정 상태 관리
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');

  // 수정 시작
  const handleEditStart = (todo: any) => {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  };

  // 수정 취소
  const handleEditCancel = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  // 수정 저장
  const handleEditSave = async (id: number) => {
    if (!editingTitle.trim()) {
      alert('제목을 입력하세요.');
      return;
    }
    try {
      editTodo(id, editingTitle);
      setEditingId(null);
      setEditingTitle('');
    } catch (error) {
      console.log(error);
      alert('수정에 실패했습니다.');
    }
  };

  // 토글
  const handleToggle = async (id: number) => {
    try {
      // Context 의 state 를 업데이트함
      await toggleTodo(id);
    } catch (error) {
      console.log('토글 실패 :', error);
      alert('상태 변경에 실패하였습니다.');
    }
  };

  // 삭제
  const handleDelete = async (id: number) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        // id 를 삭제
        await deleteTodo(id);
        // 삭제 이후 번호를 갱신해서 정리해줌
        await loadingInitialTodos();
      } catch (error) {
        console.log('삭제에 실패하였습니다.');
        alert('삭제에 실패하였습니다.');
      }
    }
  };

  if (loading) {
    return <div>데이터 로딩중...</div>;
  }
  return (
    <div>
      <h3>
        TodoList (무한스크롤){profile?.nickname && <span>{profile.nickname} 님의 할 일</span>}
      </h3>
      {todos.length === 0 ? (
        <p>등록된 할 일이 없습니다.</p>
      ) : (
        // 무한 스크롤 라이브러리 적용
        <InfiniteScroll
          dataLength={todos.length}
          next={loadMoreTodos}
          hasMore={hasMore}
          loader={<div>데이터를 불러오는 중...</div>}
          endMessage={<div>모든 데이터를 불러왔습니다.</div>}
        >
          <ul>
            {todos.map((item, index) => (
              <li key={item.id}>
                {/* 번호 표시 */}
                <span>{getGlobalIndex(index)}</span>
                {/* 체크 박스 */}
                <input
                  type="checkbox"
                  checked={item.completed}
                  className="border"
                  onChange={() => handleToggle(item.id)}
                />
                {/* 제목과 날짜 출력 */}
                <div>
                  {editingId === item.id ? (
                    <input
                      className="border"
                      type="text"
                      value={editingTitle}
                      onChange={e => setEditingTitle(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          handleEditSave(item.id);
                        } else if (e.key === 'Escape') {
                          handleEditCancel();
                        }
                      }}
                    />
                  ) : (
                    <span>{item.title}</span>
                  )}

                  <span>작성일 : {formatDate(item.created_at)}</span>
                </div>
                {/* 버튼들 */}
                {editingId === item.id ? (
                  <>
                    <button onClick={() => handleEditSave(item.id)} className="border">
                      저장
                    </button>
                    <button onClick={handleEditCancel} className="border">
                      취소
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEditStart(item)} className="border">
                      수정
                    </button>
                    <button className="border" onClick={() => handleDelete(item.id)}>
                      삭제
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </InfiniteScroll>
      )}
    </div>
  );
};

function TodosInfinitePage() {
  return (
    <div>
      <InfiniteScrollProvider itemsPerPage={15}>
        <div>
          <h1>무한 스크롤 Todo 목록</h1>
          <div>
            <InfiniteTodoWrite />
          </div>
          <div>
            <InfiniteTodoList />
          </div>
        </div>
      </InfiniteScrollProvider>
    </div>
  );
}

export default TodosInfinitePage;
