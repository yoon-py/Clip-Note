# Brain Bites Expo MVP

`Expo 앱 + 로컬 백엔드 + OpenAI API` 조합으로 긴 텍스트를 `lesson + summary + practice` 구조의 모바일 pack으로 바꾸는 MVP입니다.

## 구조

- `src/RootApp.js`: Expo 앱 UI와 학습 흐름
- `src/data/learningContent.js`: 기본 샘플 pack 데이터
- `server/index.js`: Express 백엔드와 OpenAI Responses API 연동
- `.env.example`: 필요한 환경변수 예시

## 환경변수

`.env.example`를 복사해서 `.env`를 만든 뒤 값을 채우면 됩니다.

```bash
cp .env.example .env
```

필수 값:

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5-mini
PORT=8787
EXPO_PUBLIC_API_URL=http://127.0.0.1:8787
```

`EXPO_PUBLIC_API_URL`은 기기별로 다르게 잡아야 합니다.

- iOS 시뮬레이터: `http://127.0.0.1:8787`
- Android 에뮬레이터: `http://10.0.2.2:8787`
- 실제 휴대폰: `http://내-맥-로컬-IP:8787`

## 설치

```bash
npm install
```

## 실행

터미널 1:

```bash
npm run backend
```

터미널 2:

```bash
npm run dev
```

Expo가 뜨면 아래처럼 볼 수 있습니다.

- `i`: iOS 시뮬레이터 열기
- `a`: Android 에뮬레이터 열기
- `w`: 웹에서 열기
- 또는 `Expo Go` 앱으로 QR 스캔

## 현재 앱 흐름

- `Home`
- `AI Studio`
- `Content Detail`
- `Lesson`
- `Summary`
- `Practice`
- `Completion`

`AI Studio` 화면에서 텍스트를 붙여넣으면 백엔드가 OpenAI API를 호출하고, 생성된 pack이 앱 라이브러리에 추가됩니다.

## 백엔드 엔드포인트

- `GET /health`
- `POST /api/generate-pack`

`POST /api/generate-pack`는 `title`, `author`, `category`, `sourceText`를 받아 pack JSON을 돌려줍니다.

## 기존 웹 프로토타입

아래 정적 웹 파일은 그대로 보존되어 있습니다.

- `index.html`
- `styles.css`
- `app.js`

새 Expo 앱과 충돌하지 않도록 모바일 앱 엔트리는 `index.js`를 사용합니다.
