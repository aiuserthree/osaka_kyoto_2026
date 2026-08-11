# 大阪・京都 3泊4日

오사카·교토 3박 4일(2026.09.06 ~ 09.09) 여행 일정 사이트.

**Live:** https://osaka-kyoto-2026.vercel.app/

## 구조

한 페이지가 너무 길어져서 영역별로 쪼갰다. 모든 페이지 상단에 로고(홈)와
햄버거 메뉴가 고정으로 붙어 있어 어디서든 다른 영역으로 넘어갈 수 있다.

```
index.html        홈 — 히어로 + 영역 카드
itinerary.html    일자별 일정 (일차 카드 4장)
  day-1.html      1일차 · 오사카 도착 & 도톤보리
  day-2.html      2일차 · 오사카성 & 전통 문화
  day-3.html      3일차 · 교토 당일치기
  day-4.html      4일차 · 쇼핑 & 귀국
stay.html         숙소
transit.html      교통 패스
notes.html        여행 팁

assets/style.css              전 페이지 공통 스타일
assets/nav.js                 햄버거 메뉴 · 현재 페이지 표시 · 스크롤 등장
assets/fonts/…woff2           Pretendard 서브셋
tools/subset-font.py          폰트 서브셋 재생성 스크립트
vercel.json                   폰트 캐시 헤더
```

빌드 과정이 없다. HTML 파일이 곧 결과물이라 고치고 싶으면 해당 파일을
바로 열어 수정하면 된다. 상단바·메뉴 마크업은 9개 파일에 같은 모양으로
들어 있으므로, 메뉴 항목을 늘리거나 이름을 바꿀 땐 전체 치환이 필요하다.

## 폰트

본문·제목·숫자 전부 **Pretendard**. CDN을 쓰지 않고 저장소에 직접 담아
서빙하기 때문에 외부 요청이 없고, 한 번 받아두면 오프라인에서도 그대로 뜬다.

용량을 위해 **이 사이트에 실제로 쓰인 글자만** 남긴 서브셋이다(2MB → 110KB).
그래서 페이지에 지금 없는 글자를 새로 추가하면 그 글자만 시스템 서체로
보일 수 있다. 그럴 땐 서브셋을 다시 만든다:

```bash
python3 -m venv .venv && .venv/bin/pip install fonttools brotli && .venv/bin/python tools/subset-font.py
```

Pretendard © orioncactus, SIL Open Font License 1.1

## 로컬에서 보기

`file://` 로 열어도 동작하지만, 폰트까지 정확히 확인하려면 서버로 띄우는 편이 낫다.

```bash
python3 -m http.server 8000
```

## 배포

`main` 브랜치에 푸시하면 Vercel이 자동 배포한다. 정적 사이트라
빌드 명령이나 프레임워크 설정은 필요 없다.

`vercel.json` 은 캐시 헤더만 지정한다. JSON 이라 주석을 달 수 없어
(주석용 키를 넣으면 스키마 검증에서 배포가 실패한다) 여기에 적어둔다.

- **CSS·JS·폰트 — `no-cache`**: 매 요청마다 검증한다. 안 바뀌었으면 304 라
  비용이 거의 없고, 고치자마자 반영된다. `max-age` 를 걸어두면
  배포해도 그 시간만큼 옛 화면이 남는다.
- **폰트에 `max-age` 를 걸면 안 되는 이유**: 파일명에 해시가 없다.
  `immutable` 은 물론이고 하루 캐시도 위험하다. 페이지에 새 글자를
  추가하면 서브셋 파일이 바뀌는데, 캐시가 남아 있는 동안은 새 글자만
  시스템 서체로 보인다. 실제로 하루 캐시에서 이 현상이 나서 걷어냈다.
- **HTML** 은 Vercel 기본값이 `public, max-age=0, must-revalidate` 라
  따로 지정하지 않는다. 이미 매번 검증한다.

배포 상태는 `npx vercel ls osaka-kyoto-2026` 로 확인할 수 있다.
`vercel.json` 을 고쳤다면 푸시 후 이 명령으로 Ready 인지 꼭 보자 —
스키마가 틀리면 사이트는 직전 배포 그대로인 채 조용히 실패한다.
