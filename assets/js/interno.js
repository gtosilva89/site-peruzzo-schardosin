/* Páginas internas: cabeçalho e menu móvel */
(function () {
  const topo = document.getElementById('topo');
  const onScroll = () => topo.classList.toggle('solid', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const menu = document.getElementById('menu'), burger = document.getElementById('burger');
  if (!burger) return;
  burger.addEventListener('click', () => { const a = menu.classList.toggle('aberto'); burger.setAttribute('aria-expanded', String(a)); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('aberto')) { menu.classList.remove('aberto'); burger.setAttribute('aria-expanded', 'false'); burger.focus(); } });
})();
