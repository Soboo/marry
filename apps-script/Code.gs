/**
 * 모바일 청첩장 참석 여부(RSVP) · 방명록 수집용 Google Apps Script
 *
 * 1) 구글 스프레드시트 새로 만들기 → 확장 프로그램 → Apps Script
 * 2) 이 파일 내용을 붙여넣고 ADMIN_KEY 를 원하는 비밀번호로 바꾸기
 * 3) 함수 목록에서 setup 실행 (권한 승인)
 * 4) 배포 → 새 배포 → 유형: 웹 앱 / 실행: 나 / 액세스: 모든 사용자 → 배포
 * 5) 나온 웹 앱 URL(…/exec)을 config.js 의 rsvpEndpoint 에 넣기
 *    (코드를 고친 뒤에는 배포 관리 → 수정 → 버전: 새 버전 으로 다시 배포해야 반영됩니다)
 */

const ADMIN_KEY = 'change-me-1234';   // 통계 페이지(admin.html) 비밀번호
// 저장할 스프레드시트 ID — 시트 주소 https://docs.google.com/spreadsheets/d/【이 부분】/edit
// 시트의 확장 프로그램 → Apps Script 로 만든 스크립트라면 비워둬도 됩니다.
const SPREADSHEET_ID = '';
const SHEET = '응답';
const STATS = '통계';
const GUESTBOOK = '방명록';

/**
 * 방명록 시트 스키마 (1행 = 머리글)
 *  A id        글 고유 ID (UUID)
 *  B 작성시각   서버 기준 작성 시각
 *  C 이름       표시용 이름 (최대 20자)
 *  D 이름키     중복 판별용: 공백 제거 + 소문자 (예: "김 민수" → "김민수")
 *  E 내용       최대 500자
 *  F 비밀번호해시 SHA-256(salt + 비밀번호) — 원문은 저장하지 않음
 *  G salt      글마다 다른 무작위 값
 *  H 기기ID     브라우저에 저장된 무작위 ID (같은 기기 중복 작성 차단용)
 *  I 상태       게시 | 삭제   (삭제는 행을 지우지 않고 상태만 바꿈)
 *  J 삭제시각
 *
 * 중복 방지: '게시' 상태인 글 중 이름키 또는 기기ID가 같은 글이 있으면 작성 거부.
 *           본인이 글을 삭제하면 다시 작성할 수 있습니다.
 * 관리자가 글을 숨기려면 시트에서 I열을 '삭제'로 바꾸면 됩니다.
 */
const GB_HEAD = ['id', '작성시각', '이름', '이름키', '내용', '비밀번호해시', 'salt', '기기ID', '상태', '삭제시각'];
const GB = { id: 0, time: 1, name: 2, key: 3, content: 4, hash: 5, salt: 6, device: 7, status: 8, deletedAt: 9 };
const GB_PAGE = 5;

function book() {
  const ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActive();
  if (!ss) throw new Error('스프레드시트를 찾을 수 없습니다. SPREADSHEET_ID 를 입력해주세요.');
  return ss;
}

function setup() {
  const ss = book();
  let sh = ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
  sh.getRange(1, 1, 1, 7).setValues([['응답시각', '구분', '성함', '참석여부', '인원', '메시지', '기기']])
    .setFontWeight('bold').setBackground('#f3e6e3');
  sh.setFrozenRows(1);

  let st = ss.getSheetByName(STATS) || ss.insertSheet(STATS);
  st.clear();
  const R = `'${SHEET}'!`;
  st.getRange('A1:D1').setValues([['구분', '참석 응답(건)', '참석 인원(명)', '불참(건)']]).setFontWeight('bold').setBackground('#f3e6e3');
  [['신랑측', 2], ['신부측', 3]].forEach(([side, row]) => {
    st.getRange(row, 1, 1, 4).setFormulas([[
      `="${side}"`,
      `=COUNTIFS(${R}B:B,"${side}",${R}D:D,"참석")`,
      `=SUMIFS(${R}E:E,${R}B:B,"${side}",${R}D:D,"참석")`,
      `=COUNTIFS(${R}B:B,"${side}",${R}D:D,"불참")`
    ]]);
  });
  st.getRange(4, 1, 1, 4).setFormulas([['="합계"', '=SUM(B2:B3)', '=SUM(C2:C3)', '=SUM(D2:D3)']]).setFontWeight('bold');
  st.getRange('A6').setValue('※ 같은 이름으로 여러 번 응답하면 모두 집계됩니다. 응답 시트에서 중복 행을 지워주세요.');
  st.autoResizeColumns(1, 4);

  let gb = ss.getSheetByName(GUESTBOOK) || ss.insertSheet(GUESTBOOK);
  gb.getRange(1, 1, 1, GB_HEAD.length).setValues([GB_HEAD]).setFontWeight('bold').setBackground('#f3e6e3');
  gb.setFrozenRows(1);
  gb.getRange('A:A').setNumberFormat('@');
  gb.getRange('D:D').setNumberFormat('@');
  gb.hideColumns(GB.hash + 1, 2); // 해시·salt 열 숨김
  gb.getRange(2, GB.status + 1, gb.getMaxRows() - 1, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(['게시', '삭제'], true).build());
}

