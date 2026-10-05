# 김한용 ♥ 배지영 모바일 청첩장

GitHub Pages용 정적 사이트입니다. 빌드 과정 없이 파일을 올리기만 하면 됩니다.

## 파일 구성
| 파일 | 설명 |
|---|---|
| `index.html` / `style.css` / `script.js` | 청첩장 페이지 |
| `config.js` | **이름·날짜·장소·인사말·계좌 등 내용은 여기서만 수정** |
| `images/` | **모든 사진을 이 폴더 하나에서 관리** (가로·세로 최대 1600px) |
| `images/photos.json` | 갤러리 순서와 메인(커버) 사진 지정 |
| `images/og.jpg` | 카카오톡/문자 공유 미리보기 이미지 (메인 사진에서 자동 생성) |
| `admin.html` | 관리 페이지 — 사진 업로드/삭제/순서/메인 지정, 참석 응답 통계 |
| `apps-script/Code.gs` | 응답을 구글 시트에 저장하는 스크립트 |

## 1. GitHub Pages 배포
1. GitHub `soboo` 계정에서 새 저장소 `marry` 생성 — Public
2. 이 폴더의 파일 전체를 업로드 (Add file → Upload files, 폴더째 드래그)
3. Settings → Pages → Source: `Deploy from a branch`, Branch: `main` / `(root)` → Save
4. 1~2분 뒤 `https://<아이디>.github.io/wedding/` 에서 확인

> 카카오톡 미리보기(og 태그)는 `https://soboo.github.io/marry/` 기준 전체 주소로 설정돼 있습니다.
> 저장소 이름이나 계정이 바뀌면 `index.html`의 `og:` 주소들과 `config.js`의 `shareUrl`을 함께 바꿔주세요.
> 사진이나 문구를 바꿨는데 카톡 미리보기가 예전 그대로면, 카카오 개발자 사이트의
> [공유 디버거](https://developers.kakao.com/tool/debugger/sharing)에 주소를 넣고 **캐시 초기화**를 눌러주세요.

## 2. 참석 여부 응답 수집 (Google 스프레드시트)
1. 구글 드라이브에서 새 스프레드시트 생성 → **확장 프로그램 → Apps Script**
2. `apps-script/Code.gs` 내용을 통째로 붙여넣고, 맨 위 `ADMIN_KEY`를 원하는 비밀번호로 변경 → 저장
3. 상단 함수 선택에서 `setup` 선택 → **실행** → 권한 승인
   (“확인되지 않은 앱” 경고 → 고급 → 이동 클릭). `응답`, `통계` 시트가 생깁니다.
4. **배포 → 새 배포** → 유형 ⚙ `웹 앱` → 실행 계정 `나`, 액세스 권한 `모든 사용자` → 배포
5. 나온 URL(`https://script.google.com/macros/s/.../exec`)을 `config.js`의 `rsvpEndpoint`에 입력

### 통계 보기
- 스프레드시트 `통계` 시트: 신랑측/신부측 참석 건수·참석 인원·불참 건수가 자동 집계
- `https://soboo.github.io/marry/admin.html` 에서 비밀번호 입력 → 휴대폰에서도 현황 확인

> Code.gs를 수정했다면 **배포 → 배포 관리 → 수정(연필) → 버전: 새 버전**으로 다시 배포해야 반영됩니다.

## 3. 사진 관리 (업로드하면 저장소에 바로 반영)
`https://soboo.github.io/marry/admin.html` → **사진 관리** 탭

1. 최초 1회: GitHub **Fine-grained 토큰** 만들기
   - GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token
   - Repository access: Only select repositories → `marry`
   - Permissions → Repository permissions → **Contents: Read and write**
   - 만료일은 결혼식 이후로
2. 토큰을 붙여넣고 **연결**
3. **＋ 사진 추가**(여러 장 가능) · ★ 메인 지정 · ◀ ▶ 순서 · 🗑 삭제
4. **저장하고 반영하기** → 저장소에 커밋 1개로 올라가고, 1~2분 뒤 청첩장에 반영

- 사진은 브라우저에서 자동으로 1600px JPEG로 줄인 뒤 올라갑니다 (휴대폰 사진 회전도 자동 보정).
- 메인 사진을 바꾸면 카카오톡 미리보기용 `og.jpg`도 자동으로 다시 만들어집니다.
- 토큰은 저장소에 저장되지 않고 그 브라우저에만 남습니다. 공용 PC에서는 '기억하기'를 끄고, 다 쓰면 '연결 해제'를 눌러주세요.
