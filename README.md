# 🗳️ Radar Eleitoral 2026

Site informativo e não-partidário sobre as Eleições Gerais 2026 no Brasil. Sem login, sem coleta de dados pessoais.

**Acessar:** https://fau009.github.io/radar-eleitoral-2026/

## O que tem

- **Início** — contagem regressiva para o 1º e 2º turno, e pesquisas eleitorais com data e fonte citadas.
- **Institucional** — como funcionam os três poderes e os cargos eletivos, com diagramas interativos.
- **Atualmente** — organograma e lista (com filtro por estado/cidade) de quem ocupa cada cargo hoje e dos candidatos de 2026, com ficha (nome, idade, escolaridade, partido etc.).
- **Onde Votar** — explicador de zona/seção eleitoral e link direto para a ferramenta oficial do TSE. **Este site nunca pede CPF, título de eleitor ou qualquer documento** — ver seção "Decisões de segurança" abaixo.

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
| Pesquisas eleitorais | Institutos públicos (ex. Genial/Quaest), citados por pesquisa em `data/pesquisas.json` | manual |

Para atualizar os dados de candidatos/atuais/prefeitos, execute os scripts em `scripts/` (Node ≥ 18, usam apenas `fetch` nativo e o zip público do TSE).

## Limitações conhecidas (próxima atualização)

- **Vereadores** (~57 mil eleitos em todo o país) ainda não estão no site — volume grande demais para checar a tempo do 1º turno. Não são eleitos em 2026 de qualquer forma.
- **Deputados Estaduais/Distritais atuais** (mandato em exercício) ainda não estão no site — por ora só aparecem os candidatos de 2026 para esse cargo.
- A "frase-objetivo de campanha" de cada candidato só é preenchida quando há uma citação literal e linkável da fala do próprio candidato — por padrão fica vazia, com link para a página oficial de candidaturas do TSE.

## Decisões de segurança e integridade de conteúdo

- **Nenhuma busca por CPF ou título de eleitor.** A página "Onde Votar" linka direto para a ferramenta oficial do TSE — replicar isso com um formulário próprio seria indistinguível de phishing.
- **CPF e número de título eleitoral nunca são publicados**, mesmo vindo de dataset público do TSE — não agregam informação útil pro eleitor e são identificadores sensíveis.
- **Nenhum número de pesquisa é inventado.** Todo dado em `data/pesquisas.json` tem instituto, data de coleta e link da fonte.
- **Nenhuma caracterização de candidato é escrita por quem mantém o site** — "frase-objetivo" só existe como citação literal e linkada.
- Paleta de cores neutra, sem cores associadas a partidos.

## Stack

HTML/CSS/JS puro + dados estáticos em `data/*.json` gerados por scripts Node em `scripts/`. Sem backend, 100% compatível com GitHub Pages.

## Estrutura

```
index.html, institucional.html, atualmente.html, onde-votar.html
css/style.css
js/header.js        # cabeçalho fixo + timer, compartilhado por todas as páginas
js/home.js, js/institucional.js, js/atualmente.js
data/*.json          # gerado pelos scripts — nunca editar à mão, exceto pesquisas.json e atuais_governadores.json/atuais_presidente.json
scripts/*.mjs        # pipeline de dados (baixa do TSE/Câmara/Senado e transforma em JSON)
```

## Licença

MIT — veja [LICENSE](./LICENSE).
