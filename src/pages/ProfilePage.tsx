/**
 * 사용자 프로필 페이지
 * - 기본 정보 표시
 * - 정보 수정
 * - 회원 탈퇴 기능 : 반드시 확인을 거치고 진행해야함
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateProfile } from '../lib/profile';
import type { Profile, ProfileUpdate } from '../types/todoType';

function ProfilePage() {
  // 회원 기본 정보
  const { user, deleteAccount } = useAuth();
  // 데이터 가져오는 동안의 로딩
  const [loading, setLoading] = useState<boolean>(true);
  // 사용자 프로필
  const [profileData, setProfileData] = useState<Profile | null>(null);
  // Error 메세지
  const [error, setError] = useState<string>('');
  // 회원 정보 수정
  const [userEdit, setUserEdit] = useState<boolean>(false);
  // 회원 닉네임 보관
  const [nickName, setNickName] = useState<string>('');

  // 사용자 프로필 정보 가져오기
  const loadProfile = async () => {
    if (!user?.id) {
      // 사용자의 id 가 없으면 중지
      setError('사용자의 정보를 찾을 수 없습니다.');
      setLoading(false);
      return;
    }
    try {
      // 사용자 정보를 가져오기 ( null 일 수도 있음 )
      const tempData = await getProfile(user?.id);
      if (!tempData) {
        // null 일 경우
        setError('사용자의 프로필 정보를 찾을 수 없습니다.');
        return;
      }

      // 사용자 정보가 있을 경우
      setNickName(tempData.nickname || '');
      setProfileData(tempData);
    } catch (error) {
      console.log(error);
      setError('사용자의 프로필 정보 호출 오류');
    } finally {
      setLoading(false);
    }
  };

  // 프로필 데이터 업데이트
  const saveProfile = async () => {
    if (!user) {
      return;
    }
    if (!profileData) {
      return;
    }

    try {
      const tempUpdateData: ProfileUpdate = { nickname: nickName };
      const success = await updateProfile(tempUpdateData, user.id);
      if (!success) {
        console.log('프로필 업데이트에 실패하였습니다.');
        return;
      }

      loadProfile();
    } catch (err) {
      console.log('프로필 업데이트 오류', err);
    } finally {
      setUserEdit(false);
    }
  };

  // 회원탈퇴
  const handleDeleteUser = () => {
    const message: string = '계정을 완전히 삭제하시겠습니까? 복구가 불가능 합니다.';
    let isConfirm = false;
    isConfirm = confirm(message);

    if (isConfirm) {
      deleteAccount();
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[999] w-full h-full bg-sky-400 flex items-center justify-center">
        <h1 className="text-white text-xl font-bold">프로필 로딩중 ...</h1>
      </div>
    );
  }
  // error 메세지 출력하기
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h2 className="text-2xl font-bold mb-4">프로필</h2>
        <div className="mb-4 text-red-600">{error}</div>
        <button
          onClick={loadProfile}
          className="px-4 py-2 bg-blue-200 text-white rounded-lg hover:bg-blue-300 transition-colors"
        >
          재시도
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-blue-700">회원 정보</h2>
      {/* 사용자 기본 정보 */}
      <div className="mb-6 p-6 border rounded-lg shadow bg-white">
        <h3 className="text-xl font-semibold mb-4">기본 정보</h3>
        <div className="text-gray-700 mb-2">이메일 : {user?.email}</div>
        <div className="text-gray-700">
          가입일: {user?.created_at && new Date(user.created_at).toLocaleString()}
        </div>
      </div>
      {/* 사용자 추가 정보 */}
      <div className="p-6 border rounded-lg shadow bg-white">
        <h3 className="text-xl font-semibold mb-4">사용자 추가 정보</h3>
        <div className="text-gray-700 mb-2">아이디 : {profileData?.id}</div>
        {userEdit ? (
          <>
            <div className="mb-4">
              닉네임 :
              <input
                type="text"
                value={nickName}
                onChange={e => setNickName(e.target.value)}
                className="ml-2 px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <div className="text-gray-700 mb-4">
              아바타 :
              {profileData?.avatar_url ? (
                <img src={profileData.avatar_url} className="h-9 w-10 rounded-full mt-2" />
              ) : (
                <button className="ml-2 px-2 py-1 border rounded-lg hover:bg-gray-100">
                  파일 추가
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="text-gray-700 mb-4">닉네임 : {profileData?.nickname}</div>
            <div className="text-gray-700 mb-4">
              아바타 :
              {profileData?.avatar_url ? (
                <img src={profileData.avatar_url} className="h-16 w-16 rounded-full mt-2" />
              ) : (
                <img
                  className="h-16 w-16 rounded-full mt-2"
                  src={
                    'https://e7.pngegg.com/pngimages/867/694/png-clipart-user-profile-default-computer-icons-network-video-recorder-avatar-cartoon-maker-blue-text.png'
                  }
                />
              )}
            </div>
          </>
        )}
        <div className="text-gray-700 mb-4">
          가입일 : {profileData?.created_at && new Date(profileData.created_at).toLocaleString()}
        </div>
      </div>
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <div className="mt-6 flex gap-3">
        {userEdit ? (
          <>
            <button
              onClick={saveProfile}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              수정 확인
            </button>
            <button
              onClick={() => {
                setUserEdit(false);
                setNickName(profileData?.nickname || '');
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              수정 취소
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setUserEdit(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              정보 수정
            </button>
            <button
              onClick={handleDeleteUser}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              회원 탈퇴
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
