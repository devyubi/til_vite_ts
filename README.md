# full-calendar

- https://fullcalendar.io/docs/getting-started
- 가능하면 6.0 버전 쓰기

## 1. 설치

```bash
npm i @fullcalendar/react @fullcalendar/core \
      @fullcalendar/daygrid @fullcalendar/timegrid \
      @fullcalendar/interaction @fullcalendar/list
```

## 2. 폴더 및 파일 구조

- /src/pages/Calendar.tsx 파일 생성
- 최초 월 달력 출력하기

```tsx
import FullCalendar from '@fullcalendar/react';
// full screen 관련 ( 직접 타이핑 )
import DayGridPlugin from '@fullcalendar/daygrid';
import React from 'react';

function Calendar() {
  return (
    <div>
      <h2>Full Calendar</h2>
      <div>
        {/* daygridPlugin : 월 달력 플러그인, initialView : `월`로 보기 */}
        <FullCalendar plugins={[DayGridPlugin]} initialView="dayGridmonth" height={'auto'} />
      </div>
    </div>
  );
}

export default Calendar;
```

- 일정 출력 및 날짜 선택 시 상세 내용 보기

```tsx
import React, { useState } from 'react';
// full screen 관련
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import type { EventClickArg } from '@fullcalendar/core/index.js';

function Calendar() {
  const [events, setEvents] = useState([
    { id: '1', title: '우리반 운동회', start: '2025-09-03', allDay: true },
    { id: '2', title: '과학 실험', start: '2025-09-05T10:00:00', end: '2025-09-05T11:00:00' },
  ]);
  // 일정 상세 보기
  const handleClick = (info: EventClickArg) => {
    // console.log(info.event.title);
    alert(`제목 : ${info.event.title} 입니다.`);
  };
  return (
    <div>
      <h2>Full Calendar</h2>
      <div>
        {/* dayGridPlugin :  월 달력 플러그 인, initialView :  `월`로 보기 */}
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={events} // 일정 출력
          eventClick={e => handleClick(e)}
          height={'auto'}
        />
      </div>
    </div>
  );
}

export default Calendar;
```

- 일정 추가하기

```tsx
import React, { useState } from 'react';
// full screen 관련
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateSelectArg, EventClickArg } from '@fullcalendar/core/index.js';
// full calendar 에 입력 시 들어오는 데이터 모양
import type { EventInput } from '@fullcalendar/core/index.js';

function Calendar() {
  const [events, setEvents] = useState<EventInput[]>([
    { id: '1', title: '사과 반짝 세일', start: '2025-09-03', allDay: true },
    { id: '2', title: '딸기 파격 세일', start: '2025-09-05T10:00:00', end: '2025-09-05T11:00:00' },
  ]);
  // 일정 상세 보기
  const handleClick = (info: EventClickArg) => {
    // console.log(info.event.title);
    alert(`제목 : ${info.event.title} 입니다.`);
  };
  // 빈 날짜 선택 처리
  const handleSelect = (e: DateSelectArg) => {
    // 내용 입력 창을 만들어봄
    // 기본 프롬프트창으로 (웹브라우저 프롬프트로) 일단 처리
    const title = prompt('일정의 제목을 입력하세요.') || '';
    const calendarData = e.view.calendar;

    if (!title?.trim()) {
      alert('제목을 입력하세요.');
      return;
    }
    const newEvent = {
      id: String(Date.now()),
      title: title,
      start: e.start,
      allDay: e.allDay,
      end: e.end,
    };
    setEvents([...events, { newEvent }]);
  };

  return (
    <div>
      <h2>Full Calendar</h2>
      <div>
        {/* dayGridPlugin :  월 달력 플러그 인, initialView :  `월`로 보기 */}
        {/* interactionPlugin : 클릭 및 드래그 관련 플러그인 */}
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events} // 일정 출력
          eventClick={e => handleClick(e)} // 날짜 선택 내용 출력
          selectable={true} // 날짜를 선택할 수 있게 활성화
          selectMirror={true}
          select={e => handleSelect(e)}
          height={'auto'}
        />
      </div>
    </div>
  );
}

export default Calendar;
```

- 드래그 해서 일정 수정하기 : `editable = { true / false }`
  - editable={true} // 드래그로 일정 추가, 수정

