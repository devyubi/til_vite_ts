# Editor 와 Supabase Storage 연동

- 사용자가 내용 작성 중 이미지를 배치한다면 ?
  - 1. 그냥 text 로 처리한다.
  - 2. 이미지를 배치하면 storage 업로드 후 url 을 받아서 보여준다
  - 3. 이미지를 배치하면 미리보기 URL 을 생성 한 후 보여주고,
       img src='임시주소', img 파일은 별도로 보관함.
       사용자가 저장 버튼을 누르면 그 때 storage 에 등록자 폴더 생성 후 저장한다.
       저장에 성공하면 getURL 로 주소를 알아냄.
       content 의 내용 중 img src='주소' 교체하고, DB 에 저장한다.

## 1. Supabase Storage 설정

### 1.1 `todos-images` 생성

- public bucket : 활성
- Restrict file size : 50 M
- Allowed MIME types : `image/jpeg, image/png, image/gif, image/webp, image/svg+xml`
- 주의 사항 : `image/*` 는 배제함. (쓰지 않는 걸 권장함)

### 1.2 `RLS` 설정

```sql
CREATE POLICY "Public object access Todo Images" ON storage.objects FOR ALL USING (bucket_id = 'todo-images');
```

### 1.3 업로드 시 `todo-images/사용자ID폴더/파일들...`

## 2. 새 글 및 이미지 등록

### 2.1 text editor 의 이미지 업로드 기능 처리

- 임시 미리보기 이미지를 생성하고, 실제로는 파일을 업로드 하고, URL 을 받아서 내용 수정 후 content 를 insert 함
- /src/components/RichTextEditor.tsx

- /src/pages/TodoWritePage.tsx
