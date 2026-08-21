/* 실시간 엔-원 환율.
 *
 * 빌드 과정이 없는 정적 사이트라 브라우저에서 직접 받아온다.
 * open.er-api.com 은 키가 필요 없고 CORS 가 열려 있다.
 *
 * 환율만 갱신하고 원화 금액을 그대로 두면 페이지 안에서 숫자가 어긋나므로,
 * 엔화에서 환산된 값은 전부 data-jpy 로 표시해 두고 함께 다시 계산한다.
 *   data-jpy        이 요소가 나타내는 엔화 금액
 *   data-krw-base   엔화와 무관한 고정 원화(항공권·숙소)를 더할 때 쓴다
 *   data-krw-round  '약 65만원' 처럼 만원 단위로 굴려 보여준다(히어로 요약용)
 *
 * 못 받아오면 HTML 에 박아둔 기준 환율(890원)을 그대로 둔다. 숫자가
 * 사라지는 것보다 조금 낡은 값이 낫다.
 */
(function () {
  var API = 'https://open.er-api.com/v6/latest/JPY';
  var won = function (n) { return Math.round(n).toLocaleString('ko-KR') + '원'; };
  var man = function (n) { return '약 ' + Math.round(n / 10000) + '만원'; };

  function paint(rate, when) {
    document.querySelectorAll('[data-jpy]').forEach(function (el) {
      var base = Number(el.getAttribute('data-krw-base') || 0);
      var krw = base + Number(el.getAttribute('data-jpy')) * rate;
      el.textContent = el.hasAttribute('data-krw-round') ? man(krw) : won(krw);
    });
    document.querySelectorAll('[data-fx-rate]').forEach(function (el) {
      /* 반올림해 보여주면 표의 환산값을 독자가 되짚어 계산할 때 어긋난다.
         계산에 쓰는 정밀도 그대로 소수점 두 자리까지 보여준다. */
      el.textContent = '100엔 = ' + (rate * 100).toLocaleString('ko-KR',
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '원';
    });
    document.querySelectorAll('[data-fx-note]').forEach(function (el) {
      el.textContent = when;
    });
  }

  fetch(API, { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (j) {
      var rate = j && j.rates && j.rates.KRW;
      if (!rate) throw new Error('KRW 없음');
      var d = new Date((j.time_last_update_unix || 0) * 1000);
      var when = isNaN(d.getTime()) ? '실시간'
               : (d.getMonth() + 1) + '월 ' + d.getDate() + '일 기준 · 실시간';
      paint(rate, when);
    })
    .catch(function () {
      document.querySelectorAll('[data-fx-note]').forEach(function (el) {
        el.textContent = '실시간 조회 실패 · 아래는 기준 환율';
      });
    });
})();
