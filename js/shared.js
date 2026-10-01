// Helpers reusados por atualmente.js e candidatos.js: cache de fetch, lista de UFs e o card de ficha.

const UFS = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"];

const _cache = {};
async function loadData(path) {
  if (!path) return null;
  if (_cache[path]) return _cache[path];
  const res = await fetch(path);
  const json = await res.json();
  _cache[path] = json;
  return json;
}

function unwrap(json, wrapped) {
  if (!json) return [];
  return wrapped ? json.lista : json;
}

function popularUfs(selectEl) {
  if (selectEl.options.length > 1) return;
  UFS.forEach((uf) => selectEl.insertAdjacentHTML("beforeend", `<option value="${uf}">${uf}</option>`));
}

function fichaCard(p, fallbackCargoLabel) {
  const nome = p.nomeCompleto || p.nomeUrna || "(nome não disponível)";
  const urna = p.nomeUrna && p.nomeUrna !== nome ? ` (${p.nomeUrna})` : "";
  const cargoLabel = p.cargo || fallbackCargoLabel || "";
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
    ? `<div class="ficha-frase">"${p.fraseObjetivo}"</div>`
    : p.situacaoCandidatura
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

function renderFichaResult(resultEl, lista, fallbackCargoLabel, limite = 300) {
  if (lista.length === 0) {
    resultEl.innerHTML = `<p class="empty-hint">Nenhum resultado com esses filtros.</p>`;
    return;
  }
  const mostrar = lista.slice(0, limite);
  const aviso =
    lista.length > limite
      ? `<p class="source-note">Mostrando ${limite} de ${lista.length} — refine com estado, cidade ou nome.</p>`
      : `<p class="source-note">${lista.length} resultado(s).</p>`;
  resultEl.innerHTML = aviso + `<div class="ficha-grid">${mostrar.map((p) => fichaCard(p, fallbackCargoLabel)).join("")}</div>`;
}
