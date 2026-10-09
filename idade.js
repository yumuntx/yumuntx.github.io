/* =========================================================
   第八页 · 岁岁：年份滑杆 → 年龄切换
   ========================================================= */
(function () {
  'use strict';

  var slider = document.getElementById('idadeSlider');
  var num = document.getElementById('idadeNum');
  var data = document.getElementById('idadeData');
  var frase = document.getElementById('idadeFrase');
  var folha = document.querySelector('.folha.idade');
  var pagina = document.querySelectorAll('.pagina')[7];
  if (!slider || !num || !pagina) return;

  var NASC = 2004;
  var ULTIMO = 2026;

  /* 每一岁说一句话（0 和 22 是这一页的重点） */
  var LINHAS = {
    0: '那年的秋天，你来了',
    1: '小小的，一天一个样',
    2: '刚开始学说话，就很好听',
    3: '走两步就要抱一下',
    4: '开始有说不完的话',
    5: '什么都想问一个为什么',
    6: '笑起来整个屋子都亮了',
    7: '好奇心装满一整个夏天',
    8: '学会了自己哄自己开心',
    9: '好像一转眼就长高了一截',
    10: '心里开始装下很多事',
    11: '安静的时候在偷偷发光',
    12: '有了自己的小秘密',
    13: '一边长大，一边变好看',
    14: '开始在意别人的眼光，也开始有自己的样子',
    15: '把喜欢的事做得很认真',
    16: '慢慢有了自己的主意',
    17: '站在长大和没长大之间',
    18: '成年了，世界一下变大',
    19: '走得更远，也变得更稳',
    20: '学会了自己扛事',
    21: '把日子过成了自己的样子',
    22: '今天，生日快乐'
  };
  var MARCOS = [0, 6, 12, 18, 22];

  function fx() { return window.FX; }
  function sino(f, d) { if (fx() && FX.sino) FX.sino(f, d || .5); }
  function burst(x, y, n, forte) { if (fx() && FX.burst) FX.burst(x, y, n || 10, !!forte); }
  function petalas(x, y, n) { if (fx() && FX.petalas) FX.petalas(x, y, n || 8); }
  function centro(el) {
    var r = el.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  }

  var valorAtual = ULTIMO;

  function escreve(ano, som) {
    var idade = ano - NASC;
    if (num.textContent !== String(idade)) {
      num.textContent = idade;
      num.classList.remove('vira');
      void num.offsetWidth;
      num.classList.add('vira');
      if (som !== false) {
        /* 每长一岁一个音，越高越亮 */
        sino(523.25 * Math.pow(2, Math.min(idade, 22) / 22), .32);
      }
    }
    data.textContent = ano + '.10.10';
    if (frase) {
      frase.classList.add('troca');
      window.setTimeout(function () {
        frase.textContent = LINHAS[idade] || (idade + ' 岁 · 又是一年');
        frase.classList.remove('troca');
      }, 160);
    }
    if (folha) { folha.classList.toggle('idade-marco', MARCOS.indexOf(idade) >= 0); }
    if (MARCOS.indexOf(idade) >= 0 && som !== false && idade !== valorAtual - NASC) {
      var c = centro(num);
      burst(c[0], c[1], 12 + idade / 2, true);
      petalas(c[0], c[1], idade >= 18 ? 12 : 7);
    }
    valorAtual = ano;
  }

  slider.addEventListener('input', function () {
    escreve(parseInt(slider.value, 10));
  });
  slider.addEventListener('change', function () {
    var idade = parseInt(slider.value, 10) - NASC;
    if (idade === 22) {
      var c = centro(num);
      sino(1318.5, 1.2);
      burst(c[0], c[1], 20, true);
      petalas(c[0], c[1], 16);
    }
  });

  /* 点大数字：回到今天 + 金爆 */
  num.addEventListener('click', function (e) {
    e.stopPropagation();
    slider.value = String(ULTIMO);
    escreve(ULTIMO);
    var c = centro(num);
    burst(c[0], c[1], 22, true);
    petalas(c[0], c[1], 14);
    sino(1046.5, 1.1);
    window.setTimeout(function () { sino(1568, 1.3); }, 120);
  });

  /* 进这一页时，从 0 一岁一岁数到今天 */
  var jaCorreu = false;
  function contar() {
    if (jaCorreu) return;
    jaCorreu = true;
    var atual = NASC;
    slider.value = String(NASC);
    escreve(NASC, false);
    var passo = window.setInterval(function () {
      atual += 1;
      slider.value = String(atual);
      escreve(atual, false);
      if (atual % 4 === 0) { sino(659.3, .18); }
      if (atual >= ULTIMO) {
        window.clearInterval(passo);
        slider.value = String(ULTIMO);
        escreve(ULTIMO, false);
        var c = centro(num);
        sino(1174.7, 1.4);
        burst(c[0], c[1], 18, true);
        petalas(c[0], c[1], 12);
      }
    }, 130);
  }

  if (window.MutationObserver) {
    var obs = new MutationObserver(function () {
      if (pagina.classList.contains('ativa')) { contar(); obs.disconnect(); }
    });
    obs.observe(pagina, { attributes: true, attributeFilter: ['class'] });
    if (pagina.classList.contains('ativa')) { contar(); obs.disconnect(); }
  }
})();