```tsx
import React, { useState } from 'react';
// full screen 관련
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateSelectArg, EventClickArg } from '@fullcalendar/core/index.js';
// full calendar 에 입력 시 들어오는 데이터 모양
import type { EventInput } from '@fullcalendar/core/index.js';

function Calendar() {
  const [events, setEvents] = useState<EventInput[]>([
    { id: '1', title: '사과 반짝 세일', start: '2025-09-03', allDay: true },
    { id: '2', title: '딸기 파격 세일', start: '2025-09-05T10:00:00', end: '2025-09-05T11:00:00' },
  ]);
  // 일정 상세 보기
  const handleClick = (info: EventClickArg) => {
    // console.log(info.event.title);
    alert(`제목 : ${info.event.title} 입니다.`);
  };
  // 빈 날짜 선택 처리
  const handleSelect = (e: DateSelectArg) => {
    // 내용 입력 창을 만들어봄
    // 기본 프롬프트창으로 (웹브라우저 프롬프트로) 일단 처리
    const title = prompt('일정의 제목을 입력하세요.') || '';
    const calendarData = e.view.calendar;

    if (!title?.trim()) {
      alert('제목을 입력하세요.');
      return;
    }
    const newEvent = {
      id: String(Date.now()),
      title: title,
      start: e.start,
      allDay: e.allDay,
      end: e.end,
    };
    setEvents([...events, { newEvent }]);
  };

  return (
    <div>
      <h2>Full Calendar</h2>
      <div>
        {/* dayGridPlugin :  월 달력 플러그 인, initialView :  `월`로 보기 */}
        {/* interactionPlugin : 클릭 및 드래그 관련 플러그인 */}
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events} // 일정 출력
          eventClick={e => handleClick(e)} // 날짜 선택 내용 출력
          selectable={true} // 날짜를 선택할 수 있게 활성화
          selectMirror={true}
          select={e => handleSelect(e)}
          editable={true} // 드래그로 일정 추가, 수정
          height={'auto'}
        />
      </div>
    </div>
  );
}

export default Calendar;
```

- 주 / 일 버튼 처리하기 ( 도구 모음 )

```tsx
import React, { useState } from 'react';
// full screen 관련
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateSelectArg, EventClickArg } from '@fullcalendar/core/index.js';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
// full calendar 에 입력 시 들어오는 데이터 모양
import type { EventInput } from '@fullcalendar/core/index.js';

function Calendar() {
  const [events, setEvents] = useState<EventInput[]>([
    { id: '1', title: '사과 반짝 세일', start: '2025-09-03', allDay: true },
    { id: '2', title: '딸기 파격 세일', start: '2025-09-05T10:00:00', end: '2025-09-05T11:00:00' },
  ]);
  // 일정 상세 보기
  const handleClick = (info: EventClickArg) => {
    // console.log(info.event.title);
    alert(`제목 : ${info.event.title} 입니다.`);
  };
  // 빈 날짜 선택 처리
  const handleSelect = (e: DateSelectArg) => {
    // 내용 입력 창을 만들어봄
    // 기본 프롬프트창으로 (웹브라우저 프롬프트로) 일단 처리
    const title = prompt('일정의 제목을 입력하세요.') || '';
    const calendarData = e.view.calendar;

    if (!title?.trim()) {
      alert('제목을 입력하세요.');
      return;
    }
    const newEvent = {
      id: String(Date.now()),
      title: title,
      start: e.start,
      allDay: e.allDay,
      end: e.end,
    };
    setEvents([...events, { newEvent }]);
  };

  // 헤더 도구 상자
  const headerToolbar = {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth, timeGridWeek, timeGridDay, listWeek',
  };

  return (
    <div>
      <h2>Full Calendar</h2>
      <div>
        {/* dayGridPlugin :  월 달력 플러그 인, initialView :  `월`로 보기 */}
        {/* interactionPlugin : 클릭 및 드래그 관련 플러그인 */}
        {/* timeGridPlugin :  시간순 출력 관련 플러그인 */}
        {/* listPlugin :  목록 출력 관련 플러그인 */}
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]}
          initialView="dayGridMonth"
          events={events} // 일정 출력
          headerToolbar={headerToolbar}
          eventClick={e => handleClick(e)} // 날짜 선택 내용 출력
          selectable={true} // 날짜를 선택할 수 있게 활성화
          selectMirror={true}
          select={e => handleSelect(e)}
          editable={true} // 드래그로 일정 추가, 수정
          height={'auto'}
        />
      </div>
    </div>
  );
}

export default Calendar;
```

- 한국어 / 한국시간 처리하기

