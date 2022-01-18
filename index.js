const PORT = process.env.PORT || 8000;
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

const elNomeAtivo = "abs-nome-atv";
const elPreco = "td span.nome-coluna";
const nomeColunaPreco = "Preço Unitário";
const endpoint =
  "https://conteudos.xpi.com.br/renda-fixa/lista-de-emissoes/tesouro-direto/";

const ativos = [];
const precoAtivos = [];
const titulosFiltro = [
  "Tesouro Selic 2024",
  "Tesouro Selic 2025",
  "Tesouro IPCA+ com Juros Semestrais 2026",
  "Tesouro IPCA+ com Juros Semestrais 2030",
  "Tesouro IPCA+ com Juros Semestrais 2035",
  "Tesouro IPCA+ com Juros Semestrais 2040",
  "Tesouro IPCA+ com Juros Semestrais 2050",
  "Tesouro IPCA+ com Juros Semestrais 2055",
  "Tesouro Prefixado com Juros Semestrais 2031",
];
app.get("/", (req, res) => {
  res.send("Aqui mesmo nao tem nada, ta. Tu ta no /, caso nao tenha visto.");
});

app.get("/ativos/tesouro-direto", (req, res) => {
  const ativo = req.query.ativo;

  axios(endpoint).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);

    $(`.${elNomeAtivo}`, html).each(function () {
      ativos.push($(this).text().trim());
    });

    $(elPreco, html).each(function () {
      if ($(this).text() === nomeColunaPreco) {
        let precoUnitario = $(this).parent().last().text();
        precoUnitario = precoUnitario
          .trim()
          .replace(nomeColunaPreco, "")
          .trim()
          .replace("R$ ", "")
          .replace(",", ".");

        precoAtivos.push(toFloatOuZero(precoUnitario));
      }
    });
    const retorno = {};
    if (ativo) {
      const indexAtivo = ativos.indexOf(ativo);
      res.send(precoAtivos[indexAtivo] + "");
    }

    ativos.map((a, index) => {
      retorno[a] = precoAtivos[index];
    });

    res.json(retorno);
  });
});
app.listen(PORT, () => {
  console.log(`Rodando em ${PORT}`);
});

function toFloatOuZero(val) {
  val = parseFloat(val);
  return !isNaN(val) ? val : 0;
}
