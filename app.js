// IMPORT DE BIBLIOTECAS
    import express from 'express'
    import { engine } from 'express-handlebars'
    // PATH
        import path from 'path'
        import { fileURLToPath } from 'url'
    import admin from './routes/admin.js'
    import mongoose from 'mongoose'
    const app = express()

    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)

// CONFIGS
    //BodyParser
    app.use(express.urlencoded({ extended: true }))
    app.use(express.json())

    // Handlebars
    app.engine('handlebars', engine({ defaultLayout: 'main' }));
    app.set('view engine', 'handlebars');
    app.set('views', path.join(__dirname, 'views'))

    // Public
    app.use(express.static(path.join(__dirname, 'public')))

    app.use((req, res, next) => {
        console.log('Middleware')
        next()
    })

    // Mongoose
    mongoose.Promise = global.Promise
    mongoose.connect('mongodb://localhost/blog').then(() => {
        console.log('Conectado ao Banco de Dados (MongoDB)')
    }).catch((err) => {
        console.log(`Houve um erro ao se conectar ao banco de dados: ${err}`)
    })

// ROTAS
    app.use('/admin', admin)

//OUTROS
const PORT = 9091
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
})
