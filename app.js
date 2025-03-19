// IMPORT DE BIBLIOTECAS
    import express from 'express'
    import { engine } from 'express-handlebars'
    const app = express()
    import admin from './routes/admin.js'
    import path from 'path'
    //const mongoose = require('mongoose')

// CONFIGS
    //BodyParser
    app.use(express.urlencoded({ extended: true }))
    app.use(express.json())

    // Handlebars
    app.engine('handlebars', engine({ defaultLayout: 'main' }));
    app.set('view engine', 'handlebars');

    // Public
    app.use(express.static(path.join(__dirname, 'public')))

    // Mongoose


// ROTAS
    app.use('/admin', admin)

//OUTROS
const PORT = 9091
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
})
