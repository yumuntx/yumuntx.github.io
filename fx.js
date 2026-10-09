/* =========================================================
   FX —— 极光 / 星尘 / 光斑 / 流光 / 合成节拍 / 音效
   纯 Canvas 2D，无依赖；音频只用于"合成音效"，不接管 <audio>，
   所以绝不会影响背景音乐的正常播放。
   ========================================================= */
(function () {
  'use strict';

  var canvas = document.getElementById('fx');
  var glow = document.getElementById('fxGlow');
  var container = document.getElementById('container');
  if (!canvas || !glow || !container) return;

  var ctx = canvas.getContext('2d');
  var gtx = glow.getContext('2d');
  var semMov = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var W = 0, H = 0, DPR = 1, GW = 0, GH = 0;
  var pequeno = window.innerWidth < 820;
  var estrelas = [], poeira = [], auroras = [], orbes = [], riscos = [], petalas = [];
  var px = 0, py = 0, mx = 0, my = 0;          /* 指针 */
  var beat = 0, beatSuave = 0, clima = 0, climaAlvo = 0;
  var tempo = 0, ultimo = 0;

  var ONSETS = (window.LYRICS || []).map(function (l) { return l.t; });

  /* ---------------- 尺寸 ---------------- */
  function medir() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    pequeno = window.innerWidth < 820;
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    GW = Math.max(160, Math.round(W / 9));
    GH = Math.max(100, Math.round(H / 9));
    glow.width = GW;
    glow.height = GH;
    montar();
  }

  function aleatorio(a, b) { return a + Math.random() * (b - a); }

  /* ---------------- 建场景 ---------------- */
  function montar() {
    estrelas = [];
    var n = pequeno ? 170 : 340;
    for (var i = 0; i < n; i++) {
      var cam = i % 3;                                   /* 0 远 1 中 2 近 */
      estrelas.push({
        x: Math.random() * W,
        y: Math.random() * H * 0.92,
        r: cam === 2 ? aleatorio(1.1, 2.1) : cam === 1 ? aleatorio(.7, 1.3) : aleatorio(.4, .9),
        a: aleatorio(.25, .95),
        f: aleatorio(.4, 1.6),
        p: Math.random() * 6.28,
        cam: cam
      });
    }
    poeira = [];
    for (var j = 0; j < (pequeno ? 34 : 72); j++) {
      poeira.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: aleatorio(1.4, 3.4),
        v: aleatorio(.12, .5),
        a: aleatorio(.15, .5),
        p: Math.random() * 6.28
      });
    }
    orbes = [];
    for (var k = 0; k < (pequeno ? 11 : 22); k++) {
      orbes.push({
        x: Math.random() * W,
        y: aleatorio(H * .35, H * 1.05),
        r: aleatorio(24, 78),
        v: aleatorio(.06, .22),
        a: aleatorio(.08, .22),
        h: Math.random() < .5 ? 38 : (Math.random() < .5 ? 330 : 268),
        p: Math.random() * 6.28
      });
    }
    petalas = [];
    for (var pi = 0; pi < (pequeno ? 14 : 30); pi++) {
      petalas.push({
        x: Math.random() * W, y: Math.random() * H,
        r: aleatorio(3.5, 9), v: aleatorio(.18, .55),
        p: Math.random() * 6.28, giro: aleatorio(-.01, .01),
        a: aleatorio(.18, .5)
      });
    }
    montarFundo();
    auroras = [];
    var cores = [
      [332, .5], [42, .45], [276, .42], [168, .3], [212, .26], [16, .34], [300, .36]
    ];
    var qtd = pequeno ? 6 : 9;
    for (var m = 0; m < qtd; m++) {
      auroras.push({
        x: Math.random() * GW,
        y: Math.random() * GH,
        r: aleatorio(GW * .28, GW * .62),
        h: cores[m % cores.length][0],
        a: cores[m % cores.length][1],
        vx: aleatorio(-.05, .05),
        vy: aleatorio(-.03, .03),
        p: Math.random() * 6.28
      });
    }
  }

  /* ---------------- 节拍（合成，不用分析器） ---------------- */
  var bgm = null;
  function nivelBeat(t) {
    var lento = .5 + .5 * Math.sin(t * .82);
    var pulso = Math.max(0, 1 - ((t % 2.35) / 2.35) * 3.1);
    var acento = 0;
    for (var i = 0; i < ONSETS.length; i++) {
      var d = t - ONSETS[i];
      if (d >= 0 && d < 1) { acento = Math.max(acento, 1 - d); }
    }
    return Math.min(1, lento * .42 + pulso * .5 + acento * .8);
  }

  /* ---------------- 合成音效（独立 AudioContext，只出声，不动 <audio>） ---------------- */
  var AC = window.AudioContext || window.webkitAudioContext;
  var ac = null, master = null, somLigado = false;

  function audio() {
    if (!AC) return null;
    if (!ac) {
      try {
        ac = new AC();
        master = ac.createGain();
        master.gain.value = .1;
        master.connect(ac.destination);
      } catch (e) { ac = null; }
    }
    if (ac && ac.state === 'suspended') { ac.resume(); }
    return ac;
  }

  function nota(freq, dur, tipo, vol, atraso) {
    if (!somLigado) return;
    var a = audio();
    if (!a) return;
    var t0 = a.currentTime + (atraso || 0);
    var o = a.createOscillator();
    var g = a.createGain();
    o.type = tipo || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || .5, t0 + .015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(master);
    o.start(t0);
    o.stop(t0 + dur + .06);
  }

  function sino(base, dur) {
    nota(base, dur || .9, 'sine', .5);
    nota(base * 2.01, (dur || .9) * .6, 'sine', .22, .01);
    nota(base * 3.02, (dur || .9) * .38, 'sine', .1, .02);
  }

  /* ---------------- 星屑爆发（供 script.js 调用） ---------------- */
  var faiscas = [];
  function burst(x, y, n, forte) {
    if (semMov) return;
    for (var i = 0; i < (n || 10); i++) {
      var a = Math.random() * 6.283, d = aleatorio(.4, 2.6) * (forte ? 1.6 : 1);
      faiscas.push({
        x: x, y: y,
        vx: Math.cos(a) * d, vy: Math.sin(a) * d - .4,
        r: aleatorio(1.2, 3.4), a: 1, dec: aleatorio(.008, .02),
        h: Math.random() < .7 ? 44 : 330
      });
    }
  }

  /* 花瓣爆发（供交互层调用） */
  function petalasBurst(x, y, n) {
    if (semMov) return;
    for (var i = 0; i < (n || 14); i++) {
      petalas.push({
        x: x + aleatorio(-14, 14), y: y + aleatorio(-10, 10),
        r: aleatorio(3.5, 9), v: aleatorio(.5, 1.4),
        p: Math.random() * 6.28, giro: aleatorio(-.02, .02),
        a: aleatorio(.35, .8),
        dx: aleatorio(-1.4, 1.4),
        vida: aleatorio(2.4, 5.2)
      });
    }
    if (petalas.length > 140) { petalas.splice(0, petalas.length - 140); }
  }

  /* ================= 背景元素加厚：光柱 / 萤火 / 金尘流 ================= */
  var raios = [], pirilampos = [], fios = [];

  function montarFundo() {
    /* 光柱：从上方斜射下来的柔光 */
    raios = [];
    for (var i = 0; i < (pequeno ? 4 : 7); i++) {
      raios.push({
        x: Math.random() * GW,
        w: aleatorio(6, 26),
        h: aleatorio(GH * 0.7, GH * 1.5),
        ang: aleatorio(-.22, .22),
        a: aleatorio(.12, .34),
        p: Math.random() * 6.28,
        v: aleatorio(.06, .18)
      });
    }
    /* 萤火：小而亮的暖光点，会慢慢游走 */
    pirilampos = [];
    for (var j = 0; j < (pequeno ? 10 : 20); j++) {
      pirilampos.push({
        x: Math.random() * W, y: Math.random() * H,
        r: aleatorio(1.1, 2.2),
        vx: aleatorio(-.22, .22), vy: aleatorio(-.3, -.06),
        p: Math.random() * 6.28, f: aleatorio(.6, 1.6),
        a: aleatorio(.4, .9)
      });
    }
    /* 金尘流：沿着一条缓慢摆动的带子流动 */
    fios = [];
    for (var k = 0; k < (pequeno ? 24 : 52); k++) {
      fios.push({
        t: Math.random(),
        v: aleatorio(.00035, .0011),
        off: aleatorio(-1, 1),
        r: aleatorio(.8, 2.4),
        a: aleatorio(.25, .7)
      });
    }
  }

  function desenharRaios(dt) {
    gtx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < raios.length; i++) {
      var r = raios[i];
      r.p += .0035;
      r.x += r.v;
      if (r.x > GW + 40) { r.x = -40; }
      var cx = r.x + Math.sin(r.p) * 8;
      var w = r.w * (1 + Math.sin(r.p) * .18);
      var gr = gtx.createLinearGradient(cx, 0, cx + Math.tan(r.ang) * r.h, r.h);
      var al = r.a * (.6 + beatSuave * .5 + clima * .4);
      gr.addColorStop(0, 'rgba(255,238,198,' + al.toFixed(3) + ')');
      gr.addColorStop(.55, 'rgba(255,214,150,' + (al * .35).toFixed(3) + ')');
      gr.addColorStop(1, 'rgba(255,200,140,0)');
      gtx.fillStyle = gr;
      gtx.beginPath();
      gtx.moveTo(cx - w / 2, 0);
      gtx.lineTo(cx + w / 2, 0);
      gtx.lineTo(cx + w / 2 + Math.tan(r.ang) * r.h, r.h);
      gtx.lineTo(cx - w / 2 + Math.tan(r.ang) * r.h, r.h);
      gtx.closePath();
      gtx.fill();
    }
    gtx.globalCompositeOperation = 'source-over';
  }

  function desenharVagaLumes(dt) {
    for (var i = 0; i < pirilampos.length; i++) {
      var v = pirilampos[i];
      v.p += .03 * v.f * (dt / 16);
      v.x += v.vx * (dt / 16) + Math.sin(v.p) * .35;
      v.y += v.vy * (dt / 16);
      if (v.y < -20) { v.y = H + 20; v.x = Math.random() * W; }
      if (v.x < -20) { v.x = W + 20; }
      if (v.x > W + 20) { v.x = -20; }
      var al = v.a * (.35 + .65 * (.5 + .5 * Math.sin(v.p))) * (.7 + beatSuave * .6);
      var vx = v.x - px * 20, vy = v.y - py * 20;
      var g = ctx.createRadialGradient(vx, vy, 0, vx, vy, v.r * 9);
      g.addColorStop(0, 'rgba(255,248,224,' + al.toFixed(3) + ')');
      g.addColorStop(.35, 'rgba(255,220,150,' + (al * .5).toFixed(3) + ')');
      g.addColorStop(1, 'rgba(255,200,120,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(vx, vy, v.r * 9, 0, 6.283);
      ctx.fill();
    }
  }

  function desenharFios(dt) {
    for (var i = 0; i < fios.length; i++) {
      var f = fios[i];
      f.t += f.v * (dt / 16);
      if (f.t > 1) { f.t -= 1; }
      var base = Math.sin((f.t * 6.283) + f.off * 2) * 0.5 + 0.5;
      var x = f.t * W + Math.sin(f.t * 6.283 * 2 + f.off) * 60;
      var y = H * (.22 + base * .5) + f.off * 26;
      y -= Math.sin(f.t * 6.283) * 40;
      var al = f.a * (.5 + .5 * Math.sin(f.t * 6.283 * 3)) * (.7 + beatSuave * .5);
      var g = ctx.createRadialGradient(x, y, 0, x, y, f.r * 7);
      g.addColorStop(0, 'rgba(255,244,214,' + al.toFixed(3) + ')');
      g.addColorStop(1, 'rgba(255,214,150,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, f.r * 7, 0, 6.283);
      ctx.fill();
    }
  }

  /* ---------------- 主循环 ---------------- */
  function quadro(agora) {
    var dt = Math.min(60, agora - (ultimo || agora));
    ultimo = agora;
    tempo += dt / 1000;

    if (bgm && !bgm.paused) {
      var t = bgm.currentTime;
      beat = nivelBeat(t);
    } else {
      beat *= .96;
    }
    beatSuave += (beat - beatSuave) * .12;
    clima += (climaAlvo - clima) * .012;
    container.style.setProperty('--beat', beatSuave.toFixed(3));

    px += (mx - px) * .045;
    py += (my - py) * .045;

    desenharAurora();
    desenharRaios(dt);
    desenharFundo(dt);
    requestAnimationFrame(quadro);
  }

  function desenharAurora() {
    gtx.clearRect(0, 0, GW, GH);
    gtx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < auroras.length; i++) {
      var a = auroras[i];
      a.x += a.vx;
      a.y += a.vy;
      a.p += .0022;
      if (a.x < -a.r) a.x = GW + a.r;
      if (a.x > GW + a.r) a.x = -a.r;
      if (a.y < -a.r) a.y = GH + a.r;
      if (a.y > GH + a.r) a.y = -a.r;
      var rr = a.r * (1 + Math.sin(a.p) * .12) * (1 + beatSuave * .18) * (1 + clima * .35);
      var g = gtx.createRadialGradient(a.x, a.y, 0, a.x, a.y, rr);
      var alfa = a.a * (.7 + beatSuave * .5 + clima * .5);
      g.addColorStop(0, 'hsla(' + a.h + ',85%,68%,' + alfa + ')');
      g.addColorStop(.55, 'hsla(' + (a.h + 18) + ',80%,58%,' + (alfa * .38) + ')');
      g.addColorStop(1, 'hsla(' + (a.h + 30) + ',80%,50%,0)');
      gtx.fillStyle = g;
      gtx.beginPath();
      gtx.arc(a.x, a.y, rr, 0, 6.283);
      gtx.fill();
    }
    gtx.globalCompositeOperation = 'source-over';
  }

  function desenharFundo(dt) {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';

    /* 星星 */
    for (var i = 0; i < estrelas.length; i++) {
      var e = estrelas[i];
      e.p += .012 * e.f * (dt / 16);
      var par = (e.cam + 1) * 7;
      var x = e.x - px * par;
      var y = e.y - py * par;
      var al = e.a * (.55 + .45 * Math.sin(e.p)) * (.75 + beatSuave * .35);
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,250,240,' + al.toFixed(3) + ')';
      ctx.arc(x, y, e.r, 0, 6.283);
      ctx.fill();
    }

    /* 光斑（景深） */
    for (var k = 0; k < orbes.length; k++) {
      var o = orbes[k];
      o.y -= o.v * (dt / 16) * (1 + beatSuave * .5);
      o.p += .01;
      if (o.y < -o.r * 2) { o.y = H + o.r * 2; o.x = Math.random() * W; }
      var oy = o.y - py * 12;
      var ox = o.x - px * 16 + Math.sin(o.p) * 14;
      var raio = o.r * (1 + Math.sin(o.p) * .08);
      var g2 = ctx.createRadialGradient(ox, oy, 0, ox, oy, raio);
      var aa = o.a * (.7 + beatSuave * .5);
      g2.addColorStop(0, 'hsla(' + o.h + ',92%,74%,' + aa + ')');
      g2.addColorStop(.6, 'hsla(' + (o.h + 16) + ',90%,64%,' + (aa * .35) + ')');
      g2.addColorStop(1, 'hsla(' + (o.h + 30) + ',90%,60%,0)');
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.arc(ox, oy, raio, 0, 6.283);
      ctx.fill();
    }

    /* 浮尘 */
    for (var j = 0; j < poeira.length; j++) {
      var d = poeira[j];
      d.y -= d.v * (dt / 16);
      d.p += .02;
      if (d.y < -10) { d.y = H + 10; d.x = Math.random() * W; }
      var dx = d.x - px * 22 + Math.sin(d.p) * 10;
      var dy = d.y - py * 22;
      var al2 = d.a * (.5 + .5 * Math.sin(d.p)) * (.7 + beatSuave * .6);
      var g3 = ctx.createRadialGradient(dx, dy, 0, dx, dy, d.r * 5);
      g3.addColorStop(0, 'rgba(255,244,214,' + al2.toFixed(3) + ')');
      g3.addColorStop(1, 'rgba(255,214,150,0)');
      ctx.fillStyle = g3;
      ctx.beginPath();
      ctx.arc(dx, dy, d.r * 5, 0, 6.283);
      ctx.fill();
    }

    /* 星屑 */
    for (var f = faiscas.length - 1; f >= 0; f--) {
      var s = faiscas[f];
      s.x += s.vx * (dt / 16);
      s.y += s.vy * (dt / 16);
      s.vy += .022 * (dt / 16);
      s.vx *= .985;
      s.a -= s.dec * (dt / 16);
      if (s.a <= 0) { faiscas.splice(f, 1); continue; }
      var g4 = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 6);
      g4.addColorStop(0, 'hsla(' + s.h + ',100%,86%,' + s.a.toFixed(3) + ')');
      g4.addColorStop(1, 'hsla(' + s.h + ',100%,70%,0)');
      ctx.fillStyle = g4;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 6, 0, 6.283);
      ctx.fill();
    }

    /* 飘落的花瓣 */
    for (var pe = 0; pe < petalas.length; pe++) {
      var pt = petalas[pe];
      pt.y += pt.v * (dt / 16) * (1 + beatSuave * .4);
      pt.p += .012;
      pt.x += Math.sin(pt.p) * .5 + (pt.dx || 0) * (dt / 16);
      if (pt.vida !== undefined) {
        pt.vida -= dt / 1000;
        if (pt.vida <= 0) { petalas.splice(pe, 1); pe--; continue; }
      }
      if (pt.y > H + 20) {
        if (pt.vida !== undefined) { petalas.splice(pe, 1); pe--; continue; }
        pt.y = -20; pt.x = Math.random() * W;
      }
      var px2 = pt.x - px * 18;
      var py2 = pt.y - py * 18;
      var al3 = pt.a * (.6 + .4 * Math.sin(pt.p)) * (.75 + clima * .5);
      ctx.save();
      ctx.translate(px2, py2);
      ctx.rotate(pt.p + pt.giro * 60);
      var g6 = ctx.createRadialGradient(0, 0, 0, 0, 0, pt.r * 2.6);
      g6.addColorStop(0, 'rgba(255,226,238,' + al3.toFixed(3) + ')');
      g6.addColorStop(.55, 'rgba(255,190,215,' + (al3 * .55).toFixed(3) + ')');
      g6.addColorStop(1, 'rgba(255,190,215,0)');
      ctx.fillStyle = g6;
      ctx.beginPath();
      ctx.ellipse(0, 0, pt.r * 1.5, pt.r, 0, 0, 6.283);
      ctx.fill();
      ctx.restore();
    }

    /* 萤火 + 金尘流 */
    desenharVagaLumes(dt);
    desenharFios(dt);

    /* 流星 */
    if (!semMov && Math.random() < .0022) {
      riscos.push({
        x: aleatorio(W * .2, W * 1.05), y: aleatorio(-40, H * .35),
        vx: aleatorio(-7, -3.4), vy: aleatorio(2.4, 4.6), a: 1
      });
    }
    for (var r = riscos.length - 1; r >= 0; r--) {
      var q = riscos[r];
      q.x += q.vx * (dt / 16) * 1.6;
      q.y += q.vy * (dt / 16) * 1.6;
      q.a -= .008 * (dt / 16);
      if (q.a <= 0 || q.y > H + 60) { riscos.splice(r, 1); continue; }
      var g5 = ctx.createLinearGradient(q.x, q.y, q.x - q.vx * 22, q.y - q.vy * 22);
      g5.addColorStop(0, 'rgba(255,250,235,' + q.a.toFixed(3) + ')');
      g5.addColorStop(1, 'rgba(255,220,170,0)');
      ctx.strokeStyle = g5;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(q.x, q.y);
      ctx.lineTo(q.x - q.vx * 22, q.y - q.vy * 22);
      ctx.stroke();
    }

    ctx.globalCompositeOperation = 'source-over';
  }

  /* ---------------- 指针 ---------------- */
  window.addEventListener('pointermove', function (e) {
    mx = (e.clientX / window.innerWidth - .5) * 2;
    my = (e.clientY / window.innerHeight - .5) * 2;
    var p = document.getElementById('paginas');
    if (p) {
      p.style.setProperty('--fx', mx.toFixed(3));
      p.style.setProperty('--fy', my.toFixed(3));
      p.style.setProperty('--tx', mx.toFixed(3));
      p.style.setProperty('--ty', my.toFixed(3));
    }
  }, { passive: true });

  window.addEventListener('resize', medir);
  document.addEventListener('visibilitychange', function () {
    ultimo = performance.now();
  });

  /* ---------------- 对外接口 ---------------- */
  window.FX = {
    burst: burst,
    sino: sino,
    nota: nota,
    ligarSom: function (v) { somLigado = !!v; if (v) audio(); },
    clima: function (v) { climaAlvo = Math.max(0, Math.min(1.4, v || 0)); },
    petalas: petalasBurst,
    registrarAudio: function (el) { bgm = el; },
    pausar: function () { ctx.clearRect(0, 0, W, H); }
  };

  medir();
  requestAnimationFrame(quadro);
})();
