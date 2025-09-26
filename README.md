# 더미 데이터를 이용한 테스트 코드

- DB 테이블 구조에 대하여 고민 선작업

## 1. 데이터 타입 정의를 많이 고민해야함

- /src/types/ChatType.ts 파일 생성

## 2. 채팅 시스템에서 사용자 정보를 나타내는 기본형

- 첫번째 : 하단은 샘플링 코드

```ts
const user: any = {
  id: 'user-123',
  email: 'test@test.com',
  nickname: '무뉴비',
  avatar_url?:'http~',
}
```

- 두번째 : type 을 정의해 봄

```ts
interface ChatUser {
  id: string;
  email: string;
  nickname: string;
  avatar_url?: string;
}
```

## 3. 채팅 시스템에서 채팅방의 타입도 필요로 함

- 채팅방의 기본 정보를 담는 타입
- 향후 업데이트를 위해서 채팅방의 타입도 정의된 타입
- 채팅방 생성자와 시간 정보로 채팅방을 관리함
- 첫번째 : 하단은 샘플링 코드

```ts
const chat: any = {
  id: 'chat-455',
  name: '1:1 채팅',
  type: 'direct', // direct (1:1) | group 채팅
  created_by: 'user-123',
  created_at: '2025-09-26~~',
  updated_at: '2025-09-26~~',
};
```

- 두번째 : type 을 정의해 봄

```ts
interface Chat {
  id: string;
  name: string;
  type: 'direct'; // direct (1:1) | group 채팅
  created_by: string;
  created_at: string;
  updated_at: string;
}
```

## 4. 채팅 메세지의 타입도 필요로 함

- 개별 메세지의 기본 정보를 담는 타입
- 어떤 채팅방의 메세지인지 구분
- 발신자 : 누가 발신을 했는지
- 실제 메세지 텍스트도 저장
- 첫번째 : 하단은 샘플링 코드

```ts
const message:any = {
  id: 'msg-123',
  chat_id: 'chat-123',
  sender_id: 'user-123',
  content: '안녕하세요. 금일도 화이팅~~!'
  created_at: '2025-09-26~~',
  updated_at: '2025-09-26~~',
}
```

- 두번째 : type 을 정의해 봄

```ts
interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}
```

## 5. 메세지 + 발신자 정보 형태가 필요함

- 확장 타입
- 하나의 메세지는 메세지 타입과 발신자 정보 형태가 혼합이 되어있음.
- 첫번째 : 하단은 샘플링 코드

```ts
const sample:any = {
    id: 'msg-123',
  chat_id: 'chat-123',
  sender_id: 'user-123',
  content: '안녕하세요. 금일도 화이팅~~!'
  created_at: '2025-09-26~~',
  updated_at: '2025-09-26~~',
  sender : {
   id: 'user-123',
   email: 'test@test.com',
   nickname: '무뉴비',
   avatar_url?:'http~',
  }
}
```

- 두번째 : type 을 정의해 봄 (문법이 약하다면 사용함)

```ts
interface MessageDetail {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  sender: {
    id: string;
    email: string;
    nickname: string;
    avatar_url?: string;
  };
}
```

- 두번째 : type 을 정의해 봄 (문법중 상속을 아는 경우)

```ts
interface MessageDetail extands Message {
sender: ChatUser;
}
```

## 6. 채팅방 목록용 타입도 필요할 것 같음!

- 채팅방의 목록을 표시할 때 사용한 타입
- last_message : 미리보기 제공
- other_user : 상대방 정보
- unread_count : 읽지 않은 메세지 갯수
- 첫번째 : 하단은 샘플링 코드

```ts
const chatItem: any = {
  id: 'chat-456';
  name:'무뉴비';
  type: 'direct',
  last_message: {
    content: '안녕하세요',
    created_at : '2025-09-01~~',
    sender_nickname: '홍길동',
  },
  other_user: {
   id: 'user-123',
   email: 'test@test.com',
   nickname: '소정',
   avatar_url?:'http~',
  },
  unread_count: 5,
  updated_at: '2025-09-01~~',
}
```

- 두번째 : type 을 정의해 봄

```ts
interface ChatListItem {
  id: string;
  name: string;
  type: 'direct';
  last_message?: {
    content: string;
    created_at: string;
    sender_nickname: string;
  };
  other_user: ChatUser;
  unread_count: number;
  updated_at: string;
}
```
