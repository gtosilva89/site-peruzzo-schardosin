/* Peruzzo & Schardosin – acessibilidade, idioma e cookies (compartilhado por todas as páginas)
   Referências: WCAG 2.2 (W3C), nível AA, e eMAG 3.1 (atalhos Alt+1, Alt+2, Alt+3). */
(function () {
  'use strict';

  /* ---------- Armazenamento seguro ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem armazenamento */ } }
  };

  const html = document.documentElement;
  const body = document.body;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- Aviso rápido (role=status) ---------- */
  let avisoTimer;
  function avisar(msg) {
    const el = $('#avisoFlut'); if (!el) return;
    el.textContent = msg; el.hidden = false;
    clearTimeout(avisoTimer); avisoTimer = setTimeout(() => { el.hidden = true; }, 4200);
  }

  /* ---------- Idioma ---------- */
  const LANGS = { pt: 'pt-BR', en: 'en', es: 'es' };
  const NOMES = { pt: 'Português (Brasil)', en: 'English', es: 'Español' };
  const originais = new WeakMap();
  const attrOriginais = new WeakMap();
  let lang = store.get('ps_idioma', null);
  if (!lang) {
    const nav = (navigator.language || 'pt').slice(0, 2).toLowerCase();
    lang = LANGS[nav] ? nav : 'pt';
  }
  /* chaves normalizadas: o navegador escreve <br> e caminhos relativos à página */
  const norm = k => k.trim().replace(/<br\s*\/?>/g, '<br>').replace(/href="(?:\.\.\/)*(?:paginas\/)?([\w-]+\.html)"/g, 'href="$1"');
  const dic = {};
  function dicionario(l) {
    if (!dic[l] && window.I18N && window.I18N[l]) { dic[l] = {}; Object.keys(window.I18N[l]).forEach(k => { dic[l][norm(k)] = window.I18N[l][k]; }); }
    return dic[l];
  }
  function t(txt) {
    if (lang === 'pt') return txt;
    const d = dicionario(lang); if (!d) return txt;
    const k = norm(txt);
    if (d[k] === undefined) return txt;
    /* mantém os caminhos de link do texto original */
    const caminhos = (txt.match(/href="[^"]*"/g) || []);
    let i = 0;
    return d[k].replace(/href="[^"]*"/g, m => caminhos[i] !== undefined ? caminhos[i++] : m);
  }
  window.PS_t = t;
  function aplicarIdioma() {
    html.lang = LANGS[lang];
    $$('[data-i18n]').forEach(el => {
      if (!originais.has(el)) originais.set(el, el.innerHTML.trim());
      el.innerHTML = t(originais.get(el));
    });
    $$('[data-i18n-attr]').forEach(el => {
      if (!attrOriginais.has(el)) {
        const o = {};
        el.dataset.i18nAttr.split('|').forEach(a => { o[a] = el.getAttribute(a) || ''; });
        attrOriginais.set(el, o);
      }
      const o = attrOriginais.get(el);
      Object.keys(o).forEach(a => el.setAttribute(a, t(o[a])));
    });
    if (!html.dataset.tituloPt) html.dataset.tituloPt = document.title;
    document.title = t(html.dataset.tituloPt);
    const md = $('meta[name="description"]');
    if (md) { if (!md.dataset.pt) md.dataset.pt = md.content; md.content = t(md.dataset.pt); }
    const btn = $('#btnIdioma');
    if (btn) {
      const opc = $(`#listaIdioma [data-lang="${lang}"] svg`);
      if (opc) $('.flag-atual', btn).innerHTML = opc.outerHTML;
      btn.setAttribute('aria-label', t('Idioma') + ': ' + NOMES[lang]);
      $$('#listaIdioma [data-lang]').forEach(b => b.setAttribute('aria-current', b.dataset.lang === lang ? 'true' : 'false'));
    }
    const aviso = $('#avisoIdioma');
    if (aviso) aviso.hidden = lang === 'pt';
    document.dispatchEvent(new CustomEvent('ps:idioma', { detail: lang }));
  }
  function trocarIdioma(l) { lang = l; store.set('ps_idioma', l); aplicarIdioma(); avisar(t('Idioma alterado para') + ' ' + NOMES[l]); }

  const btnIdioma = $('#btnIdioma'), lista = $('#listaIdioma');
  if (btnIdioma && lista) {
    const fechar = (foco) => { lista.hidden = true; btnIdioma.setAttribute('aria-expanded', 'false'); if (foco) btnIdioma.focus(); };
    btnIdioma.addEventListener('click', e => {
      e.stopPropagation();
      const abrir = lista.hidden; lista.hidden = !abrir; btnIdioma.setAttribute('aria-expanded', String(abrir));
      if (abrir) ($(`[data-lang="${lang}"]`, lista) || $('button', lista)).focus();
    });
    lista.addEventListener('click', e => { const b = e.target.closest('[data-lang]'); if (b) { trocarIdioma(b.dataset.lang); fechar(true); } });
    lista.addEventListener('keydown', e => {
      const bs = $$('button', lista), i = bs.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); bs[(i + 1) % bs.length].focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); bs[(i - 1 + bs.length) % bs.length].focus(); }
      if (e.key === 'Escape') fechar(true);
      if (e.key === 'Tab') fechar(false);
    });
    document.addEventListener('click', e => { if (!lista.hidden && !lista.contains(e.target)) fechar(false); });
  }

  /* ---------- Preferências de acessibilidade ---------- */
  const PADRAO = { fonte: 100, contraste: false, links: false, espaco: false, legivel: false, semanim: false, cursor: false };
  const pref = Object.assign({}, PADRAO, store.get('ps_a11y', {}));
  const CLASSES = { contraste: 'a11y-contraste', links: 'a11y-links', espaco: 'a11y-espaco', legivel: 'a11y-legivel', semanim: 'a11y-semanim', cursor: 'a11y-cursor' };
  function aplicarA11y() {
    html.style.fontSize = pref.fonte + '%';
    Object.keys(CLASSES).forEach(k => html.classList.toggle(CLASSES[k], !!pref[k]));
    $$('[data-opc]').forEach(b => b.setAttribute('aria-pressed', String(!!pref[b.dataset.opc])));
    const bc = $('#btnContraste'); if (bc) bc.setAttribute('aria-pressed', String(pref.contraste));
    const out = $('#fontePct'); if (out) out.textContent = pref.fonte + '%';
    store.set('ps_a11y', pref);
  }
  function fonte(d) {
    const novo = Math.min(160, Math.max(90, pref.fonte + d * 10));
    if (novo === pref.fonte) { avisar(d > 0 ? t('Tamanho máximo do texto') : t('Tamanho mínimo do texto')); return; }
    pref.fonte = novo; aplicarA11y(); avisar(t('Tamanho do texto') + ': ' + novo + '%');
  }
  function alternar(k) { pref[k] = !pref[k]; aplicarA11y(); }

  const on = (s, ev, fn) => { const el = $(s); if (el) el.addEventListener(ev, fn); };
  on('#btnMais', 'click', () => fonte(1));
  on('#btnMenos', 'click', () => fonte(-1));
  on('#btnContraste', 'click', () => { alternar('contraste'); avisar(pref.contraste ? t('Alto contraste ativado') : t('Alto contraste desativado')); });
  $$('[data-fonte]').forEach(b => b.addEventListener('click', () => fonte(+b.dataset.fonte)));
  $$('[data-opc]').forEach(b => b.addEventListener('click', () => alternar(b.dataset.opc)));
  on('#a11yReset', 'click', () => { Object.assign(pref, PADRAO); aplicarA11y(); avisar(t('Preferências restauradas')); });

  /* ---------- Diálogos acessíveis (foco preso e devolvido) ---------- */
  const FOCAVEIS = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
  let ultimoFoco = null, dialogoAtual = null;
  function abrirDialogo(el, fundo) {
    ultimoFoco = document.activeElement; dialogoAtual = el;
    if (fundo) fundo.hidden = false;
    el.hidden = false; el.classList.add('aberto');
    body.classList.add('sem-rolagem');
    const f = $$(FOCAVEIS, el).filter(x => x.offsetParent !== null);
    (f[0] || el).focus();
  }
  function fecharDialogo(el, fundo) {
    el.classList.remove('aberto');
    if (el.classList.contains('painel-a11y')) el.hidden = true;
    if (fundo) fundo.hidden = true;
    body.classList.remove('sem-rolagem');
    dialogoAtual = null;
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
  }
  window.PS_dialogo = { abrir: abrirDialogo, fechar: fecharDialogo };
  document.addEventListener('keydown', e => {
    if (!dialogoAtual) return;
    if (e.key === 'Escape') { e.preventDefault(); fecharDialogo(dialogoAtual, dialogoAtual.id === 'painelA11y' ? $('#painelFundo') : null); return; }
    if (e.key === 'Tab') {
      const f = $$(FOCAVEIS, dialogoAtual).filter(x => x.offsetParent !== null);
      if (!f.length) return;
      const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });

  const painel = $('#painelA11y'), painelFundo = $('#painelFundo');
  const abrirPainel = () => painel && abrirDialogo(painel, painelFundo);
  on('#btnA11y', 'click', abrirPainel);
  on('#painelFechar', 'click', () => fecharDialogo(painel, painelFundo));
  if (painelFundo) painelFundo.addEventListener('click', () => fecharDialogo(painel, painelFundo));

  /* ---------- Atalhos de teclado (padrão eMAG) ---------- */
  function destacar(el) {
    el.classList.add('alvo-atalho');
    setTimeout(() => el.classList.remove('alvo-atalho'), 1800);
  }
  function irPara(id) {
    const comportamento = pref.semanim || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    if (id === 'menu') {
      const menu = document.getElementById('menu'), burger = document.getElementById('burger');
      if (!menu) return;
      window.scrollTo({ top: 0, behavior: comportamento });
      const movel = burger && getComputedStyle(burger).display !== 'none';
      if (movel && !menu.classList.contains('aberto')) burger.click();
      setTimeout(() => {
        const primeiro = menu.querySelector('a, button');
        if (primeiro) primeiro.focus({ preventScroll: true });
        destacar(menu);
      }, movel ? 350 : 60);
      return;
    }
    const el = document.getElementById(id); if (!el) return;
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    const topo = document.getElementById('topo');
    const alturaTopo = topo ? topo.getBoundingClientRect().height : 0;
    let y = el.getBoundingClientRect().top + window.scrollY - alturaTopo;
    if (id === 'conteudo') {
      /* pula o cabeçalho: leva ao primeiro bloco de conteúdo abaixo da abertura */
      const primeiro = el.querySelector('h1');
      if (primeiro) y = Math.max(0, primeiro.getBoundingClientRect().top + window.scrollY - alturaTopo - 40);
    }
    window.scrollTo({ top: Math.max(0, y), behavior: comportamento });
    el.focus({ preventScroll: true });
    destacar(id === 'conteudo' ? (el.querySelector('h1') || el) : el);
  }
  $$('.atalhos a').forEach(a => a.addEventListener('click', e => { e.preventDefault(); irPara(a.getAttribute('href').slice(1)); }));
  document.addEventListener('keydown', e => {
    if (!e.altKey || e.ctrlKey || e.metaKey) return;
    const mapa = { '1': 'conteudo', '2': 'menu', '3': 'rodape' };
    if (mapa[e.key]) { e.preventDefault(); irPara(mapa[e.key]); }
    if (e.key === '4') { e.preventDefault(); abrirPainel(); }
  });

  /* ---------- VLibras (gov.br) ---------- */
  let vlibrasEstado = 'nao';
  function carregarVLibras(abrir) {
    if (vlibrasEstado === 'ok') { clicarVLibras(); return; }
    if (vlibrasEstado === 'carregando') return;
    vlibrasEstado = 'carregando';
    const s = document.createElement('script');
    s.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    s.onload = () => {
      try { new window.VLibras.Widget('https://vlibras.gov.br/app'); vlibrasEstado = 'ok';
        if (abrir) setTimeout(clicarVLibras, 900);
      } catch (err) { vlibrasEstado = 'erro'; avisoVLibras(); }
    };
    s.onerror = () => { vlibrasEstado = 'erro'; avisoVLibras(); };
    document.head.appendChild(s);
  }
  function clicarVLibras() { const b = document.querySelector('[vw-access-button]'); if (b) b.click(); }
  function avisoVLibras() { vlibrasEstado = 'nao'; avisar(t('Não foi possível carregar o VLibras agora. Ele funciona no site publicado, com conexão à internet.')); }
  on('#btnLibras', 'click', () => carregarVLibras(true));
  if (store.get('ps_vlibras', false)) carregarVLibras(false);
  on('#btnLibras', 'click', () => store.set('ps_vlibras', true));

  /* ---------- Cookies (LGPD) ---------- */
  const VERSAO_COOKIES = 1;
  const banner = $('#cookieBanner'), modalCk = $('#modalCookies');
  let consent = store.get('ps_consentimento', null);
  if (consent && consent.v !== VERSAO_COOKIES) consent = null;
  function salvarConsent(analise, marketing) {
    consent = { v: VERSAO_COOKIES, necessarios: true, analise: !!analise, marketing: !!marketing, data: new Date().toISOString() };
    store.set('ps_consentimento', consent);
    if (banner) banner.hidden = true;
    html.classList.remove('tem-banner');
    if (modalCk && modalCk.classList.contains('aberto')) fecharDialogo(modalCk);
    ativarScripts();
    avisar(t('Preferências de cookies salvas'));
  }
  function abrirPrefCookies() {
    if (!modalCk) return;
    $('#ckAnalise').checked = !!(consent && consent.analise);
    $('#ckMarketing').checked = !!(consent && consent.marketing);
    abrirDialogo(modalCk);
  }
  window.PS_cookies = { abrir: abrirPrefCookies, consentimento: () => consent };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-cookie]'); if (!b) return;
    e.preventDefault();
    const a = b.dataset.cookie;
    if (a === 'todos') salvarConsent(true, true);
    if (a === 'necessarios') salvarConsent(false, false);
    if (a === 'personalizar' || a === 'abrir') abrirPrefCookies();
    if (a === 'salvar') salvarConsent($('#ckAnalise').checked, $('#ckMarketing').checked);
  });
  if (modalCk) {
    modalCk.addEventListener('click', e => { if (e.target === modalCk || e.target.closest('[data-fechar]')) fecharDialogo(modalCk); });
  }
  /* ===== ESTATÍSTICAS (opcional) – só carregam se o visitante aceitar "Análise" =====
     Preencha UMA das opções:
       PLAUSIBLE_DOMINIO: ex.: 'peruzzoschardosin.adv.br' (Plausible, sem cookies)
       GA4_ID:            ex.: 'G-XXXXXXXXXX' (Google Analytics 4, IP anonimizado) */
  const ESTATISTICAS = { PLAUSIBLE_DOMINIO: '', GA4_ID: '' };
  let estatAtivas = false;
  function ativarScripts() {
    if (!consent || !consent.analise || estatAtivas) return;
    estatAtivas = true;
    if (ESTATISTICAS.PLAUSIBLE_DOMINIO) {
      const s = document.createElement('script'); s.defer = true;
      s.dataset.domain = ESTATISTICAS.PLAUSIBLE_DOMINIO; s.src = 'https://plausible.io/js/script.js';
      document.head.appendChild(s);
    } else if (ESTATISTICAS.GA4_ID) {
      const s = document.createElement('script'); s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ESTATISTICAS.GA4_ID; document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', ESTATISTICAS.GA4_ID, { anonymize_ip: true });
    }
  }
  if (banner) { if (!consent) { banner.hidden = false; html.classList.add('tem-banner'); } else ativarScripts(); }

  /* ---------- Início ---------- */
  aplicarA11y();
  aplicarIdioma();
  const ano = $('#ano'); if (ano) ano.textContent = new Date().getFullYear();
})();
