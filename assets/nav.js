/* 大阪・京都 3泊4日 — 공통 스크립트
   1) 햄버거 메뉴 토글  2) 현재 페이지 표시  3) 스크롤 진입 페이드업
   JS가 실행되지 않아도 콘텐츠는 전부 그대로 보인다. */
(function () {
  'use strict';

  var doc = document.documentElement;

  /* ---------- 1. 햄버거 메뉴 ---------- */
  var btn = document.querySelector('.menu-btn');
  var menu = document.getElementById('sitemenu');

  if (btn && menu) {
    doc.classList.add('js-menu');   // CSS 트랜지션 활성화
    menu.hidden = false;            // 이후 표시는 .open 클래스로 제어

    var open = function () {
      menu.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', '메뉴 닫기');
      document.body.classList.add('menu-open');
    };

    var close = function () {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', '메뉴 열기');
      document.body.classList.remove('menu-open');
    };

    btn.addEventListener('click', function () {
      if (menu.classList.contains('open')) { close(); } else { open(); }
    });

    // Esc 로 닫기
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        close();
        btn.focus();
      }
    });

    // 메뉴 안 링크를 누르면 닫기 (같은 페이지 앵커 이동 대응)
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) close();
    });

    // 데스크톱으로 넓어지면 상태 초기화
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1200 && menu.classList.contains('open')) close();
    });
  }

  /* ---------- 2. 현재 페이지 표시 ---------- */
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.menu a[href]').forEach(function (a) {
    var target = a.getAttribute('href').split('/').pop().split('#')[0] || 'index.html';
    if (target === here) a.setAttribute('aria-current', 'page');
  });

  /* ---------- 3. 스크롤 진입 페이드업 ----------
     첫 화면 안에 이미 들어와 있는 요소는 건드리지 않는다. 숨겼다가
     되살리는 대상은 스크롤해야 닿는 요소뿐이라, 애니메이션이 돌지
     않더라도 사용자가 빈 화면을 보는 경우가 없다. */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, i) {
      if (!entry.isIntersecting) return;
      entry.target.style.animationDelay = (i * 60) + 'ms';
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });

  var fold = window.innerHeight * 0.9;
  document.querySelectorAll('.reveal').forEach(function (el) {
    if (el.getBoundingClientRect().top <= fold) return;  // 첫 화면 안 — 그대로 노출
    el.classList.add('pre');
    io.observe(el);
  });
})();
