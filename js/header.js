// Monta o cabeçalho fixo (marca + timer + abas) em todas as páginas e mantém o timer atualizado.
// Datas oficiais: https://www.tse.jus.br/comunicacao/noticias/2026/Marco/eleicoes-2026-confira-as-principais-datas-do-calendario-eleitoral

const TURNO_1 = new Date("2026-10-04T08:00:00-03:00");
const TURNO_1_FIM = new Date("2026-10-04T17:00:00-03:00");
const TURNO_2 = new Date("2026-10-25T08:00:00-03:00");
const TURNO_2_FIM = new Date("2026-10-25T17:00:00-03:00");

const PAGES = [
  { href: "index.html", label: "Início" },
  { href: "institucional.html", label: "Institucional" },
  { href: "atualmente.html", label: "Atualmente" },
  { href: "onde-votar.html", label: "Onde Votar" },
];

function renderHeader() {
  const current = location.pathname.split("/").pop() || "index.html";
  const tabs = PAGES.map(
    (p) => `<a href="${p.href}" class="${p.href === current ? "active" : ""}">${p.label}</a>`
  ).join("");

  document.body.insertAdjacentHTML(
    "afterbegin",
    `<header class="site-header">
      <div class="header-top">
        <a href="index.html" class="brand">🗳️ Radar Eleitoral <small>2026</small></a>
        <div class="timer">
          <span class="timer-label" id="timer-label">1º turno em</span>
          <span class="timer-value" id="timer-value">—</span>
        </div>
      </div>
      <nav class="tabs">${tabs}</nav>
    </header>`
  );
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function getCountdown() {
  const now = new Date();

  if (now < TURNO_1) return { label: "1º turno em", target: TURNO_1 };
  if (now <= TURNO_1_FIM) return { label: "Votação do 1º turno em andamento", fixedValue: "até 17h" };
  if (now < TURNO_2) return { label: "2º turno (se houver) em", target: TURNO_2 };
  if (now <= TURNO_2_FIM) return { label: "Votação do 2º turno em andamento", fixedValue: "até 17h" };
  return { label: "Eleições 2026", fixedValue: "encerradas" };
}

function formatCountdown(state) {
  if (state.fixedValue) return state.fixedValue;
  const diffMs = state.target - new Date();
  const dias = Math.floor(diffMs / 86400000);
  const horas = Math.floor((diffMs % 86400000) / 3600000);
  const min = Math.floor((diffMs % 3600000) / 60000);
  const seg = Math.floor((diffMs % 60000) / 1000);
  return dias > 0 ? `${dias}d ${pad(horas)}h ${pad(min)}m` : `${pad(horas)}h ${pad(min)}m ${pad(seg)}s`;
}

function updateTimer() {
  const label = document.getElementById("timer-label");
  const value = document.getElementById("timer-value");
  if (!label || !value) return;
  const state = getCountdown();
  label.textContent = state.label;
  value.textContent = formatCountdown(state);
}

window.RadarEleitoral = { getCountdown, formatCountdown };

renderHeader();
updateTimer();
setInterval(updateTimer, 1000);
