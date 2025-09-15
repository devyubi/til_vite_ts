import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Profile } from '../types/todoType';
import { getProfile } from '../lib/profile';
import InfiniteScroll from 'react-infinite-scroll-component';
import { InfiniteScrollProvider, useInfiniteScroll } from '../contexts/InfinityScrollContext';
import { motion, AnimatePresence } from 'framer-motion';

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
    <motion.div
      className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 180, damping: 18 }}
    >
      <h2 className="mb-3 text-lg font-semibold text-neutral-900">할 일 작성</h2>
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={e => handleChange(e)}
          onKeyDown={e => handleKeyDown(e)}
          placeholder="할 일을 입력 해주세요."
          className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-[15px] text-neutral-900 placeholder-neutral-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        <button
          onClick={handleSave}
          className="shrink-0 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          등록
        </button>
      </div>
    </motion.div>
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
    return (
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-600 shadow-sm">
        데이터 로딩중...
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
        <h3 className="text-base font-semibold text-neutral-900">
          TodoList (무한스크롤)
          {profile?.nickname && (
            <span className="ml-2 align-middle text-sm font-normal text-neutral-500">
              {profile.nickname} 님의 할 일
            </span>
          )}
        </h3>
        {totalCount > 0 && (
          <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600">
            총 {totalCount}개
          </span>
        )}
      </div>
      {todos.length === 0 ? (
        <p className="px-5 py-8 text-sm text-neutral-600">등록된 할 일이 없습니다.</p>
      ) : (
        // 무한 스크롤 라이브러리 적용
        <InfiniteScroll
          dataLength={todos.length}
          next={loadMoreTodos}
          hasMore={hasMore}
          loader={
            <div className="border-t border-neutral-200 px-5 py-4 text-sm text-neutral-600">
              데이터를 불러오는 중...
            </div>
          }
          endMessage={
            <div className="border-t border-neutral-200 px-5 py-4 text-sm text-neutral-600">
              모든 데이터를 불러왔습니다.
            </div>
          }
        >
          <ul className="divide-y divide-neutral-200">
            <AnimatePresence initial={false}>
              {todos.map((item, index) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                  className="group grid grid-cols-[3rem_auto_auto] items-center gap-4 px-5 py-4 hover:bg-neutral-50"
                >
                  {/* 번호 표시 */}
                  <span className="select-none text-center text-sm font-medium text-neutral-500">
                    {getGlobalIndex(index)}
                  </span>
                  {/* 체크 박스 */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      className="h-5 w-5 rounded border-neutral-300 accent-blue-600"
                      onChange={() => handleToggle(item.id)}
                    />
                    {/* 제목과 날짜 출력 */}
                    <div className="flex flex-col">
                      {editingId === item.id ? (
                        <input
                          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-[15px] text-neutral-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                        <span
                          className={[
                            'text-[15px]',
                            item.completed ? 'text-neutral-400 line-through' : 'text-neutral-900',
                          ].join(' ')}
                        >
                          {item.title}
                        </span>
                      )}
                      <span className="mt-0.5 text-xs text-neutral-500">
                        작성일 : {formatDate(item.created_at)}
                      </span>
                    </div>
                  </div>
                  {/* 버튼들 */}
                  <div className="ml-auto flex items-center gap-2">
                    {editingId === item.id ? (
                      <>
                        <button
                          onClick={() => handleEditSave(item.id)}
                          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                          저장
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-300"
                        >
                          취소
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditStart(item)}
                          className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-300"
                        >
                          수정
                        </button>
                        <button
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300"
                          onClick={() => handleDelete(item.id)}
                        >
                          삭제
                        </button>
                      </>
                    )}
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </InfiniteScroll>
      )}
    </div>
  );
};

function TodosInfinitePage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <InfiniteScrollProvider itemsPerPage={15}>
        <main className="mx-auto max-w-3xl px-4 py-8">
          <h1 className="mb-6 text-2xl font-bold tracking-tight text-neutral-900">
            무한 스크롤 Todo 목록
          </h1>
          <div className="mb-6">
            <InfiniteTodoWrite />
          </div>
          <div>
            <InfiniteTodoList />
          </div>
        </main>
      </InfiniteScrollProvider>
    </div>
  );
}

export default TodosInfinitePage;
