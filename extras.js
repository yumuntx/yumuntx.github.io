/* =========================================================
   第九 ~ 十二页 · 逻辑
   点击用 pointerdown（捕获阶段）优先处理 + click 兜底：
   指针一按下就响应，就算布局在这之后有位移也不会点空
   ========================================================= */
(function () {
  'use strict';

  function q(s, r) { return (r || document).querySelector(s); }
  function qa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function fx() { return window.FX; }
  function sino(f, d) { if (fx() && FX.sino) { FX.sino(f, d || .5); } }
  function nota(f, d, v) { if (fx() && FX.nota) { FX.nota(f, d || .3, 'triangle', v || .2); } }
  function burst(x, y, n, forte) { if (fx() && FX.burst) { FX.burst(x, y, n || 12, !!forte); } }
  function petalas(x, y, n) { if (fx() && FX.petalas) { FX.petalas(x, y, n || 8); } }
  function centro(el) { var r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
  function separa(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  /* ================= 9 · 数字里的你 ================= */
  /* 生日卡是给「2026.10.10 这天」做的，所以"今天"写死成这一天 */
  var NASC = new Date(2004, 9, 10);
  var agora = new Date(2026, 9, 10);
  var dias = Math.max(1, Math.floor((agora - NASC) / 86400000));

  var DADOS = [
    { v: dias, s: '', t: '天 · 你在这个世界上' },
    { v: dias, s: '', t: '次日落，一次也没落下' },
    { v: dias * 24, s: '', t: '小时，够做很多事了' },
    { v: Math.round(dias / 29.53), s: '', t: '次月圆，都照过你' },
    { v: Math.round(dias * 24 * 60 * 72 / 100000000 * 10) / 10, s: '亿', t: '次心跳，一直都在跳' },
    { v: 22, s: '个', t: '春夏秋冬，都好好长大了' }
  ];

  /* 生成元素时同时挂 onclick（最保险），与委托用时间戳去重，不会重复触发 */
  function direto(el, fn) {
    el.onclick = function (e) {
      var t = e.target;
      if (ultimoEl && (Date.now() - ultimoT < 700) &&
          (t === ultimoEl || ultimoEl.contains(t) || t.contains(ultimoEl))) { return; }
      if (e) { e.stopPropagation(); }
      fn();
    };
  }

  var grade = q('.numeros-grade');
  function montaNumeros() {
    if (!grade || grade.dataset.pronto) { return; }
    grade.dataset.pronto = '1';
    DADOS.forEach(function (d) {
      var el = document.createElement('button');
      el.className = 'numero';
      el.type = 'button';
      el.innerHTML = '<b data-alvo="' + d.v + '" data-suf="' + d.s + '">0</b><i>' + d.t + '</i>';
      grade.appendChild(el);
      direto(el, function () {
        conta(el, true);
        var c = centro(el);
        burst(c[0], c[1], 12, true);
        petalas(c[0], c[1], 6);
        sino(880 + qa('.numero', grade).indexOf(el) * 60, .8);
      });
    });
  }

  function textoFinal(b) {
    var alvo = parseFloat(b.dataset.alvo);
    var suf = b.dataset.suf || '';
    return (alvo >= 1000 ? separa(Math.round(alvo)) : (alvo % 1 ? alvo.toFixed(1) : Math.round(alvo))) + suf;
  }

  function conta(el, novo) {
    var b = q('b', el);
    if (!b) { return; }
    var final = textoFinal(b);
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { b.textContent = final; return; }
    var alvo = parseFloat(b.dataset.alvo);
    var t0 = null, dur = novo ? 1100 : 1500;
    window.setTimeout(function () { b.textContent = final; }, dur + 500);
    function passo(ts) {
      if (!t0) { t0 = ts; }
      var p = Math.min(1, (ts - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      var v = alvo * e;
      b.textContent = (alvo >= 1000 ? separa(Math.round(v)) : (alvo % 1 ? v.toFixed(1) : Math.round(v))) + (b.dataset.suf || '');
      if (p < 1) { window.requestAnimationFrame(passo); } else { b.textContent = final; }
    }
    window.requestAnimationFrame(passo);
  }

  /* ================= 10 · 抽一支签 ================= */
  var QIAN = [
    '想要的，慢慢都来', '走的每一步都算数', '遇见的人都值得', '难过的事都不长久',
    '喜欢的事都能做成', '每个清晨都有好天气', '被人认真地放在心上', '想去的地方都能到达',
    '心里有光，路上有风', '不必着急，也不必害怕', '好运气排着队来找你', '想见的人都会重逢'
  ];
  var qianTexto = q('.qian-texto');
  var qianConta = q('.qian-conta');
  var qianVezes = 0;
  var ultimoQian = -1;

  function tiraQian() {
    if (!qianTexto) { return; }
    var i = Math.floor(Math.random() * QIAN.length);
    if (QIAN.length > 1 && i === ultimoQian) { i = (i + 1 + Math.floor(Math.random() * (QIAN.length - 1))) % QIAN.length; }
    ultimoQian = i;
    qianVezes += 1;
    qianTexto.classList.add('troca');
    window.setTimeout(function () {
      qianTexto.textContent = QIAN[i];
      qianTexto.classList.remove('troca');
      qianTexto.classList.remove('novo');
      void qianTexto.offsetWidth;
      qianTexto.classList.add('novo');
    }, 240);
    if (qianConta) { qianConta.textContent = '已经抽了 ' + qianVezes + ' 支'; }
    var c = centro(qianTexto);
    burst(c[0], c[1], 16, true);
    petalas(c[0], c[1], 10);
    sino(659.3, .7);
    nota(987.8, .5, .16);
  }

  /* ================= 11 · 十二个月 ================= */
  var MESES = [
    ['一月', '开年顺顺当当'], ['二月', '心里暖烘烘'], ['三月', '想要的都在路上'], ['四月', '事事有回音'],
    ['五月', '忙也忙得开心'], ['六月', '有人陪你吹晚风'], ['七月', '想去的地方都去成'], ['八月', '热闹也安静'],
    ['九月', '收成比期待多一点'], ['十月', '生日快乐'], ['十一月', '天冷心不冷'], ['十二月', '这一年值得']
  ];
  var gradeMes = q('.meses-grade');
  var mesAno = q('.mes-ano');

  function montaMeses() {
    if (!gradeMes || gradeMes.dataset.pronto) { return; }
    gradeMes.dataset.pronto = '1';
    MESES.forEach(function (m) {
      var el = document.createElement('button');
      el.className = 'mes';
      el.type = 'button';
      el.innerHTML = '<b>' + m[0] + '</b><span>' + m[1] + '</span>';
      gradeMes.appendChild(el);
      direto(el, function () { clicaMes(el); });
    });
  }

  function clicaMes(el) {
    var todos = qa('.mes', gradeMes);
    var i = todos.indexOf(el);
    var m = MESES[i] || ['', ''];
    var on = el.classList.toggle('aceso');
    var c = centro(el);
    if (on) { burst(c[0], c[1], 10, true); nota(523.25 + i * 42, .28, .18); }
    else { nota(392, .2, .14); }
    if (mesAno) { mesAno.textContent = on ? m[0] + ' · ' + m[1] : ''; }
    if (todos.every(function (x) { return x.classList.contains('aceso'); })) {
      if (mesAno) { mesAno.textContent = '一整年都亮着 —— 那就一整年都好。'; }
      sino(1318.5, 1.6);
      todos.forEach(function (x, n) {
        window.setTimeout(function () {
          var cc = centro(x);
          burst(cc[0], cc[1], 8, true);
          petalas(cc[0], cc[1], 4);
        }, n * 90);
      });
    }
  }

  /* ================= 12 · 时间胶囊 ================= */
  var CAPSULAS = [
    ['2027', '愿你的事都顺，愿你想的人都在'],
    ['2028', '愿你还在做喜欢的事'],
    ['2030', '愿你身边还是这些人'],
    ['更久以后', '愿你还是你']
  ];
  var gradeCap = q('.capsulas-grade');

  function montaCapsulas() {
    if (!gradeCap || gradeCap.dataset.pronto) { return; }
    gradeCap.dataset.pronto = '1';
    CAPSULAS.forEach(function (c) {
      var el = document.createElement('button');
      el.className = 'capsula';
      el.type = 'button';
      el.innerHTML =
        '<span class="capsula-cara"><span class="capsula-ano">' + c[0] + '</span>' +
        '<span class="capsula-selo" aria-hidden="true"></span>' +
        '<span class="capsula-dica">点开看看</span></span>' +
        '<span class="capsula-txt">' + c[1] + '</span>';
      gradeCap.appendChild(el);
      direto(el, function () { clicaCapsula(el); });
    });
  }

  function clicaCapsula(el) {
    var todos = qa('.capsula', gradeCap);
    var i = todos.indexOf(el);
    var on = el.classList.toggle('aberta');
    var cc = centro(el);
    if (on) {
      burst(cc[0], cc[1], 14, true);
      petalas(cc[0], cc[1], 8);
      sino([784, 880, 987.8, 1174.7][i] || 880, 1);
    } else { nota(440, .25, .16); }
  }

  /* ================= 统一处理：pointerdown 优先，click 兜底 ================= */
  var ultimoEl = null, ultimoT = 0;

  function trata(e) {
    var t = e.target;
    if (!t || !t.closest) { return null; }
    var el;
    if ((el = t.closest('.capsula'))) { clicaCapsula(el); return el; }
    if ((el = t.closest('.mes'))) { clicaMes(el); return el; }
    if ((el = t.closest('.numero'))) {
      conta(el, true);
      var c = centro(el);
      burst(c[0], c[1], 12, true);
      petalas(c[0], c[1], 6);
      sino(880 + qa('.numero', grade).indexOf(el) * 60, .8);
      return el;
    }
    if (t.closest('.qian-btn') || t.closest('.qian-texto') || t.closest('.qian-palco')) {
      tiraQian();
      return t.closest('.qian-palco') || t.closest('.qian-btn') || t;
    }
    if (t.closest('.folha.qian')) { tiraQian(); return t.closest('.folha.qian'); }
    return null;
  }

  /* 把 pointerdown / mousedown / touchstart / click 全挂上，
     任何一种可用都不会"点不到"；用时间戳+元素去重，不会重复触发 */
  function jaTratado(e, el) {
    var t = e.target;
    if (!t || !t.closest) { return false; }
    return !!ultimoEl && (Date.now() - ultimoT < 700) &&
           (t === ultimoEl || ultimoEl.contains(t) || t.contains(ultimoEl));
  }

  function aoPressionar(e) {
    if (e.button !== undefined && e.button !== 0) { return; }
    if (e.target && e.target.closest && e.target.closest('.portao,.passagem')) { return; }
    var el = trata(e);
    if (el) { ultimoEl = el; ultimoT = Date.now(); }
  }

  if (window.PointerEvent) {
    window.addEventListener('pointerdown', aoPressionar, true);
  }
  window.addEventListener('mousedown', function (e) { aoPressionar(e); }, true);
  window.addEventListener('touchstart', function (e) { aoPressionar(e); }, true);

  window.addEventListener('click', function (e) {
    if (jaTratado(e)) { return; }
    aoPressionar(e);
  }, true);

  /* 大按钮兜底：全部点亮 / 全部拆开 */
  function acaoMesTudo() {
    var todos = qa('.mes', gradeMes);
    todos.forEach(function (m, i) {
      if (m.classList.contains('aceso')) { return; }
      window.setTimeout(function () { clicaMes(m); }, i * 90);
    });
  }

  function acaoCapTudo() {
    var todos = qa('.capsula', gradeCap);
    if (!todos.length) { return; }
    var abrir = !todos.every(function (c) { return c.classList.contains('aberta'); });
    todos.forEach(function (c, i) {
      window.setTimeout(function () {
        if (c.classList.contains('aberta') !== abrir) { clicaCapsula(c); }
      }, i * 160);
    });
    if (abrir && fx() && FX.sino) { window.setTimeout(function () { FX.sino(1568, 1.6); }, 700); }
  }

  /* 对外暴露，供 HTML 里的 onclick 直接调用——这是最不可能失效的一条路 */
  window.DSH = {
    qian: tiraQian,
    mesTudo: acaoMesTudo,
    capTudo: acaoCapTudo,
    capsula: function (i) { var t = qa('.capsula', gradeCap)[i]; if (t) { clicaCapsula(t); } },
    mes: function (i) { var t = qa('.mes', gradeMes)[i]; if (t) { clicaMes(t); } }
  };

  function ligaTudo(id, fn) {
    var b = document.getElementById(id);
    if (!b) { return; }
    b.onclick = function (e) { if (e) { e.stopPropagation(); } fn(); };
    b.addEventListener('click', function (e) { e.stopPropagation(); fn(); });
    b.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
  }

  ligaTudo('mesTudo', acaoMesTudo);
  ligaTudo('capTudo', acaoCapTudo);


  /* 自检：如果点了没反应，直接告诉用户怎么办 */
  function avisa(msg) {
    var a = document.getElementById('avisoAuto');
    if (!a) {
      a = document.createElement('p');
      a.id = 'avisoAuto';
      a.className = 'aviso';
      document.body.appendChild(a);
    }
    a.textContent = msg;
    window.setTimeout(function () { a.classList.add('mostra'); }, 40);
  }

  window.setTimeout(function () {
    var cap = document.querySelector('.capsula');
    if (!cap) { return; }
    try {
      var antes = cap.classList.contains('aberta');
      var ev = window.PointerEvent
        ? new PointerEvent('pointerdown', { bubbles: true, button: 0, isPrimary: true })
        : new MouseEvent('mousedown', { bubbles: true, button: 0 });
      cap.dispatchEvent(ev);
      var depois = cap.classList.contains('aberta');
      if (depois) { cap.classList.remove('aberta'); }
      if (antes === depois) {
        avisa('检测到点击没有反应 —— 请按 Ctrl+F5 强制刷新，或换 Chrome / Edge 打开。');
      }
    } catch (err) {
      avisa('这个浏览器可能不支持部分新特性 —— 建议换 Chrome / Edge 打开。');
    }
  }, 3500);


  /* ================= 后面三页：不用点也能玩 =================
     ① 进页面自动演示一遍  ② 鼠标划过就触发  ③ 点当然也可以 */

  var jaAuto = { 9: false, 10: false, 11: false };

  function autoQian() {
    var n = 0;
    var passo = window.setInterval(function () {
      tiraQian();
      n += 1;
      if (n >= 3) { window.clearInterval(passo); }
    }, 1500);
  }

  function autoMeses() {
    qa('.mes', gradeMes).forEach(function (m, i) {
      if (m.classList.contains('aceso')) { return; }
      window.setTimeout(function () { clicaMes(m); }, 240 + i * 150);
    });
  }

  function autoCapsulas() {
    qa('.capsula', gradeCap).forEach(function (c, i) {
      if (c.classList.contains('aberta')) { return; }
      window.setTimeout(function () { clicaCapsula(c); }, 700 + i * 620);
    });
  }

  /* 鼠标划过：只"打开/点亮"，不会关掉 */
  var ultimoHoverQian = 0;
  window.addEventListener('pointerover', function (e) {
    var t = e.target;
    if (!t || !t.closest) { return; }
    var el;
    if ((el = t.closest('.capsula'))) {
      if (!el.classList.contains('aberta')) { clicaCapsula(el); }
      return;
    }
    if ((el = t.closest('.mes'))) {
      if (!el.classList.contains('aceso')) { clicaMes(el); }
      return;
    }
    if (t.closest('.qian-palco') || t.closest('.qian-btn')) {
      if (Date.now() - ultimoHoverQian < 1400) { return; }
      ultimoHoverQian = Date.now();
      tiraQian();
    }
  }, true);

  /* 键盘：空格 / 回车 也能抽签 */
  window.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') { return; }
    if (e.target && e.target.closest && e.target.closest('input,textarea,button')) { return; }
    var qp = document.querySelector('.qian-palco');
    if (qp && qp.offsetParent !== null) { e.preventDefault(); tiraQian(); }
  }, false);

  /* ================= 进入某页时触发 ================= */
  montaNumeros(); montaMeses(); montaCapsulas();

  var paginas = qa('.pagina');
  function aoEntrar(i) {
    if (i === 8) {
      montaNumeros();
      qa('.numero', grade).forEach(function (el, k) { window.setTimeout(function () { conta(el); }, 260 + k * 120); });
    }
    if (i === 9) {
      /* 抽签页：进来先自动抽三支 */
      if (!jaAuto[9]) { jaAuto[9] = true; window.setTimeout(autoQian, 900); }
    }
    if (i === 10) {
      montaMeses();
      if (!jaAuto[10]) { jaAuto[10] = true; window.setTimeout(autoMeses, 700); }
    }
    if (i === 11) {
      montaCapsulas();
      if (!jaAuto[11]) { jaAuto[11] = true; window.setTimeout(autoCapsulas, 500); }
    }
  }

  if (window.MutationObserver) {
    paginas.forEach(function (p, i) {
      if (i < 8) { return; }
      var obs = new MutationObserver(function () {
        if (p.classList.contains('ativa')) { aoEntrar(i); }
      });
      obs.observe(p, { attributes: true, attributeFilter: ['class'] });
      if (p.classList.contains('ativa')) { aoEntrar(i); }
    });
  }
})();
