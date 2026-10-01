// ---------- Timer hero ----------
function updateHero() {
  const state = window.RadarEleitoral.getCountdown();
  document.getElementById("hero-timer").textContent = window.RadarEleitoral.formatCountdown(state);
  document.getElementById("hero-timer-label").textContent = state.label;
}
updateHero();
setInterval(updateHero, 1000);

// ---------- Cor fixa por candidato (identidade, não por posição no ranking) ----------
const CAND_COLORS_PRESIDENTE = {
  "Lula": "var(--cat-1)",
  "Flávio Bolsonaro": "var(--cat-2)",
  "Ronaldo Caiado": "var(--cat-3)",
  "Zema": "var(--cat-4)",
  "Renan Santos": "var(--cat-5)",
  "Augusto Cury": "var(--cat-6)",
};
const CAND_COLORS_SP = { "Tarcísio de Freitas": "var(--cat-1)", "Fernando Haddad": "var(--cat-2)" };
const CAND_COLORS_MG = {
  "Cleitinho Azevedo": "var(--cat-1)",
  "Patrus Ananias": "var(--cat-2)",
  "Alexandre Kalil": "var(--cat-3)",
  "Mateus Simões": "var(--cat-4)",
};

function barRow(nome, partido, pct, color) {
  return `
    <div class="poll-bar-row">
      <span class="name">${nome} (${partido})</span>
      <div class="poll-bar-track">
        <div class="poll-bar-fill" style="width:${pct}%;background:${color}">${pct}%</div>
      </div>
    </div>`;
}

// ---------- Pesquisas — Presidente (seletor de instituto) ----------
let pesquisasPresidente = null;

async function initPesquisasPresidente() {
  const res = await fetch("data/pesquisas_presidente.json");
  pesquisasPresidente = await res.json();

  const tabs = document.getElementById("instituto-tabs");
  tabs.innerHTML = pesquisasPresidente.institutos
    .map((inst, i) => `<button type="button" class="flow-step${i === 0 ? " active" : ""}" data-i="${i}">${inst.instituto}</button>`)
    .join("");
  tabs.querySelectorAll("[data-i]").forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.querySelectorAll(".flow-step").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderInstituto(Number(btn.dataset.i));
    });
  });
  renderInstituto(0);
}

function renderInstituto(i) {
  const inst = pesquisasPresidente.institutos[i];
  const el = document.getElementById("pesquisas-content");
  const bars = inst.candidatos
    .map((c) => barRow(c.nome, c.partido, c.percentual, CAND_COLORS_PRESIDENTE[c.nome] || "var(--cat-7)"))
    .join("");
  const extra = inst.brancoNuloNaoVotaria != null
    ? `<p style="font-size:13px;color:var(--slate-500);">Branco/nulo/não vai votar: ${inst.brancoNuloNaoVotaria}%${inst.indecisos != null ? ` · Indecisos: ${inst.indecisos}%` : ""}</p>`
    : "";
  el.innerHTML = `
    <p><strong>${inst.instituto}</strong> — coleta em ${inst.periodoColeta}</p>
    ${bars}
    ${extra}
    <p class="source-note">Fonte: <a href="${inst.fonte}" target="_blank" rel="noopener">${inst.instituto} — ${inst.dataPesquisa}</a>. Página atualizada em ${pesquisasPresidente.atualizadoEm}.</p>
  `;
}

// ---------- Evolução (linha, mesmo instituto) ----------
let evolucaoData = null;
let evolucaoAtual = "presidente";

async function initEvolucao() {
  const res = await fetch("data/pesquisas_evolucao.json");
  evolucaoData = await res.json();

  const tabs = document.getElementById("evolucao-tabs");
  tabs.innerHTML = `
    <button type="button" class="flow-step active" data-k="presidente">Presidente</button>
    <button type="button" class="flow-step" data-k="governador_sp">Governador — SP</button>`;
  tabs.querySelectorAll("[data-k]").forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.querySelectorAll(".flow-step").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      evolucaoAtual = btn.dataset.k;
      renderEvolucao();
    });
  });
  renderEvolucao();
}

