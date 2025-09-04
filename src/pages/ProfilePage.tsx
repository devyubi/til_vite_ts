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
  const { user } = useAuth();
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

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[999] w-full h-full bg-green-600 flex items-center justify-center">
        <h1 className="text-white text-xl font-bold">프로필 로딩중 ...</h1>
      </div>
    );
  }
  // error 메세지 출력하기
  if (error) {
    return (
      <div>
        <h2>프로필</h2>
        <div>{error}</div>
        <button onClick={loadProfile}>재시도</button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">회원 정보</h2>
      {/* 사용자 기본 정보 */}
      <div className="mb-6 p-4 border rounded-lg shadow-sm bg-white">
        <h3 className="text-xl font-semibold mb-2">기본 정보</h3>
        <div className="text-gray-700">이메일 : {user?.email}</div>
        <div className="text-gray-700">
          가입일: {user?.created_at && new Date(user.created_at).toLocaleString()}
        </div>
      </div>
      {/* 사용자 추가 정보 */}
      <div className="p-4 border rounded-lg shadow-sm bg-white">
        <h3 className="text-xl font-semibold mb-2">사용자 추가 정보</h3>
        <div className="text-gray-700">아이디 : {profileData?.id}</div>
        {userEdit ? (
          <>
            <div>
              닉네임 :
              <input type="text" value={nickName} onChange={e => setNickName(e.target.value)} />
            </div>
            <div className="text-gray-700">
              아바타 :
              {profileData?.avatar_url ? (
                <img src={profileData.avatar_url} />
              ) : (
                <button className="border px-1">파일 추가</button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="text-gray-700">닉네임 : {profileData?.nickname}</div>
            <div className="text-gray-700">
              아바타 :
              {profileData?.avatar_url ? (
                <img src={profileData.avatar_url} />
              ) : (
                <img
                  className="h-[30px] w-[35px]"
                  src={
                    'https://e7.pngegg.com/pngimages/867/694/png-clipart-user-profile-default-computer-icons-network-video-recorder-avatar-cartoon-maker-blue-text.png'
                  }
                />
              )}
            </div>
          </>
        )}
        <div className="text-gray-700">
          아바타 :
          {profileData?.avatar_url ? (
            <img src={profileData.avatar_url} />
          ) : (
            <button className="border px-1">파일 추가</button>
          )}
        </div>
        <div className="text-gray-700">
          가입일 :{profileData?.created_at && new Date(profileData.created_at).toLocaleString()}
        </div>
      </div>
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <div>
        {userEdit ? (
          <>
            <button onClick={saveProfile}>수정 확인</button>
            <button
              onClick={() => {
                setUserEdit(false);
                setNickName(profileData?.nickname || '');
              }}
            >
              수정 취소
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setUserEdit(true)}>정보 수정</button>
            <button>회원 탈퇴</button>
          </>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
