// Adiciona o link oficial da ficha de cada candidato a presidente no DivulgaCandContas (TSE).
// Padrão confirmado manualmente: /candidato/BR/BR/{codigoEleicao}/{SQ_CANDIDATO}/2026/BR
// O codigoEleicao é o mesmo para todos os candidatos a presidente, por ser a mesma eleição nacional.
// Requer _rawdata/consulta_cand_2026/consulta_cand_2026_BR.csv (ver build-candidatos.mjs).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CSV_PATH = path.join(ROOT, "_rawdata", "consulta_cand_2026", "consulta_cand_2026_BR.csv");
const OUT_PATH = path.join(ROOT, "data", "candidatos_presidente.json");

const CODIGO_ELEICAO_PRESIDENTE = "20322002026";

function run() {
  const raw = fs.readFileSync(CSV_PATH, { encoding: "latin1" });
  const lines = raw.split(/\r?\n/).filter((l) => l.length > 0);
  const header = lines[0].split(";").map((c) => c.replace(/^"|"$/g, ""));
  const iCargo = header.indexOf("DS_CARGO");
  const iNumero = header.indexOf("NR_CANDIDATO");
  const iSq = header.indexOf("SQ_CANDIDATO");

  const sqMap = {};
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(";").map((c) => c.replace(/^"|"$/g, ""));
    const cargo = cols[iCargo];
    if (cargo !== "PRESIDENTE" && cargo !== "VICE-PRESIDENTE") continue;
    sqMap[`${cargo}|${cols[iNumero]}`] = cols[iSq];
  }

  const candidatos = JSON.parse(fs.readFileSync(OUT_PATH, "utf8"));
  let matched = 0;
  for (const c of candidatos) {
    const sq = sqMap[`${c.cargo}|${c.numero}`];
    if (sq) {
      c.linkOficial = `https://divulgacandcontas.tse.jus.br/divulga/#/candidato/BR/BR/${CODIGO_ELEICAO_PRESIDENTE}/${sq}/2026/BR`;
      matched++;
    }
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(candidatos));
  console.log(`Linkados ${matched} de ${candidatos.length} candidatos a presidente/vice`);
}

run();
