// Página "Atualmente": só quem está no cargo hoje. Candidatos de 2026 ficam em candidatos.html.

const NIVEIS = {
  presidente: {
    label: "Presidente",
    atuaisFile: "data/atuais_presidente.json",
    atuaisIsWrapped: true,
    temUf: false,
    temCidade: false,
    countHint: "1 cargo",
  },
  governador: {
    label: "Governadores",
    atuaisFile: "data/atuais_governadores.json",
    atuaisIsWrapped: true,
    temUf: true,
    temCidade: false,
    countHint: "27 estados",
  },
  senador: {
    label: "Senado Federal",
    atuaisFile: "data/atuais_senadores.json",
    temUf: true,
    temCidade: false,
    countHint: "81 cadeiras",
  },
  deputado_federal: {
    label: "Câmara dos Deputados",
    atuaisFile: "data/atuais_deputados_federais.json",
    temUf: true,
    temCidade: false,
    countHint: "513 cadeiras",
  },
  deputado_estadual: {
    label: "Assembleias Estaduais",
    atuaisFile: null,
    temUf: true,
    temCidade: false,
    countHint: "em atualização futura",
  },
  prefeito: {
    label: "Prefeituras",
    atuaisFile: "data/atuais_prefeitos.json",
    temUf: true,
    temCidade: true,
    countHint: "5.564 municípios",
  },
};

let nivelAtual = null;

function renderOrgChart() {
  const wrap = document.getElementById("orgchart-wrap");
  const tier = (ids) => `<div class="org-level">${ids
    .map((id) => `<button type="button" class="org-node" data-nivel="${id}">${NIVEIS[id].label}<span class="count">${NIVEIS[id].countHint}</span></button>`)
    .join("")}</div>`;

  wrap.innerHTML = `
    ${tier(["presidente"])}
    <div class="org-connector"></div>
    ${tier(["governador", "senador", "deputado_federal"])}
    <div class="org-connector"></div>
    ${tier(["deputado_estadual"])}
    <div class="org-connector"></div>
    ${tier(["prefeito"])}
  `;

  wrap.querySelectorAll(".org-node").forEach((btn) => {
    btn.addEventListener("click", () => selecionarNivel(btn.dataset.nivel));
  });
}

function renderListChart() {
  const wrap = document.getElementById("listchart-wrap");
  wrap.innerHTML = `<div class="flow-steps">${Object.keys(NIVEIS)
    .map((id) => `<button type="button" class="flow-step" data-nivel="${id}">${NIVEIS[id].label}</button>`)
    .join("")}</div>`;
  wrap.querySelectorAll("[data-nivel]").forEach((btn) => {
    btn.addEventListener("click", () => selecionarNivel(btn.dataset.nivel));
  });
}

function selecionarNivel(id) {
  nivelAtual = id;
  document.getElementById("filtros-ficha").style.display = "block";

  const cfg = NIVEIS[id];
  document.getElementById("f-cidade").style.display = cfg.temCidade ? "inline-block" : "none";
  document.getElementById("f-uf").closest("label").style.display = cfg.temUf ? "inline" : "none";

  popularUfs(document.getElementById("f-uf"));
  aplicarFiltro();

  document.getElementById("filtros-ficha").scrollIntoView({ behavior: "smooth", block: "start" });
}

async function aplicarFiltro() {
  const cfg = NIVEIS[nivelAtual];
  const uf = document.getElementById("f-uf").value;
  const cidade = document.getElementById("f-cidade").value.trim().toLowerCase();
  const nomeBusca = document.getElementById("f-nome").value.trim().toLowerCase();
  const resultEl = document.getElementById("ficha-result");
  resultEl.innerHTML = `<p class="empty-hint">Carregando…</p>`;

  if (!cfg.atuaisFile) {
    resultEl.innerHTML = `<p class="empty-hint">Quem está em exercício nesse cargo ainda não está disponível nesta versão do site — chega numa atualização futura.</p>`;
    return;
  }

  const raw = await loadData(cfg.atuaisFile);
  let lista = unwrap(raw, cfg.atuaisIsWrapped);

  if (uf) lista = lista.filter((p) => p.uf === uf);
  if (cidade) lista = lista.filter((p) => (p.municipio || "").toLowerCase().includes(cidade));
  if (nomeBusca) {
    lista = lista.filter((p) =>
      (p.nomeCompleto || "").toLowerCase().includes(nomeBusca) || (p.nomeUrna || "").toLowerCase().includes(nomeBusca)
    );
  }

  renderFichaResult(resultEl, lista, cfg.label);
}

document.getElementById("btn-view-org").addEventListener("click", (e) => {
  document.getElementById("orgchart-wrap").style.display = "flex";
  document.getElementById("listchart-wrap").style.display = "none";
  e.target.classList.add("active");
  document.getElementById("btn-view-list").classList.remove("active");
});

document.getElementById("btn-view-list").addEventListener("click", (e) => {
  document.getElementById("orgchart-wrap").style.display = "none";
  document.getElementById("listchart-wrap").style.display = "block";
  e.target.classList.add("active");
  document.getElementById("btn-view-org").classList.remove("active");
});

["f-uf", "f-cidade", "f-nome"].forEach((id) => {
  document.getElementById(id).addEventListener("input", aplicarFiltro);
  document.getElementById(id).addEventListener("change", aplicarFiltro);
});

renderOrgChart();
renderListChart();