```tsx
import React, { useState } from 'react';
// full screen 관련
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateSelectArg, EventClickArg } from '@fullcalendar/core/index.js';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import koLocale from '@fullcalendar/core/locales/ko';
// full calendar 에 입력 시 들어오는 데이터 모양
import type { EventInput } from '@fullcalendar/core/index.js';

function Calendar() {
  const [events, setEvents] = useState<EventInput[]>([
    { id: '1', title: '사과 반짝 세일', start: '2025-09-03', allDay: true },
    { id: '2', title: '딸기 파격 세일', start: '2025-09-05T10:00:00', end: '2025-09-05T11:00:00' },
  ]);
  // 일정 상세 보기
  const handleClick = (info: EventClickArg) => {
    // console.log(info.event.title);
    alert(`제목 : ${info.event.title} 입니다.`);
  };
  // 빈 날짜 선택 처리
  const handleSelect = (e: DateSelectArg) => {
    console.log(e);
    // 내용 입력 창을 만들어봄
    // 기본 프롬프트창으로 (웹브라우저 프롬프트로) 일단 처리
    const title = prompt('일정의 제목을 입력하세요.') || '';
    const calendarData = e.view.calendar;
    console.log(calendarData);

    if (!title?.trim()) {
      alert('제목을 입력하세요.');
      return;
    }
    const newEvent = {
      id: String(Date.now()),
      title: title,
      start: e.start,
      allDay: e.allDay,
      end: e.end,
    };
    setEvents([...events, newEvent]);
  };

  // 헤더 도구 상자
  const headerToolbar = {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
  };

  return (
    <div>
      <h2>Full Calendar</h2>
      <div>
        {/* dayGridPlugin :  월 달력 플러그 인, initialView :  `월`로 보기 */}
        {/* interactionPlugin : 클릭 및 드래그 관련 플러그인 */}
        {/* timeGridPlugin :  시간순 출력 관련 플러그인 */}
        {/* listPlugin :  목록 출력 관련 플러그인 */}
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]}
          initialView="dayGridMonth"
          events={events} // 일정 출력
          headerToolbar={headerToolbar}
          locale={koLocale} // 한국어
          timeZone="Asia/Seoul" // 한국 시간
          slotMinTime="06:00:00" // 아침 6시부터
          slotMaxTime="22:00:00" // 밤 10시까지
          nowIndicator={true} // 현재 시간 빨간 선
          eventClick={e => handleClick(e)} // 날짜 선택 내용 출력
          selectable={true} // 날짜를 선택할 수 있게 활성화
          selectMirror={true}
          select={e => handleSelect(e)}
          editable={true} // 드래그로 일정 추가, 수정
          height={'auto'}
        />
      </div>
    </div>
  );
}

export default Calendar;
```

- 하루에 최대 출력 가능 개수 : ( 더 많으면 more 출력 )
  - `dayMaxEvents={3} // 최대 미리보기 개수` 만 추가함

```tsx
import React, { useState } from 'react';
// full screen 관련
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateSelectArg, EventClickArg } from '@fullcalendar/core/index.js';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import koLocale from '@fullcalendar/core/locales/ko';
// full calendar 에 입력 시 들어오는 데이터 모양
import type { EventInput } from '@fullcalendar/core/index.js';

function Calendar() {
  const [events, setEvents] = useState<EventInput[]>([
    { id: '1', title: '사과 반짝 세일', start: '2025-09-03', allDay: true },
    { id: '2', title: '딸기 파격 세일', start: '2025-09-05T10:00:00', end: '2025-09-05T11:00:00' },
  ]);
  // 일정 상세 보기
  const handleClick = (info: EventClickArg) => {
    // console.log(info.event.title);
    alert(`제목 : ${info.event.title} 입니다.`);
  };
  // 빈 날짜 선택 처리
  const handleSelect = (e: DateSelectArg) => {
    console.log(e);
    // 내용 입력 창을 만들어봄
    // 기본 프롬프트창으로 (웹브라우저 프롬프트로) 일단 처리
    const title = prompt('일정의 제목을 입력하세요.') || '';
    const calendarData = e.view.calendar;
    console.log(calendarData);

    if (!title?.trim()) {
      alert('제목을 입력하세요.');
      return;
    }
    const newEvent = {
      id: String(Date.now()),
      title: title,
      start: e.start,
      allDay: e.allDay,
      end: e.end,
    };
    setEvents([...events, newEvent]);
  };

  // 헤더 도구 상자
  const headerToolbar = {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
  };

  return (
    <div>
      <h2>Full Calendar</h2>
      <div>
        {/* dayGridPlugin :  월 달력 플러그 인, initialView :  `월`로 보기 */}
        {/* interactionPlugin : 클릭 및 드래그 관련 플러그인 */}
        {/* timeGridPlugin :  시간순 출력 관련 플러그인 */}
        {/* listPlugin :  목록 출력 관련 플러그인 */}
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]}
          initialView="dayGridMonth"
          events={events} // 일정 출력
          headerToolbar={headerToolbar}
          locale={koLocale} // 한국어
          timeZone="Asia/Seoul" // 한국 시간
          slotMinTime="06:00:00" // 아침 6시부터
          slotMaxTime="22:00:00" // 밤 10시까지
          nowIndicator={true} // 현재 시간 빨간 선
          dayMaxEvents={3} // 최대 미리보기 개수
          eventClick={e => handleClick(e)} // 날짜 선택 내용 출력
          selectable={true} // 날짜를 선택할 수 있게 활성화
          selectMirror={true}
          select={e => handleSelect(e)}
          editable={true} // 드래그로 일정 추가, 수정
          height={'auto'}
        />
      </div>
    </div>
  );
}

export default Calendar;
```

