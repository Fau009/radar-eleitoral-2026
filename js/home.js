function updateHero() {
  const state = window.RadarEleitoral.getCountdown();
  document.getElementById("hero-timer").textContent = window.RadarEleitoral.formatCountdown(state);
  document.getElementById("hero-timer-label").textContent = state.label;
}
updateHero();
setInterval(updateHero, 1000);

async function loadPesquisas() {
  const el = document.getElementById("pesquisas-content");
  try {
    const res = await fetch("data/pesquisas.json");
    const d = await res.json();

    const bar = (c) => `
      <div class="poll-bar-row">
        <span class="name">${c.candidato} (${c.partido})</span>
        <div class="poll-bar-track">
          <div class="poll-bar-fill" style="width:${c.percentual}%">${c.percentual}%</div>
        </div>
      </div>`;

    el.innerHTML = `
      <p><strong>${d.corrida}</strong> — instituto ${d.instituto}, coleta em ${d.periodoColeta}</p>
      <h3 style="font-size:14px;color:var(--slate-500);margin-bottom:4px;">Cenário estimulado (1º turno)</h3>
      ${d.primeiroTurno.map(bar).join("")}
      <p style="font-size:13px;color:var(--slate-500);">Indecisos / brancos / nulos: ${d.indecisosOuBranco}%</p>

      <h3 style="font-size:14px;color:var(--slate-500);margin:16px 0 4px;">2º turno simulado — ${d.segundoTurnoSimulado.cenario}</h3>
      ${d.segundoTurnoSimulado.resultado.map(bar).join("")}

      <p style="font-size:13px;">${d.observacao}</p>
      <p class="source-note">Fonte: <a href="${d.fonte}" target="_blank" rel="noopener">${d.instituto} — ${d.dataPesquisa}</a>. Página atualizada em ${d.atualizadoEm}.</p>
    `;
  } catch (e) {
    el.innerHTML = `<p class="empty-hint">Não foi possível carregar as pesquisas agora.</p>`;
  }
}
loadPesquisas();
