const PODERES = [
  {
    id: "executivo",
    titulo: "Poder Executivo",
    resumo: "Governa o dia a dia: aplica leis, cuida de saúde, educação, segurança, obras.",
    detalhe: `
      <p><strong>O que faz:</strong> administra o país/estado/município — propõe e executa orçamento, políticas públicas, representa o país no exterior (no caso do Presidente), é comandante das forças de segurança da sua esfera.</p>
      <p><strong>Quem compõe:</strong></p>
      <ul>
        <li><strong>Presidente + Vice</strong> — governo federal, eleito por voto direto majoritário (2 turnos se necessário), mandato de 4 anos.</li>
        <li><strong>Governador + Vice</strong> — governo estadual, mesma lógica, por estado.</li>
        <li><strong>Prefeito + Vice</strong> — governo municipal (não é eleito em 2026 — próxima eleição municipal é 2028).</li>
      </ul>`,
  },
  {
    id: "legislativo",
    titulo: "Poder Legislativo",
    resumo: "Cria e aprova leis, fiscaliza o Executivo, aprova o orçamento público.",
    detalhe: `
      <p><strong>O que faz:</strong> discute, propõe e vota leis; aprova (ou rejeita) o orçamento; fiscaliza gastos e atos do Executivo; pode instaurar CPIs; no caso do Senado, aprova nomes indicados pelo Presidente para cargos-chave (ex: ministros do STF).</p>
      <p><strong>Quem compõe:</strong></p>
      <ul>
        <li><strong>Câmara dos Deputados</strong> — 513 Deputados Federais, eleitos por voto proporcional, mandato de 4 anos. Representam o povo.</li>
        <li><strong>Senado Federal</strong> — 81 Senadores (3 por estado + DF), eleitos por voto majoritário, mandato de 8 anos (renovado por 1/3 e 2/3 alternadamente). Representam os estados.</li>
        <li><strong>Assembleias Estaduais</strong> — Deputados Estaduais (ou Distritais no DF), voto proporcional, atuam dentro do estado.</li>
        <li><strong>Câmaras Municipais</strong> — Vereadores (não eleitos em 2026).</li>
      </ul>`,
  },
  {
    id: "judiciario",
    titulo: "Poder Judiciário",
    resumo: "Interpreta e aplica a lei, julga conflitos — inclusive sobre as próprias eleições.",
    detalhe: `
      <p><strong>O que faz:</strong> julga processos, interpreta a Constituição e as leis, resolve conflitos entre pessoas, empresas, estados e os outros poderes.</p>
      <p><strong>Quem compõe (nível federal):</strong></p>
      <ul>
        <li><strong>STF</strong> — última instância, guarda a Constituição, 11 ministros indicados pelo Presidente e aprovados pelo Senado.</li>
        <li><strong>STJ, TRFs, Justiça Federal/Estadual</strong> — demais instâncias.</li>
        <li><strong>Justiça Eleitoral (TSE/TREs)</strong> — ramo especializado só em eleições: organiza, fiscaliza e apura a votação, julga contas de campanha e registra candidaturas. É quem toca o site oficial de "onde votar".</li>
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
