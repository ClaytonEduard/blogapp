// carregando modulos
const express = require("express");
const Handlebars = require("handlebars");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const app = express();
// constante para mapear as rotas
const admin = require("./routes/admin");
//configurando o bootstrap
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");

//carregando o modulo de postagens
require("./models/Postagem");
const Postagem = mongoose.model("postagens");

require("./models/Categoria");
const Categoria = mongoose.model("categorias");

const usuarios = require("./routes/usuarios");

//configurações
// Configurar sessão- serve para a criar e configura os Midllewares
//sessão
app.use(
  session({
    secret: "cursodenode",
    resave: true,
    saveUninitialized: true,
  })
);
//flash
app.use(flash());
//Midllewares
app.use((req, res, next) => {
  //variaveis globais usa-se o .locals
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

//Body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//Handlebars
app.engine(
  "handlebars",
  exphbs.engine({
    defaultLayout: "main",
    handlebars: allowInsecurePrototypeAccess(Handlebars),
  })
);
app.set("view engine", "handlebars");

//Mongoose
mongoose
  .connect("mongodb://localhost/blogapp")
  .then(() => {
    console.log("Conectado ao mongo");
  })
  .catch((err) => {
    console.log("Erro ao se conectar:" + err);
  });
//Public
//todas as definições de css e outros estão na pasta public
app.use(express.static(path.join(__dirname, "public")));

// criando o Midlleware
//rotas

app.get("/", (req, res) => {
  Postagem.find()
    .populate("categoria")
    .sort({ data: "desc" })
    .then((postagens) => {
      res.render("index", { postagens: postagens });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/404");
    });
});

app.get("/postagem/:slug", (req, res) => {
  Postagem.findOne({ slug: req.params.slug })
    .then((postagem) => {
      if (postagem) {
        res.render("postagem/index", { postagem: postagem });
      } else {
        req.flash("error_msg", "Esta postagem não existe");
        res.redirect("/");
      }
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/");
    });
});

app.get("/categorias", (req, res) => {
  Categoria.find()
    .then((categorias) => {
      res.render("categorias/index", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno ao listar as categorias");
      res.redirect("/");
    });
});

app.get("/categorias/:slug", (req, res) => {
  Categoria.findOne({ slug: req.params.slug })
    .then((categoria) => {
      if (categoria) {
        Postagem.find({ categoria: categoria._id })
          .then((postagens) => {
            res.render("categorias/postagens", {
              postagens: postagens,
              categoria: categoria,
            });
          })
          .catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao listar os posts");
            res.redirect("/");
          });
      } else {
        req.flash("error_msg", "Esta categoria não existe");
        res.redirect("/");
      }
    })
    .catch((err) => {
      req.flash(
        "error_msg",
        "Houve um erro interno ao carregar a pagina desta categoria"
      );
      res.redirect("/");
    });
});

app.get("/404", (req, res) => {
  res.send("erro 404!");
});

app.use("/admin", admin);
app.use("/usuarios", usuarios);
//outros
const PORT = 8080;
app.listen(PORT, () => {
  console.log("Servidor rodando!");
});
