/* =========================================================
 *  청첩장 설정 파일 — 내용 수정은 이 파일만 고치면 됩니다.
 *  "TODO" 표시가 있는 항목은 실제 정보로 바꿔주세요.
 * ========================================================= */
window.WEDDING = {
  groom: { name: '김한용', nameEn: 'Kim Hanyong', father: '김기주', mother: '정성분', order: '장남' }, // 혼주 성함 (비우면 생략)
  bride: { name: '배지영', nameEn: 'Bae Jiyeong', father: '배정길', mother: '김현진', order: '장녀' },

  // 예식 일시 (24시간제)
  date: { year: 2027, month: 2, day: 20, hour: 12, minute: 30 },

  venue: {
    name: '더루체웨딩홀',
    nameEn: 'The Luce, Ansan', // 커버 사진 위 영문 표기
    hall: '5층 헤리티지홀',
    address: '경기 안산시 단원구 중앙대로 829',
    tel: '',
    mapQuery: '안산 더루체웨딩홀',
    kakaoPlaceId: '26801913', // 카카오맵 장소 ID (place.map.kakao.com/【이 숫자】)
    transport: [
      { title: '지하철', body: '4호선 · 수인분당선 고잔역 1번 출구, 도보 약 10분' },
      { title: '버스', body: '고잔역 인근 정류장 하차 후 도보 이동\n노선은 위 지도 앱의 길찾기를 이용해주세요.' },
      { title: '자가용', body: '내비게이션에 "더루체웨딩홀" 또는 "중앙대로 829" 입력' },
      { title: '주차', body: '건물 내 주차장 이용 또는 주변 공영주차장 이용\n주차요원의 안내에 따라서 주차 부탁드립니다.\n(하객 2시간 30분 무료, 이후 30분당 600원)' }
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
  galleryCount: 20,

  // 마음 전하실 곳 — 나중에 수정
  accounts: {
    groom: [
      { role: '신랑', name: '김한용', bank: '우리은행', number: '1002-561-589062' },
      { role: '신랑 아버지', name: '김기주', bank: '농협', number: '006-12-224330' },
      { role: '신랑 어머니', name: '정성분', bank: '농협', number: '006-12-144301' }
    ],
    bride: [
      { role: '신부', name: '배지영', bank: '우리은행', number: '1002-466-437760' },
      { role: '신부 아버지', name: '배정길', bank: '기업은행', number: '287-278784-01-017' },
      { role: '신부 어머니', name: '김현진', bank: '국민은행', number: '781601-00-048872' }
    ]
  },

  // 참석 여부·방명록을 받을 Google Apps Script 웹앱 URL (README 참고)
  // 비워두면 방명록은 화면 확인용으로만 동작합니다 (새로고침 시 사라짐).
  rsvpEndpoint: 'https://script.google.com/macros/s/AKfycbxWxB_DKdAjEmDLPQaLxeyIr5l6Vf20yEct5F2C3oT5vyvL-Xf_uDHktEQSDiGW2VXd/exec', // 예: 'https://script.google.com/macros/s/XXXX/exec'

  // 배경음악 — music 폴더에 넣은 파일 경로 (비우면 음악 버튼이 사라집니다)
  bgm: 'music/test.mp3',
  bgmVolume: 0.2, // 배경음악 볼륨 (0 ~ 1)
  bgmStart: 3,     // 음원 시작 위치 (초) — 앞부분을 건너뜁니다

  // 배경 꽃잎 효과
  petals: true
};
