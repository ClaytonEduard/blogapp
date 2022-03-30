const express = require("express");
const { route } = require("express/lib/application");
const req = require("express/lib/request");
//componente para criar rotas separadas
const router = express.Router();
//carregando o mongo
const mongoose = require("mongoose");
//chamando o model da categoria
require("../models/Categoria");
//conectando o model de categoria -  tipo criando um objeto
const Categoria = mongoose.model("categorias");
//concetando o model de postagens
require("../models/Postagem");
const Postagem = mongoose.model("postagens");

//definindo as rotas
router.get("/", (req, res) => {
  //res.send("Pagina principal do painel ADM")
  res.render("admin/index");
});

router.get("/posts", (req, res) => {
  res.send("Pagina de posts");
});

router.get("/categorias", (req, res) => {
  Categoria.find()
    .sort({ date: "desc" })
    .then((categorias) => {
      res.render("admin/categorias", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar as categorias!");
      res.redirect("/admin");
    });
});

router.get("/categorias/add", (req, res) => {
  res.render("admin/addcategorias");
});

//rota de cadastro da categoria
router.post("/categorias/nova", (req, res) => {
  //controle de validação do formulario sendo no backend
  var erros = [];
  // o user nao pode enviar o formulario vazio
  if (
    !req.body.nome ||
    typeof req.body.nome == undefined ||
    req.body.nome == null
  ) {
    // ler os dados do array e verificar os criteiros do if
    erros.push({ texto: "Nome inválido" });
  }
  if (
    !req.body.slug ||
    typeof req.body.slug == undefined ||
    req.body.slug == null
  ) {
    // ler os dados do array e verificar os criteiros do if
    erros.push({ texto: "Slug inválido" });
  }
  if (req.body.nome.length < 2) {
    erros.push({ texto: "Nome da categoria é muito pequeno!" });
  }

  // verificando se o array de erros possue valores
  if (erros.length > 0) {
    res.render("admin/addcategorias", { erros: erros });
  } else {
    //definindo o arquivo para salvar
    const novaCategoria = {
      nome: req.body.nome,
      slug: req.body.slug,
    };
    //setando o novo arquivo para gravar
    new Categoria(novaCategoria)
      .save()
      .then(() => {
        req.flash("success_msg", "Categoria criada com sucesso");
        res.redirect("/admin/categorias");
      })
      .catch((err) => {
        req.flash(
          "error_msg",
          "Houve um erro ao salvar a categoria, tente novamente!"
        );
        res.redirect("/admin");
      });
  }
});

// rota para buscar os dados para editar
router.get("/categorias/edit/:id", (req, res) => {
  // comando para indentificar o id do arquivo a ser editado
  Categoria.findOne({ _id: req.params.id })
    .then((categorias) => {
      res.render("admin/editcategorias", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "Esta categoria não existe");
      req.redirect("/admin/categorias");
    });
});
//rota para salvar os dados editado
router.post("/categorias/edit", (req, res) => {
  //controle de validação do formulario sendo no backend
  var erros = [];
  // o user nao pode enviar o formulario vazio
  if (
    !req.body.nome ||
    typeof req.body.nome == undefined ||
    req.body.nome == null
  ) {
    // ler os dados do array e verificar os criteiros do if
    erros.push({ texto: "Nome inválido" });
  }
  if (
    !req.body.slug ||
    typeof req.body.slug == undefined ||
    req.body.slug == null
  ) {
    // ler os dados do array e verificar os criteiros do if
    erros.push({ texto: "Slug inválido" });
  }
  if (req.body.nome.length < 2) {
    erros.push({ texto: "Nome da categoria é muito pequeno!" });
  }

  // verificando se o array de erros possue valores
  if (erros.length > 0) {
    res.render("admin/addcategorias", { erros: erros });
  } else {
    // comando para indentificar o id do arquivo a ser editado
    Categoria.findOne({ _id: req.body.id })
      .then((categorias) => {
        categorias.nome = req.body.nome;
        categorias.slug = req.body.slug;
        categorias
          .save()
          .then(() => {
            req.flash("success_msg", "Categoria alterada com sucesso");
            res.redirect("/admin/categorias");
          })
          .catch((err) => {
            req.flash(
              "error_msg",
              "Houve um erro interno ao salvar a edição da categoria"
            );
            res.redirect("/admin/categorias");
          });
      })
      .catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar a categoria");
        req.redirect("/admin/categorias");
      });
  }
});
//deletar
router.post("/categorias/deletar", (req, res) => {
  Categoria.findOneAndRemove({ _id: req.body.id })
    .then(() => {
      req.flash("success_msg", "Categoria deletada com sucesso");
      res.redirect("/admin/categorias");
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao deletar a categoria");
      res.redirect("/admin/categorias");
    });
});

