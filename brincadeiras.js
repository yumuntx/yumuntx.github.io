/* =========================================================
   小花样：花瓣轨迹 / 双击爆彩 / 拖动朱印
   ========================================================= */
(function () {
  'use strict';

  function fx() { return window.FX; }
  function podar() {
    return !document.body.classList.contains('trancado') &&
           !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /* ---------- 1 · 鼠标划过留花瓣 ---------- */
  var ultimo = 0;
  window.addEventListener('pointermove', function (e) {
    if (!podar() || !fx()) { return; }
    var agora = Date.now();
    if (agora - ultimo < 70) { return; }
    ultimo = agora;
    if (FX.petalas) { FX.petalas(e.clientX + (Math.random() - .5) * 22, e.clientY + (Math.random() - .5) * 22, 1); }
  }, { passive: true });

  /* ---------- 2 · 双击任何地方：金爆 + 花瓣 ---------- */
  window.addEventListener('dblclick', function (e) {
    if (!podar() || !fx()) { return; }
    var x = e.clientX, y = e.clientY;
    if (FX.burst) { FX.burst(x, y, 22, true); }
    if (FX.petalas) { FX.petalas(x, y, 16); }
    if (FX.sino) { FX.sino(987.8, 1.2); window.setTimeout(function () { FX.sino(1318.5, 1.4); }, 110); }
  });

  /* ---------- 3 · 朱印可以拖着盖 ---------- */
  var selo = document.querySelector('.sinete');
  if (selo && window.PointerEvent) {
    var arrastando = false, dx = 0, dy = 0, folha = selo.closest('.folha');

    selo.style.touchAction = 'none';
    selo.addEventListener('pointerdown', function (e) {
      if (!folha || !podar()) { return; }
      arrastando = true;
      var r = selo.getBoundingClientRect();
      dx = e.clientX - r.left;
      dy = e.clientY - r.top;
      /* 拖起来后改成相对信纸的绝对定位 */
      var fr = folha.getBoundingClientRect();
      selo.style.position = 'absolute';
      selo.style.left = (r.left - fr.left) + 'px';
      selo.style.top = (r.top - fr.top) + 'px';
      selo.style.margin = '0';
      selo.style.zIndex = '6';
      selo.style.cursor = 'grabbing';
      selo.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    selo.addEventListener('pointermove', function (e) {
      if (!arrastando || !folha) { return; }
      var fr = folha.getBoundingClientRect();
      selo.style.left = (e.clientX - fr.left - dx) + 'px';
      selo.style.top = (e.clientY - fr.top - dy) + 'px';
    });
    function solta(e) {
      if (!arrastando) { return; }
      arrastando = false;
      selo.style.cursor = 'grab';
      selo.classList.remove('carimba');
      void selo.offsetWidth;
      selo.classList.add('carimba');
      var r = selo.getBoundingClientRect();
      var x = r.left + r.width / 2, y = r.top + r.height / 2;
      if (fx()) {
        if (FX.burst) { FX.burst(x, y, 14, true); }
        if (FX.petalas) { FX.petalas(x, y, 8); }
        if (FX.nota) { FX.nota(196, .5, 'sine', .3); window.setTimeout(function () { FX.nota(146.8, .6, 'sine', .22); }, 45); }
      }
    }
    selo.addEventListener('pointerup', solta);
    selo.addEventListener('pointercancel', solta);
    selo.style.cursor = 'grab';
    selo.title = '可以拖着盖章';
  }

  /* ---------- 5 · 长按 0.7 秒：下一场花瓣雨 ---------- */
  var pressT = null, pressX = 0, pressY = 0, choveu = false;
  function comecaChuva(x, y) {
    if (!podar() || !fx() || !FX.petalas) { return; }
    choveu = true;
    if (FX.sino) { FX.sino(1046.5, 1.4); }
    for (var i = 0; i < 26; i++) {
      (function (k) {
        window.setTimeout(function () {
          FX.petalas(Math.random() * window.innerWidth, -10 - Math.random() * 60, 3);
        }, k * 55);
      })(i);
    }
  }
  window.addEventListener('pointerdown', function (e) {
    if (e.target && e.target.closest && e.target.closest('input,button,a,label,.portao,.passagem')) { return; }
    pressX = e.clientX; pressY = e.clientY; choveu = false;
    pressT = window.setTimeout(function () { comecaChuva(pressX, pressY); }, 700);
  }, true);
  ['pointerup', 'pointercancel', 'pointermove'].forEach(function (ev) {
    window.addEventListener(ev, function (e) {
      if (ev === 'pointermove' && pressT && (Math.abs(e.clientX - pressX) > 12 || Math.abs(e.clientY - pressY) > 12)) {
        window.clearTimeout(pressT); pressT = null;
      }
      if (ev !== 'pointermove') { window.clearTimeout(pressT); pressT = null; }
    }, true);
  });

  /* ---------- 6 · 点缠枝纹：它会转一圈 ---------- */
  document.addEventListener('click', function (e) {
    var orn = e.target && e.target.closest ? e.target.closest('.ornamento') : null;
    if (!orn || !podar() || !fx()) { return; }
    e.stopPropagation();
    orn.style.transition = 'transform .9s cubic-bezier(.22,1,.36,1), filter .9s ease';
    orn.style.transform = 'rotate(360deg) scale(1.08)';
    orn.style.filter = 'drop-shadow(0 0 18px rgba(255,206,130,.9))';
    window.setTimeout(function () {
      orn.style.transition = 'transform .6s ease, filter .6s ease';
      orn.style.transform = '';
      orn.style.filter = '';
    }, 950);
    var r = orn.getBoundingClientRect();
    if (FX.burst) { FX.burst(r.left + r.width / 2, r.top + r.height / 2, 14, true); }
    if (FX.sino) { FX.sino(1174.7, 1); }
  }, false);

  /* ---------- 7 · 双击信纸：翻到背面看一眼（每页背面藏了一句话） ---------- */
  var VERSOS = [
    '这封信，从很久以前就想写了。',
    '如果只记得一句，就记这句。',
    '背面还写着两个字：别累。',
    '四个都给你，不许挑。',
    '一年后拆开看看，准不准。',
    '这首诗，只念给一个人听。',
    '落款处还有半句话：慢慢来。',
    '每一年都算数。',
    '数字会变，人不变。',
    '签是随机的，好运是固定的。',
    '每个月都替你留了一句。',
    '这几封信，先替你收着。'
  ];

  function versoEl() {
    var d = document.getElementById('versoDica');
    if (!d) {
      d = document.createElement('p');
      d.id = 'versoDica';
      d.className = 'verso-dica';
      d.setAttribute('aria-hidden', 'true');
      document.body.appendChild(d);
    }
    return d;
  }

  document.addEventListener('dblclick', function (e) {
    var t = e.target;
    if (!t || !t.closest || !podar()) { return; }
    if (t.closest('button,input,textarea,a,label,.capsula,.mes,.numero,.desejo,.tempo,.qian-palco,.sinete,.nav-seta,.ponto')) { return; }
    var folha = t.closest('.folha');
    if (!folha) { return; }
    var paginas = document.querySelectorAll('.pagina');
    var pg = folha.closest('.pagina');
    var i = Array.prototype.indexOf.call(paginas, pg);
    var txt = VERSOS[i] || VERSOS[0];

    folha.classList.remove('vira-verso');
    void folha.offsetWidth;
    folha.classList.add('vira-verso');
    window.setTimeout(function () { folha.classList.remove('vira-verso'); }, 2000);

    var d = versoEl();
    d.textContent = txt;
    window.setTimeout(function () { d.classList.add('mostra'); }, 420);
    window.setTimeout(function () { d.classList.remove('mostra'); }, 3400);

    if (fx()) {
      if (FX.sino) { FX.sino(587.3, 1.1); window.setTimeout(function () { FX.sino(880, 1.3); }, 120); }
      if (FX.petalas) { FX.petalas(window.innerWidth * .5, window.innerHeight * .5, 10); }
    }
  }, false);

  /* ---------- 4 · 悬停时信纸有微光跟随（便宜又好看） ---------- */
  var paginas = document.querySelectorAll('.pagina');
  Array.prototype.forEach.call(paginas, function (p) {
    var folha = p.querySelector('.folha');
    if (!folha) { return; }
    folha.addEventListener('pointermove', function (e) {
      var r = folha.getBoundingClientRect();
      var mx = ((e.clientX - r.left) / r.width - .5) * 2;
      var my = ((e.clientY - r.top) / r.height - .5) * 2;
      folha.style.setProperty('--fx', mx.toFixed(3));
      folha.style.setProperty('--fy', my.toFixed(3));
    }, { passive: true });
  });
})();
