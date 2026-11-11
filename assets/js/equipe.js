/* =========================================================
   EQUIPE – edite esta lista para incluir, alterar ou remover pessoas.
   Cada pessoa ganha automaticamente uma página de perfil:
   equipe/perfil.html#slug

   Campos:
     slug       Endereço do perfil (sem acentos e espaços). Ex.: 'andressa-zatt-peruzzo'
     nome       Nome completo
     cargo      Ex.: "Sócia fundadora", "Advogada", "Secretária", "Estagiária"
     grupo      "socias" | "advogados" | "apoio"
     oab        Ex.: "OAB/PR 74.659" ('' se não tiver)
     unidade    Ex.: "Saudade do Iguaçu – PR"
     foto       Ex.: 'assets/img/equipe/andressa.jpg' ('' mostra as iniciais)
     whatsapp   Só números com DDI e DDD. Ex.: '5546999240790'
     email      E-mail profissional (opcional)
     linkedin   Endereço completo do LinkedIn (opcional)
     bio        Uma ou duas frases (aparece no cartão da página inicial)
     sobre      Lista de parágrafos para a página de perfil
     areas      Lista de áreas de atuação
     formacao   Lista de formações (graduação, pós, cursos)
     idiomas    Lista de idiomas
     frase      Frase de destaque no perfil (opcional)

   Textos entre colchetes [assim] aparecem destacados em amarelo como
   "a preencher". Substitua pelos dados reais antes de publicar.
   ========================================================= */
window.EQUIPE = [
  {
    slug: 'andressa-zatt-peruzzo',
    nome: 'Andressa Zatt Peruzzo',
    cargo: 'Sócia fundadora',
    grupo: 'socias',
    oab: 'OAB/PR 74.659',
    unidade: 'Saudade do Iguaçu – PR',
    foto: '',
    whatsapp: '5546999240790',
    email: '',
    linkedin: '',
    bio: 'Atendimento personalizado e acompanhamento próximo de cada cliente.',
    sobre: [
      'Advogada e sócia fundadora do Peruzzo & Schardosin Advogados Associados. Atende cada cliente de forma personalizada, com explicações claras sobre caminhos, prazos e riscos.',
      '[Complementar com a trajetória profissional: ano de início na advocacia, experiências anteriores e o que a motiva no dia a dia.]'
    ],
    areas: ['[Áreas em que atua – ex.: Família e Sucessões]', '[Outra área]'],
    formacao: ['[Graduação em Direito – instituição e ano]', '[Pós-graduação ou especialização – área e instituição]'],
    idiomas: ['Português'],
    frase: ''
  },
  {
    slug: 'nayara-schardosin',
    nome: 'Nayara Schardosin',
    cargo: 'Sócia fundadora',
    grupo: 'socias',
    oab: 'OAB/PR 85.895',
    unidade: 'Saudade do Iguaçu – PR',
    foto: '',
    whatsapp: '5546999225986',
    email: '',
    linkedin: '',
    bio: 'Atuação dedicada, com foco em soluções claras e seguras.',
    sobre: [
      'Advogada e sócia fundadora do Peruzzo & Schardosin Advogados Associados, com atuação dedicada e foco em soluções claras e seguras para cada cliente.',
      '[Complementar com a trajetória profissional: ano de início na advocacia, experiências anteriores e o que a motiva no dia a dia.]'
    ],
    areas: ['[Áreas em que atua – ex.: Previdenciário]', '[Outra área]'],
    formacao: ['[Graduação em Direito – instituição e ano]', '[Pós-graduação ou especialização – área e instituição]'],
    idiomas: ['Português'],
    frase: ''
  },
  {
    slug: 'renata-zatt-peruzzo',
    nome: 'Renata Zatt Peruzzo',
    cargo: 'Advogada',
    grupo: 'advogados',
    oab: 'OAB/PR 133.290',
    unidade: '',
    foto: '',
    whatsapp: '',
    email: '',
    linkedin: '',
    bio: '',
    sobre: [
      'Advogada do Peruzzo & Schardosin Advogados Associados.',
      '[Complementar com a trajetória profissional e as áreas de interesse.]'
    ],
    areas: ['[Áreas em que atua]'],
    formacao: ['[Graduação em Direito – instituição e ano]'],
    idiomas: ['Português'],
    frase: ''
  }
  /* Exemplo de colaborador da equipe de apoio:
  ,{
    slug: 'nome-sobrenome', nome: 'Nome Sobrenome', cargo: 'Secretária', grupo: 'apoio',
    oab: '', unidade: 'Saudade do Iguaçu – PR', foto: '', whatsapp: '', email: '', linkedin: '',
    bio: 'Agenda de atendimentos e recebimento de documentos.',
    sobre: ['Responsável pela agenda de atendimentos e pelo recebimento de documentos.'],
    areas: [], formacao: [], idiomas: ['Português'], frase: ''
  }
  */
];

