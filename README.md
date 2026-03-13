# Brain Bites Expo MVP

책, 문서, 긴 설명형 콘텐츠를 `짧은 lesson + practice` 흐름으로 소비하게 만드는 Expo 기반 모바일 MVP입니다.

핵심 흐름은 아래처럼 구성되어 있습니다.

- `Home`: 추천 pack, 오늘의 진행 상태, creator studio 구조 요약
- `Content Detail`: 표지, 설명, key ideas, idea 목록
- `Lesson`: 한 번에 한 카드씩 읽는 학습 화면
- `Summary`: 핵심 bullet 요약
- `Practice`: 1문항 퀴즈와 즉시 피드백
- `Completion`: 완료 상태와 다음 idea 이동

## 새로 추가된 Expo 구조

- `package.json`: Expo 실행 스크립트와 의존성
- `app.json`: Expo 앱 설정
- `index.js`: Expo 엔트리 파일
- `src/RootApp.js`: 전체 모바일 화면 흐름과 UI
- `src/data/learningContent.js`: 샘플 학습 pack 데이터

## 실행 방법

의존성을 설치한 뒤 Expo 개발 서버를 실행하면 됩니다.

```bash
npm install
npm run start
```

플랫폼별 실행:

```bash
npm run ios
npm run android
npm run web
```

## 현재 포함된 샘플 콘텐츠

- `The Art of Thinking Clearly`
- 핵심 idea 6개
- 학습 흐름: `pack detail -> lesson cards -> summary -> practice -> completion`

## 제품 구조 의도

이 MVP는 앞단 사용자 경험을 `학습 앱`처럼 단순하게 유지하면서, 뒤에서는 향후 아래 제작 레이어를 붙이기 쉽게 설계했습니다.

- source 업로드
- idea 추출
- lesson card 생성
- practice question 생성
- pack 발행

즉, 사용자 입장에서는 쉬운 모바일 학습 앱처럼 보이지만, 서비스 관점에서는 `NotebookLM 스타일의 이해 엔진 + Blinkist/Duolingo 스타일의 소비 UX`를 목표로 합니다.

## 기존 웹 프로토타입

아래 파일들은 기존 정적 웹 프로토타입으로 그대로 남겨두었습니다.

- `index.html`
- `styles.css`
- `app.js`

이 파일들은 Expo 앱 엔트리와 충돌하지 않도록 그대로 보존했고, 새 모바일 MVP는 `index.js`와 `src/` 아래에서 동작합니다.
