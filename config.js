/* =========================================================
 *  청첩장 설정 파일 — 내용 수정은 이 파일만 고치면 됩니다.
 *  "TODO" 표시가 있는 항목은 실제 정보로 바꿔주세요.
 * ========================================================= */
window.WEDDING = {
  groom: { name: '김한용', father: '', mother: '', order: '아들' }, // TODO: 혼주 성함 (비우면 생략)
  bride: { name: '배지영', father: '', mother: '', order: '딸' },   // TODO: 혼주 성함

  // 예식 일시 (24시간제)
  date: { year: 2027, month: 2, day: 20, hour: 12, minute: 30 },

  venue: {
    name: '더루체웨딩홀',
    hall: '5층 헤리티지홀',
    address: '경기 안산시 단원구 중앙대로 829',
    tel: '',
    mapQuery: '안산 더루체웨딩홀',
    transport: [
      { title: '지하철', body: '4호선 · 수인분당선 고잔역 1번 출구 바로 앞 (도보 약 1분)' },
      { title: '버스', body: '고잔역 인근 정류장 하차 후 도보 이동\n노선은 위 지도 앱의 길찾기를 이용해주세요.' },
      { title: '자가용', body: '내비게이션에 "더루체웨딩홀" 또는 "중앙대로 829" 입력' },
      { title: '주차', body: '건물 내 주차장 이용 · 하객 2시간 30분 무료\n(이후 30분당 600원)' }
    ]
  },

  // 카카오톡·문자 공유 시 사용할 주소
  shareUrl: 'https://soboo.github.io/marry/',

  // 인사말 — 원본 청첩장 문구로 교체하세요
  greeting: [
    '서로 다른 길을 걸어온 두 사람이',
    '이제 같은 길을 함께 걸어가려 합니다.',
    '',
    '저희의 새로운 시작을 축복해 주시면',
    '더없는 기쁨으로 간직하겠습니다.'
  ],

  // 갤러리 사진 수 (images/gallery/01.jpg ~ NN.jpg)
  galleryCount: 19,

  // 마음 전하실 곳 — 나중에 수정
  accounts: {
    groom: [
      { role: '신랑', name: '김한용', bank: '은행명', number: '000-0000-0000-00' },
      { role: '신랑 아버지', name: '', bank: '', number: '' },
      { role: '신랑 어머니', name: '', bank: '', number: '' }
    ],
    bride: [
      { role: '신부', name: '배지영', bank: '은행명', number: '000-0000-0000-00' },
      { role: '신부 아버지', name: '', bank: '', number: '' },
      { role: '신부 어머니', name: '', bank: '', number: '' }
    ]
  },

  // 참석 여부 응답을 받을 Google Apps Script 웹앱 URL (README 참고)
  rsvpEndpoint: '', // 예: 'https://script.google.com/macros/s/XXXX/exec'

  // 배경 꽃잎 효과
  petals: true
};