- 일정 삭제하기

```tsx
import React, { useState } from 'react';
// full screen 관련
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateSelectArg, EventClickArg } from '@fullcalendar/core/index.js';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import koLocale from '@fullcalendar/core/locales/ko';
// full calendar 에 입력 시 들어오는 데이터 모양
import type { EventInput } from '@fullcalendar/core/index.js';

function Calendar() {
  const [events, setEvents] = useState<EventInput[]>([
    { id: '1', title: '사과 반짝 세일', start: '2025-09-03', allDay: true },
    { id: '2', title: '딸기 파격 세일', start: '2025-09-05T10:00:00', end: '2025-09-05T11:00:00' },
  ]);
  // 일정 상세 보기
  const handleClick = (info: EventClickArg) => {
    // id로 비교해서 삭제
    const arr = events.filter(item => item.id !== info.event.id);
    setEvents(arr);
    alert(`제목 : ${info.event.title} 이 삭제되었습니다.`);
  };
  // 빈 날짜 선택 처리
  const handleSelect = (e: DateSelectArg) => {
    console.log(e);
    // 내용 입력 창을 만들어봄
    // 기본 프롬프트창으로 (웹브라우저 프롬프트로) 일단 처리
    const title = prompt('일정의 제목을 입력하세요.') || '';
    const calendarData = e.view.calendar;
    console.log(calendarData);

    if (!title?.trim()) {
      alert('제목을 입력하세요.');
      return;
    }
    const newEvent = {
      id: String(Date.now()),
      title: title,
      start: e.start,
      allDay: e.allDay,
      end: e.end,
    };
    setEvents([...events, newEvent]);
  };

  // 헤더 도구 상자
  const headerToolbar = {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
  };

  return (
    <div>
      <h2>Full Calendar</h2>
      <div>
        {/* dayGridPlugin :  월 달력 플러그 인, initialView :  `월`로 보기 */}
        {/* interactionPlugin : 클릭 및 드래그 관련 플러그인 */}
        {/* timeGridPlugin :  시간순 출력 관련 플러그인 */}
        {/* listPlugin :  목록 출력 관련 플러그인 */}
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]}
          initialView="dayGridMonth"
          events={events} // 일정 출력
          headerToolbar={headerToolbar}
          locale={koLocale} // 한국어
          timeZone="Asia/Seoul" // 한국 시간
          slotMinTime="06:00:00" // 아침 6시부터
          slotMaxTime="22:00:00" // 밤 10시까지
          nowIndicator={true} // 현재 시간 빨간 선
          dayMaxEvents={3} // 최대 미리보기 개수
          eventClick={e => handleClick(e)} // 날짜 선택 내용 출력
          selectable={true} // 날짜를 선택할 수 있게 활성화
          selectMirror={true}
          select={e => handleSelect(e)}
          editable={true} // 드래그로 일정 추가, 수정
          height={'auto'}
        />
      </div>
    </div>
  );
}

export default Calendar;
```

- 일정별로 색상을 다르게 표현하기