/* ---------- utilidades compartilhadas (cartões e perfil) ---------- */
window.PS_EQUIPE = (function () {
  'use strict';
  const t = s => (window.PS_t ? window.PS_t(s) : s);
  const RAIZ = () => document.documentElement.dataset.raiz || '';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  /* texto entre [colchetes] = a preencher */
  const txt = s => { const e = esc(t(s)); return /^\[.*\]$/.test(String(s).trim()) ? `<mark class="pendente">${e}</mark>` : e; };
  const slugDe = p => p.slug || p.nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const iniciais = n => { const ps = n.split(/\s+/).filter(p => p.length > 2); return ((ps[0] || n)[0] + (ps.length > 1 ? ps[ps.length - 1][0] : '')).toUpperCase(); };
  const fmtZap = z => { const d = String(z).replace(/\D/g, '').replace(/^55/, ''); return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : z; };
  const foto = (p, cls) => p.foto
    ? `<img class="${cls || ''}" src="${esc(RAIZ() + p.foto)}" alt="${esc(t('Foto de') + ' ' + p.nome)}" loading="lazy">`
    : `<span class="ini" aria-hidden="true">${esc(iniciais(p.nome))}</span>`;
  const perfilUrl = p => `${RAIZ()}equipe/perfil.html#${slugDe(p)}`;
  const GRUPOS = [['socias', 'Sócias'], ['advogados', 'Advogadas e advogados'], ['apoio', 'Equipe de apoio']];

  function cartoes(alvo, nivel) {
    const h4 = nivel || 'h4';
    const hg = h4 === 'h3' ? 'h2' : 'h3';
    let h = '';
    GRUPOS.forEach(([g, titulo]) => {
      const lista = window.EQUIPE.filter(p => p.grupo === g);
      if (!lista.length) return;
      h += `<${hg} class="equipe-grupo">${esc(t(titulo))}</${hg}><ul class="pessoas pessoas-${lista.length > 2 ? 'muitas' : 'poucas'}" role="list">`;
      lista.forEach(p => {
        h += `<li class="pessoa">
          <div class="foto">${foto(p)}</div>
          <${h4}><a class="pessoa-link" href="${perfilUrl(p)}">${esc(p.nome)}</a></${h4}>
          <div class="cargo">${esc(t(p.cargo))}</div>
          ${p.oab ? `<div class="oab">${esc(p.oab)}</div>` : ''}
          ${p.unidade ? `<div class="unid">${esc(p.unidade)}</div>` : ''}
          ${p.bio ? `<p>${esc(t(p.bio))}</p>` : ''}
          <span class="ver-perfil" aria-hidden="true">${esc(t('Ver perfil'))} →</span>
        </li>`;
      });
      h += '</ul>';
    });
    alvo.innerHTML = h;
  }
  return { t, esc, txt, slugDe, iniciais, fmtZap, foto, perfilUrl, cartoes, RAIZ };
})();

/* Página inicial e página da equipe: cartões */
(function () {
  const alvo = document.getElementById('equipeGrade');
  if (!alvo) return;
  const r = () => window.PS_EQUIPE.cartoes(alvo, alvo.dataset.nivel || 'h4');
  r(); document.addEventListener('ps:idioma', r);
})();
