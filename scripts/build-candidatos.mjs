// Transforma o CSV oficial de candidaturas 2026 do TSE em JSON estático por cargo.
// Fonte: https://dadosabertos.tse.jus.br/dataset/candidatos-2026
// IMPORTANTE: nunca incluir NR_CPF_CANDIDATO nem NR_TITULO_ELEITORAL_CANDIDATO no output —
// são identificadores pessoais sensíveis sem valor informativo para o eleitor.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CSV_PATH = path.join(ROOT, "_rawdata", "consulta_cand_2026", "consulta_cand_2026_BRASIL.csv");
const OUT_DIR = path.join(ROOT, "data");

const NULOS = new Set(["#NULO", "#NE", "NÃO DIVULGÁVEL", "", "-1", "-3"]);
const clean = (v) => (v == null || NULOS.has(v.trim()) ? null : v.trim());

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  const header = splitLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitLine(lines[i]);
    if (cols.length < header.length) continue;
    const row = {};
    header.forEach((h, idx) => (row[h] = cols[idx]));
    rows.push(row);
  }
  return rows;
}

function splitLine(line) {
  // Campos sempre entre aspas e separados por ';', sem ';' escapado dentro de aspas neste dataset.
  return line.split(";").map((c) => c.replace(/^"|"$/g, ""));
}

function calcIdade(dtNascimentoBr, dtReferenciaBr) {
  const [dn, mn, an] = dtNascimentoBr.split("/").map(Number);
  const [dr, mr, ar] = dtReferenciaBr.split("/").map(Number);
  let idade = ar - an;
  if (mr < mn || (mr === mn && dr < dn)) idade--;
  return idade;
}

const DATA_ELEICAO = "04/10/2026";

const CARGO_SLUG = {
  "PRESIDENTE": "presidente",
  "VICE-PRESIDENTE": "presidente",
  "GOVERNADOR": "governador",
  "VICE-GOVERNADOR": "governador",
  "SENADOR": "senador",
  "1º SUPLENTE": "senador",
  "2º SUPLENTE": "senador",
  "DEPUTADO FEDERAL": "deputado_federal",
  "DEPUTADO ESTADUAL": "deputado_estadual",
  "DEPUTADO DISTRITAL": "deputado_estadual",
};

function run() {
  const raw = fs.readFileSync(CSV_PATH, { encoding: "latin1" });
  const rows = parseCsv(raw);

  const buckets = {};
  for (const r of rows) {
    const cargo = r.DS_CARGO?.trim();
    const slug = CARGO_SLUG[cargo];
    if (!slug) continue;

    const nascimento = clean(r.DT_NASCIMENTO);
    const entry = {
      cargo,
      uf: clean(r.SG_UF),
      numero: clean(r.NR_CANDIDATO),
      nomeCompleto: toTitleCase(clean(r.NM_CANDIDATO)),
      nomeUrna: toTitleCase(clean(r.NM_URNA_CANDIDATO)),
      genero: clean(r.DS_GENERO),
      idade: nascimento ? calcIdade(nascimento, DATA_ELEICAO) : null,
      escolaridade: clean(r.DS_GRAU_INSTRUCAO),
      ocupacao: toTitleCase(clean(r.DS_OCUPACAO)),
      partido: { sigla: clean(r.SG_PARTIDO), nome: toTitleCase(clean(r.NM_PARTIDO)) },
      coligacao: toTitleCase(clean(r.NM_COLIGACAO)),
      email: clean(r.DS_EMAIL),
      situacaoCandidatura: toTitleCase(clean(r.DS_SITUACAO_CANDIDATURA)) || "Em análise pela Justiça Eleitoral",
      fraseObjetivo: null, // preenchido manualmente, só com citação literal e link à fonte
      fraseObjetivoFonte: null,
    };

    (buckets[slug] ??= []).push(entry);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const [slug, list] of Object.entries(buckets)) {
    list.sort((a, b) => (a.uf || "").localeCompare(b.uf || "") || a.nomeUrna.localeCompare(b.nomeUrna));
    const outPath = path.join(OUT_DIR, `candidatos_${slug}.json`);
    fs.writeFileSync(outPath, JSON.stringify(list, null, 0));
    console.log(`${slug}: ${list.length} registros -> ${outPath}`);
  }
}

function toTitleCase(s) {
  if (!s) return s;
  return s
    .toLowerCase()
    .split(" ")
    .map((w) => (w.length <= 2 && w !== w.toUpperCase() ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

run();
