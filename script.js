/* =========================================================
   生日快乐 · 关芷童
   1) 轻触信封（或点页面任意处 / 回车）→ 打开小册子 + 彩纸 + 起音乐
   2) 小册子 4 页：箭头 / 圆点 / 左右方向键 / 手机左右滑动 都能翻
   3) 歌词按 song.mp3 时间轴走，一次一句
   ========================================================= */
(function () {
  'use strict';

  var container = document.getElementById('container');
  var sobre = document.getElementById('sobre');
  var livro = document.getElementById('livro');
  var bgm = document.getElementById('bgm');
  var btn = document.getElementById('musicaBtn');
  var btnTxt = document.getElementById('musicaTxt');
  var linha = document.getElementById('letraLinha');
  var layer = document.getElementById('confettiLayer');
  var paginas = Array.prototype.slice.call(document.querySelectorAll('.pagina'));
  var pontos = Array.prototype.slice.call(document.querySelectorAll('.ponto'));
  var navPrev = document.getElementById('navPrev');
  var navNext = document.getElementById('navNext');

  var VOLUME = 0.55;
  var aberto = false;
  var pagina = 0;
  var fadeTimer = null;

  /* ---------------- 彩纸 & 心心 ---------------- */
  var CORES = ['#ffd479', '#ff8fb8', '#8fd9c4', '#8fc9ff', '#c9a6f2', '#fff7ea'];

  function confetti(qtd) {
    if (!layer) return;
    var n = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : (qtd || 26);
    for (var i = 0; i < n; i++) {
      var p = document.createElement('i');
      p.className = 'confetti';
      p.style.left = (Math.random() * 100).toFixed(1) + '%';
      p.style.background = CORES[i % CORES.length];
      p.style.width = (6 + Math.random() * 6).toFixed(1) + 'px';
      p.style.height = (10 + Math.random() * 10).toFixed(1) + 'px';
      p.style.opacity = (0.65 + Math.random() * 0.35).toFixed(2);
      p.style.animationDuration = (2.2 + Math.random() * 1.8).toFixed(2) + 's';
      p.style.animationDelay = (Math.random() * 0.45).toFixed(2) + 's';
      p.style.setProperty('--dx', (Math.random() * 160 - 80).toFixed(0) + 'px');
      p.style.setProperty('--rot', (360 + Math.random() * 720).toFixed(0) + 'deg');
      p.addEventListener('animationend', function () { this.remove(); });
      layer.appendChild(p);
    }
  }

  function coracoes(qtd) {
    if (!layer) return;
    var n = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : (qtd || 12);
    for (var i = 0; i < n; i++) {
      var h = document.createElement('span');
      h.className = 'coracao-f';
      h.textContent = '♥';
      h.style.left = (30 + Math.random() * 40).toFixed(1) + '%';
      h.style.fontSize = (13 + Math.random() * 12).toFixed(1) + 'px';
      h.style.animationDuration = (3.4 + Math.random() * 2.4).toFixed(2) + 's';
      h.style.animationDelay = (Math.random() * 0.8).toFixed(2) + 's';
      h.style.setProperty('--rot', (Math.random() * 70 - 35).toFixed(0) + 'deg');
      h.addEventListener('animationend', function () { this.remove(); });
      layer.appendChild(h);
    }
  }

  /* ---------------- 音乐 ---------------- */
  function estado(tocando) {
    if (!btn) return;
    btn.classList.toggle('tocando', !!tocando);
    btn.setAttribute('aria-pressed', tocando ? 'true' : 'false');
    if (btnTxt) btnTxt.textContent = tocando ? '背景音乐 播放中' : (aberto ? '继续播放音乐' : '播放背景音乐');
  }

  function tocar() {
    if (!bgm) return;
    bgm.volume = 0;
    var p = bgm.play();
    if (p && p.catch) p.catch(function () { estado(false); });
    clearInterval(fadeTimer);
    fadeTimer = window.setInterval(function () {
      if (!bgm || bgm.paused) { clearInterval(fadeTimer); return; }
      bgm.volume = Math.min(VOLUME, bgm.volume + 0.035);
      if (bgm.volume >= VOLUME - 0.001) clearInterval(fadeTimer);
    }, 90);
  }

  function pausar() { if (bgm) bgm.pause(); }

  if (bgm) {
    bgm.addEventListener('play', function () {
      estado(true);
      if (window.FX) { FX.registrarAudio(bgm); FX.ligarSom(true); }
      if (typeof guiaOn !== 'undefined' && guiaOn && aberto) guiaPara(TOUR_MS);
    });
    bgm.addEventListener('pause', function () {
      estado(false);
      if (window.FX) { FX.ligarSom(false); }
      if (typeof guiaPara === 'function') guiaPara(0);
    });
    bgm.addEventListener('error', function () {
      if (btnTxt) btnTxt.textContent = '音乐没加载上，见 README';
    });
  }

  /* ---------------- 翻页 ---------------- */
  /* 六种翻页效果，一次一个轮着来 */
  var EFEITOS = ['flip', 'push', 'sobe', 'dissolve', 'wipe', 'gira'];
  var efeito = 0;

  function ir(i) {
    if (!paginas.length) return;
    if (i < 0 || i >= paginas.length) return;
    if (i === pagina) return;

    var velha = paginas[pagina];
    var nova = paginas[i];
    var avanco = i > pagina;
    var e = EFEITOS[efeito % EFEITOS.length];
    efeito += 1;

    if (paginasEl) paginasEl.style.setProperty('--dir', avanco ? '1' : '-1');

    if (cenaFlash) {
      cenaFlash.classList.remove('on');
      void cenaFlash.offsetWidth;
      cenaFlash.classList.add('on');
    }
    if (livro) {
      livro.classList.remove('virando');
      void livro.offsetWidth;
      livro.classList.add('virando');
      window.setTimeout(function () { livro.classList.remove('virando'); }, 780);
    }

    velha.classList.remove('ativa');
    velha.classList.add('sai-' + e);
    nova.classList.add('vai-' + e);
    nova.classList.add('ativa');

    window.setTimeout(function () {
      velha.classList.remove('sai-' + e);
      nova.classList.remove('vai-' + e);
    }, 840);

    pagina = i;
    if (window.FX) {
      FX.sino(avanco ? 988 : 784, .85);
      var rr = (livro || container).getBoundingClientRect();
      FX.burst(avanco ? rr.right - 26 : rr.left + 26, rr.top + rr.height * .5, 14, true);
    }
    pontos.forEach(function (p, k) { p.classList.toggle('ativo', k === i); });
    if (navPrev) navPrev.classList.toggle('desativado', i === 0);
    if (navNext) navNext.classList.toggle('desativado', i === paginas.length - 1);
    if (i > 0 && container) container.classList.add('virado');

    /* 翻到最后一页，送一把彩纸和心心 */
    if (i === paginas.length - 1) { confetti(18); coracoes(7); }
  }

  if (navPrev) navPrev.addEventListener('click', function (e) { e.stopPropagation(); navUsuario(pagina - 1); });
  if (navNext) navNext.addEventListener('click', function (e) { e.stopPropagation(); navUsuario(pagina + 1); });
  pontos.forEach(function (p) {
    p.addEventListener('click', function (e) {
      e.stopPropagation();
      navUsuario(parseInt(p.getAttribute('data-p'), 10) || 0);
    });
  });

  /* 手机左右滑动 */
  var xIni = null, yIni = null;
  var zona = document.getElementById('paginas');
  if (zona) {
    zona.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      xIni = e.touches[0].clientX;
      yIni = e.touches[0].clientY;
    }, { passive: true });
    zona.addEventListener('touchend', function (e) {
      if (xIni === null) return;
      var t = e.changedTouches[0];
      var dx = t.clientX - xIni, dy = t.clientY - yIni;
      xIni = null; yIni = null;
      if (Math.abs(dx) < 38 || Math.abs(dx) < Math.abs(dy)) return;
      navUsuario(dx < 0 ? pagina + 1 : pagina - 1);
    }, { passive: true });
  }

  /* ---------------- 打开 ---------------- */
  function abrir() {
    if (aberto) return;
    /* 登录页 / 过渡页还锁着的时候，点哪儿都不算"开卡" */
    if (document.getElementById('portao') || document.body.classList.contains('trancado')) return;
    aberto = true;
    container.classList.add('aberto');
    if (livro) livro.setAttribute('aria-hidden', 'false');
    pararPrologo();
    guiaEstado(guiaOn);
    clearTimeout(guiaTimer);
    guiaTimer = window.setTimeout(guiaProxima, TOUR_MS);
    barra(TOUR_MS);
    confetti(34);
    coracoes(10);
    tocar();
  }
  /* 过渡页开始时就要有音乐，所以把这个方法暴露出去 */
  window.DSH_tocar = tocar;
  window.DSH_estaTocando = function () { return !!(bgm && !bgm.paused); };


  if (sobre) sobre.addEventListener('click', function (e) { e.stopPropagation(); abrir(); });
  document.addEventListener('click', function () { abrir(); });
  document.addEventListener('keydown', function (e) {
    if (!aberto) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); abrir(); }
      return;
    }
    if (e.key === 'ArrowRight') navUsuario(pagina + 1);
    if (e.key === 'ArrowLeft') navUsuario(pagina - 1);
  });

  if (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!bgm) return;
      if (bgm.paused) tocar(); else pausar();
    });
  }


  var coracao = document.getElementById('coracao');
  if (coracao) {
    coracao.addEventListener('click', function (e) {
      e.stopPropagation();
      confetti(18);
      coracoes(14);
      if (window.FX) { FX.sino(660, 1.2); FX.burst(e.clientX, e.clientY, 18, true); }
    });
  }

  /* ---------------- 歌词 ---------------- */
  var L = window.LYRICS || [];
  var atual = -2;

  function mostra(i) {
    if (!linha) return;
    if (i < 0) {
      linha.classList.remove('mostra');
      linha.textContent = '';
      return;
    }
    linha.textContent = L[i].s;
    linha.classList.remove('mostra');
    void linha.offsetWidth;
    linha.classList.add('mostra');
    fantasma(L[i].s);
  }

  /* ---------------- 背景里浮现的歌词 ---------------- */
  var fundo = document.getElementById('letraFundo');
  var semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var modoLetra = 0;
  var ladoVertical = 0;

  function fantasma(txt) {
    if (!fundo || !txt || semMovimento) return;

    var modo = modoLetra % 3;
    modoLetra += 1;

    var p = document.createElement('p');
    var vive = 16600;

    if (modo === 1) {                       /* 竖排，从侧面升上来 */
      p.className = 'letra-fantasma vertical';
      p.style.left = (ladoVertical % 2 === 0) ? '11%' : '89%';
      ladoVertical += 1;
      vive = 18600;
    } else if (modo === 2) {                /* 大字横着飘过 */
      p.className = 'letra-fantasma corre';
      p.style.top = (74 + Math.random() * 8).toFixed(1) + '%';
      vive = 15600;
    } else {                                /* 大字从底下浮上来 */
      p.className = 'letra-fantasma';
      p.style.left = (50 + (Math.random() * 10 - 5)).toFixed(1) + '%';
    }

    p.textContent = txt;
    fundo.appendChild(p);
    window.setTimeout(function () { p.remove(); }, vive);
  }

  function tick() {
    if (!linha || !L.length || !bgm || bgm.paused) return;
    var t = bgm.currentTime, cur = -1;
    for (var i = 0; i < L.length; i++) { if (t >= L[i].t) cur = i; }
    if (cur === atual) return;
    atual = cur;
    mostra(cur);
  }

  /* ================= 导览脚本：序曲 → 自动翻页 → 尾声 ================= */
  var TOUR_MS = parseInt((location.search.match(/tour=(\d+)/) || [])[1], 10) || 7600;
  var guiaOn = true;
  var guiaTimer = null;
  var prologoTimers = [];
  var cenaFlash = document.getElementById('cenaFlash');
  var guiaBarra = document.getElementById('guiaBarra');
  var guiaEl = document.getElementById('guia');
  var guiaBtn = document.getElementById('guiaBtn');
  var guiaTxt = document.getElementById('guiaTxt');
  var finaleEl = document.getElementById('finale');
  var finaleBtn = document.getElementById('finaleBtn');

  /* 序曲：一层层亮起来 */
  function iniciarPrologo() {
    if (prologoTimers.length || aberto) { return; }
    [2.2, 5.0, 7.6, 10.2].forEach(function (s, i) {
      prologoTimers.push(window.setTimeout(function () {
        if (!aberto) { container.classList.add('t' + (i + 1)); }
      }, s * 1000));
    });
  }
  /* 有口令页时，等它对上了再开始序曲 */
  if (document.getElementById('portao')) {
    window.addEventListener('dsh:entrar', iniciarPrologo, { once: true });
  } else {
    iniciarPrologo();
  }

  function pararPrologo() {
    prologoTimers.forEach(clearTimeout);
    prologoTimers = [];
    container.classList.add('t1', 't2', 't3', 't4');
  }

  /* 进度线 */
  function barra(ms, pausada) {
    if (!guiaBarra || !guiaEl) return;
    guiaEl.classList.toggle('pausada', !!pausada);
    guiaBarra.style.transition = 'none';
    guiaBarra.style.width = '0%';
    void guiaBarra.offsetWidth;
    if (pausada || !ms) return;
    guiaBarra.style.transition = 'width ' + ms + 'ms linear';
    guiaBarra.style.width = '100%';
  }

  function guiaEstado(v) {
    if (!guiaBtn) return;
    guiaBtn.setAttribute('aria-pressed', v ? 'true' : 'false');
    if (guiaTxt) guiaTxt.textContent = v ? '自动导览 开' : '自动导览 关';
  }

  function guiaPara(ms) {
    clearTimeout(guiaTimer);
    barra(0, true);
    if (ms) {
      guiaTimer = window.setTimeout(function () {
        if (guiaOn && aberto && !container.classList.contains('final')) { guiaProxima(); }
      }, ms);
    }
  }

  function guiaProxima() {
    if (!guiaOn || !aberto) return;
    if (container.classList.contains('final')) return;
    if (window.FX && bgm && bgm.paused) { guiaTimer = window.setTimeout(guiaProxima, 2000); return; }
    if (pagina >= paginas.length - 1) { abrirFinale(); return; }
    ir(pagina + 1);
    guiaTimer = window.setTimeout(guiaProxima, TOUR_MS);
    barra(TOUR_MS);
  }

  /* 用户自己翻页：先停一会儿再继续自动 */
  function navUsuario(i) {
    ir(i);
    if (guiaOn && aberto && !container.classList.contains('final')) { guiaPara(TOUR_MS); }
  }

  /* 尾声 */
  function abrirFinale() {
    clearTimeout(guiaTimer);
    barra(0, true);
    container.classList.add('final');
    if (finaleEl) { finaleEl.setAttribute('aria-hidden', 'false'); }
    confetti(44);
    coracoes(18);
    if (window.FX) {
      FX.clima(1);
      FX.sino(523.25, 2.2);
      FX.sino(783.99, 2.6);
      for (var i = 0; i < 6; i++) {
        (function (k) {
          window.setTimeout(function () {
            FX.burst(window.innerWidth * (0.18 + Math.random() * 0.64),
                     window.innerHeight * (0.22 + Math.random() * 0.46), 18, true);
          }, 300 + k * 380);
        })(i);
      }
    }
  }

  function refazer() {
    container.classList.remove('final');
    if (finaleEl) { finaleEl.setAttribute('aria-hidden', 'true'); }
    ir(0);
    confetti(26);
    if (window.FX) { FX.clima(0); }
    clearTimeout(guiaTimer);
    if (guiaOn) {
      guiaTimer = window.setTimeout(guiaProxima, TOUR_MS);
      barra(TOUR_MS);
    }
  }

  if (finaleBtn) {
    finaleBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      refazer();
    });
  }
  if (guiaBtn) {
    guiaBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      guiaOn = !guiaOn;
      guiaEstado(guiaOn);
      if (guiaOn) { guiaPara(TOUR_MS); } else { guiaPara(0); }
    });
  }

  window.setInterval(tick, 150);

  /* ---------------- 鼠标划过，纸面轻轻侧一下（只在真鼠标 + 打开后） ---------------- */
  var paginasEl = document.getElementById('paginas');
  var ponteiroFino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (paginasEl && ponteiroFino && container) {
    container.addEventListener('mousemove', function (e) {
      if (!aberto) return;
      var r = paginasEl.getBoundingClientRect();
      if (!r.width || !r.height) return;
      var tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width * 0.9)));
      var ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height * 1.2)));
      paginasEl.style.setProperty('--tx', tx.toFixed(3));
      paginasEl.style.setProperty('--ty', ty.toFixed(3));
    });
    container.addEventListener('mouseleave', function () {
      paginasEl.style.setProperty('--tx', '0');
      paginasEl.style.setProperty('--ty', '0');
    });
  }

  /* ---------------- 点亮愿望 / 打勾约定 ---------------- */
  function alternar(el) {
    var ligado = el.classList.toggle('aceso');
    el.setAttribute('aria-pressed', ligado ? 'true' : 'false');
    if (ligado) {
      coracoes(4);
      if (window.FX) FX.nota(1318, .55, 'triangle', .3);
    }
  }

  Array.prototype.forEach.call(document.querySelectorAll('.desejo, .item, .tempo'), function (el) {
    el.addEventListener('click', function (e) {
      e.stopPropagation();
      alternar(el);
    });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        e.stopPropagation();
        alternar(el);
      }
    });
  });

  /* ---------------- 可以戳的小玩意 ---------------- */
  function faiscas(x, y, qtd) {
    if (!layer || semMovimento) return;
    for (var i = 0; i < (qtd || 7); i++) {
      var s = document.createElement('span');
      var a = Math.random() * Math.PI * 2;
      var d = 26 + Math.random() * 58;
      s.className = 'faisca';
      s.style.left = (x - 4) + 'px';
      s.style.top = (y - 4) + 'px';
      s.style.setProperty('--fx', (Math.cos(a) * d).toFixed(1) + 'px');
      s.style.setProperty('--fy', (Math.sin(a) * d).toFixed(1) + 'px');
      s.style.setProperty('--fr', (Math.random() * 360).toFixed(0) + 'deg');
      s.style.animationDelay = (Math.random() * 0.08).toFixed(2) + 's';
      s.addEventListener('animationend', function () { this.remove(); });
      layer.appendChild(s);
    }
  }

  /* 戳纸面：蹦星星 */
  if (livro) {
    livro.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('button, .desejo, .item, .tempo')) return;
      faiscas(e.clientX, e.clientY, 6);
    });
  }

  /* 戳夜空：爆一簇光屑 */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t && t.closest && t.closest('.livro, .sobre, .musica, .vela, .menu')) return;
    if (window.FX) FX.burst(e.clientX, e.clientY, 16, true);
    faiscas(e.clientX, e.clientY, 6);
    if (window.FX) FX.nota(1568, .22, 'sine', .18);
  });

  /* 戳飘过的歌词：炸成星屑 */
  if (fundo) {
    fundo.addEventListener('click', function (e) {
      if (!e.target.classList || !e.target.classList.contains('letra-fantasma')) return;
      e.stopPropagation();
      faiscas(e.clientX, e.clientY, 14);
      e.target.remove();
    });
  }

  /* 吹蜡烛：点一下灭，冒一缕烟，过会儿自己再亮 */
  var vela = document.getElementById('vela');
  if (vela) {
    vela.addEventListener('click', (function () {
      var apagando = false;
      return function (e) {
        e.stopPropagation();
        if (apagando) return;
        apagando = true;
        vela.classList.add('apagada');
        confetti(20);
        coracoes(4);
        if (window.FX) {
          FX.nota(180, .5, 'sine', .35);
          FX.nota(90, .7, 'sine', .25, .03);
          var r = vela.getBoundingClientRect();
          FX.burst(r.left + r.width / 2, r.top + 10, 16, true);
        }
        window.setTimeout(function () {
          vela.classList.remove('apagada');
          apagando = false;
        }, 2600);
      };
    })());
  }
})();
