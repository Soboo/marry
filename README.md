# 김한용 ♥ 배지영 모바일 청첩장

GitHub Pages용 정적 사이트입니다. 빌드 과정 없이 파일을 올리기만 하면 됩니다.

## 파일 구성
| 파일 | 설명 |
|---|---|
| `index.html` / `style.css` / `script.js` | 청첩장 페이지 |
| `config.js` | **이름·날짜·장소·인사말·계좌 등 내용은 여기서만 수정** |
| `images/main.jpg` | 메인(커버) 사진 |
| `images/gallery/01~19.jpg` | 갤러리 원본(1600px) · `images/thumb/` 썸네일 |
| `images/og.jpg` | 카카오톡/문자 공유 시 미리보기 이미지 |
| `admin.html` | 참석 응답 통계 페이지 (비밀번호 필요) |
| `apps-script/Code.gs` | 응답을 구글 시트에 저장하는 스크립트 |

## 1. GitHub Pages 배포
1. GitHub에서 새 저장소 생성 (예: `wedding`) — Public
2. 이 폴더의 파일 전체를 업로드 (Add file → Upload files, 폴더째 드래그)
3. Settings → Pages → Source: `Deploy from a branch`, Branch: `main` / `(root)` → Save
4. 1~2분 뒤 `https://<아이디>.github.io/wedding/` 에서 확인

> 카카오톡 공유 미리보기 이미지를 확실히 띄우려면 `index.html`의 `og:image`를
> `https://<아이디>.github.io/wedding/images/og.jpg` 처럼 **전체 주소**로 바꿔주세요.

## 2. 참석 여부 응답 수집 (Google 스프레드시트)
1. 구글 드라이브에서 새 스프레드시트 생성 → **확장 프로그램 → Apps Script**
2. `apps-script/Code.gs` 내용을 통째로 붙여넣고, 맨 위 `ADMIN_KEY`를 원하는 비밀번호로 변경 → 저장
3. 상단 함수 선택에서 `setup` 선택 → **실행** → 권한 승인
   (“확인되지 않은 앱” 경고 → 고급 → 이동 클릭). `응답`, `통계` 시트가 생깁니다.
4. **배포 → 새 배포** → 유형 ⚙ `웹 앱` → 실행 계정 `나`, 액세스 권한 `모든 사용자` → 배포
5. 나온 URL(`https://script.google.com/macros/s/.../exec`)을 `config.js`의 `rsvpEndpoint`에 입력

### 통계 보기
- 스프레드시트 `통계` 시트: 신랑측/신부측 참석 건수·참석 인원·불참 건수가 자동 집계
- `https://<아이디>.github.io/wedding/admin.html` 에서 비밀번호 입력 → 휴대폰에서도 현황 확인

> Code.gs를 수정했다면 **배포 → 배포 관리 → 수정(연필) → 버전: 새 버전**으로 다시 배포해야 반영됩니다.

## 3. 사진 교체
같은 이름(`01.jpg`…)으로 덮어쓰면 됩니다. 장수가 바뀌면 `config.js`의 `galleryCount`도 수정하세요.
가로 1600px 이하, JPG 품질 80 정도면 충분합니다.