/** 청첩장에서 응답 저장 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents || '{}');
    if (d.type === 'guestbook.create') return json(gbCreate(d));
    if (d.type === 'guestbook.delete') return json(gbDelete(d));
    const side = d.side === '신부측' ? '신부측' : '신랑측';
    const attend = d.attend === '불참' ? '불참' : '참석';
    const count = attend === '참석' ? Math.max(1, Math.min(10, parseInt(d.count, 10) || 1)) : 0;
    book().getSheetByName(SHEET).appendRow([
      new Date(), side, clean(d.name, 20), attend, count, clean(d.message, 200), clean(d.ua, 120)
    ]);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** 통계 조회: …/exec?key=비밀번호 */
function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'guestbook') return json(gbList(parseInt(e.parameter.page, 10) || 1));
  if (!e || !e.parameter || e.parameter.key !== ADMIN_KEY) return json({ ok: false, error: 'unauthorized' });
  const rows = book().getSheetByName(SHEET).getDataRange().getValues().slice(1);
  const stat = { 신랑측: { yes: 0, people: 0, no: 0 }, 신부측: { yes: 0, people: 0, no: 0 } };
  const list = rows.map(r => {
    const s = stat[r[1]] || stat['신랑측'];
    if (r[3] === '참석') { s.yes++; s.people += Number(r[4]) || 0; } else s.no++;
    return { time: r[0], side: r[1], name: r[2], attend: r[3], count: r[4], message: r[5] };
  });
  return json({ ok: true, stat, list: list.reverse() });
}

/* ---------- 방명록 ---------- */
const clean = (v, n) => String(v == null ? '' : v).replace(/^[=+\-@]/, "'$&").slice(0, n);
const nameKey = s => String(s).replace(/\s+/g, '').toLowerCase();
const sha256 = s => Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8)
  .map(b => ((b + 256) % 256).toString(16).padStart(2, '0')).join('');

function gbSheet() { return book().getSheetByName(GUESTBOOK); }
function gbRows(sh) {
  const n = sh.getLastRow() - 1;
  return n > 0 ? sh.getRange(2, 1, n, GB_HEAD.length).getValues() : [];
}

/** 목록: …/exec?action=guestbook&page=1  (최신순, 5개씩) */
function gbList(page) {
  const live = gbRows(gbSheet()).filter(r => r[GB.status] === '게시').reverse();
  const pages = Math.max(1, Math.ceil(live.length / GB_PAGE));
  page = Math.min(Math.max(1, page), pages);
  const items = live.slice((page - 1) * GB_PAGE, page * GB_PAGE).map(r => ({
    id: r[GB.id], name: r[GB.name], content: r[GB.content],
    time: r[GB.time] instanceof Date ? r[GB.time].toISOString() : r[GB.time]
  }));
  return { ok: true, page, pages, total: live.length, items };
}

function gbCreate(d) {
  const name = String(d.name || '').trim().slice(0, 20);
  const content = String(d.content || '').trim().slice(0, 500);
  const password = String(d.password || '');
  const device = String(d.device || '').slice(0, 64);
  if (!name || !content) return { ok: false, error: 'required', message: '이름과 내용을 입력해주세요.' };
  if (password.length < 4 || password.length > 20) return { ok: false, error: 'password', message: '비밀번호는 4~20자로 입력해주세요.' };

  const sh = gbSheet(), key = nameKey(name);
  const dup = gbRows(sh).some(r => r[GB.status] === '게시' && (r[GB.key] === key || (device && r[GB.device] === device)));
  if (dup) return { ok: false, error: 'duplicate', message: '이미 작성하신 방명록이 있어요. 기존 글을 삭제한 뒤 다시 작성해주세요.' };

  const salt = Utilities.getUuid();
  sh.appendRow([Utilities.getUuid(), new Date(), clean(name, 20), key, clean(content, 500),
    sha256(salt + password), salt, device, '게시', '']);
  return { ok: true };
}

function gbDelete(d) {
  const sh = gbSheet(), rows = gbRows(sh);
  const i = rows.findIndex(r => r[GB.id] === d.id && r[GB.status] === '게시');
  if (i < 0) return { ok: false, error: 'notfound', message: '이미 삭제되었거나 없는 글이에요.' };
  if (sha256(rows[i][GB.salt] + String(d.password || '')) !== rows[i][GB.hash])
    return { ok: false, error: 'password', message: '비밀번호가 일치하지 않아요.' };
  sh.getRange(i + 2, GB.status + 1, 1, 2).setValues([['삭제', new Date()]]);
  return { ok: true };
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
