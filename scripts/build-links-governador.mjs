// Adiciona o link oficial da ficha de cada candidato a governador no DivulgaCandContas (TSE).
// Padrão confirmado manualmente: /candidato/{REGIAO}/{UF}/{codigoEleicao}/{SQ_CANDIDATO}/2026/{UF}
// O codigoEleicao é o mesmo em toda a eleição geral de 2026 (igual ao de Presidente).
// Requer _rawdata/consulta_cand_2026/consulta_cand_2026_BRASIL.csv (ver build-candidatos.mjs).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CSV_PATH = path.join(ROOT, "_rawdata", "consulta_cand_2026", "consulta_cand_2026_BRASIL.csv");
const OUT_PATH = path.join(ROOT, "data", "candidatos_governador.json");

const CODIGO_ELEICAO = "20322002026";

const REGIAO_POR_UF = {
  AC: "NORTE", AP: "NORTE", AM: "NORTE", PA: "NORTE", RO: "NORTE", RR: "NORTE", TO: "NORTE",
  AL: "NORDESTE", BA: "NORDESTE", CE: "NORDESTE", MA: "NORDESTE", PB: "NORDESTE", PE: "NORDESTE", PI: "NORDESTE", RN: "NORDESTE", SE: "NORDESTE",
  DF: "CENTROOESTE", GO: "CENTROOESTE", MT: "CENTROOESTE", MS: "CENTROOESTE",
  ES: "SUDESTE", MG: "SUDESTE", RJ: "SUDESTE", SP: "SUDESTE",
  PR: "SUL", RS: "SUL", SC: "SUL",
};

function run() {
  const raw = fs.readFileSync(CSV_PATH, { encoding: "latin1" });
  const lines = raw.split(/\r?\n/).filter((l) => l.length > 0);
  const header = lines[0].split(";").map((c) => c.replace(/^"|"$/g, ""));
  const iCargo = header.indexOf("DS_CARGO");
  const iNumero = header.indexOf("NR_CANDIDATO");
  const iSq = header.indexOf("SQ_CANDIDATO");
  const iUf = header.indexOf("SG_UF");

  const sqMap = {};
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(";").map((c) => c.replace(/^"|"$/g, ""));
    const cargo = cols[iCargo];
    if (cargo !== "GOVERNADOR" && cargo !== "VICE-GOVERNADOR") continue;
    sqMap[`${cargo}|${cols[iUf]}|${cols[iNumero]}`] = cols[iSq];
  }

  const candidatos = JSON.parse(fs.readFileSync(OUT_PATH, "utf8"));
  let matched = 0;
  for (const c of candidatos) {
    const sq = sqMap[`${c.cargo}|${c.uf}|${c.numero}`];
    const regiao = REGIAO_POR_UF[c.uf];
    if (sq && regiao) {
      c.linkOficial = `https://divulgacandcontas.tse.jus.br/divulga/#/candidato/${regiao}/${c.uf}/${CODIGO_ELEICAO}/${sq}/2026/${c.uf}`;
      matched++;
    }
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(candidatos));
  console.log(`Linkados ${matched} de ${candidatos.length} candidatos a governador/vice`);
}

run();
