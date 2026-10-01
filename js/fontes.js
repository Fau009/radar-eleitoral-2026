function li(label, link, dataPesquisa) {
  return `<li style="margin-bottom:4px;">${label} — <a href="${link}" target="_blank" rel="noopener">fonte</a>${dataPesquisa ? ` (coleta: ${dataPesquisa})` : ""}</li>`;
}

async function carregarFontesPresidente() {
  const res = await fetch("data/pesquisas_presidente.json");
  const d = await res.json();
  document.getElementById("fontes-presidente").innerHTML = d.institutos
    .map((i) => li(`<strong>${i.instituto}</strong>`, i.fonte, i.periodoColeta))
    .join("");
}

async function carregarFontesGovernador() {
  const res = await fetch("data/pesquisas_governador.json");
  const d = await res.json();
  document.getElementById("fontes-governador").innerHTML = d.estados
    .map((e) => `<li style="margin-bottom:8px;"><strong>${e.nomeEstado}:</strong><ul>${e.institutos
      .map((i) => li(i.instituto, i.fonte, i.periodoColeta))
      .join("")}</ul></li>`)
    .join("");
}

async function carregarFontesExtras() {
  const [estados, decisao, qualidade, evolucao] = await Promise.all([
    fetch("data/pesquisas_estados.json").then((r) => r.json()),
    fetch("data/pesquisas_decisao.json").then((r) => r.json()),
    fetch("data/pesquisas_qualidade_voto.json").then((r) => r.json()),
    fetch("data/pesquisas_evolucao.json").then((r) => r.json()),
  ]);

  const itens = [
    li(`<strong>Mapa por estado</strong> (${estados.instituto})`, estados.fonte, estados.dataPesquisa),
    li(`<strong>Voto já decidido</strong> (${decisao.instituto})`, decisao.fonte, decisao.periodoColeta),
    li(`<strong>Qualidade do voto</strong> (${qualidade.instituto})`, qualidade.fonte, qualidade.periodoColeta),
    `<li style="margin-bottom:4px;"><strong>Evolução — Presidente</strong> (${evolucao.presidente.instituto}): ${evolucao.presidente.pontos
      .map((p) => `<a href="${p.fonte}" target="_blank" rel="noopener">${p.data}</a>`)
      .join(", ")}</li>`,
    `<li style="margin-bottom:4px;"><strong>Evolução — Governador SP</strong> (${evolucao.governador_sp.instituto}): ${evolucao.governador_sp.pontos
      .map((p) => `<a href="${p.fonte}" target="_blank" rel="noopener">${p.data}</a>`)
      .join(", ")}</li>`,
  ];
  document.getElementById("fontes-extras").innerHTML = itens.join("");
}

carregarFontesPresidente();
carregarFontesGovernador();
carregarFontesExtras();
