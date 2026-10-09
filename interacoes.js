/* =========================================================
   每一页的可互动元素（挂在 script.js 之后）
   ========================================================= */
(function () {
  'use strict';

  var container = document.getElementById('container');
  var layer = document.getElementById('confettiLayer');
  if (!container) return;
  var semMov = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function q(s, r) { return (r || document).querySelector(s); }
  function qa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function fx() { return window.FX; }
  function sino(f, d) { if (fx()) FX.sino(f, d || 1); }
  function nota(f, d, v) { if (fx()) FX.nota(f, d || .4, 'triangle', v || .28); }
  function burst(x, y, n, forte) { if (fx()) FX.burst(x, y, n || 12, forte); }
  function petalas(x, y, n) { if (fx() && FX.petalas) FX.petalas(x, y, n || 14); }
  function centro(el) {
    var r = el.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  }
  function pulso(el) {
    if (!el) return;
    el.classList.remove('pulso');
    void el.offsetWidth;
    el.classList.add('pulso');
    window.setTimeout(function () { el.classList.remove('pulso'); }, 900);
  }
  function premio(alvo, texto) {
    if (!alvo || q('.premio', alvo)) return;
    var p = document.createElement('p');
    p.className = 'premio';
    p.textContent = texto;
    alvo.appendChild(p);
    window.setTimeout(function () { p.classList.add('mostra'); }, 40);
  }

  /* ---------------- 1 · 封面 ---------------- */
  var retrato = q('.pagina:nth-child(1) .userImg');
  if (retrato) {
    retrato.style.cursor = 'pointer';
    retrato.addEventListener('click', function (e) {
      e.stopPropagation();
      pulso(retrato);
      var c = centro(retrato);
      burst(c[0], c[1], 16, true);
      petalas(c[0], c[1], 16);
      sino(1046.5, 1.1);
    });
  }

  var versos = q('.pagina:nth-child(1) .capa-verso');
  if (versos) {
    versos.style.cursor = 'pointer';
    versos.title = '点一下';
    versos.addEventListener('click', function (e) {
      e.stopPropagation();
      var on = versos.classList.toggle('ouro');
      var c = centro(versos);
      if (on) { burst(c[0], c[1], 14, true); sino(880, .9); }
      else { nota(587, .3, .2); }
    });
  }

  /* ---------------- 2 · 一句话：连点三下开花 ---------------- */
  var cartaz = q('.pagina:nth-child(2) .cartaz');
  if (cartaz) {
    var carga = 0;
    cartaz.style.cursor = 'pointer';
    cartaz.title = '连点三下';
    cartaz.addEventListener('click', function (e) {
      e.stopPropagation();
      carga += 1;
      var c = centro(cartaz);
      cartaz.classList.remove('carga1', 'carga2');
      cartaz.classList.add('carga' + Math.min(2, carga));
      nota(659 + carga * 130, .3, .22);
      burst(c[0], c[1], 8 + carga * 4, carga > 1);
      if (carga >= 3) {
        carga = 0;
        cartaz.classList.remove('carga1', 'carga2');
        cartaz.classList.add('florido');
        var sub = q('.pagina:nth-child(2) .cartaz-sub');
        if (sub) sub.classList.add('ouro');
        sino(1318.5, 1.6);
        window.setTimeout(function () { sino(1568, 1.9); }, 130);
        for (var i = 0; i < 5; i++) {
          (function (k) {
            window.setTimeout(function () {
              burst(window.innerWidth * (.25 + Math.random() * .5), window.innerHeight * (.3 + Math.random() * .4), 14, true);
            }, k * 180);
          })(i);
        }
        if (typeof confetti === 'function') { /* confetti 在另一个闭包里，这里用画布代替 */ }
        window.setTimeout(function () { cartaz.classList.remove('florido'); }, 2600);
      }
    });
  }

  /* ---------------- 3 · 长信：段落划金线 + 抽出便条 ---------------- */
  var carta = q('.pagina:nth-child(3) .carta-txt');
  if (carta) {
    var partes = carta.innerHTML.split(/<br\s*\/?>\s*<br\s*\/?>/i);
    if (partes.length > 1) {
      carta.innerHTML = partes.map(function (t) { return '<p>' + t + '</p>'; }).join('');
    } else {
      carta.innerHTML = '<p>' + carta.innerHTML + '</p>';
    }
    qa('p', carta).forEach(function (p) {
      p.style.cursor = 'pointer';
      p.addEventListener('click', function (e) {
        e.stopPropagation();
        var on = p.classList.toggle('marcado');
        var c = centro(p);
        if (on) { nota(784, .35, .22); burst(c[0], c[1] - 10, 8); }
      });
    });
  }

  var folhaCarta = q('.pagina:nth-child(3) .folha');
  if (folhaCarta) {
    var bilhete = document.createElement('div');
    bilhete.className = 'bilhete';
    bilhete.innerHTML = '<i>便条</i><span>其实还有一句没写进去——<br>希望你快乐，不止今天。</span>';
    folhaCarta.appendChild(bilhete);
    folhaCarta.style.cursor = 'pointer';
    folhaCarta.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.col-esq')) return;
      if (e.target.closest && e.target.closest('.bilhete')) return;
      var on = folhaCarta.classList.toggle('nota');
      if (on) {
        var c = centro(bilhete);
        burst(c[0], c[1], 12, true);
        petalas(c[0], c[1], 10);
        sino(698.5, 1.1);
      } else {
        nota(523, .3, .2);
      }
    });
  }

  /* ---------------- 4 / 5 · 点齐了给奖励 ---------------- */
  function vigiar(seletor, textoPremio, alvoPremio) {
    var itens = qa(seletor);
    if (!itens.length) return;
    function checa() {
      var todos = itens.every(function (i) { return i.classList.contains('aceso'); });
      if (todos) {
        premio(q(alvoPremio), textoPremio);
        var c = centro(itens[0]);
        sino(1174.7, 1.5);
        for (var k = 0; k < 4; k++) {
          (function (n) {
            window.setTimeout(function () {
              var cc = centro(itens[n] || itens[0]);
              burst(cc[0], cc[1], 12, true);
              petalas(cc[0], cc[1], 8);
            }, n * 160);
          })(k);
        }
      } else {
        var p = q('.premio', q(alvoPremio));
        if (p) p.classList.remove('mostra');
      }
    }
    itens.forEach(function (i) {
      i.addEventListener('click', function () { window.setTimeout(checa, 30); });
      i.addEventListener('keydown', function () { window.setTimeout(checa, 30); });
    });
  }
  vigiar('.pagina:nth-child(4) .desejo', '四个都亮啦 —— 那就都给你。', '.pagina:nth-child(4) .col-dir');
  vigiar('.pagina:nth-child(5) .tempo', '都记下了，一年后再看。', '.pagina:nth-child(5) .col-dir');

  /* ---------------- 6 · 竖排诗：一列列点亮 ---------------- */
  var poema = q('.pagina:nth-child(6) .poema');
  if (poema) {
    var colunas = qa('p', poema);
    colunas.forEach(function (p) {
      p.style.cursor = 'pointer';
      p.addEventListener('click', function (e) {
        e.stopPropagation();
        var on = p.classList.toggle('aceso');
        var c = centro(p);
        if (on) { nota(880, .35, .22); burst(c[0], c[1], 8); petalas(c[0], c[1], 6); }
        var todas = colunas.every(function (x) { return x.classList.contains('aceso'); });
        var selo = q('.sinete', poema);
        if (todas) {
          premio(q('.pagina:nth-child(6) .folha'), '四句都亮起来了');
          sino(1396.9, 1.8);
          if (selo) {
            selo.classList.remove('carimba');
            void selo.offsetWidth;
            selo.classList.add('carimba');
          }
          for (var i = 0; i < 10; i++) {
            (function (k) {
              window.setTimeout(function () {
                petalas(window.innerWidth * Math.random(), -20, 6);
              }, k * 120);
            })(i);
          }
        }
      });
    });
    var seloEl = q('.sinete', poema);
    if (seloEl) {
      seloEl.style.cursor = 'pointer';
      seloEl.addEventListener('click', function (e) {
        e.stopPropagation();
        seloEl.classList.remove('carimba');
        void seloEl.offsetWidth;
        seloEl.classList.add('carimba');
        var c = centro(seloEl);
        burst(c[0], c[1], 12, true);
        nota(196, .5, .3);
        window.setTimeout(function () { nota(146.8, .6, .22); }, 40);
      });
    }
  }

  /* ---------------- 7 · 落款 ---------------- */
  var assinatura = q('.pagina:nth-child(7) .assinatura');
  if (assinatura) {
    assinatura.style.cursor = 'pointer';
    assinatura.title = '点一下，再写一遍';
    assinatura.addEventListener('click', function (e) {
      e.stopPropagation();
      assinatura.classList.remove('reescreve');
      void assinatura.offsetWidth;
      assinatura.classList.add('reescreve');
      var c = centro(assinatura);
      burst(c[0], c[1], 12, true);
      sino(659.3, 1);
    });
  }
  var fecho = q('.pagina:nth-child(7) .final');
  if (fecho) {
    fecho.style.cursor = 'pointer';
    fecho.addEventListener('click', function (e) {
      e.stopPropagation();
      var on = fecho.classList.toggle('ouro');
      var c = centro(fecho);
      if (on) { burst(c[0], c[1], 12, true); sino(987.8, 1.2); }
    });
  }
})();
