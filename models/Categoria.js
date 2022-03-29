// chamando o modo do mongoose
const mongoose = require('mongoose')
//definindo o modo do banco
const Schema = mongoose.Schema;

const Categoria = new Schema({
       nome:{
           type: String,
           require:true
       },
       slug:{
           type: String,
           require:true
       },
       date:{
           type: Date,
           default:Date.now()
       }
})

mongoose.model("categorias", Categoria)