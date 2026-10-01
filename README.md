# 🗳️ Radar Eleitoral 2026

Site informativo e não-partidário sobre as Eleições Gerais 2026 no Brasil. Sem login, sem coleta de dados pessoais.

**Acessar:** https://fau009.github.io/radar-eleitoral-2026/

## O que tem

- **Início** — contagem regressiva para o 1º e 2º turno; pesquisas de Presidente com seletor de instituto (até 6 institutos, cada um com sua data); evolução nas últimas semanas (linha, mesmo instituto); mapa esquemático de liderança por estado; pesquisas de Governador (SP e MG); voto já decidido (rosca) e qualidade da intenção de voto (velocímetro verde/amarelo/vermelho).
- **Institucional** — como funcionam os três poderes, com deveres e escopo de trabalho por cargo, e diagramas interativos.
- **Atualmente** — organograma e lista (com filtro por estado/cidade) de quem ocupa cada cargo hoje, do Presidente às Prefeituras.
- **Candidatos** — candidatos de 2026 a Presidente, Governador, Senador e Deputado Federal, com ficha e filtro por estado (Assembleias e Prefeituras ficam só em "Atualmente" — volume grande demais pra manter como candidatos também).
- **Onde Votar** — explicador de zona/seção eleitoral e link direto para a ferramenta oficial do TSE. **Este site nunca pede CPF, título de eleitor ou qualquer documento** — ver seção "Decisões de segurança" abaixo.
- **Fontes** — lista central de onde vem cada informação do site, com link direto.

## Datas oficiais

1º turno: 04/10/2026. 2º turno (só Presidente e Governador, se necessário): 25/10/2026. Fonte: [TSE](https://www.tse.jus.br/comunicacao/noticias/2026/Marco/eleicoes-2026-confira-as-principais-datas-do-calendario-eleitoral).

## Fontes de dados

| Dado | Fonte | Atualização |
|---|---|---|
| Candidatos 2026 (todos os cargos) | [Dados Abertos TSE — candidatos-2026](https://dadosabertos.tse.jus.br/dataset/candidatos-2026) | `scripts/build-candidatos.mjs` |
| Deputados Federais atuais | [API Câmara dos Deputados](https://dadosabertos.camara.leg.br/api/v2) | `scripts/build-atuais.mjs` |
| Senadores atuais | [API Senado Federal](https://legis.senado.leg.br/dadosabertos) | `scripts/build-atuais.mjs` |
| Prefeitos atuais (eleição 2024) | [Dados Abertos TSE — candidatos-2024](https://dadosabertos.tse.jus.br/dataset/candidatos-2024), filtrado por eleitos | `scripts/build-prefeitos.mjs` |
| Governadores atuais | Compilado manualmente, fonte: [Wikipédia](https://pt.wikipedia.org/wiki/Lista_de_governadores_das_unidades_federativas_do_Brasil) | manual |
| Presidente atual | [Planalto](https://www.gov.br/planalto/pt-br/conheca-a-presidencia/presidente) | manual |
| Pesquisas de Presidente (6 institutos) | Quaest, Datafolha, PoderData, Real Time, AtlasIntel, Paraná Pesquisas — citados por pesquisa em `data/pesquisas_presidente.json` | manual |
| Evolução (mesmo instituto ao longo do tempo) | `data/pesquisas_evolucao.json`, cada ponto com sua fonte | manual |
| Liderança por estado | Quaest (26/ago/2026), 17 estados + DF — `data/pesquisas_estados.json` | manual |
| Pesquisas de Governador (SP, MG) | Datafolha, Quaest, Atlas/Estadão — `data/pesquisas_governador.json` | manual |
| Voto já decidido / qualidade do voto | Quaest — `data/pesquisas_decisao.json`, `data/pesquisas_qualidade_voto.json` | manual |

Para atualizar os dados de candidatos/atuais/prefeitos, execute os scripts em `scripts/` (Node ≥ 18, usam apenas `fetch` nativo e o zip público do TSE). Os arquivos `data/pesquisas_*.json` são compilados manualmente a partir de cobertura jornalística das pesquisas — não há API oficial para isso. A lista completa e navegável de fontes está na página **Fontes** do site (`fontes.html`).

### Com que frequência as pesquisas saem?

Varia por instituto: na reta final da eleição, pesquisa nacional de Presidente costuma sair a cada 1–2 semanas (às vezes mais de um instituto na mesma semana); longe da eleição, o ritmo cai para 3–4 semanas. Pesquisas estaduais (Governador) saem com menos frequência e nem todo estado tem cobertura constante. O site **não atualiza sozinho** (é estático, sem servidor) — os dados ficam na data marcada até alguém pedir uma atualização.

## Limitações conhecidas (próxima atualização)

- **Vereadores** (~57 mil eleitos em todo o país) ainda não estão no site — volume grande demais para checar a tempo do 1º turno. Não são eleitos em 2026 de qualquer forma.
- **Deputados Estaduais/Distritais atuais** (mandato em exercício) ainda não estão no site — por ora só aparecem os candidatos de 2026 para esse cargo.
- A "frase-objetivo de campanha" de cada candidato só é preenchida quando há uma citação literal e linkável da fala do próprio candidato — por padrão fica vazia, com link para a página oficial de candidaturas do TSE.
- **Perfil do eleitorado por sexo/idade, por candidato:** pesquisamos e não achamos pesquisa pública com esse cruzamento publicado de forma acessível para esta eleição — por isso não está no site (ver nota na Home). Evita inventar número.
- **Mapa por estado:** é um cartograma esquemático (grade), não um mapa geográfico real, e só tem dado para 18 das 27 UFs (as que a Quaest publicou nessa rodada).
- **Voto em branco x nulo:** institutos publicam os dois somados a "não vai votar" — o velocímetro usa esse grupo combinado como critério "vermelho", não só voto nulo.

## Decisões de segurança e integridade de conteúdo

- **Nenhuma busca por CPF ou título de eleitor.** A página "Onde Votar" linka direto para a ferramenta oficial do TSE — replicar isso com um formulário próprio seria indistinguível de phishing.
- **CPF e número de título eleitoral nunca são publicados**, mesmo vindo de dataset público do TSE — não agregam informação útil pro eleitor e são identificadores sensíveis.
- **Nenhum número de pesquisa é inventado.** Todo dado em `data/pesquisas_*.json` tem instituto, data de coleta e link da fonte — e quando não achamos dado confiável pra algo pedido (ex: cruzamento por sexo/idade), preferimos deixar de fora a inventar.
- **Nenhuma caracterização de candidato é escrita por quem mantém o site** — "frase-objetivo" só existe como citação literal e linkada.
- Paleta de cores neutra, sem cores associadas a partidos.

## Stack

HTML/CSS/JS puro + dados estáticos em `data/*.json` gerados por scripts Node em `scripts/`. Sem backend, 100% compatível com GitHub Pages.

## Estrutura

```
index.html, institucional.html, atualmente.html, candidatos.html, onde-votar.html, fontes.html
css/style.css
js/header.js         # cabeçalho fixo + timer, compartilhado por todas as páginas
js/shared.js         # helpers reusados por atualmente.js e candidatos.js (fetch cache, UFs, ficha)
js/home.js, js/institucional.js, js/atualmente.js, js/candidatos.js, js/fontes.js
data/*.json           # candidatos_*/atuais_* gerados pelos scripts; pesquisas_*.json e atuais_governadores/presidente são manuais
scripts/*.mjs         # pipeline de dados (baixa do TSE/Câmara/Senado e transforma em JSON)
```

## Licença

MIT — veja [LICENSE](./LICENSE).
