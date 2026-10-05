(() => {
  const C = window.WEDDING;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const DOW = ['일', '월', '화', '수', '목', '금', '토'];
  const pad = n => String(n).padStart(2, '0');

  /* ---------- 기본 정보 바인딩 ---------- */
  const { year, month, day, hour, minute } = C.date;
  const wedding = new Date(year, month - 1, day, hour, minute);
  const ampm = hour < 12 ? '오전' : '오후';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  const timeText = `${ampm} ${h12}시${minute ? ` ${minute}분` : ''}`;
  const binds = {
    groom: C.groom.name,
    bride: C.bride.name,
    dateLong: `${year}년 ${month}월 ${day}일 ${DOW[wedding.getDay()]}요일 ${timeText}`,
    dateShort: `${year}. ${pad(month)}. ${pad(day)}`,
    venueLine: `${C.venue.name} ${C.venue.hall}`.trim(),
    venueName: `${C.venue.name} ${C.venue.hall}`.trim(),
    address: C.venue.address
  };
  $$('[data-bind]').forEach(el => (el.textContent = binds[el.dataset.bind] ?? ''));

  /* ---------- 인사말 & 혼주 ---------- */
  $('#greetingText').innerHTML = C.greeting.map(l => `<p>${esc(l)}</p>`).join('');
  const parentRow = (p, label) => {
    const names = [p.father, p.mother].filter(Boolean).map(esc).join(' · ');
    return `<div class="row">${names ? `${names}<small>의 ${p.order}</small>` : `<small>${label}</small>`}<b>${esc(p.name)}</b></div>`;
  };
  $('#parents').innerHTML = parentRow(C.groom, '신랑') + parentRow(C.bride, '신부');

  /* ---------- 달력 ---------- */
  (() => {
    const first = new Date(year, month - 1, 1).getDay();
    const last = new Date(year, month, 0).getDate();
    let html = DOW.map((d, i) => `<span class="dow ${i === 0 ? 'sun' : ''}">${d}</span>`).join('');
    for (let i = 0; i < first; i++) html += '<span></span>';
    for (let d = 1; d <= last; d++) {
      const w = (first + d - 1) % 7;
      html += `<span class="${d === day ? 'on' : w === 0 ? 'sun' : ''}">${d}</span>`;
    }
    $('#calendar').innerHTML = html;
  })();

  /* ---------- 카운트다운 ---------- */
  const cd = Object.fromEntries($$('[data-cd]').map(el => [el.dataset.cd, el]));
  const tick = () => {
    const diff = wedding - new Date();
    const t = Math.max(0, diff);
    cd.d.textContent = Math.floor(t / 864e5);
    cd.h.textContent = pad(Math.floor(t / 36e5) % 24);
    cd.m.textContent = pad(Math.floor(t / 6e4) % 60);
    cd.s.textContent = pad(Math.floor(t / 1e3) % 60);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const wd = new Date(year, month - 1, day);
    const dd = Math.round((wd - today) / 864e5);
    $('#ddayText').innerHTML =
      dd > 0 ? `${esc(C.groom.name)} ♥ ${esc(C.bride.name)}의 결혼식이 <em>${dd}일</em> 남았습니다.`
      : dd === 0 ? '<em>오늘</em> 저희 결혼합니다!'
      : '저희의 결혼을 축하해주셔서 감사합니다.';
  };
  tick(); setInterval(tick, 1000);

  /* ---------- 갤러리 + 라이트박스 ---------- */
  const N = C.galleryCount;
  const SHOW = 9;
  const grid = $('#gallery');
  const src = i => `images/gallery/${pad(i)}.jpg`;
  const thumb = i => `images/thumb/${pad(i)}.jpg`;
  grid.innerHTML = Array.from({ length: N }, (_, k) =>
    `<button class="${k >= SHOW ? 'hide' : ''}" data-i="${k}" aria-label="사진 ${k + 1} 크게 보기">
       <img src="${thumb(k + 1)}" alt="" loading="lazy" decoding="async"></button>`).join('');
  $$('img', grid).forEach(img => {
    if (img.complete) img.classList.add('loaded');
    else img.addEventListener('load', () => img.classList.add('loaded'));
  });
  const more = $('#moreBtn');
  if (N <= SHOW) more.remove();
  more?.addEventListener('click', () => {
    $$('.hide', grid).forEach((b, k) => { b.classList.remove('hide'); b.classList.add('pop'); b.style.animationDelay = `${k * 40}ms`; });
    more.remove();
  });

  const lb = $('#lightbox'), track = $('#lbTrack'), count = $('#lbCount');
  track.innerHTML = Array.from({ length: N }, (_, k) => `<figure><img data-src="${src(k + 1)}" alt="사진 ${k + 1}"></figure>`).join('');
  let cur = 0;
  const load = i => { const im = track.children[i]?.querySelector('img'); if (im && !im.src) im.src = im.dataset.src; };
  const go = (i, anim = true) => {
    cur = (i + N) % N;
    [cur - 1, cur, cur + 1].forEach(j => load((j + N) % N));
    track.style.transition = anim ? '' : 'none';
    track.style.transform = `translateX(${-cur * 100}%)`;
    count.textContent = `${cur + 1} / ${N}`;
  };
  const openLb = i => { lb.hidden = false; document.body.style.overflow = 'hidden'; go(i, false); };
  const closeLb = () => { lb.hidden = true; document.body.style.overflow = ''; };
  grid.addEventListener('click', e => { const b = e.target.closest('button'); if (b) openLb(+b.dataset.i); });
  $('.lb-close', lb).onclick = closeLb;
  $('.lb-nav.prev', lb).onclick = () => go(cur - 1);
  $('.lb-nav.next', lb).onclick = () => go(cur + 1);
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') go(cur - 1);
    if (e.key === 'ArrowRight') go(cur + 1);
  });
  // 스와이프
  let sx = 0, sy = 0, dx = 0, drag = false;
  lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; dx = 0; drag = true; track.style.transition = 'none'; }, { passive: true });
  lb.addEventListener('touchmove', e => {
    if (!drag) return;
    dx = e.touches[0].clientX - sx;
    if (Math.abs(e.touches[0].clientY - sy) > Math.abs(dx)) return;
    track.style.transform = `translateX(calc(${-cur * 100}% + ${dx}px))`;
  }, { passive: true });
  lb.addEventListener('touchend', () => {
    drag = false;
    if (dx > 50) go(cur - 1); else if (dx < -50) go(cur + 1); else go(cur);
  });

  /* ---------- 지도 / 교통 ---------- */
  const q = encodeURIComponent(C.venue.mapQuery || C.venue.name);
  $('#naverMap').href = `https://map.naver.com/p/search/${q}`;
  $('#kakaoMap').href = `https://map.kakao.com/link/search/${q}`;
  $('#tmap').href = `tmap://search?name=${q}`; // 티맵 앱이 설치된 휴대폰에서 열립니다
  $('#transport').innerHTML = C.venue.transport.map(t => `<div><dt>${esc(t.title)}</dt><dd>${esc(t.body)}</dd></div>`).join('');

  /* ---------- 계좌 ---------- */
  const accBlock = (el, title, list) => {
    const items = list.filter(a => a.number);
    if (!items.length) { el.remove(); return; }
    el.innerHTML = `<button class="acc-head" aria-expanded="false">${title}</button>
      <div class="acc-body"><div>${items.map(a => `
        <div class="acc-item"><p><small>${esc(a.role)} ${esc(a.name)}</small>${esc(a.bank)} ${esc(a.number)}</p>
        <button data-copy="${esc(`${a.bank} ${a.number}`)}">복사</button></div>`).join('')}</div></div>`;
    $('.acc-head', el).onclick = () => {
      const open = el.classList.toggle('open');
      $('.acc-head', el).setAttribute('aria-expanded', open);
    };
  };
  accBlock($('#accGroom'), '신랑측 계좌번호', C.accounts.groom);
  accBlock($('#accBride'), '신부측 계좌번호', C.accounts.bride);

  /* ---------- 복사 / 공유 / 토스트 ---------- */
  const toast = (msg) => {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2000);
  };
  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }
    toast('복사되었습니다');
  };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-copy],[data-copy-bind]');
    if (b) copy(b.dataset.copy ?? binds[b.dataset.copyBind]);
  });
  $('#shareBtn').onclick = async () => {
    const data = { title: document.title, text: binds.dateLong, url: location.href };
    if (navigator.share) { try { await navigator.share(data); } catch {} }
    else copy(location.href);
  };

  /* ---------- 스크롤 등장 효과 ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- 참석 여부 (RSVP) ---------- */
  const modal = $('#rsvpModal'), form = $('#rsvpForm'), err = $('#formError');
  const countField = $('#countField'), countInput = form.count;
  const openModal = () => { modal.hidden = false; document.body.style.overflow = 'hidden'; };
  const closeModal = () => { modal.hidden = true; document.body.style.overflow = ''; err.textContent = ''; };
  $('#rsvpOpen').onclick = openModal;
  $('.sheet-close', modal).onclick = closeModal;
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  form.addEventListener('change', () => countField.classList.toggle('off', form.attend.value === '불참'));
  $$('[data-step]', form).forEach(b => b.onclick = () => {
    countInput.value = Math.min(10, Math.max(1, (+countInput.value || 1) + +b.dataset.step));
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    err.textContent = '';
    const name = form.name.value.trim();
    if (!form.side.value) return (err.textContent = '신랑측 / 신부측을 선택해주세요.');
    if (!name) return (err.textContent = '성함을 입력해주세요.');
    const attend = form.attend.value;
    const payload = {
      side: form.side.value,
      name,
      attend,
      count: attend === '참석' ? Math.min(10, Math.max(1, +countInput.value || 1)) : 0,
      message: form.message.value.trim(),
      ua: navigator.userAgent.slice(0, 120)
    };
    const btn = $('#rsvpSubmit');
    btn.disabled = true; btn.textContent = '전달 중...';
    try {
      if (!C.rsvpEndpoint) {
        console.warn('[RSVP] config.js의 rsvpEndpoint가 비어 있어 전송하지 않았습니다.', payload);
        await new Promise(r => setTimeout(r, 500));
      } else {
        // text/plain 으로 보내면 CORS preflight 없이 Apps Script로 전달됩니다.
        await fetch(C.rsvpEndpoint, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
      }
      try { localStorage.setItem('rsvp-done', '1'); } catch {}
      form.reset(); countField.classList.remove('off');
      closeModal();
      toast(attend === '참석' ? '참석 의사가 전달되었습니다. 감사합니다!' : '마음 전해주셔서 감사합니다.');
    } catch (ex) {
      err.textContent = '전송에 실패했어요. 잠시 후 다시 시도해주세요.';
    } finally {
      btn.disabled = false; btn.textContent = '전달하기';
    }
  });

  /* ---------- 꽃잎 효과 ---------- */
  if (C.petals && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const cv = $('#petals'), ctx = cv.getContext('2d');
    let W, H, dpr;
    const resize = () => { dpr = Math.min(2, devicePixelRatio || 1); W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr; };
    resize(); addEventListener('resize', resize);
    const P = Array.from({ length: innerWidth < 600 ? 14 : 22 }, () => mk(true));
    function mk(init) {
      return { x: Math.random() * W, y: init ? Math.random() * H : -20 * dpr, r: (4 + Math.random() * 5) * dpr,
        vy: (0.35 + Math.random() * 0.6) * dpr, vx: (Math.random() - 0.3) * 0.5 * dpr,
        a: Math.random() * 6.28, va: (Math.random() - 0.5) * 0.03, sw: Math.random() * 6.28, o: 0.35 + Math.random() * 0.4 };
    }
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of P) {
        p.sw += 0.012; p.y += p.vy; p.x += p.vx + Math.sin(p.sw) * 0.4 * dpr; p.a += p.va;
        if (p.y > H + 20 * dpr) Object.assign(p, mk(false));
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.globalAlpha = p.o;
        ctx.fillStyle = '#f0c9c2';
        ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.62, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      if (!document.hidden) requestAnimationFrame(draw);
    };
    document.addEventListener('visibilitychange', () => { if (!document.hidden) requestAnimationFrame(draw); });
    requestAnimationFrame(draw);
  }

  function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
})();