function lineChartSVG(pontos, seriesA, seriesB) {
  const W = 560, H = 220, PAD_L = 36, PAD_R = 16, PAD_T = 18, PAD_B = 28;
  const plotW = W - PAD_L - PAD_R, plotH = H - PAD_T - PAD_B;
  const allVals = pontos.flatMap((p) => [p[seriesA.key], p[seriesB.key]]);
  const min = Math.max(0, Math.floor(Math.min(...allVals) / 5) * 5 - 5);
  const max = Math.ceil(Math.max(...allVals) / 5) * 5 + 5;
  const x = (i) => PAD_L + (pontos.length === 1 ? plotW / 2 : (i / (pontos.length - 1)) * plotW);
  const y = (v) => PAD_T + plotH - ((v - min) / (max - min)) * plotH;

  const pathFor = (key) => pontos.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p[key])}`).join(" ");

  const gridLines = [min, (min + max) / 2, max]
    .map((v) => `<line x1="${PAD_L}" y1="${y(v)}" x2="${W - PAD_R}" y2="${y(v)}" stroke="var(--grid-line)" stroke-width="1" />
      <text x="${PAD_L - 6}" y="${y(v) + 4}" font-size="10" fill="var(--ink-muted)" text-anchor="end">${Math.round(v)}%</text>`)
    .join("");

  const dateLabels = pontos
    .map((p, i) => `<text x="${x(i)}" y="${H - 6}" font-size="10" fill="var(--ink-muted)" text-anchor="middle">${p.dataCurta}</text>`)
    .join("");

  const dots = (key, color) =>
    pontos.map((p, i) => `<circle cx="${x(i)}" cy="${y(p[key])}" r="4.5" fill="${color}" stroke="var(--white)" stroke-width="1.5" />`).join("");

  const endLabel = (key, color, dy) => {
    const last = pontos[pontos.length - 1];
    return `<text x="${x(pontos.length - 1) + 6}" y="${y(last[key]) + dy}" font-size="12" font-weight="700" fill="${color}">${last[key]}%</text>`;
  };

  return `
    <svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:${W}px;">
      ${gridLines}
      ${dateLabels}
      <path d="${pathFor(seriesA.key)}" fill="none" stroke="${seriesA.color}" stroke-width="2.5" />
      <path d="${pathFor(seriesB.key)}" fill="none" stroke="${seriesB.color}" stroke-width="2.5" />
      ${dots(seriesA.key, seriesA.color)}
      ${dots(seriesB.key, seriesB.color)}
      ${endLabel(seriesA.key, seriesA.color, -8)}
      ${endLabel(seriesB.key, seriesB.color, 16)}
    </svg>`;
}

function dataCurta(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function renderEvolucao() {
  const el = document.getElementById("evolucao-content");
  if (evolucaoAtual === "presidente") {
    const d = evolucaoData.presidente;
    const pontos = d.pontos.map((p) => ({ ...p, dataCurta: dataCurta(p.data) }));
    el.innerHTML = `
      <p><strong>${d.instituto}</strong> — ${pontos.length} pesquisas encontradas desse instituto (mesma metodologia)</p>
      <div class="legend-list" style="flex-direction:row;gap:16px;margin-bottom:4px;">
        <span class="legend-row"><span class="swatch" style="background:var(--cat-1)"></span>Lula</span>
        <span class="legend-row"><span class="swatch" style="background:var(--cat-2)"></span>Flávio Bolsonaro</span>
      </div>
      ${lineChartSVG(pontos, { key: "lula", color: "var(--cat-1)" }, { key: "flavio", color: "var(--cat-2)" })}
      <p class="source-note">Fontes: ${pontos.map((p) => `<a href="${p.fonte}" target="_blank" rel="noopener">${dataCurta(p.data)}</a>`).join(" · ")}</p>
    `;
  } else {
    const d = evolucaoData.governador_sp;
    const pontos = d.pontos.map((p) => ({ ...p, dataCurta: dataCurta(p.data) }));
    el.innerHTML = `
      <p><strong>${d.instituto}</strong> — governador de ${d.nomeEstado}, ${pontos.length} pesquisas desse instituto</p>
      <div class="legend-list" style="flex-direction:row;gap:16px;margin-bottom:4px;">
        <span class="legend-row"><span class="swatch" style="background:var(--cat-1)"></span>Tarcísio de Freitas</span>
        <span class="legend-row"><span class="swatch" style="background:var(--cat-2)"></span>Fernando Haddad</span>
      </div>
      ${lineChartSVG(pontos, { key: "tarcisio", color: "var(--cat-1)" }, { key: "haddad", color: "var(--cat-2)" })}
      <p class="source-note">Fontes: ${pontos.map((p) => `<a href="${p.fonte}" target="_blank" rel="noopener">${dataCurta(p.data)}</a>`).join(" · ")}</p>
    `;
  }
}

// ---------- Mapa por estado ----------
const STATE_GRID = {
  RR: [1, 3], AP: [1, 4],
  AM: [2, 2], PA: [2, 4], MA: [2, 5], CE: [2, 6],
  AC: [3, 1], RO: [3, 2], TO: [3, 4], PI: [3, 5], RN: [3, 7],
  MT: [4, 3], BA: [4, 5], PB: [4, 6],
  MS: [5, 3], GO: [5, 4], PE: [5, 5], AL: [5, 6],
  DF: [6, 4], MG: [6, 5], SE: [6, 6],
  SP: [7, 4], ES: [7, 5],
  PR: [8, 4], RJ: [8, 5],
  SC: [9, 4],
  RS: [10, 4],
};

async function initMapa() {
  const res = await fetch("data/pesquisas_estados.json");
  const d = await res.json();
  const el = document.getElementById("mapa-content");

  const cells = Object.entries(STATE_GRID)
    .map(([uf, [row, col]]) => {
      const dado = d.porEstado[uf];
      if (!dado) {
        return `<div class="state-cell sem-dado" style="grid-row:${row};grid-column:${col};">${uf}<span class="state-tooltip">${uf}: sem pesquisa própria nesta rodada</span></div>`;
      }
      const lidera = dado.lula >= dado.flavio ? "Lula" : "Flávio";
      const cor = dado.lula >= dado.flavio ? "var(--cat-1)" : "var(--cat-2)";
      return `<div class="state-cell" style="grid-row:${row};grid-column:${col};background:${cor};">${uf}<span class="state-tooltip">${uf}: Lula ${dado.lula}% · Flávio ${dado.flavio}% — lidera ${lidera}</span></div>`;
    })
    .join("");

  el.innerHTML = `
    <p class="source-note" style="text-align:center;">Grade esquemática (cartograma) — não é um mapa geográfico preciso, cada estado tem o mesmo tamanho pra ficar visível.</p>
    <div class="state-map">${cells}</div>
    <div class="map-legend">
      <span><span class="swatch" style="background:var(--cat-1)"></span>Lula lidera</span>
      <span><span class="swatch" style="background:var(--cat-2)"></span>Flávio lidera</span>
      <span><span class="swatch" style="background:var(--slate-200)"></span>Sem pesquisa estadual</span>
    </div>
    <p class="source-note">Fonte: <a href="${d.fonte}" target="_blank" rel="noopener">${d.instituto} — ${d.dataPesquisa}</a>. ${d.nota}</p>
  `;
}

// ---------- Pesquisas — Governador ----------
let pesquisasGovernador = null;

async function initGovernador() {
  const res = await fetch("data/pesquisas_governador.json");
  pesquisasGovernador = await res.json();

  const tabs = document.getElementById("estado-tabs");
  tabs.innerHTML = pesquisasGovernador.estados
    .map((e, i) => `<button type="button" class="flow-step${i === 0 ? " active" : ""}" data-i="${i}">${e.nomeEstado}</button>`)
    .join("");
  tabs.querySelectorAll("[data-i]").forEach((btn) => {
    btn.addEventListener("click", () => {
      tabs.querySelectorAll(".flow-step").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderGovernadorEstado(Number(btn.dataset.i));
    });
  });
  renderGovernadorEstado(0);
}

function renderGovernadorEstado(i) {
  const estado = pesquisasGovernador.estados[i];
  const cores = estado.uf === "SP" ? CAND_COLORS_SP : estado.uf === "MG" ? CAND_COLORS_MG : {};
  const el = document.getElementById("governador-content");

  el.innerHTML = estado.institutos
    .map((inst) => {
      const bars = inst.candidatos.map((c) => barRow(c.nome, c.partido, c.percentual, cores[c.nome] || "var(--cat-7)")).join("");
      return `
        <div style="margin-bottom:14px;">
          <p style="margin-bottom:4px;"><strong>${inst.instituto}</strong> — ${inst.periodoColeta}</p>
          ${bars}
          ${inst.nota ? `<p class="source-note">${inst.nota}</p>` : ""}
          <p class="source-note">Fonte: <a href="${inst.fonte}" target="_blank" rel="noopener">${inst.instituto} — ${inst.dataPesquisa}</a></p>
        </div>`;
    })
    .join("") + `<p class="source-note">${pesquisasGovernador.nota}</p>`;
}

// ---------- Donut: já decidiu o voto ----------
function donutSVG(pct, colorMain, colorRest) {
  const r = 56, cx = 70, cy = 70, stroke = 20;
  const circ = 2 * Math.PI * r;
  const mainLen = (pct / 100) * circ;
  return `
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${colorRest}" stroke-width="${stroke}" />
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${colorMain}" stroke-width="${stroke}"
        stroke-dasharray="${mainLen} ${circ - mainLen}" stroke-linecap="round"
        transform="rotate(-90 ${cx} ${cy})" />
      <text x="${cx}" y="${cy - 2}" text-anchor="middle" class="donut-center-label">${pct}%</text>
      <text x="${cx}" y="${cy + 16}" text-anchor="middle" class="donut-center-sub">já decidiu</text>
    </svg>`;
}

async function initDecisao() {
  const res = await fetch("data/pesquisas_decisao.json");
  const d = await res.json();
  const el = document.getElementById("decisao-content");
  el.innerHTML = `
    <div class="chart-figure">
      ${donutSVG(d.jaDecidiu, "var(--cat-1)", "var(--slate-200)")}
      <div class="legend-list">
        <span class="legend-row"><span class="swatch" style="background:var(--cat-1)"></span>Já tem candidato definido — ${d.jaDecidiu}%</span>
        <span class="legend-row"><span class="swatch" style="background:var(--slate-200)"></span>Ainda pode mudar / não sabe — ${d.podeMudar}%</span>
      </div>
      <p style="font-size:12px;color:var(--slate-500);">${d.observacao}</p>
      <p class="source-note">Fonte: <a href="${d.fonte}" target="_blank" rel="noopener">${d.instituto} — ${d.dataPesquisa}</a></p>
    </div>
  `;
}

// ---------- Gauge: qualidade do voto ----------
function polarToCartesian(cx, cy, r, angleDeg) {
  const a = ((angleDeg - 180) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function gaugeSVG(categorias) {
  const cx = 100, cy = 98, r = 72, stroke = 24;
  let angle = 0;
  const arcs = categorias
    .map((c) => {
      const sweep = (c.percentual / 100) * 180;
      const start = polarToCartesian(cx, cy, r, angle);
      const end = polarToCartesian(cx, cy, r, angle + sweep);
      const largeArc = sweep > 180 ? 1 : 0;
      const color = `var(--status-${c.status})`;
      const path = `<path d="M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="butt" />`;
      angle += sweep;
      return path;
    })
    .join("");

  return `<svg width="220" height="130" viewBox="0 0 200 110">${arcs}</svg>`;
}

async function initGauge() {
  const res = await fetch("data/pesquisas_qualidade_voto.json");
  const d = await res.json();
  const el = document.getElementById("gauge-content");
  const legend = d.categorias
    .map((c) => `<span class="legend-row"><span class="swatch" style="background:var(--status-${c.status})"></span>${c.label} — ${c.percentual}%</span>`)
    .join("");
  el.innerHTML = `
    <div class="chart-figure">
      ${gaugeSVG(d.categorias)}
      <div class="legend-list">${legend}</div>
      <p style="font-size:12px;color:var(--slate-500);">${d.nota}</p>
      <p class="source-note">Fonte: <a href="${d.fonte}" target="_blank" rel="noopener">${d.instituto} — ${d.dataPesquisa}</a></p>
    </div>
  `;
}

initPesquisasPresidente();
initEvolucao();
initMapa();
initGovernador();
initDecisao();
initGauge();
