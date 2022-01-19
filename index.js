const PORT = process.env.PORT || 8000;
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

const elTitulos = ".list.tesouro";
const elNomeAtivo = "abs-nome-atv";
const elPreco = "td span.nome-coluna";
const nomeColunaPreco = "Preço Unitário";
const endpoint = "https://statusinvest.com.br/";

const ativos = {};
let ponto = null;
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

  axios(endpoint)
    .then((response) => {
      try {
        const html = response.data;

        const $ = cheerio.load(html);

        $(`div${elTitulos}`, html).each(function () {
          ponto = $(this);

          let nomeAtivo = $(this).find("a.info h4");
          if (nomeAtivo.length > 0) {
            console.log("----", nomeAtivo.html(), "----");
            const p_nomeAtivo = nomeAtivo.html() + "";
            console.log("----", p_nomeAtivo, "----");
            nomeAtivo = nomeAtivo.html()?.replaceAll("\n", "");

            let precoAtivo = $(this).find("a.info div");
            console.log(precoAtivo.html());
            if (precoAtivo.length > 0) {
              precoAtivo = precoAtivo
                .slice(3, 4)
                .find("span")
                .text()
                .trim()
                .replaceAll("\n", "")
                .replace("vendaR$", "")
                .replace(".", "")
                .replace("venda R$", "");

              ativos[nomeAtivo] = precoAtivo;
            }
          }
        });

        if (ativo) {
          res.send(ativos[ativo] + "");
          return;
        }
        res.json(ativos);
      } catch (erro) {
        console.error(erro);
        res.json({ e: erro, p: ponto.text() });
      }
    })
    .catch((erro) => {
      console.error(erro);
      res.json({ e: erro, p: ponto.text() });
    });
});

app.listen(PORT, () => {
  console.log(`Rodando em ${PORT}`);
});
