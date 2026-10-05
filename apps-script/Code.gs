/**
 * 모바일 청첩장 참석 여부(RSVP) 수집용 Google Apps Script
 *
 * 1) 구글 스프레드시트 새로 만들기 → 확장 프로그램 → Apps Script
 * 2) 이 파일 내용을 붙여넣고 ADMIN_KEY 를 원하는 비밀번호로 바꾸기
 * 3) 함수 목록에서 setup 실행 (권한 승인)
 * 4) 배포 → 새 배포 → 유형: 웹 앱 / 실행: 나 / 액세스: 모든 사용자 → 배포
 * 5) 나온 웹 앱 URL(…/exec)을 config.js 의 rsvpEndpoint 에 넣기
 */

const ADMIN_KEY = 'change-me-1234';   // 통계 페이지(admin.html) 비밀번호
const SHEET = '응답';
const STATS = '통계';

function setup() {
  const ss = SpreadsheetApp.getActive();
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
}

/** 청첩장에서 응답 저장 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents || '{}');
    const clean = (v, n) => String(v == null ? '' : v).replace(/^[=+\-@]/, "'$&").slice(0, n);
    const side = d.side === '신부측' ? '신부측' : '신랑측';
    const attend = d.attend === '불참' ? '불참' : '참석';
    const count = attend === '참석' ? Math.max(1, Math.min(10, parseInt(d.count, 10) || 1)) : 0;
    SpreadsheetApp.getActive().getSheetByName(SHEET).appendRow([
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
  if (!e || !e.parameter || e.parameter.key !== ADMIN_KEY) return json({ ok: false, error: 'unauthorized' });
  const rows = SpreadsheetApp.getActive().getSheetByName(SHEET).getDataRange().getValues().slice(1);
  const stat = { 신랑측: { yes: 0, people: 0, no: 0 }, 신부측: { yes: 0, people: 0, no: 0 } };
  const list = rows.map(r => {
    const s = stat[r[1]] || stat['신랑측'];
    if (r[3] === '참석') { s.yes++; s.people += Number(r[4]) || 0; } else s.no++;
    return { time: r[0], side: r[1], name: r[2], attend: r[3], count: r[4], message: r[5] };
  });
  return json({ ok: true, stat, list: list.reverse() });
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
