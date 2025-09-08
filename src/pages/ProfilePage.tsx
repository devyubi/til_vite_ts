/**
 * 사용자 프로필 페이지
 * - 기본 정보 표시
 * - 정보 수정
 * - 회원 탈퇴 기능 : 반드시 확인을 거치고 진행해야함
 */

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateProfile, uploadAvatar } from '../lib/profile';
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

  // 사용자 아바타 이미지를 위한 상태 관리
  // 이미지 업로드 상태 표현
  const [uploading, setUploading] = useState<boolean>(false);
  // 미리보기 이미지 URL (문자열)
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  // 실제 파일 (바이너리)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // 사용자가 새로운 이미지 선택 시 (편집중인 경우), 원본 URL 보관용 (문자열)
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState<string | null>(null);
  // 이미지 제거 요청 상태 (그러나, 실제 file 제거는 수정 확인 버튼을 눌렀을 때 처리함)
  const [imageRemoverRequest, setImageRemoverRequest] = useState<boolean>(false);
  // input type='file' 태그 참조
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    // 여러개가 업로드 되어선 안됨
    setLoading(true);

    try {
      let imgUrl = originalAvatarUrl; // 원본 이미지 URL
      // 아바타 이미지 제거라면?
      if (imageRemoverRequest) {
        // storage 에 실제 이미지를 제거함
      } else if (selectedFile) {
        // 새로운 이미지가 업로드 된다면?
        const uploadedImageUrl = await uploadAvatar(selectedFile, user.id);
      }

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
    const message: string = '계정을 완전히 삭제하시겠습니까? \n\n 복구가 불가능 합니다.';
    let isConfirm = false;
    isConfirm = confirm(message);

    if (isConfirm) {
      deleteAccount();
    }
  };

  // 이미지 선택 처리 (미리보기)
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    // 파일 형식 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert(`지원하지 않는 파일 형식입니다. 허용 형식: ${allowedTypes.join(', ')}`);
      return;
    }

    // 파일 크기 검증 (5MB 제한)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert(`파일 크기가 너무 큽니다. 최대 5MB까지 업로드 가능합니다.`);
      return;
    }

    // 미리보기 생성 (파일을 문자열로 변환한 것)
    const reader = new FileReader();
    reader.onload = e => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setSelectedFile(file);
    // 새 이미지 선택 시 이미지 제거 요청 상태 초기화
    setImageRemoverRequest(false);
  };

  // 이미지 파일 선택 취소
  const handleCancelUpload = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 이미지 파일 제거 처리
  const handleRemoveImage = () => {
    const ok = confirm('프로필 이미지를 제거 하시겠습니까?');
    if (!ok) {
      return;
    }
    // 즉시 제거하지 않음
    // 제거 하라는 상태만 별도로 관리함
    setImageRemoverRequest(true);
    setPreviewImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
              <h4>아바타 편집</h4>
              <div>
                {previewImage ? (
                  <div>
                    <img src={previewImage} />
                    <p>새로운 이미지 미리보기</p>
                  </div>
                ) : imageRemoverRequest ? (
                  <div>이미지 제거됨.</div>
                ) : originalAvatarUrl ? (
                  <div>
                    <img src={originalAvatarUrl} />
                    현재 아바타
                  </div>
                ) : (
                  <div>이미지 없음, 아바타 이미지를 설정 해보세요!</div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />
              </div>
              <div>
                <div>
                  {/* disabled : 비활성화 */}
                  <button disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                    {uploading ? '업로드 중...' : '이미지 선택'}
                  </button>
                  {previewImage && (
                    <button disabled={uploading} onClick={handleCancelUpload}>
                      취소
                    </button>
                  )}
                  {!previewImage && !imageRemoverRequest && originalAvatarUrl && (
                    <button onClick={handleRemoveImage}>
                      {uploading ? '처리 중' : '이미지 제거'}
                    </button>
                  )}
                  {imageRemoverRequest && (
                    <button
                      disabled={uploading}
                      onClick={() => {
                        setImageRemoverRequest(false);
                      }}
                    >
                      제거 취소
                    </button>
                  )}
                </div>
              </div>
              <p>지원 형식 : JPEG, PNG, GIF (최대 5MB)</p>
            </div>
          </>
        ) : (
          <>
            <div className="text-gray-700 mb-4">닉네임 : {profileData?.nickname}</div>
            <div className="text-gray-700 mb-4">
              <h4>아바타 : </h4>
              {profileData?.avatar_url ? (
                <img src={profileData.avatar_url} className="h-16 w-16 rounded-full mt-2" />
              ) : (
                <div>기본 이미지</div>
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
              disabled={uploading}
              onClick={saveProfile}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              {uploading ? '저장 중...' : '수정 확인'}
            </button>
            <button
              onClick={() => {
                setUserEdit(false);
                setNickName(profileData?.nickname || '');
                setPreviewImage(null);
                setSelectedFile(null);
                setImageRemoverRequest(false);
                setOriginalAvatarUrl(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              수정 취소
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                setUserEdit(true);
                // 편집 시작 시 원본 이미지 URL 저장
                setOriginalAvatarUrl(profileData?.avatar_url || null);
                setImageRemoverRequest(false);
              }}
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
