/* =========================================================
   BLOG – Peruzzo & Schardosin
   Os artigos ficam em blog/artigos.js (veja as instruções no topo daquele arquivo).
   Funciona no servidor e também abrindo os arquivos direto no computador.
   ========================================================= */
(function () {
  'use strict';
  const t = s => (window.PS_t ? window.PS_t(s) : s);
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const RAIZ = document.documentElement.dataset.raiz || '';
  const CORES = {
    'Família e Sucessões': ['#C98A73', '#8E5444', 'casa'],
    'Previdenciário': ['#4A4544', '#2A2828', 'doc'],
    'Imobiliário e Rural': ['#F3D9CD', '#D9A18B', 'chave'],
    'Direito Civil': ['#5B5150', '#3A3434', 'balanca'],
    'Trabalhista': ['#D6A390', '#9A5644', 'pasta'],
    'Consumidor': ['#EBC0AD', '#C98A73', 'carrinho']
  };
  const ILU = {
    casa: '<g fill="none" stroke="#fff" stroke-width="1.6"><path d="M110 150V95l50-38 50 38v55z"/><path d="M146 150v-30h28v30"/></g><g fill="none" stroke="#F0C7B4" stroke-width="1.4" opacity=".3"><circle cx="60" cy="40" r="60"/><circle cx="270" cy="170" r="80"/></g>',
    doc: '<g fill="none" stroke="#fff" stroke-width="1.6"><rect x="118" y="40" width="84" height="110" rx="3"/><path d="M134 64h52M134 80h52M134 96h36"/><circle cx="182" cy="128" r="16" stroke="#F0C7B4"/><path d="M174 128l6 6 10-11" stroke="#F0C7B4"/></g>',
    chave: '<g fill="none" stroke="#3F3F3F" stroke-width="1.6"><circle cx="135" cy="100" r="22"/><circle cx="135" cy="100" r="8"/><path d="M157 100h60M197 100v16M210 100v12"/></g><g fill="none" stroke="#fff" stroke-opacity=".6"><path d="M20 180L80 130l60 50"/><path d="M220 60l50-40 50 40"/></g>',
    balanca: '<g fill="none" stroke="#fff" stroke-width="1.6"><path d="M160 40v120M120 160h80M110 70h100M110 70l-22 50h44zM210 70l-22 50h44z"/></g>',
    pasta: '<g fill="none" stroke="#fff" stroke-width="1.6"><rect x="105" y="70" width="110" height="80" rx="4"/><path d="M140 70V58a4 4 0 014-4h32a4 4 0 014 4v12M105 105h110"/></g>',
    carrinho: '<g fill="none" stroke="#3F3F3F" stroke-width="1.6"><path d="M100 60h18l18 70h70l16-50H128"/><circle cx="146" cy="150" r="7"/><circle cx="200" cy="150" r="7"/></g>'
  };
  function capa(p) {
    const [a, b, i] = CORES[p.categoria] || ['#585858', '#3F3F3F', 'balanca'];
    const id = 'g' + p.slug.replace(/[^a-z0-9]/gi, '');
    return `<svg class="ilu" aria-hidden="true" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="320" height="200" fill="url(#${id})"/><g class="mov">${ILU[i]}</g></svg>`;
  }
  const LOCALE = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' };
  function dataFmt(iso) {
    const l = (document.documentElement.lang || 'pt-BR').slice(0, 2);
    try { return new Date(iso + 'T12:00:00').toLocaleDateString(LOCALE[l] || 'pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return iso; }
  }
  function card(p, nivel) {
    const h = nivel || 'h3';
    return `<article class="card">
      <div class="capa">${capa(p)}<span>${esc(t(p.categoria))}</span></div>
      <div class="corpo"><${h}><a class="card-link" href="${RAIZ}blog/artigo.html#${esc(p.slug)}">${esc(p.titulo)}</a></${h}><p>${esc(p.resumo)}</p>
      <div class="meta"><span><time datetime="${esc(p.data)}">${esc(dataFmt(p.data))}</time> · ${esc(p.leitura)} ${esc(t('min de leitura'))}</span><span class="ler" aria-hidden="true">${esc(t('Ler'))} →</span></div></div>
    </article>`;
  }

  /* ---------- Markdown simples e seguro ---------- */
  function inline(s) {
    s = esc(s);
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, txt, url) => {
      const u = /^(https?:|mailto:|tel:|#|[\w./-]+\.html)/i.test(url) ? url : '#';
      const ext = /^https?:/i.test(u);
      return `<a href="${u}"${ext ? ' target="_blank" rel="noopener"' : ''}>${txt}${ext ? '<span class="sr-only"> (' + esc(t('abre em nova janela')) + ')</span>' : ''}</a>`;
    });
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
    return s;
  }
  function markdown(md) {
    const linhas = md.replace(/\r/g, '').split('\n');
    let out = '', lista = null, par = [];
    const fecharPar = () => { if (par.length) { out += `<p>${inline(par.join(' '))}</p>`; par = []; } };
    const fecharLista = () => { if (lista) { out += `</${lista}>`; lista = null; } };
    linhas.forEach(l => {
      let m;
      if (!l.trim()) { fecharPar(); fecharLista(); return; }
      if ((m = l.match(/^(#{2,4})\s+(.*)/))) { fecharPar(); fecharLista(); const n = m[1].length; const id = m[2].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); out += `<h${n} id="${id}">${inline(m[2])}</h${n}>`; return; }
      if ((m = l.match(/^>\s?(.*)/))) { fecharPar(); fecharLista(); out += `<blockquote><p>${inline(m[1])}</p></blockquote>`; return; }
      if ((m = l.match(/^[-*]\s+(.*)/))) { fecharPar(); if (lista !== 'ul') { fecharLista(); out += '<ul>'; lista = 'ul'; } out += `<li>${inline(m[1])}</li>`; return; }
      if ((m = l.match(/^\d+[.)]\s+(.*)/))) { fecharPar(); if (lista !== 'ol') { fecharLista(); out += '<ol>'; lista = 'ol'; } out += `<li>${inline(m[1])}</li>`; return; }
      fecharLista(); par.push(l.trim());
    });
    fecharPar(); fecharLista();
    return out;
  }

  let POSTS = null;
  function carregar() {
    if (!POSTS) {
      if (!Array.isArray(window.ARTIGOS)) return Promise.reject(new Error('artigos.js não carregado'));
      POSTS = window.ARTIGOS.slice().sort((a, b) => b.data.localeCompare(a.data));
    }
    return Promise.resolve(POSTS);
  }
  const erroHtml = () => `<p class="blog-erro">${esc(t('Não foi possível carregar os artigos agora. Tente novamente em instantes.'))}</p>`;

  /* ---------- Página inicial: 3 mais recentes ---------- */
  const home = $('#blogHome');
  if (home) {
    const r = () => carregar().then(ps => { home.innerHTML = ps.slice(0, 3).map(p => card(p, 'h3')).join(''); }).catch(() => { home.innerHTML = erroHtml(); });
    r(); document.addEventListener('ps:idioma', r);
  }

  /* ---------- Lista do blog ---------- */
  const lista = $('#blogLista');
  if (lista) {
    const busca = $('#blogBusca'), filtros = $('#blogFiltros'), contador = $('#blogContador');
    let cat = 'todas';
    const desenhar = () => carregar().then(ps => {
      const cats = ['todas'].concat([...new Set(ps.map(p => p.categoria))]);
      filtros.innerHTML = cats.map(c => `<button type="button" class="chip" aria-pressed="${c === cat}" data-cat="${esc(c)}">${esc(c === 'todas' ? t('Todos') : t(c))}</button>`).join('');
      const q = (busca.value || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      const res = ps.filter(p => (cat === 'todas' || p.categoria === cat) && (!q || norm(p.titulo + ' ' + p.resumo + ' ' + p.categoria).includes(q)));
      lista.innerHTML = res.length ? res.map(p => card(p, 'h2')).join('') : `<p class="blog-vazio">${esc(t('Nenhum artigo encontrado.'))}</p>`;
      contador.textContent = res.length === 1 ? t('1 artigo encontrado') : res.length + ' ' + t('artigos encontrados');
    }).catch(() => { lista.innerHTML = erroHtml(); });
    filtros.addEventListener('click', e => { const b = e.target.closest('[data-cat]'); if (b) { cat = b.dataset.cat; desenhar().then(() => { const n = filtros.querySelector(`[data-cat="${CSS.escape(cat)}"]`); if (n) n.focus(); }); } });
    let tm; busca.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(desenhar, 200); });
    $('#blogForm').addEventListener('submit', e => { e.preventDefault(); desenhar(); });
    desenhar(); document.addEventListener('ps:idioma', desenhar);
  }

  /* ---------- Artigo ---------- */
  const art = $('#artigo');
  if (art) {
    const abrir = () => {
      const slug = (location.hash || '').slice(1);
      carregar().then(ps => {
        const p = ps.find(x => x.slug === slug);
        if (!p) { art.innerHTML = `<div class="wrap doc"><h1>${esc(t('Artigo não encontrado'))}</h1><p><a href="${RAIZ}blog/index.html">${esc(t('Ver todos os artigos'))}</a></p></div>`; return; }
        return Promise.resolve(p.texto || '').then(md => {
          document.title = p.titulo + ' – Peruzzo & Schardosin';
          const md_ = document.querySelector('meta[name="description"]'); if (md_) md_.content = p.resumo;
          const url = location.href.split('#')[0] + '#' + p.slug;
          const u = encodeURIComponent(url), tt = encodeURIComponent(p.titulo);
          const outros = ps.filter(x => x.slug !== p.slug).slice(0, 2);
          art.innerHTML = `
          <section class="pagina-topo artigo-topo"><div class="wrap">
            <nav class="migalhas" aria-label="${esc(t('Você está em'))}"><a href="${RAIZ}index.html">${esc(t('Início'))}</a> <span aria-hidden="true">›</span> <a href="${RAIZ}blog/index.html">Blog</a> <span aria-hidden="true">›</span> <span aria-current="page">${esc(t(p.categoria))}</span></nav>
            <span class="eyebrow">${esc(t(p.categoria))}</span>
            <h1>${esc(p.titulo)}</h1>
            <p><span>${esc(t('Por'))} ${esc(p.autor)}</span> · <time datetime="${esc(p.data)}">${esc(dataFmt(p.data))}</time> · ${esc(p.leitura)} ${esc(t('min de leitura'))}</p>
          </div></section>
          <article class="doc artigo-corpo"><div class="wrap">
            ${document.documentElement.lang.slice(0, 2) !== 'pt' ? `<p class="aviso-idioma">${esc(t('Este artigo está disponível apenas em português.'))}</p>` : ''}
            <p class="artigo-lead">${esc(p.resumo)}</p>
            ${markdown(md)}
            <div class="compartilhar">
              <h2 class="h-peq">${esc(t('Compartilhe este artigo'))}</h2>
              <div class="comp-botoes">
                <a class="comp" href="https://wa.me/?text=${tt}%20${u}" target="_blank" rel="noopener">WhatsApp<span class="sr-only"> (${esc(t('abre em nova janela'))})</span></a>
                <a class="comp" href="https://www.linkedin.com/sharing/share-offsite/?url=${u}" target="_blank" rel="noopener">LinkedIn<span class="sr-only"> (${esc(t('abre em nova janela'))})</span></a>
                <a class="comp" href="https://www.facebook.com/sharer/sharer.php?u=${u}" target="_blank" rel="noopener">Facebook<span class="sr-only"> (${esc(t('abre em nova janela'))})</span></a>
                <button type="button" class="comp" id="copiarLink">${esc(t('Copiar link'))}</button>
              </div>
            </div>
            <div class="autor-box"><b>${esc(p.autor)}</b><span>Peruzzo & Schardosin Advogados Associados</span>
              <p>${esc(t('Ficou com dúvida sobre o seu caso?'))} <a href="${RAIZ}index.html#contato">${esc(t('Agende um atendimento'))}</a>.</p></div>
            ${outros.length ? `<h2>${esc(t('Leia também'))}</h2><div class="cards cards-2">${outros.map(o => card(o, 'h3')).join('')}</div>` : ''}
          </div></article>`;
          const cp = $('#copiarLink');
          if (cp) cp.addEventListener('click', () => {
            const ok = () => { cp.textContent = t('Link copiado'); setTimeout(() => { cp.textContent = t('Copiar link'); }, 2500); };
            try { navigator.clipboard.writeText(url).then(ok, () => { cp.textContent = url; }); } catch (e) { cp.textContent = url; }
          });
          const ld = document.getElementById('ldArtigo');
          if (ld) ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.titulo, description: p.resumo, datePublished: p.data, author: { '@type': 'Person', name: p.autor }, publisher: { '@type': 'Organization', name: 'Peruzzo & Schardosin Advogados Associados' }, inLanguage: 'pt-BR', mainEntityOfPage: url });
          const h1 = art.querySelector('h1'); if (h1 && abrir.foco) { h1.setAttribute('tabindex', '-1'); h1.focus(); }
          abrir.foco = true;
        });
      }).catch(() => { art.innerHTML = `<div class="wrap doc">${erroHtml()}</div>`; });
    };
    abrir(); window.addEventListener('hashchange', () => { window.scrollTo(0, 0); abrir(); });
    document.addEventListener('ps:idioma', () => { abrir.foco = false; abrir(); });
  }
})();
