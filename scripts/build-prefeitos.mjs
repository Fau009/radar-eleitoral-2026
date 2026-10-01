// Extrai os prefeitos atualmente em exercício a partir do resultado oficial da eleição municipal de 2024 do TSE.
// Fonte: https://dadosabertos.tse.jus.br/dataset/candidatos-2024 (arquivo BRASIL, filtrado por CARGO=PREFEITO e situação ELEITO)
// Streaming porque o arquivo nacional tem ~245MB (inclui vereadores, que não usamos aqui).

import fs from "node:fs";
import readline from "node:readline";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CSV_PATH = path.join(ROOT, "_rawdata", "consulta_cand_2024", "consulta_cand_2024_BRASIL.csv");
const OUT_PATH = path.join(ROOT, "data", "atuais_prefeitos.json");

const NULOS = new Set(["#NULO", "#NE", "NÃO DIVULGÁVEL", "", "-1", "-3"]);
const clean = (v) => (v == null || NULOS.has(v.trim()) ? null : v.trim());

function splitLine(line) {
  return line.split(";").map((c) => c.replace(/^"|"$/g, ""));
}

function toTitleCase(s) {
  if (!s) return s;
  return s
    .toLowerCase()
    .split(" ")
    .map((w) => (w.length <= 2 && w !== w.toUpperCase() ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

function calcIdade(dtNascimentoBr, dtReferenciaBr) {
  const [dn, mn, an] = dtNascimentoBr.split("/").map(Number);
  const [dr, mr, ar] = dtReferenciaBr.split("/").map(Number);
  let idade = ar - an;
  if (mr < mn || (mr === mn && dr < dn)) idade--;
  return idade;
}

async function run() {
  const rl = readline.createInterface({
    input: fs.createReadStream(CSV_PATH, { encoding: "latin1" }),
    crlfDelay: Infinity,
  });

  let header = null;
  const prefeitos = [];
  let lineNo = 0;

  for await (const line of rl) {
    lineNo++;
    if (lineNo === 1) {
      header = splitLine(line);
      continue;
    }
    if (!line.includes("PREFEITO") || line.includes("VICE-PREFEITO")) continue; // filtro rápido antes de parsear tudo

    const cols = splitLine(line);
    const row = {};
    header.forEach((h, idx) => (row[h] = cols[idx]));

    if (row.DS_CARGO?.trim() !== "PREFEITO") continue;
    if (!row.DS_SIT_TOT_TURNO?.trim().startsWith("ELEITO")) continue;

    const nascimento = clean(row.DT_NASCIMENTO);
    prefeitos.push({
      cargo: "PREFEITO",
      uf: clean(row.SG_UF),
      municipio: toTitleCase(clean(row.NM_UE)),
      nomeCompleto: toTitleCase(clean(row.NM_CANDIDATO)),
      nomeUrna: toTitleCase(clean(row.NM_URNA_CANDIDATO)),
      genero: clean(row.DS_GENERO),
      idade: nascimento ? calcIdade(nascimento, "06/10/2024") : null,
      escolaridade: clean(row.DS_GRAU_INSTRUCAO),
      partido: { sigla: clean(row.SG_PARTIDO), nome: toTitleCase(clean(row.NM_PARTIDO)) },
      situacao: toTitleCase(clean(row.DS_SIT_TOT_TURNO)),
      mandatoDesde: "2025",
    });
  }

  prefeitos.sort((a, b) => a.uf.localeCompare(b.uf) || a.municipio.localeCompare(b.municipio));
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(prefeitos));
  console.log(`prefeitos atuais extraídos: ${prefeitos.length}`);
}

run();