// listar postagens
router.get("/postagens", (req, res) => {
  Postagem.find()
    .populate("categoria")
    .sort({ data: "desc" })
    .then((postagens) => {
      res.render("admin/postagens", { postagens: postagens });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao carregar aspostagens: " + err);
      res.redirect("/admin " + err);
    });
});

router.get("/postagens/add", (req, res) => {
  Categoria.find()
    .then((categorias) => {
      res.render("admin/addpostagem", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao carregar o fomulário");
      res.redirect("/admin");
    });
});
//cadastrando a postagems
router.post("/postagens/nova", (req, res) => {
  var erros = [];
  if (req.body.categorias == "0") {
    erros.push({ texto: "Categoria invalida, registre uma categoria" });
  }

  if (erros.length > 0) {
    res.render("admin/addpostagem", { erros: erros });
  } else {
    const novaPostagem = {
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria,
      slug: req.body.slug,
    };
    new Postagem(novaPostagem)
      .save()
      .then((categorias) => {
        req.flash("success_msg", "Postagem criada com sucesso");
        res.redirect("/admin/postagens");
      })
      .catch((err) => {
        req.flash(
          "error_msg",
          "Houve um erro durante o salvamento da postagem: " + err
        );
        res.redirect("/admin/postagens");
      });
  }
});

//editar postagens

router.get("/postagens/edit/:id", (req, res) => {
  Postagem.findOne({ _id: req.params.id })
    .then((postagem) => {
      Categoria.find()
        .then((categorias) => {
          res.render("admin/editpostagens", {
            categorias: categorias,
            postagem: postagem,
          });
        })
        .catch((err) => {
          req.flash(
            "error_msg",
            "Houve um erro ao listar as categorias: " + err
          );
          res.redirect("/admin/postagens");
        });
    })
    .catch((err) => {
      req.flash(
        "error_msg",
        "Houve um erro durante carregar o formulário de edição: " + err
      );
      res.redirect("/admin/postagens");
    });
});

// atualizar os dados da postagem depois de carregados
router.post("/postagem/edit", (req, res) => {
  Postagem.findOne({ _id: req.body.id })
    .then((postagem) => {
      postagem.titulo = req.body.titulo;
      postagem.descricao = req.body.descricao;
      postagem.slug = req.body.slug;
      postagem.conteudo = req.body.conteudo;
      postagem.categoria = req.body.categoria;

      postagem
        .save()
        .then(() => {
          req.flash("success_msg", "Postagem editada com sucesso");
          res.redirect("/admin/postagens");
        })
        .catch((err) => {
          req.flash("error_msg", "Erro Interno: " + err);
          res.redirect("/admin/postagens");
        });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro ao salvar a edição: " + err);
      res.redirect("/admin/postagens");
    });
});
// modulo de deletar sem ter um formulario
router.get("/postagens/deletar/:id", (req, res) => {
  Postagem.remove({ _id: req.params.id })
    .then(() => {
      req.flash("success_msg", "Postagem deletada com sucesso");
      res.redirect("/admin/postagens");
    })
    .catch((err) => {
      req.flash("error_msg", "Erro Interno: " + err);
      res.redirect("/admin/postagens");
    });
});

//exporta o modulo
module.exports = router;
