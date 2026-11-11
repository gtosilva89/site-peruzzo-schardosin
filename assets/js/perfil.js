/* Página de perfil de cada profissional: equipe/perfil.html#slug
   Os dados vêm de assets/js/equipe.js; os artigos, de blog/artigos.js. */
(function () {
  'use strict';
  const alvo = document.getElementById('perfil');
  if (!alvo || !window.PS_EQUIPE) return;
  const E = window.PS_EQUIPE, t = E.t, esc = E.esc, txt = E.txt;

  const ICO = {
    zap: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2z"/></svg>',
    mail: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    in: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 11-.01 5 2.5 2.5 0 01.01-5zM3 9h4v12H3zM10 9h3.8v1.7h.1a4.2 4.2 0 013.8-2c4 0 4.8 2.6 4.8 6V21h-4v-5.6c0-1.3 0-3-1.9-3s-2.2 1.5-2.2 2.9V21h-4z"/></svg>',
    cal: '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>'
  };
  const NJ = () => `<span class="sr-only"> (${esc(t('abre em nova janela'))})</span>`;
  const lista = arr => (arr || []).filter(Boolean);

  function render() {
    const slug = decodeURIComponent((location.hash || '').slice(1));
    const pessoas = window.EQUIPE || [];
    const p = pessoas.find(x => E.slugDe(x) === slug) || (slug ? null : pessoas[0]);
    if (!p) {
      alvo.innerHTML = `<section class="pagina-topo"><div class="wrap"><h1>${esc(t('Perfil não encontrado'))}</h1><p><a class="btn btn-rose" href="index.html">${esc(t('Ver toda a equipe'))}</a></p></div></section>`;
      return;
    }
    const nome1 = p.nome.split(' ')[0];
    document.title = `${p.nome} – Peruzzo & Schardosin`;
    const md = document.querySelector('meta[name="description"]');
    if (md) md.content = `${p.nome}, ${t(p.cargo)}${p.oab ? ' (' + p.oab + ')' : ''} no Peruzzo & Schardosin Advogados Associados.`;

    const contato = [];
    if (p.whatsapp) contato.push(`<a class="ctt" href="https://wa.me/${esc(p.whatsapp)}" target="_blank" rel="noopener">${ICO.zap}<span>WhatsApp ${esc(E.fmtZap(p.whatsapp))}</span>${NJ()}</a>`);
    if (p.email) contato.push(`<a class="ctt" href="mailto:${esc(p.email)}">${ICO.mail}<span>${esc(p.email)}</span></a>`);
    if (p.linkedin) contato.push(`<a class="ctt" href="${esc(p.linkedin)}" target="_blank" rel="noopener">${ICO.in}<span>LinkedIn</span>${NJ()}</a>`);

    const artigos = (window.ARTIGOS || []).filter(a => a.autor === p.nome).sort((a, b) => b.data.localeCompare(a.data));
    const outros = pessoas.filter(x => x !== p);
    const raiz = E.RAIZ();

    alvo.innerHTML = `
    <section class="perfil-topo">
      <div class="wrap perfil-topo-in">
        <div class="perfil-foto">${E.foto(p)}</div>
        <div class="perfil-id">
          <nav class="migalhas" aria-label="${esc(t('Você está em'))}"><a href="${raiz}index.html">${esc(t('Início'))}</a> <span aria-hidden="true">›</span> <a href="index.html">${esc(t('Nosso time'))}</a> <span aria-hidden="true">›</span> <span aria-current="page">${esc(p.nome)}</span></nav>
          <span class="eyebrow">${esc(t(p.cargo))}</span>
          <h1>${esc(p.nome)}</h1>
          <p class="perfil-meta">${[p.oab, p.unidade].filter(Boolean).map(esc).join(' · ')}</p>
          ${p.frase ? `<blockquote class="perfil-frase">${txt(p.frase)}</blockquote>` : ''}
          <div class="perfil-acoes">
            <a class="btn btn-rose" href="${raiz}index.html#contato">${ICO.cal}<span>${esc(t('Agendar atendimento'))}</span></a>
            ${p.whatsapp ? `<a class="btn btn-claro" href="https://wa.me/${esc(p.whatsapp)}" target="_blank" rel="noopener">${ICO.zap}<span>${esc(t('Falar com'))} ${esc(nome1)}</span>${NJ()}</a>` : ''}
          </div>
        </div>
      </div>
    </section>
    <section class="perfil-corpo">
      <div class="wrap perfil-grade">
        <div class="perfil-principal">
          <h2>${esc(t('Sobre'))}</h2>
          ${lista(p.sobre).map(s => `<p>${txt(s)}</p>`).join('') || (p.bio ? `<p>${esc(t(p.bio))}</p>` : '')}
          ${lista(p.areas).length ? `<h2>${esc(t('Áreas de atuação'))}</h2><ul class="perfil-areas" role="list">${lista(p.areas).map(a => `<li>${txt(a)}</li>`).join('')}</ul>` : ''}
        </div>
        <aside class="perfil-lado" aria-label="${esc(t('Informações profissionais'))}">
          ${lista(p.formacao).length ? `<div class="lado-bloco"><h2>${esc(t('Formação'))}</h2><ul role="list">${lista(p.formacao).map(f => `<li>${txt(f)}</li>`).join('')}</ul></div>` : ''}
          ${p.oab ? `<div class="lado-bloco"><h2>${esc(t('Registro profissional'))}</h2><p>${esc(p.oab)}</p></div>` : ''}
          ${lista(p.idiomas).length ? `<div class="lado-bloco"><h2>${esc(t('Idiomas'))}</h2><p>${lista(p.idiomas).map(i => txt(i)).join(' · ')}</p></div>` : ''}
          ${contato.length ? `<div class="lado-bloco"><h2>${esc(t('Contato'))}</h2>${contato.join('')}</div>` : ''}
        </aside>
      </div>
    </section>
    ${artigos.length ? `<section class="perfil-artigos"><div class="wrap"><h2>${esc(t('Artigos de'))} ${esc(nome1)}</h2><div class="cards">${artigos.slice(0, 3).map(a => `
      <article class="card"><div class="corpo"><span class="cat-mini">${esc(t(a.categoria))}</span><h3><a class="card-link" href="${raiz}blog/artigo.html#${esc(a.slug)}">${esc(a.titulo)}</a></h3><p>${esc(a.resumo)}</p><div class="meta"><span>${esc(a.leitura)} ${esc(t('min de leitura'))}</span><span class="ler" aria-hidden="true">${esc(t('Ler'))} →</span></div></div></article>`).join('')}</div></div></section>` : ''}
    ${outros.length ? `<section class="perfil-outros"><div class="wrap"><h2>${esc(t('Conheça também'))}</h2><ul class="outros-lista" role="list">${outros.map(o => `
      <li><a href="#${esc(E.slugDe(o))}"><span class="mini-foto">${E.foto(o)}</span><span><b>${esc(o.nome)}</b><small>${esc(t(o.cargo))}${o.oab ? ' · ' + esc(o.oab) : ''}</small></span></a></li>`).join('')}</ul>
      <p style="margin-top:28px"><a class="btn btn-linha" href="index.html">${esc(t('Ver toda a equipe'))}</a></p></div></section>` : ''}`;

    const ld = document.getElementById('ldPerfil');
    if (ld) ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Person', name: p.nome, jobTitle: t(p.cargo), worksFor: { '@type': 'LegalService', name: 'Peruzzo & Schardosin Advogados Associados' }, knowsAbout: lista(p.areas).filter(a => !/^\[/.test(a)), alumniOf: lista(p.formacao).filter(a => !/^\[/.test(a)), identifier: p.oab || undefined });
    if (render.foco) { const h1 = alvo.querySelector('h1'); if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus(); } }
    render.foco = true;
  }
  render();
  window.addEventListener('hashchange', () => { window.scrollTo(0, 0); render(); });
  document.addEventListener('ps:idioma', () => { render.foco = false; render(); });
})();
