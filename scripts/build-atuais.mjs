// Busca dados oficiais de quem está atualmente no cargo (Câmara e Senado via API oficial).
// Fontes: https://dadosabertos.camara.leg.br/api/v2 | https://legis.senado.leg.br/dadosabertos

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "data");

async function buildDeputadosAtuais() {
  const res = await fetch("https://dadosabertos.camara.leg.br/api/v2/deputados?ordem=ASC&ordenarPor=nome&itens=600", {
    headers: { Accept: "application/json" },
  });
  const json = await res.json();
  const lista = json.dados.map((d) => ({
    cargo: "DEPUTADO FEDERAL",
    uf: d.siglaUf,
    nomeCompleto: null, // a API de lista não traz nome civil completo, só nome parlamentar
    nomeUrna: d.nome,
    partido: { sigla: d.siglaPartido, nome: null },
    email: d.email || null,
    foto: d.urlFoto || null,
    fontePerfil: d.uri.replace("api/v2/deputados/", "deputados/"),
  }));
  fs.writeFileSync(path.join(OUT_DIR, "atuais_deputados_federais.json"), JSON.stringify(lista));
  console.log(`deputados federais atuais: ${lista.length}`);
}

async function buildSenadoresAtuais() {
  const res = await fetch("https://legis.senado.leg.br/dadosabertos/senador/lista/atual", {
    headers: { Accept: "application/json" },
  });
  const json = await res.json();
  const parlamentares = json.ListaParlamentarEmExercicio.Parlamentares.Parlamentar;
  const lista = parlamentares.map((p) => {
    const id = p.IdentificacaoParlamentar;
    return {
      cargo: "SENADOR",
      uf: id.UfParlamentar,
      nomeCompleto: toTitleCase(id.NomeCompletoParlamentar),
      nomeUrna: toTitleCase(id.NomeParlamentar),
      genero: id.SexoParlamentar,
      partido: { sigla: id.SiglaPartidoParlamentar, nome: null },
      email: id.EmailParlamentar || null,
      foto: id.UrlFotoParlamentar || null,
      fontePerfil: id.UrlPaginaParlamentar || null,
    };
  });
  fs.writeFileSync(path.join(OUT_DIR, "atuais_senadores.json"), JSON.stringify(lista));
  console.log(`senadores atuais: ${lista.length}`);
}

function toTitleCase(s) {
  if (!s) return s;
  return s
    .toLowerCase()
    .split(" ")
    .map((w) => (w.length <= 2 && w !== w.toUpperCase() ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

async function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  await buildDeputadosAtuais();
  await buildSenadoresAtuais();
}

run();
