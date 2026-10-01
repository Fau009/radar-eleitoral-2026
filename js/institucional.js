const PODERES = [
  {
    id: "executivo",
    titulo: "Poder Executivo",
    resumo: "Governa o dia a dia: aplica leis, cuida de saúde, educação, segurança, obras.",
    detalhe: `
      <p><strong>Deveres e escopo de trabalho, por cargo:</strong></p>
      <ul>
        <li><strong>Presidente + Vice</strong> — comanda as Forças Armadas, define política externa e relações com outros países, toca a economia nacional (câmbio, juros via indicação ao BC, impostos federais), programas sociais federais (Bolsa Família, SUS, previdência), segurança nas fronteiras e Polícia Federal. Eleito por voto direto majoritário (2 turnos se necessário), mandato de 4 anos.</li>
        <li><strong>Governador + Vice</strong> — comanda a Polícia Militar e Civil do estado, administra escolas estaduais e hospitais estaduais/regionais, rodovias estaduais, presídios, impostos estaduais (ICMS). Mesma lógica eleitoral do Presidente, por estado.</li>
        <li><strong>Prefeito + Vice</strong> — transporte público municipal, saúde básica (postos de saúde, UBS), educação infantil e fundamental, zoneamento urbano, coleta de lixo, trânsito local, Guarda Municipal. Não é eleito em 2026 — próxima eleição municipal é 2028.</li>
      </ul>`,
  },
  {
    id: "legislativo",
    titulo: "Poder Legislativo",
    resumo: "Cria e aprova leis, fiscaliza o Executivo, aprova o orçamento público.",
    detalhe: `
      <p><strong>Deveres e escopo de trabalho, por cargo:</strong></p>
      <ul>
        <li><strong>Deputado Federal</strong> (Câmara dos Deputados, 513 cadeiras) — propõe e vota leis federais (trabalhista, tributária, penal etc.), vota o orçamento da União, fiscaliza ministérios, pode abrir CPI federal. Eleito por voto proporcional, mandato de 4 anos.</li>
        <li><strong>Senador</strong> (Senado Federal, 81 cadeiras — 3 por estado + DF) — além de votar leis federais, aprova (ou rejeita) nomes indicados pelo Presidente para ministros do STF, diretores do BC e embaixadores, e julga o Presidente em processo de impeachment. Eleito por voto majoritário, mandato de 8 anos (renovado por 1/3 e 2/3 alternadamente).</li>
        <li><strong>Deputado Estadual/Distrital</strong> (Assembleias Estaduais) — mesmo papel do Deputado Federal, mas para leis e orçamento do estado (ex: regras de ICMS, estrutura da polícia estadual). Voto proporcional, dentro do estado.</li>
        <li><strong>Vereador</strong> (Câmaras Municipais) — leis e orçamento do município (ex: IPTU, zoneamento, transporte local). Não eleito em 2026.</li>
      </ul>`,
  },
  {
    id: "judiciario",
    titulo: "Poder Judiciário",
    resumo: "Interpreta e aplica a lei, julga conflitos — inclusive sobre as próprias eleições.",
    detalhe: `
      <p><strong>Deveres e escopo de trabalho, por instância (nível federal):</strong></p>
      <ul>
        <li><strong>STF</strong> — última palavra sobre se uma lei ou ato do governo respeita a Constituição; julga autoridades com foro privilegiado (ex: Presidente, deputados, senadores) em crimes comuns. 11 ministros indicados pelo Presidente e aprovados pelo Senado.</li>
        <li><strong>STJ, TRFs, Justiça Federal/Estadual</strong> — julgam processos cíveis, criminais e trabalhistas em instâncias anteriores ao STF, cada um com sua área de competência.</li>
        <li><strong>Justiça Eleitoral (TSE/TREs)</strong> — ramo especializado só em eleições: organiza, fiscaliza e apura a votação, julga contas de campanha, registra (ou barra) candidaturas, define onde cada eleitor vota. É quem toca a ferramenta oficial de "onde votar".</li>
      </ul>
      <p>Ministros do Judiciário <strong>não são eleitos</strong> — por isso esse poder não aparece nas suas fichas de candidatos.</p>`,
  },
];

const CARGOS_FLOW = [
  {
    id: "presidente",
    label: "Presidente",
    passos: ["Candidatura registrada no TSE", "Campanha nacional", "Voto direto, 1 turno", "Se ninguém passa de 50%: 2º turno", "Mais votado no fim vence", "Mandato de 4 anos"],
  },
  {
    id: "governador",
    label: "Governador",
    passos: ["Candidatura registrada no TRE do estado", "Campanha estadual", "Voto direto, 1 turno", "Se ninguém passa de 50%: 2º turno", "Mais votado no fim vence", "Mandato de 4 anos"],
  },
  {
    id: "senador",
    label: "Senador",
    passos: ["Candidatura por estado", "Campanha estadual", "Voto direto majoritário, 1 turno só", "Os mais votados (1 ou 2 vagas, depende do ano) vencem", "Mandato de 8 anos"],
  },
  {
    id: "deputado",
    label: "Deputado Federal/Estadual",
    passos: ["Candidatura por partido/federação", "Campanha estadual", "Voto proporcional — conta voto no candidato + no partido", "Vagas do estado divididas entre partidos pelo total de votos", "Dentro do partido, os mais votados ocupam as vagas", "Mandato de 4 anos"],
  },
];

function renderPoderes() {
  const grid = document.getElementById("poderes-grid");
  grid.innerHTML = PODERES.map(
    (p) => `
    <div class="poder-card" data-id="${p.id}">
      <h3>${p.titulo}</h3>
      <p>${p.resumo}</p>
    </div>`
  ).join("");

  const detalhes = document.getElementById("poder-detalhes");
  detalhes.innerHTML = PODERES.map((p) => `<div class="poder-detalhe" id="detalhe-${p.id}">${p.detalhe}</div>`).join("");

  grid.querySelectorAll(".poder-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      PODERES.forEach((p) => {
        const el = document.getElementById(`detalhe-${p.id}`);
        if (p.id === id) el.classList.toggle("open");
        else el.classList.remove("open");
      });
    });
  });
}

function renderFlow() {
  const nav = document.getElementById("cargo-escolha");
  nav.innerHTML = CARGOS_FLOW.map((c) => `<button type="button" class="flow-step" data-id="${c.id}">${c.label}</button>`).join("");

  const result = document.getElementById("flow-result");

  nav.querySelectorAll(".flow-step").forEach((btn) => {
    btn.addEventListener("click", () => {
      nav.querySelectorAll(".flow-step").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const cargo = CARGOS_FLOW.find((c) => c.id === btn.dataset.id);
      result.style.display = "block";
      result.innerHTML = `<strong>${cargo.label}:</strong><div class="flow-steps" style="margin-top:10px;">${cargo.passos
        .map((s, i) => `<span class="flow-step" style="cursor:default;">${s}</span>${i < cargo.passos.length - 1 ? '<span class="flow-arrow">→</span>' : ""}`)
        .join("")}</div>`;
    });
  });
}

renderPoderes();
renderFlow();
