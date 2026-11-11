/* Peruzzo & Schardosin – página inicial */
(function () {
  'use strict';

  /* ===== CONFIGURAÇÃO =====
     Endereços do sistema (admin). Quando o sistema estiver publicado no servidor,
     preencha as URLs abaixo e os botões levarão direto para o login do sistema. */
  const SISTEMA = {
    cliente: '',   // ex.: 'https://sistema.peruzzoschardosin.adv.br/cliente'
    equipe: ''     // ex.: 'https://sistema.peruzzoschardosin.adv.br/login'
  };
  const ZAP_PADRAO = '5546999101177';  // WhatsApp do escritório

  const t = s => (window.PS_t ? window.PS_t(s) : s);
  const D = window.PS_dialogo;
  const $ = s => document.querySelector(s);

  /* Cabeçalho */
  const topo = $('#topo');
  const onScroll = () => topo.classList.toggle('solid', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* Menu móvel */
  const menu = $('#menu'), burger = $('#burger');
  const fecharMenu = () => { menu.classList.remove('aberto'); burger.setAttribute('aria-expanded', 'false'); };
  burger.addEventListener('click', () => {
    const aberto = menu.classList.toggle('aberto');
    burger.setAttribute('aria-expanded', String(aberto));
    if (aberto) { const l = menu.querySelector('a'); if (l) l.focus(); }
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', fecharMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('aberto')) { fecharMenu(); burger.focus(); } });

  /* Revelar ao rolar (quem chega por link com #seção vê tudo de imediato) */
  const els = document.querySelectorAll('.rev');
  if (location.hash) els.forEach(el => el.classList.add('vis'));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); } }), { threshold: 0.12 });
    els.forEach((el, i) => { el.style.transitionDelay = (i % 3) * 90 + 'ms'; io.observe(el); });
  } else els.forEach(el => el.classList.add('vis'));

  /* Áreas de atuação: no computador o cartão vira ao passar o mouse (CSS);
     em telas de toque, vira com um toque e volta com outro toque */
  const semMouse = window.matchMedia('(hover: none)');
  document.querySelectorAll('.area').forEach(card => {
    card.addEventListener('click', e => {
      if (!semMouse.matches || e.target.closest('a')) return;
      const virar = !card.classList.contains('virado');
      document.querySelectorAll('.area.virado').forEach(c => c.classList.remove('virado'));
      card.classList.toggle('virado', virar);
    });
    card.addEventListener('mouseleave', () => {
      if (semMouse.matches) return;
      card.classList.remove('virado');
      const ativo = document.activeElement;
      if (ativo && card.contains(ativo) && !ativo.matches(':focus-visible')) ativo.blur();
    });
  });

  /* WhatsApp flutuante */
  const zapBtn = $('#zapBtn'), zapMenu = $('#zapMenu');
  const fecharZap = () => { zapMenu.classList.remove('aberto'); zapBtn.setAttribute('aria-expanded', 'false'); };
  zapBtn.addEventListener('click', e => {
    e.stopPropagation();
    const ab = zapMenu.classList.toggle('aberto'); zapBtn.setAttribute('aria-expanded', String(ab));
    if (ab) zapMenu.querySelector('a').focus();
  });
  document.addEventListener('click', e => { if (!zapMenu.contains(e.target)) fecharZap(); });
  zapMenu.addEventListener('keydown', e => { if (e.key === 'Escape') { fecharZap(); zapBtn.focus(); } });

  /* ===== Horário de atendimento (CONFIRMAR com o escritório) =====
     0 = domingo ... 6 = sábado. Cada dia: lista de faixas ['HH:MM','HH:MM']. */
  const HORARIO = {
    1: [['08:00', '12:00'], ['13:30', '18:00']],
    2: [['08:00', '12:00'], ['13:30', '18:00']],
    3: [['08:00', '12:00'], ['13:30', '18:00']],
    4: [['08:00', '12:00'], ['13:30', '18:00']],
    5: [['08:00', '12:00'], ['13:30', '18:00']],
    6: [], 0: []
  };
  /* Opcional: URL da API do sistema que recebe agendamentos (POST JSON). Vazio = envia pelo WhatsApp. */
  const AGENDA_ENDPOINT = '';

  function agoraBrasilia() {
    const p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    const g = k => (p.find(x => x.type === k) || {}).value;
    const dias = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return { dia: dias[g('weekday')], min: (+g('hour') % 24) * 60 + +g('minute') };
  }
  const paraMin = h => { const [a, b] = h.split(':'); return +a * 60 + +b; };
  const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  function desenharHorario() {
    const st = $('#statusHorario'), ul = $('#listaHorario'); if (!st || !ul) return;
    const { dia, min } = agoraBrasilia();
    const hoje = HORARIO[dia] || [];
    const faixa = hoje.find(([a, b]) => min >= paraMin(a) && min < paraMin(b));
    if (faixa) { st.className = 'status-h aberto'; st.textContent = `${t('Aberto agora')} · ${t('Fecha às')} ${faixa[1]}`; }
    else {
      let prox = null;
      for (let i = 0; i < 8 && !prox; i++) {
        const d = (dia + i) % 7;
        const f = (HORARIO[d] || []).find(([a]) => i > 0 || paraMin(a) > min);
        if (f) prox = { i, d, h: f[0] };
      }
      st.className = 'status-h fechado';
      st.textContent = t('Fechado agora') + (prox ? ` · ${t('Abre')} ${prox.i === 0 ? t('hoje às') : prox.i === 1 ? t('amanhã às') : t(DIAS[prox.d]) + ' ' + t('às')} ${prox.h}` : '');
    }
    const fmt = fs => fs.length ? fs.map(f => f.join('–')).join(' · ') : t('Fechado');
    ul.innerHTML = `<li><span>${t('Segunda a sexta')}</span><span>${fmt(HORARIO[1])}</span></li><li><span>${t('Sábado e domingo')}</span><span>${fmt(HORARIO[6])}</span></li>`;
  }
  desenharHorario(); setInterval(desenharHorario, 60000);
  document.addEventListener('ps:idioma', desenharHorario);

  /* Data mínima = hoje */
  const dataPref = $('#dataPref');
  if (dataPref) { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); dataPref.min = d.toISOString().slice(0, 10); }

  /* Formulário de agendamento */
  const form = $('#fale');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const ok = $('#ok'), erro = $('#erroForm');
    const campos = ['nome', 'tel'].map(id => document.getElementById(id));
    let primeiroErro = null, msgErro = t('Preencha seu nome, seu WhatsApp e autorize o uso dos dados para continuar.');
    campos.forEach(c => { const inval = !c.value.trim(); c.setAttribute('aria-invalid', String(inval)); if (inval && !primeiroErro) primeiroErro = c; });
    const telEl = $('#tel'), digitos = telEl.value.replace(/\D/g, '');
    if (telEl.value.trim() && (digitos.length < 10 || digitos.length > 15)) {
      telEl.setAttribute('aria-invalid', 'true');
      if (!primeiroErro) { primeiroErro = telEl; msgErro = t('Informe um WhatsApp válido, com DDD (ou com o código do país, se morar no exterior).'); }
    }
    const emailEl = $('#email');
    if (emailEl.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailEl.value.trim())) {
      emailEl.setAttribute('aria-invalid', 'true');
      if (!primeiroErro) { primeiroErro = emailEl; msgErro = t('Confira o e-mail informado.'); }
    } else emailEl.removeAttribute('aria-invalid');
    const lgpd = $('#lgpd');
    if (!lgpd.checked) { lgpd.setAttribute('aria-invalid', 'true'); primeiroErro = primeiroErro || lgpd; } else lgpd.removeAttribute('aria-invalid');
    if (dataPref.value) {
      const dw = new Date(dataPref.value + 'T12:00:00').getDay();
      const inval = dw === 0 || dw === 6;
      dataPref.setAttribute('aria-invalid', String(inval));
      if (inval && !primeiroErro) { primeiroErro = dataPref; msgErro = t('Escolha um dia de segunda a sexta-feira.'); }
    }
    if (primeiroErro) { erro.textContent = msgErro; erro.hidden = false; ok.hidden = true; primeiroErro.focus(); return; }
    erro.hidden = true;
    const v = id => document.getElementById(id).value;
    const dataTxt = v('dataPref') ? new Date(v('dataPref') + 'T12:00:00').toLocaleDateString(document.documentElement.lang) : '-';
    const txt = `${t('Olá! Meu nome é')} ${v('nome')}.\n${t('Assunto')}: ${v('assunto')}\n${t('Forma de atendimento')}: ${v('ondeAt')}\n${t('Data')}: ${dataTxt} (${v('periodo')})\n${v('msg')}\n${t('Contato')}: ${v('tel')}${v('email') ? ' · ' + v('email') : ''}`;
    const url = `https://wa.me/${ZAP_PADRAO}?text=${encodeURIComponent(txt)}`;
    const mostrar = () => {
      ok.innerHTML = `${t('Mensagem pronta.')} <a href="${url}" target="_blank" rel="noopener">${t('Abrir o WhatsApp para enviar')}<span class="sr-only"> (${t('abre em nova janela')})</span></a>`;
      ok.hidden = false; ok.focus();
    };
    if (AGENDA_ENDPOINT) {
      fetch(AGENDA_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: v('nome'), telefone: v('tel'), email: v('email'), atendimento: v('ondeAt'), assunto: v('assunto'), data: v('dataPref'), periodo: v('periodo'), mensagem: v('msg'), origem: 'site' }) }).then(mostrar, mostrar);
    } else mostrar();
  });

  /* Mapa (carrega o Google Maps só quando a pessoa clica – LGPD) */
  const btnMapa = $('#carregarMapa');
  const URL_ROTA = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent('Rua Frei Vito Berscheid, 729, Saudade do Iguaçu - PR');
  if (btnMapa) btnMapa.addEventListener('click', () => {
    const box = $('#mapaFrame'), capa = $('#mapaCapa');
    const fr = document.createElement('iframe');
    fr.src = 'https://www.google.com/maps?q=' + encodeURIComponent('Rua Frei Vito Berscheid, 729, Saudade do Iguaçu - PR') + '&z=17&output=embed';
    fr.title = t('Mapa: localização do escritório em Saudade do Iguaçu');
    fr.loading = 'eager'; fr.referrerPolicy = 'no-referrer-when-downgrade'; fr.allowFullscreen = true;
    let falhou = false;
    const falha = () => {
      if (falhou) return; falhou = true;
      fr.remove(); capa.hidden = false;
      const cta = capa.querySelector('.mapa-cta');
      cta.innerHTML = `<h3>${t('Localização do escritório')}</h3><p>${t('O mapa não pôde ser exibido aqui. Abra a localização direto no Google Maps.')}</p><a class="btn btn-rose" href="${URL_ROTA}" target="_blank" rel="noopener">${t('Traçar rota no Google Maps')}<span class="sr-only"> (${t('abre em nova janela')})</span></a>`;
      const a = cta.querySelector('a'); if (a) a.focus();
    };
    /* navegadores avisam quando o conteúdo externo é bloqueado (ex.: na prévia do Claude) */
    const onCsp = e => { if (/google/.test(e.blockedURI || '') || e.violatedDirective.indexOf('frame') === 0) falha(); };
    document.addEventListener('securitypolicyviolation', onCsp);
    setTimeout(() => document.removeEventListener('securitypolicyviolation', onCsp), 8000);
    capa.hidden = true;
    box.appendChild(fr);
  });

  /* Vídeo de apresentação: preencha data-src (mp4), data-legenda (.vtt) e data-poster no #videoBox */
  const vb = $('#videoBox');
  if (vb && vb.dataset.src) {
    vb.innerHTML = `<video controls preload="none" ${vb.dataset.poster ? `poster="${vb.dataset.poster}"` : ''} aria-label="${t('Vídeo de apresentação do escritório')}"><source src="${vb.dataset.src}" type="video/mp4">${vb.dataset.legenda ? `<track kind="captions" src="${vb.dataset.legenda}" srclang="pt" label="Português" default>` : ''}</video>`;
  }

  /* Acesso ao sistema (login) */
  const modal = $('#modal');
  let aba = 'cliente';
  function setAba(a) {
    aba = a;
    modal.querySelectorAll('[data-aba]').forEach(b => { const s = b.dataset.aba === a; b.classList.toggle('on', s); b.setAttribute('aria-selected', String(s)); b.tabIndex = s ? 0 : -1; });
    $('#usrLbl').textContent = a === 'cliente' ? t('CPF ou e-mail') : t('E-mail corporativo');
    $('#info').textContent = a === 'cliente' ? t('Primeiro acesso? Solicite seu login ao escritório.') : t('Acesso restrito às advogadas e colaboradores.');
    $('#loginMsg').hidden = true;
  }
  document.querySelectorAll('[data-acesso]').forEach(b => b.addEventListener('click', e => {
    e.preventDefault(); fecharMenu();
    const tipo = b.dataset.acesso;
    if (SISTEMA[tipo]) { window.location.href = SISTEMA[tipo]; return; }
    setAba(tipo); D.abrir(modal); setTimeout(() => $('#usr').focus(), 30);
  }));
  const abas = Array.from(modal.querySelectorAll('[data-aba]'));
  abas.forEach(b => {
    b.addEventListener('click', () => setAba(b.dataset.aba));
    b.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const o = abas[(abas.indexOf(b) + 1) % 2]; setAba(o.dataset.aba); o.focus(); }
    });
  });
  $('#fechar').addEventListener('click', () => D.fechar(modal));
  modal.addEventListener('click', e => { if (e.target === modal) D.fechar(modal); });
  $('#login').addEventListener('submit', e => {
    e.preventDefault();
    const m = $('#loginMsg');
    m.textContent = t('Prévia do site: quando o site estiver no ar, este login levará ao sistema do escritório.');
    m.hidden = false;
  });
  document.addEventListener('ps:idioma', () => setAba(aba));
})();
