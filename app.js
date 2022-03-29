// carregando modulos
    const express = require('express')
    const Handlebars = require('handlebars')
    const exphbs = require('express-handlebars')
    const bodyParser = require('body-parser')
    const app= express()
    // constante para mapear as rotas
    const admin = require('./routes/admin')
    //configurando o bootstrap
    const path = require('path')
    const mongoose = require('mongoose')
    const session = require('express-session')
    const flash = require('connect-flash')
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')

//configurações
    // Configurar sessão- serve para a criar e configura os Midllewares
        //sessão
        app.use(session({
            secret: 'cursodenode',
            resave: true,
            saveUninitialized:true
        }))
        //flash
        app.use(flash())
        //Midllewares
        app.use((req,res,next)=>{
            //variaveis globais usa-se o .locals
            res.locals.success_msg = req.flash('success_msg')
            res.locals.error_msg = req.flash('error_msg')
            next()
        })

    //Body parser
        app.use(bodyParser.urlencoded({extended:true}))
        app.use(bodyParser.json())
    //Handlebars
        app.engine('handlebars', exphbs.engine({
            defaultLayout:'main', handlebars:allowInsecurePrototypeAccess(Handlebars)
        }));
        app.set('view engine', 'handlebars');
         
    //Mongoose
        mongoose.connect("mongodb://localhost/blogapp").then(()=>{
            console.log('Conectado ao mongo')
        }).catch((err)=>{
            console.log('Erro ao se conectar:'+err)
        })
    //Public
        //todas as definições de css e outros estão na pasta public
        app.use(express.static(path.join(__dirname,"public")))

        // criando o Midlleware 
//rotas
    app.use('/admin',admin)

//outros
const PORT = 8080
app.listen(PORT, ()=>{
   console.log('Servidor rodando!') 
})