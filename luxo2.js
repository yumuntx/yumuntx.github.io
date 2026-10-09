/* =========================================================
   豪华化 2：每页换花饰 / 撒金图标 / 边框流光 / 斜光 / 标题金线 / 点击涟漪
   ========================================================= */
(function () {
  'use strict';

  var semMov = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1 · 每页换一款标题花饰（3 款轮着来） ---------- */
  var FLORES = ['assets/orn-b.png', 'assets/orn-c.png', 'assets/orn-d.png'];
  var paginas = document.querySelectorAll('.pagina');
  Array.prototype.forEach.call(paginas, function (p, i) {
    var orn = p.querySelector('.ornamento');
    if (orn) {
      orn.style.backgroundImage = 'url("' + FLORES[i % FLORES.length] + '")';
      orn.style.aspectRatio = i % FLORES.length === 2 ? '1500/366' : '1500/228';
      orn.style.width = i % FLORES.length === 2 ? 'clamp(190px,24vw,320px)' : 'clamp(170px,21vw,290px)';
    }
  });

  /* ---------- 2 · 每页撒 1~2 个金色小图标 ---------- */
  var ICONES = ['ico-estrela', 'ico-coracao', 'ico-presente', 'ico-bolo', 'ico-balao', 'ico-nota'];
  var POS = [
    ['right:9%;top:16%;width:clamp(20px,2.4vw,34px)', -12],
    ['left:8%;bottom:20%;width:clamp(18px,2.2vw,30px)', 10],
    ['right:11%;bottom:24%;width:clamp(22px,2.6vw,38px)', 6],
    ['left:10%;top:17%;width:clamp(18px,2.2vw,30px)', -8],
    ['right:8%;bottom:19%;width:clamp(20px,2.4vw,34px)', 14],
    ['left:9%;top:19%;width:clamp(22px,2.6vw,36px)', -14]
  ];
  Array.prototype.forEach.call(paginas, function (p, i) {
    var folha = p.querySelector('.folha');
    if (!folha) { return; }
    var n = (i % 3 === 0) ? 2 : 1;
    for (var k = 0; k < n; k++) {
      var idx = (i * 2 + k) % ICONES.length;
      var pos = POS[(i + k) % POS.length];
      var el = document.createElement('i');
      el.className = 'icone-ouro';
      el.setAttribute('aria-hidden', 'true');
      el.style.cssText = pos[0];
      el.style.backgroundImage = 'url("assets/' + ICONES[idx] + '.png")';
      el.style.setProperty('--rot', pos[1] + 'deg');
      el.style.transform = 'rotate(' + pos[1] + 'deg)';
      el.style.animationDelay = ((i + k) * 0.6).toFixed(2) + 's';
      el.style.aspectRatio = '1 / 1';
      folha.appendChild(el);
    }
  });

  /* ---------- 3 · 边框流光 + 第二道斜光 + 标题金线 ---------- */
  Array.prototype.forEach.call(paginas, function (p) {
    var folha = p.querySelector('.folha');
    if (!folha) { return; }
    if (!folha.querySelector('.brilho-borda')) {
      var b = document.createElement('i');
      b.className = 'brilho-borda';
      b.setAttribute('aria-hidden', 'true');
      folha.appendChild(b);
    }
    if (!folha.querySelector('.sheen')) {
      var s = document.createElement('i');
      s.className = 'sheen';
      s.setAttribute('aria-hidden', 'true');
      folha.appendChild(s);
    }
    var tit = folha.querySelector('.titulo');
    if (tit && !tit.nextElementSibling) {
      var l = document.createElement('span');
      l.className = 'titulo-linha';
      l.setAttribute('aria-hidden', 'true');
      tit.parentNode.insertBefore(l, tit.nextSibling);
    }
  });

  /* ---------- 4 · 点哪儿都荡开一圈金光 ---------- */
  if (!semMov) {
    var ultimo = 0;
    window.addEventListener('pointerdown', function (e) {
      if (e.target && e.target.closest && e.target.closest('.portao,.passagem')) { return; }
      var agora = Date.now();
      if (agora - ultimo < 120) { return; }
      ultimo = agora;
      var o = document.createElement('i');
      o.className = 'onda';
      o.style.left = e.clientX + 'px';
      o.style.top = e.clientY + 'px';
      document.body.appendChild(o);
      window.setTimeout(function () { if (o.parentNode) { o.parentNode.removeChild(o); } }, 800);
    }, true);
  }

  /* ---------- 5 · 翻页时，新页的金线重新画一次 ---------- */
  Array.prototype.forEach.call(paginas, function (p) {
    var tit = p.querySelector('.titulo');
    if (!tit || !window.MutationObserver) { return; }
    var obs = new MutationObserver(function () {
      if (!p.classList.contains('ativa')) { return; }
      var l = tit.nextElementSibling;
      if (l && l.classList && l.classList.contains('titulo-linha')) {
        l.style.animation = 'none';
        void l.offsetWidth;
        l.style.animation = '';
      }
    });
    obs.observe(p, { attributes: true, attributeFilter: ['class'] });
  });
})();
