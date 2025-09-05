import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { DeleteRequest, DeleteRequestUpdate } from '../types/todoType';
import { useAuth } from '../contexts/AuthContext';

function AdminPage() {
  // ts 자리
  const { user } = useAuth();
  // 삭제 요청 DB 목록 관리
  const [deleteRequests, setDeleteRequests] = useState<DeleteRequest[]>([]);
  // 로딩창
  const [loading, setLoading] = useState(true);

  // 관리자 확인
  const isAdmin = user?.email === 'lynn9702@naver.com';
  useEffect(() => {
    console.log(user?.email);
    console.log(user?.id);
    console.log(user);
  }, [user]);

  // 컴포넌트가 완료가 되었을 때, isAdmin 을 체크 후 실행
  useEffect(() => {
    if (isAdmin) {
      // 회원 탈퇴 신청자 목록을 파악
      loadDeleteMember();
    }
  }, [isAdmin]);

  // 탈퇴 신청자 목록 파악 테이터 요청
  const loadDeleteMember = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('account_deletion_requests')
        .select('*')
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });

      if (error) {
        console.log(`삭제 목록 요청 에러 : ${error.message}`);
        return;
      }

      // 삭제 요청 목록 보관
      setDeleteRequests(data || []);
    } catch (err) {
      console.log('삭제 요청 목록 오류', err);
    } finally {
      setLoading(false);
    }
  };

  // 탈퇴 승인
  const approveDelete = async (id: string, updateUser: DeleteRequestUpdate): Promise<void> => {
    try {
      const { error } = await supabase
        .from('account_deletion_requests')
        .update({ ...updateUser, status: 'approved' })
        .eq('id', id);
      if (error) {
        console.log(`탈퇴 업데이트 오류 : ${error.message}`);
        return;
      }

      alert(`사용자 ${id}의 계정이 삭제가 승인되었습니다. \n\n 관리자님 수동으로 삭제하세요.`);

      // 목록 다시 읽기
      loadDeleteMember();
    } catch (err) {
      console.log('탈퇴승인 오류 : ', err);
    }
  };

  // 탈퇴 거절
  const rejectDelete = async (id: string, updateUser: DeleteRequestUpdate): Promise<void> => {
    try {
      const { error } = await supabase
        .from('account_deletion_requests')
        .update({ ...updateUser, status: 'rejected' })
        .eq('id', id);

      if (error) {
        console.log(`탈퇴 업데이트 오류 : ${error.message}`);
        return;
      }

      alert(`사용자 ${id}의 계정이 삭제가 거부되었습니다.`);

      // 목록 다시 읽기
      loadDeleteMember();
    } catch (err) {
      console.log('탈퇴거절 오류 : ', err);
    }
  };

  // 1. 관리자 아이디가 불일치라면
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h1 className="text-2xl font-bold text-red-600 mb-2">접근 권한이 없습니다.</h1>
        <p className="text-gray-600">관리자 페이지에 접근할 수 없습니다.</p>
      </div>
    );
  }
  // 2. 로딩중 이라면
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg font-semibold text-gray-700">로딩중...</p>
      </div>
    );
  }

  // tsx 자리
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">관리자 페이지</h1>
      <div className="max-w-3xl mx-auto space-y-4">
        {deleteRequests.length === 0 ? (
          <p className="text-center text-gray-600">대기 중인 삭제 요청이 없습니다.</p>
        ) : (
          deleteRequests.map(item => (
            <div key={item.id} className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">사용자: {item.user_email}</h3>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-sm rounded">
                  대기 중
                </span>
              </div>
              <div className="text-gray-700 space-y-1 mb-4">
                <p>사용자 ID : {item.user_id}</p>
                <p>요청시간 : {item.requested_at}</p>
                <p>사유 : {item.reason}</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => approveDelete(item.id, item)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                  승인
                </button>
                <button
                  onClick={() => rejectDelete(item.id, item)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  거절
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminPage;
