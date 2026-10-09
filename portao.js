/* =========================================================
   登录 → 信封飘落 → 打开 → 序曲
   ========================================================= */
(function () {
  'use strict';

  var portao = document.getElementById('portao');
  if (!portao) { document.body.classList.remove('trancado'); return; }

  var caixa = portao.querySelector('.gw-caixa');
  var form = document.getElementById('portaoForm');
  var user = document.getElementById('portaoUser');
  var pass = document.getElementById('portaoPass');
  var erro = document.getElementById('portaoErro');
  var passagem = document.getElementById('passagem');
  var carta = document.getElementById('passagemCarta');
  var ninho = document.getElementById('passagemCartas');
  var passagemTxt = document.getElementById('passagemTxt');
  var passagemBarra = document.getElementById('passagemBarra');

  /* 口令用字符码存，避免翻源码一眼看穿 */
  var CONTA = String.fromCharCode(108, 107, 121, 115, 98);
  var SENHA = String.fromCharCode(99, 121, 102, 110, 98);

  /* 锁着的时候，标题和图标也不能露馅 */
  var tituloReal = document.title;
  var icon = document.querySelector('link[rel="icon"]');
  var iconReal = icon ? icon.getAttribute('href') : null;
  var ICONE_NEUTRO = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='12' fill='%231c3f74'/><rect x='30' y='30' width='40' height='40' rx='5' fill='none' stroke='%23ffffff' stroke-width='7'/></svg>";

  document.body.classList.add('trancado');
  document.title = '综合信息服务平台 · 用户登录';
  if (icon) { icon.setAttribute('href', ICONE_NEUTRO); }

  function restauraAba() {
    document.title = tituloReal;
    if (icon && iconReal) { icon.setAttribute('href', iconReal); }
  }

  var tentativas = 0;
  var DICAS = [
    '用户名或密码错误，请重新输入。',
    '验证失败，请确认用户名与密码。',
    '提示：用户名为名字的缩写。',
    '提示：密码也是缩写，与“长一岁也很棒”有关。'
  ];

  function falha() {
    tentativas += 1;
    if (caixa) {
      caixa.classList.remove('erro');
      void caixa.offsetWidth;
      caixa.classList.add('erro');
    }
    if (erro) {
      erro.textContent = DICAS[Math.min(tentativas - 1, DICAS.length - 1)];
      erro.classList.add('mostra');
    }
    if (pass) { pass.value = ''; pass.focus(); }
  }

  /* 飘落的小信封 */
  function soltaCartas() {
    if (!ninho) { return; }
    ninho.innerHTML = '';
    for (var i = 0; i < 14; i++) {
      var d = document.createElement('i');
      d.className = 'pc-mini';
      d.style.left = (Math.random() * 96) + '%';
      d.style.animationDuration = (2.6 + Math.random() * 2.2).toFixed(2) + 's';
      d.style.animationDelay = (Math.random() * 2.4).toFixed(2) + 's';
      var esc = (0.6 + Math.random() * 0.8).toFixed(2);
      d.style.width = (46 * esc).toFixed(0) + 'px';
      d.style.height = (32 * esc).toFixed(0) + 'px';
      d.style.opacity = '0';
      ninho.appendChild(d);
    }
  }

  var PASSOS = [
    { t: 0, txt: '正在连接…', p: 18 },
    { t: 1200, txt: '验证通过，正在为你取件…', p: 46 },
    { t: 2400, txt: '信封到了。', p: 72 },
    { t: 3800, txt: '拆开看看…', p: 100 }
  ];

  function entra() {
    restauraAba();
    portao.classList.add('ok');
    soltaCartas();
    if (passagem) { passagem.classList.add('on'); }
    /* 音乐从过渡页开始放（登录页全程安静） */
    if (window.DSH_tocar) { window.DSH_tocar(); }
    PASSOS.forEach(function (p) {
      window.setTimeout(function () {
        if (passagemTxt) {
          passagemTxt.textContent = p.txt;
          passagemTxt.classList.toggle('forte', p.p >= 72);
        }
        if (passagemBarra) { passagemBarra.style.width = p.p + '%'; }
      }, p.t);
    });
    /* 信封落到中间 → 开盖 → 洒光 */
    window.setTimeout(function () { if (carta) { carta.classList.add('aberta'); } }, 3900);
    /* 揭开场景，序曲开始 */
    window.setTimeout(function () {
      document.body.classList.remove('trancado');
      window.dispatchEvent(new CustomEvent('dsh:entrar'));
      if (passagem) { passagem.classList.add('fim'); }
    }, 5600);
    window.setTimeout(function () {
      if (portao && portao.parentNode) { portao.parentNode.removeChild(portao); }
      if (passagem && passagem.parentNode) { passagem.parentNode.removeChild(passagem); }
    }, 7400);
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var u = (user && user.value ? user.value : '').trim().toLowerCase();
      var p = (pass && pass.value ? pass.value : '').trim().toLowerCase();
      if (u === CONTA && p === SENHA) { entra(); } else { falha(); }
    });
  }
  if (user) { window.setTimeout(function () { try { user.focus(); } catch (e) {} }, 600); }
})();
