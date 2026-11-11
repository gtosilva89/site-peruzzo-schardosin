# Site Peruzzo & Schardosin Advogados Associados

Site institucional do escritório **Peruzzo & Schardosin Advogados Associados**, com atendimento presencial em Saudade do Iguaçu (PR) e Itajaí (SC), on-line em todo o Brasil e no exterior.

**Prévia:** https://gtosilva89.github.io/site-peruzzo-schardosin/

## Recursos
- Páginas: início, equipe e perfis, blog, atendimento no exterior, política de privacidade, cookies, termos, acessibilidade, "Meus dados" (LGPD) e página de erro 404
- Português, inglês e espanhol
- Acessibilidade WCAG 2.2 AA e eMAG: atalhos de teclado, VLibras, alto contraste, ajuste de texto e painel de recursos
- Aviso de cookies (LGPD) com preferências por categoria
- Agendamento pelo WhatsApp, mapa com "Como chegar", horário de atendimento e nota do Google
- HTML, CSS e JavaScript puros, sem dependências nem etapa de build

## Rodar no computador
Abra o `index.html` direto no navegador ou, para simular o servidor:
```bash
python -m http.server 8000
```
e acesse http://localhost:8000


## Estrutura de pastas
```
index.html              Página inicial (português, inglês e espanhol)
404.html                Página de erro
robots.txt  sitemap.xml  site.webmanifest
paginas/                exterior, privacidade, cookies, termos, acessibilidade, meus-dados
equipe/
  index.html            Página com toda a equipe
  perfil.html           Perfil de cada profissional (perfil.html#slug)
blog/
  index.html            Lista de artigos (busca e filtros)
  artigo.html           Página do artigo (artigo.html#nome-do-artigo)
  artigos.js            TEXTOS DOS ARTIGOS – é aqui que se publica
assets/
  css/site.css          Todo o visual
  js/acessibilidade.js  Barra de acessibilidade, VLibras, idioma, cookies, estatísticas
  js/i18n.js            Traduções (inglês e espanhol)
  js/main.js            Página inicial: menu, horário, agendamento, mapa, login
  js/equipe.js          LISTA DA EQUIPE
  js/blog.js            Motor do blog
  js/paginas.js         Páginas Exterior e Meus dados
  js/interno.js         Menu das páginas internas
  img/marca/            Logos (horizontal e vertical; branco, grafite, rose)
  img/icones/           Ícones do navegador e do celular
  img/social/           Imagem de compartilhamento (1200 x 630)
  img/equipe/           Fotos da equipe
servidor/nginx-site.conf
```
O site funciona tanto no servidor quanto abrindo o `index.html` direto no computador.

## Antes de publicar
1. **Domínio:** troque `www.peruzzoschardosin.adv.br` pelo domínio real em todos os `.html`, `robots.txt` e `sitemap.xml`.
2. **Sistema:** em `assets/js/main.js`, preencha `SISTEMA.cliente` e `SISTEMA.equipe` com os endereços de login do sistema.
3. **Itens em amarelo** nas páginas institucionais (`<mark class="pendente">`): CNPJ, e-mail, encarregado de dados (DPO), comarca, prazos e acessibilidade física das salas.
4. **Áreas de atuação, textos das advogadas e artigos:** confirme com o escritório.
5. **Fotos da equipe:** coloque em `assets/img/equipe/` e informe o caminho em `assets/js/equipe.js`.

## Configurações rápidas
| O quê | Onde |
|---|---|
| Endereços do sistema (login) | `assets/js/main.js` → `SISTEMA` |
| Horário de atendimento | `assets/js/main.js` → `HORARIO` (confirmar com o escritório) |
| API de agendamento (opcional) | `assets/js/main.js` → `AGENDA_ENDPOINT` |
| Vídeo de apresentação | `index.html` → `#videoBox` (`data-src`, `data-legenda` .vtt, `data-poster`) |
| E-mail e API das solicitações LGPD | `assets/js/paginas.js` → `LGPD_EMAIL`, `LGPD_ENDPOINT` |
| Estatísticas (Plausible ou GA4) | `assets/js/acessibilidade.js` → `ESTATISTICAS` |
| Equipe e perfis (resumo, áreas, formação, idiomas, contato) | `assets/js/equipe.js` → `window.EQUIPE` |

## Publicar um artigo no blog
1. Abra `blog/artigos.js`.
2. Copie um bloco `{ ... }` e cole no início da lista, trocando slug, título, resumo, categoria, data, autor, tempo de leitura e o texto (entre crases).
3. Salve. O artigo aparece no blog e entre os 3 mais recentes da página inicial, no endereço `blog/artigo.html#slug`.

## Acessibilidade (WCAG 2.2 AA e eMAG 3.1)
- Atalhos: Alt+1 conteúdo, Alt+2 menu, Alt+3 rodapé, Alt+4 painel de acessibilidade.
- VLibras: carregado de `vlibras.gov.br` quando o visitante clica no botão de Libras (não funciona na prévia do Claude, só no site publicado).
- Alto contraste, tamanho do texto (90% a 160%), destacar links, espaçamento, fonte legível, pausar animações e cursor grande, com a escolha guardada no navegador.
- Testado com axe-core (regras WCAG 2.0, 2.1 e 2.2 A/AA): nenhuma violação. Faça também um teste manual com NVDA ou TalkBack antes de publicar.

## Cookies (LGPD)
- O banner aparece na primeira visita; a escolha fica em `localStorage` (`ps_consentimento`).
- Para instalar uma ferramenta de estatística, use a função `ativarScripts()` em `assets/js/acessibilidade.js`. Ela só roda se o visitante aceitar "Análise".
- Se mudar as categorias de cookies, aumente `VERSAO_COOKIES` para pedir o consentimento de novo.

## Novo texto ou tradução
1. Escreva o texto em português no HTML com o atributo `data-i18n`.
2. Em `assets/js/i18n.js`, adicione a mesma frase como chave em `en` e `es`.

## Publicar no servidor Oracle
```bash
sudo mkdir -p /var/www/peruzzo-site
sudo cp -r index.html 404.html robots.txt sitemap.xml site.webmanifest assets blog paginas /var/www/peruzzo-site/
sudo cp servidor/nginx-site.conf /etc/nginx/sites-available/peruzzo-site
sudo ln -s /etc/nginx/sites-available/peruzzo-site /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d peruzzoschardosin.adv.br -d www.peruzzoschardosin.adv.br
```
