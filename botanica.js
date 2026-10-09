/* =========================================================
   每页添一枝金线植物（Meowa 生成的素材，见 assets/bot-*.png）
   ========================================================= */
(function () {
  'use strict';

  /* 页序 : [素材, 位置class, 旋转角] */
  var DECOR = [
    ['ramo', 'bot-bl', -6],
    ['flor', 'bot-tr', 8],
    ['folha', 'bot-br', 4],
    ['borboleta', 'bot-tl', -10],
    ['samambaia', 'bot-bl', 6],
    ['ramo', 'bot-br', 186],
    ['flor', 'bot-tr', -12],
    ['folha', 'bot-bl', 3],
    ['samambaia', 'bot-tr', 165],
    ['flor', 'bot-br', -8],
    ['borboleta', 'bot-tl', 12],
    ['folha', 'bot-br', 2]
  ];

  /* 素材原始宽高比（切件时的尺寸），用来定高度 */
  var RATIO = {
    ramo: '317 / 460',
    folha: '331 / 460',
    flor: '460 / 440',
    borboleta: '397 / 460',
    samambaia: '460 / 332'
  };

  var paginas = document.querySelectorAll('.pagina');
  Array.prototype.forEach.call(paginas, function (p, i) {
    var d = DECOR[i];
    if (!d) { return; }
    var folha = p.querySelector('.folha');
    if (!folha || folha.querySelector('.botanica')) { return; }
    var el = document.createElement('i');
    el.className = 'botanica bot-' + d[0] + ' ' + d[1];
    el.setAttribute('aria-hidden', 'true');
    el.style.backgroundImage = 'url("assets/bot-' + d[0] + '.png")';
    el.style.setProperty('--rot', d[2] + 'deg');
    el.style.animationDelay = (i * 0.7).toFixed(2) + 's';
    el.style.aspectRatio = RATIO[d[0]] || '1 / 1';
    folha.appendChild(el);
  });
})();
