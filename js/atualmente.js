const NIVEIS = {
  presidente: {
    label: "Presidente",
    atuaisFile: "data/atuais_presidente.json",
    atuaisIsWrapped: true,
    candidatosFile: "data/candidatos_presidente.json",
    temUf: false,
    temCidade: false,
    countHint: "1 cargo",
  },
  governador: {
    label: "Governadores",
    atuaisFile: "data/atuais_governadores.json",
    atuaisIsWrapped: true,
    candidatosFile: "data/candidatos_governador.json",
    temUf: true,
    temCidade: false,
    countHint: "27 estados",
  },
  senador: {
    label: "Senado Federal",
    atuaisFile: "data/atuais_senadores.json",
    candidatosFile: "data/candidatos_senador.json",
    temUf: true,
    temCidade: false,
    countHint: "81 cadeiras",
  },
  deputado_federal: {
    label: "Câmara dos Deputados",
    atuaisFile: "data/atuais_deputados_federais.json",
    candidatosFile: "data/candidatos_deputado_federal.json",
    temUf: true,
    temCidade: false,
    countHint: "513 cadeiras",
  },
  deputado_estadual: {
    label: "Assembleias Estaduais",
    atuaisFile: null,
    candidatosFile: "data/candidatos_deputado_estadual.json",
    temUf: true,
    temCidade: false,
    countHint: "candidatos 2026",
  },
  prefeito: {
    label: "Prefeituras",
    atuaisFile: "data/atuais_prefeitos.json",
    candidatosFile: null,
    temUf: true,
    temCidade: true,
    countHint: "5.564 municípios",
  },
};

const cache = {};
let nivelAtual = null;

async function loadData(path) {
  if (!path) return null;
  if (cache[path]) return cache[path];
  const res = await fetch(path);
  const json = await res.json();
  cache[path] = json;
  return json;
}

function unwrap(json, wrapped) {
  if (!json) return [];
  return wrapped ? json.lista : json;
}

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
  const modoSel = document.getElementById("f-modo");
  modoSel.innerHTML = "";
  if (cfg.atuaisFile) modoSel.innerHTML += `<option value="atuais">Quem está no cargo hoje</option>`;
  if (cfg.candidatosFile) modoSel.innerHTML += `<option value="candidatos">Candidatos 2026</option>`;

  document.getElementById("f-cidade").style.display = cfg.temCidade ? "inline-block" : "none";
  document.getElementById("f-uf").closest("label").style.display = cfg.temUf ? "inline" : "none";

  popularUfs();
  aplicarFiltro();

  document.getElementById("filtros-ficha").scrollIntoView({ behavior: "smooth", block: "start" });
}

function popularUfs() {
  const sel = document.getElementById("f-uf");
  if (sel.options.length > 1) return;
  const UFS = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"];
  UFS.forEach((uf) => sel.insertAdjacentHTML("beforeend", `<option value="${uf}">${uf}</option>`));
}

function fichaCard(p) {
  const nome = p.nomeCompleto || p.nomeUrna || "(nome não disponível)";
  const urna = p.nomeUrna && p.nomeUrna !== nome ? ` (${p.nomeUrna})` : "";
  const cargoLabel = p.cargo || NIVEIS[nivelAtual]?.label || "";
  const linhas = [];
  if (p.uf) linhas.push(["UF", p.uf]);
  if (p.municipio) linhas.push(["Município", p.municipio]);
  if (p.partido?.sigla) linhas.push(["Partido", p.partido.sigla]);
  if (p.idade != null) linhas.push(["Idade", p.idade]);
  if (p.escolaridade) linhas.push(["Escolaridade", p.escolaridade]);
  if (p.situacao) linhas.push(["Situação", p.situacao]);
  if (p.situacaoCandidatura) linhas.push(["Candidatura", p.situacaoCandidatura]);
  if (p.mandatoDesde) linhas.push(["No cargo desde", p.mandatoDesde]);

  const frase = p.fraseObjetivo
    ? `<div class="ficha-frase">“${p.fraseObjetivo}”</div>`
    : p.cargo && p.situacaoCandidatura
    ? `<div class="ficha-link"><a href="https://divulgacandcontas.tse.jus.br/divulga/#/" target="_blank" rel="noopener">Ver proposta no TSE →</a></div>`
    : "";

  return `
    <div class="ficha">
      <div class="ficha-cargo">${cargoLabel}</div>
      <div class="ficha-nome">${nome}${urna}</div>
      <dl>${linhas.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>
      ${frase}
    </div>`;
}

async function aplicarFiltro() {
  const cfg = NIVEIS[nivelAtual];
  const modo = document.getElementById("f-modo").value;
  const uf = document.getElementById("f-uf").value;
  const cidade = document.getElementById("f-cidade").value.trim().toLowerCase();
  const nomeBusca = document.getElementById("f-nome").value.trim().toLowerCase();
  const resultEl = document.getElementById("ficha-result");
  resultEl.innerHTML = `<p class="empty-hint">Carregando…</p>`;

  const path = modo === "candidatos" ? cfg.candidatosFile : cfg.atuaisFile;
  if (!path) {
    resultEl.innerHTML = `<p class="empty-hint">Essa informação ainda não está disponível nesta versão do site — chega numa atualização futura.</p>`;
    return;
  }

  const raw = await loadData(path);
  let lista = unwrap(raw, cfg.atuaisIsWrapped && modo === "atuais");

  if (uf) lista = lista.filter((p) => p.uf === uf);
  if (cidade) lista = lista.filter((p) => (p.municipio || "").toLowerCase().includes(cidade));
  if (nomeBusca) {
    lista = lista.filter((p) =>
      (p.nomeCompleto || "").toLowerCase().includes(nomeBusca) || (p.nomeUrna || "").toLowerCase().includes(nomeBusca)
    );
  }

  if (lista.length === 0) {
    resultEl.innerHTML = `<p class="empty-hint">Nenhum resultado com esses filtros.</p>`;
    return;
  }

  const LIMITE = 300;
  const mostrar = lista.slice(0, LIMITE);
  const aviso =
    lista.length > LIMITE
      ? `<p class="source-note">Mostrando ${LIMITE} de ${lista.length} — refine com estado, cidade ou nome.</p>`
      : `<p class="source-note">${lista.length} resultado(s).</p>`;

  resultEl.innerHTML = aviso + `<div class="ficha-grid">${mostrar.map(fichaCard).join("")}</div>`;
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

["f-modo", "f-uf", "f-cidade", "f-nome"].forEach((id) => {
  document.getElementById(id).addEventListener("input", aplicarFiltro);
  document.getElementById(id).addEventListener("change", aplicarFiltro);
});

renderOrgChart();
renderListChart();
