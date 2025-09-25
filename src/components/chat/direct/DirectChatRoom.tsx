const DirectChatRoom = () => {
  return (
    <div className="chat-room">
      {/* 채팅방 헤더 */}
      <div className="chat-room-header">
        {/* 채팅방 정보 - 제목 */}
        <div className="chat-room-info">
          <h3>1:1 채팅 (상대방 닉네임)</h3>
        </div>
        {/* 채팅방 액션 버튼들 - 나가기 등... */}
        <div className="chat-room-actions">
          <button
            className="chat-room-exit"
            onClick={() => {
              if (window.confirm('채팅방을 나가시겠습니까?')) {
                alert('채팅방을 나갔습니다. (Mock 버전)');
              }
            }}
          >
            나가기
          </button>
        </div>
      </div>

      {/* 메세지 목록 영역 */}
      <div className="chat-room-message">
        {/* 메세지가 없을 때 안내 메세지 */}
        {/* <div className="chat-room-no-message">
          <p>아직 메세지가 없습니다.</p>
          <p>첫 메세지를 보내보세요!</p>
        </div> */}

        {/* 날짜 별로 그룹화 된 메세지 목록 렌더링 */}
        <div className="message-group">
          {/* 날짜 구분선 */}
          <div className="date-divider">
            {/* 날짜 출력 */}
            <span>오늘</span>
          </div>

          {/* 해당 날짜의 메세지들 */}
          {/* 나의 메세지 - 오른쪽 정렬 */}
          <div className="chat-room-message-item my-message">
            {/* 나의 메세지 : 말풍선, 시간, 아바타 (오른쪽 정렬) */}
            <div className="chat-room-message-bubble">
              <div className="message-text">내가 작성한 채팅이지롱~</div>
              <div className="message-time">13:17</div>
            </div>
            <div className="chat-room-message-avatar"></div>
          </div>
          {/* 상대방 메세지 - 왼쪽 정렬 */}
          <div className="chat-room-message-item other-message">
            {/* 상대방 메세지 : 말풍선, 시간, 아바타 (오른쪽 정렬) */}
            <div className="message-text">쟤가 작성한 채팅이지롱~</div>
            <div className="message-time">13:17</div>
          </div>
        </div>
      </div>

      {/* 메세지 입력 컴포넌트 */}
    </div>
  );
};

export default DirectChatRoom;
