const localStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//model de usuario
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");

module.exports = function (passport) {
  passport.use(
    new localStrategy(
      { usernameField: "email", passwordField: "senha" },
      (email, senha, done) => {
        Usuario.findOne({ email: email }).then((usuario) => {
          if (!usuario) {
            return done(null, false, { message: "Esta conta não existe" });
          }
          //conparando as senhas
          bcrypt.compare(senha, usuario.senha, (erro, batem) => {
            if (batem) {
              return done(null, usuario, { message: "Logado com sucesso" });
            } else {
              return done(null, false, { message: "Senha incorreta" });
            }
          });
        });
      }
    )
  );
  //salvar os dados do usuario na sessao
  passport.serializeUser((usuario, done) => {
    done(null, usuario.id);
  });

  //funcao para procurar o usuario
  passport.deserializeUser((id, done) => {
    Usuario.findById(id, (err, usuario) => {
      done(err, usuario);
    });
  });
};