```tsx
import React, { useState } from 'react';
// full screen 관련
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateSelectArg, EventClickArg } from '@fullcalendar/core/index.js';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import koLocale from '@fullcalendar/core/locales/ko';
// full calendar 에 입력 시 들어오는 데이터 모양
import type { EventInput } from '@fullcalendar/core/index.js';

function Calendar() {
  const [events, setEvents] = useState<EventInput[]>([
    { id: '1', title: '사과 파격 세일', start: '2025-09-03', allDay: true },
    { id: '2', title: '딸기 반짝 세일', start: '2025-09-05T10:00:00', end: '2025-09-05T11:00:00' },
    {
      id: '3',
      title: '바나나 반짝 세일',
      start: '2025-09-05T11:00:00',
      end: '2025-09-05T13:00:00',
      color: '#ff7f50', // 배경 및 글자 기본 색상
      textColor: '#f00', // 글자 색상
      borderColor: '#cc3300', // 테두리 색상
    },
  ]);
  // 일정 상세 보기
  const handleClick = (info: EventClickArg) => {
    // id로 비교해서 삭제
    const arr = events.filter(item => item.id !== info.event.id);
    setEvents(arr);
    alert(`제목 : ${info.event.title} 이 삭제되었습니다.`);
  };
  // 빈 날짜 선택 처리
  const handleSelect = (e: DateSelectArg) => {
    console.log(e);
    // 내용 입력 창을 만들어봄
    // 기본 프롬프트창으로 (웹브라우저 프롬프트로) 일단 처리
    const title = prompt('일정의 제목을 입력하세요.') || '';
    const calendarData = e.view.calendar;
    console.log(calendarData);

    if (!title?.trim()) {
      alert('제목을 입력하세요.');
      return;
    }
    const newEvent = {
      id: String(Date.now()),
      title: title,
      start: e.start,
      allDay: e.allDay,
      end: e.end,
    };
    setEvents([...events, newEvent]);
  };

  // 헤더 도구 상자
  const headerToolbar = {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
  };

  return (
    <div>
      <h2>Full Calendar</h2>
      <div>
        {/* dayGridPlugin :  월 달력 플러그 인, initialView :  `월`로 보기 */}
        {/* interactionPlugin : 클릭 및 드래그 관련 플러그인 */}
        {/* timeGridPlugin :  시간순 출력 관련 플러그인 */}
        {/* listPlugin :  목록 출력 관련 플러그인 */}
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]}
          initialView="dayGridMonth"
          events={events} // 일정 출력
          headerToolbar={headerToolbar}
          locale={koLocale} // 한국어
          timeZone="Asia/Seoul" // 한국 시간
          slotMinTime="06:00:00" // 아침 6시부터
          slotMaxTime="22:00:00" // 밤 10시까지
          nowIndicator={true} // 현재 시간 빨간 선
          dayMaxEvents={3} // 최대 미리보기 개수
          eventClick={e => handleClick(e)} // 날짜 선택 내용 출력
          selectable={true} // 날짜를 선택할 수 있게 활성화
          selectMirror={true}
          select={e => handleSelect(e)}
          editable={true} // 드래그로 일정 추가, 수정
          height={'auto'}
        />
      </div>
    </div>
  );
}

export default Calendar;
```

- 일정 기본 색상을 지정하기

```tsx
<FullCalendar
  plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]}
  initialView="dayGridMonth"
  events={events} // 일정 출력
  headerToolbar={headerToolbar}
  locale={koLocale} // 한국어
  timeZone="Asia/Seoul" // 한국 시간
  slotMinTime="06:00:00" // 아침 6시부터
  slotMaxTime="22:00:00" // 밤 10시까지
  nowIndicator={true} // 현재 시간 빨간 선
  dayMaxEvents={3} // 최대 미리보기 개수
  eventClick={e => handleClick(e)} // 날짜 선택 내용 출력
  selectable={true} // 날짜를 선택할 수 있게 활성화
  selectMirror={true}
  select={e => handleSelect(e)}
  editable={true} // 드래그로 일정 추가, 수정
  height={'auto'}
  eventColor="#90ee90" // 기본 이벤트 배경색상
  eventTextColor="#000" // 기본 글자색상
  eventBorderColor="#008000" // 기본 테두리색상
/>
```

- 클래스로 일정 색상 통일하기 : ( 카테고리별로 처리 )

- index.css

```css
/* CSS */
.sports-event {
  background-color: #f08080 !important;
  color: #fff !important;
}
.science-event {
  background-color: #4682b4 !important;
  color: #fff !important;
}
```

