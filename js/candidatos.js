// Página "Candidatos": só os 4 cargos pedidos (sem assembleia estadual nem prefeitura — volume grande demais pra manter atualizado).

const CARGOS = {
  presidente: { label: "Presidente", file: "data/candidatos_presidente.json", temUf: false },
  governador: { label: "Governador", file: "data/candidatos_governador.json", temUf: true },
  senador: { label: "Senador", file: "data/candidatos_senador.json", temUf: true },
  deputado_federal: { label: "Deputado Federal", file: "data/candidatos_deputado_federal.json", temUf: true },
};

let cargoAtual = "presidente";

function renderTabs() {
  const nav = document.getElementById("cargo-tabs");
  nav.innerHTML = Object.entries(CARGOS)
    .map(([id, c]) => `<button type="button" class="flow-step${id === cargoAtual ? " active" : ""}" data-cargo="${id}">${c.label}</button>`)
    .join("");
  nav.querySelectorAll("[data-cargo]").forEach((btn) => {
    btn.addEventListener("click", () => {
      cargoAtual = btn.dataset.cargo;
      nav.querySelectorAll(".flow-step").forEach((b) => b.classList.toggle("active", b.dataset.cargo === cargoAtual));
      document.getElementById("f-uf").closest("label").style.display = CARGOS[cargoAtual].temUf ? "inline" : "none";
      aplicarFiltro();
    });
  });
}

async function aplicarFiltro() {
  const cfg = CARGOS[cargoAtual];
  const uf = document.getElementById("f-uf").value;
  const nomeBusca = document.getElementById("f-nome").value.trim().toLowerCase();
  const resultEl = document.getElementById("ficha-result");
  resultEl.innerHTML = `<p class="empty-hint">Carregando…</p>`;

  const raw = await loadData(cfg.file);
  let lista = raw || [];

  if (uf) lista = lista.filter((p) => p.uf === uf);
  if (nomeBusca) {
    lista = lista.filter((p) =>
      (p.nomeCompleto || "").toLowerCase().includes(nomeBusca) || (p.nomeUrna || "").toLowerCase().includes(nomeBusca)
    );
  }

  renderFichaResult(resultEl, lista, cfg.label);
}

popularUfs(document.getElementById("f-uf"));
document.getElementById("f-uf").closest("label").style.display = CARGOS[cargoAtual].temUf ? "inline" : "none";
renderTabs();
aplicarFiltro();

["f-uf", "f-nome"].forEach((id) => {
  document.getElementById(id).addEventListener("input", aplicarFiltro);
  document.getElementById(id).addEventListener("change", aplicarFiltro);
});
