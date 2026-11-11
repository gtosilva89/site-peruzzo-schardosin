/* Páginas "Atendimento no exterior" e "Meus dados (LGPD)" */
(function () {
  'use strict';
  const t = s => (window.PS_t ? window.PS_t(s) : s);
  const $ = s => document.querySelector(s);

  /* Configuração do formulário LGPD:
     LGPD_EMAIL     e-mail do encarregado de dados (DPO)
     LGPD_WHATSAPP  número que recebe a solicitação (com DDI e DDD)
     LGPD_ENDPOINT  (opcional) URL da API do sistema que registra a solicitação (POST JSON) */
  const LGPD_EMAIL = '';           // ex.: 'privacidade@peruzzoschardosin.adv.br'
  const LGPD_WHATSAPP = '5546999101177';
  const LGPD_ENDPOINT = '';

  /* ---------- Relógios (exterior) ---------- */
  const hBr = $('#horaBr'), hLoc = $('#horaLocal');
  if (hBr && hLoc) {
    const fuso = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const tick = () => {
      const l = document.documentElement.lang || 'pt-BR', now = new Date();
      const f = tz => now.toLocaleTimeString(l, { hour: '2-digit', minute: '2-digit', timeZone: tz });
      hBr.textContent = f('America/Sao_Paulo');
      hLoc.textContent = f(undefined);
      $('#fusoLocal').textContent = fuso ? t('Seu fuso horário') + ': ' + fuso.replace(/_/g, ' ') : '';
    };
    tick(); setInterval(tick, 30000);
    document.addEventListener('ps:idioma', tick);
  }

  /* ---------- Formulário LGPD ---------- */
  const form = $('#formLgpd');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const erro = $('#lErro'), ok = $('#lOk');
      const obrig = [$('#lNome'), $('#lEmail')];
      let primeiro = null;
      obrig.forEach(c => { const inv = !c.value.trim() || (c.type === 'email' && !/^\S+@\S+\.\S+$/.test(c.value)); c.setAttribute('aria-invalid', String(inv)); if (inv && !primeiro) primeiro = c; });
      const tipo = form.querySelector('input[name="lTipo"]:checked');
      const radios = form.querySelectorAll('input[name="lTipo"]');
      radios.forEach(r => r.setAttribute('aria-invalid', String(!tipo)));
      if (!tipo && !primeiro) primeiro = radios[0];
      const decl = $('#lDecl'); decl.setAttribute('aria-invalid', String(!decl.checked)); if (!decl.checked && !primeiro) primeiro = decl;
      if (primeiro) { erro.textContent = t('Preencha os campos obrigatórios para enviar a solicitação.'); erro.hidden = false; ok.hidden = true; primeiro.focus(); return; }
      erro.hidden = true;
      const d = new Date(), pad = n => String(n).padStart(2, '0');
      const prot = 'LGPD-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
      const dados = { protocolo: prot, nome: $('#lNome').value, email: $('#lEmail').value, telefone: $('#lTel').value, relacao: $('#lRel').value, tipo: tipo.value, detalhes: $('#lDesc').value, data: d.toISOString() };
      const texto = `${t('Solicitação LGPD')}\n${t('Protocolo')}: ${prot}\n${t('Nome completo')}: ${dados.nome}\n${t('E-mail')}: ${dados.email}\n${t('Telefone')}: ${dados.telefone}\n${t('Relação')}: ${dados.relacao}\n${t('Tipo')}: ${dados.tipo}\n${t('Detalhes')}: ${dados.detalhes}`;
      const links = [];
      if (LGPD_EMAIL) links.push(`<a href="mailto:${LGPD_EMAIL}?subject=${encodeURIComponent(t('Solicitação LGPD') + ' ' + prot)}&body=${encodeURIComponent(texto)}">${t('Abrir o e-mail para enviar')}</a> (${LGPD_EMAIL})`);
      if (LGPD_WHATSAPP) links.push(`<a href="https://wa.me/${LGPD_WHATSAPP}?text=${encodeURIComponent(texto)}" target="_blank" rel="noopener">${t('Enviar pelo WhatsApp')}<span class="sr-only"> (${t('abre em nova janela')})</span></a>`);
      const mostrar = () => { ok.innerHTML = `<p><strong>${t('Solicitação registrada com o protocolo')} ${prot}.</strong> ${t('Guarde este número para acompanhar o pedido.')}</p><p>${links.join(' · ')}</p>`; ok.hidden = false; ok.focus(); };
      if (LGPD_ENDPOINT) {
        fetch(LGPD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) }).then(mostrar, mostrar);
      } else mostrar();
    });
  }
})();