- Calendar.tsx

```tsx
    {
      id: '1',
      title: '사과 파격 세일',
      start: '2025-09-03',
      allDay: true,
      classNames: ['sports-event'],
    },
    {
      id: '2',
      title: '딸기 반짝 세일',
      start: '2025-09-05T10:00:00',
      end: '2025-09-05T11:00:00',
      classNames: ['science-event'],
    },
```

- 아이콘 및 jsx 출력하기

```tsx
// jsx 출력하기
 eventContent={e => {
  return (
  <>
    <div className="bg-slate-500 pd-1">
      <b>{e.event.title}</b>
</div>
</>
);
```

- 전체 Calendar.tsx 코드

```tsx
import React, { useState } from 'react';
// full screen 관련
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateSelectArg, EventClickArg } from '@fullcalendar/core/index.js';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import koLocale from '@fullcalendar/core/locales/ko';
// full calendar 에 입력 시 들어오는 데이터 모양
import type { EventInput } from '@fullcalendar/core/index.js';

function Calendar() {
  const [events, setEvents] = useState<EventInput[]>([
    {
      id: '1',
      title: '사과 파격 세일',
      start: '2025-09-03',
      allDay: true,
      classNames: ['sports-event'],
    },
    {
      id: '2',
      title: '딸기 반짝 세일',
      start: '2025-09-05T10:00:00',
      end: '2025-09-05T11:00:00',
      classNames: ['science-event'],
    },
    {
      id: '3',
      title: '바나나 반짝 세일',
      start: '2025-09-05T11:00:00',
      end: '2025-09-05T13:00:00',
      color: '#ff7f50', // 배경 및 글자 기본 색상
      textColor: '#f00', // 글자 색상
      borderColor: '#cc3300', // 테두리 색상
    },
  ]);
  // 일정 상세 보기
  const handleClick = (info: EventClickArg) => {
    // id로 비교해서 삭제
    const arr = events.filter(item => item.id !== info.event.id);
    setEvents(arr);
    alert(`제목 : ${info.event.title} 이 삭제되었습니다.`);
  };
  // 빈 날짜 선택 처리
  const handleSelect = (e: DateSelectArg) => {
    console.log(e);
    // 내용 입력 창을 만들어봄
    // 기본 프롬프트창으로 (웹브라우저 프롬프트로) 일단 처리
    const title = prompt('일정의 제목을 입력하세요.') || '';
    const calendarData = e.view.calendar;
    console.log(calendarData);

    if (!title?.trim()) {
      alert('제목을 입력하세요.');
      return;
    }
    const newEvent = {
      id: String(Date.now()),
      title: title,
      start: e.start,
      allDay: e.allDay,
      end: e.end,
    };
    setEvents([...events, newEvent]);
  };

  // 헤더 도구 상자
  const headerToolbar = {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
  };

  return (
    <div>
      <h2>Full Calendar</h2>
      <div>
        {/* dayGridPlugin :  월 달력 플러그 인, initialView :  `월`로 보기 */}
        {/* interactionPlugin : 클릭 및 드래그 관련 플러그인 */}
        {/* timeGridPlugin :  시간순 출력 관련 플러그인 */}
        {/* listPlugin :  목록 출력 관련 플러그인 */}
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin, listPlugin]}
          initialView="dayGridMonth"
          events={events} // 일정 출력
          headerToolbar={headerToolbar}
          locale={koLocale} // 한국어
          timeZone="Asia/Seoul" // 한국 시간
          slotMinTime="06:00:00" // 아침 6시부터
          slotMaxTime="22:00:00" // 밤 10시까지
          nowIndicator={true} // 현재 시간 빨간 선
          dayMaxEvents={3} // 최대 미리보기 개수
          eventClick={e => handleClick(e)} // 날짜 선택 내용 출력
          selectable={true} // 날짜를 선택할 수 있게 활성화
          selectMirror={true}
          select={e => handleSelect(e)}
          editable={true} // 드래그로 일정 추가, 수정
          height={'auto'}
          eventColor="#90ee90" // 기본 이벤트 배경색상
          eventTextColor="#000" // 기본 글자색상
          eventBorderColor="#008000" // 기본 테두리색상
          // jsx 출력하기
          eventContent={e => {
            return (
              <>
                <div className="bg-slate-500 pd-1">
                  <b>{e.event.title}</b>
                </div>
              </>
            );
          }}
        />
      </div>
    </div>
  );
}

export default Calendar;
```
