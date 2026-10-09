/* =========================================================
   标题描金书写 + 金色光效贴图
   ========================================================= */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var semMov = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 0 · 全文档共用的金色描边渐变 ---------- */
  function garanteGradiente() {
    if (document.getElementById('tinta-ouro-defs')) { return; }
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('id', 'tinta-ouro-defs');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.position = 'absolute';
    svg.innerHTML =
      '<defs><linearGradient id="tinta-ouro" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="#8a6320"/>' +
      '<stop offset="26%" stop-color="#e8c476"/>' +
      '<stop offset="48%" stop-color="#fff8e2"/>' +
      '<stop offset="70%" stop-color="#cda45f"/>' +
      '<stop offset="100%" stop-color="#96690f"/>' +
      '</linearGradient></defs>';
    document.body.appendChild(svg);
  }

  /* ---------- 1 · 给每个标题加一层"会写字的描边" ---------- */
  var paginas = document.querySelectorAll('.pagina');

  function montaTraco(tit) {
    if (!tit || tit.querySelector('.titulo-svg')) { return; }
    var r = tit.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) { return; }
    var cs = window.getComputedStyle(tit);
    var texto = (tit.textContent || '').trim();
    if (!texto) { return; }

    var pad = 10;
    var w = Math.ceil(r.width) + pad * 2;
    var h = Math.ceil(r.height) + pad * 2;

    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'titulo-svg');
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    svg.setAttribute('aria-hidden', 'true');

    var t = document.createElementNS(NS, 'text');
    t.setAttribute('x', String(w / 2));
    t.setAttribute('y', String(h / 2));
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('dominant-baseline', 'central');
    t.setAttribute('font-family', cs.fontFamily);
    t.setAttribute('font-size', cs.fontSize);
    t.setAttribute('font-weight', cs.fontWeight || '400');
    if (cs.letterSpacing && cs.letterSpacing !== 'normal') {
      t.setAttribute('letter-spacing', cs.letterSpacing);
    }
    t.textContent = texto;
    svg.appendChild(t);

    /* 贴着标题自身定位（不要贴到整栏，否则会跑到中间） */
    tit.style.position = 'relative';
    tit.appendChild(svg);
    return svg;
  }

  function escreve(tit) {
    var svg = tit.querySelector ? tit.querySelector('.titulo-svg') : null;
    if (!svg) { svg = montaTraco(tit); }
    if (!svg || semMov) { return; }
    svg.classList.remove('escrevendo');
    void svg.getBoundingClientRect();
    svg.classList.add('escrevendo');
  }

  garanteGradiente();
  /* 等字体加载完再量尺寸，否则宽度不准 */
  function montaTodos() {
    Array.prototype.forEach.call(document.querySelectorAll('.titulo'), function (tit) {
      if (!tit.querySelector) { return; }
      if (tit.querySelector('.titulo-svg')) { return; }
      montaTraco(tit);
    });
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { window.setTimeout(montaTodos, 60); });
  }
  window.addEventListener('load', function () { window.setTimeout(montaTodos, 260); });

  /* 每次翻到某页，那个标题重新写一遍 */
  if (window.MutationObserver) {
    Array.prototype.forEach.call(paginas, function (p) {
      var obs = new MutationObserver(function () {
        if (!p.classList.contains('ativa')) { return; }
        var tit = p.querySelector('.titulo');
        if (tit) { window.setTimeout(function () { escreve(tit); }, 220); }
      });
      obs.observe(p, { attributes: true, attributeFilter: ['class'] });
    });
  }
  /* 首屏（第 1 页没有 .titulo，只有场景标题）也写一遍 */
  window.setTimeout(function () {
    var ativa = document.querySelector('.pagina.ativa .titulo');
    if (ativa) { escreve(ativa); }
  }, 900);

  /* ---------- 2 · 金色光效贴图 ---------- */
  var LUZES_CARTA = ['luz-estrela', 'luz-halo', 'luz-brilho'];
  var LUZES_CENA = ['luz-flare', 'luz-poeira', 'luz-estrela6'];

  Array.prototype.forEach.call(paginas, function (p, i) {
    var folha = p.querySelector('.folha');
    if (!folha || folha.querySelector('.luz-ouro')) { return; }
    var nome = LUZES_CARTA[i % LUZES_CARTA.length];
    var el = document.createElement('i');
    el.className = 'luz-ouro';
    el.setAttribute('aria-hidden', 'true');
    el.style.backgroundImage = 'url("assets/' + nome + '.png")';
    /* 散在四角附近，避开正文 */
    var pos = [
      'right:6%;top:6%;width:clamp(90px,13vw,190px);aspect-ratio:1',
      'left:4%;bottom:5%;width:clamp(80px,11vw,165px);aspect-ratio:1',
      'right:8%;bottom:8%;width:clamp(70px,9vw,140px);aspect-ratio:1',
      'left:6%;top:7%;width:clamp(80px,11vw,160px);aspect-ratio:1'
    ][i % 4];
    el.style.cssText = pos;
    el.style.setProperty('--rot', ((i * 37) % 40 - 20) + 'deg');
    el.style.animationDelay = (i * 0.5).toFixed(2) + 's';
    folha.appendChild(el);
  });

  /* 背景里再飘几张大的，让画面更"发光" */
  var cena = document.getElementById('container') || document.body;
  LUZES_CENA.forEach(function (nome, k) {
    if (document.querySelector('.luz-cena[data-' + k + ']')) { return; }
    var el = document.createElement('i');
    el.className = 'luz-cena';
    el.setAttribute('data-' + k, '1');
    el.setAttribute('aria-hidden', 'true');
    el.style.backgroundImage = 'url("assets/' + nome + '.png")';
    var pos = [
      'left:6%;top:12%;width:clamp(190px,26vw,420px)',
      'right:4%;top:44%;width:clamp(220px,30vw,470px)',
      'left:26%;bottom:4%;width:clamp(180px,24vw,380px)'
    ][k] || 'left:40%;top:30%;width:clamp(200px,26vw,400px)';
    el.style.cssText = pos;
    el.style.aspectRatio = '1';
    el.style.animationDelay = (k * 2.4).toFixed(2) + 's';
    cena.appendChild(el);
  });
})();
