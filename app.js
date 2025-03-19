// IMPORT DE BIBLIOTECAS
    import express from 'express'
    import { engine } from 'express-handlebars'
    const app = express()
    import admin from './routes/admin.js'
    //const mongoose = require('mongoose')

// CONFIGS
    //BODY PARSER
    app.use(express.urlencoded({ extended: true }))
    app.use(express.json())

    // HANBLEBARS
    app.engine('handlebars', engine({ defaultLayout: 'main' }));
    app.set('view engine', 'handlebars');

    // MONGOOSE


// ROTAS
    app.use('/admin', admin)

//OUTROS
const PORT = 9091
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
})
