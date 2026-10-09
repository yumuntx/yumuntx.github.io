/* =========================================================
   自适应：窗口矮时整页等比缩小
   —— 只缩到 78%（再缩按钮就太难点），还不够就让信纸内部滚动
   —— 绝不重置 transform，避免点击瞬间元素位移
   ========================================================= */
(function () {
  'use strict';

  var MIN = 0.93;   /* 只允许微缩；再小就改成信纸内部滚动，免得信纸缩得和四角金饰脱开 */
  var FOLGA = 1.02;
  var cache = new WeakMap();

  function alturaConteudo(folha) {
    var top = Infinity, bot = -Infinity;
    Array.prototype.forEach.call(folha.children, function (k) {
      var st = window.getComputedStyle(k);
      if (st.display === 'none' || st.visibility === 'hidden') { return; }
      if (st.position === 'absolute') { return; }
      var r = k.getBoundingClientRect();
      if (r.width < 1 && r.height < 1) { return; }
      if (r.top < top) { top = r.top; }
      if (r.bottom > bot) { bot = r.bottom; }
    });
    if (!isFinite(top)) { return 0; }
    return bot - top;
  }

  function ajusta() {
    var folha = document.querySelector('.pagina.ativa .folha');
    if (!folha) { return; }
    var k = cache.get(folha) || 1;
    var caixa = folha.getBoundingClientRect();
    var conteudo = alturaConteudo(folha) / k;
    if (conteudo < 1 || caixa.height < 1) { return; }
    var pad = parseFloat(window.getComputedStyle(folha).paddingTop) || 0;
    var disponivel = (caixa.height / k) - pad * 2;
    var novo = disponivel * FOLGA / conteudo;
    novo = novo >= 0.985 ? 1 : Math.max(MIN, novo);

    if (Math.abs(novo - k) > 0.015) {
      folha.style.transformOrigin = 'center center';
      folha.style.transform = novo === 1 ? '' : 'scale(' + novo.toFixed(4) + ')';
      cache.set(folha, novo);
    }
    /* 缩到下限还放不下：让信纸内部可以滚动，别把内容藏掉 */
    var precisa = conteudo * novo > disponivel * novo + 2;
    if (novo <= MIN + 0.001 && precisa) {
      folha.style.overflowY = 'auto';
      folha.style.overflowX = 'hidden';
      folha.style.paddingRight = '10px';
      folha.style.scrollbarWidth = 'thin';
      /* 关键：滚动时改成顶端对齐，否则居中内容会顶部被裁掉又滚不上去 */
      folha.style.justifyContent = 'flex-start';
    } else {
      folha.style.overflowY = '';
      folha.style.paddingRight = '';
      folha.style.justifyContent = '';
    }
  }

  var t = null;
  function agenda() {
    if (t) { window.clearTimeout(t); }
    t = window.setTimeout(ajusta, 320);
  }

  window.addEventListener('resize', agenda);
  window.addEventListener('orientationchange', agenda);
  window.addEventListener('load', function () { window.setTimeout(ajusta, 600); });

  if (window.MutationObserver) {
    var obs = new MutationObserver(agenda);
    Array.prototype.forEach.call(document.querySelectorAll('.pagina'), function (p) {
      obs.observe(p, { attributes: true, attributeFilter: ['class'] });
    });
  }
})();
