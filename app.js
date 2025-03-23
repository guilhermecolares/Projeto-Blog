// IMPORT DE BIBLIOTECAS
    import express from 'express'
    import { engine } from 'express-handlebars'
    import Handlebars from 'handlebars'
    // PATH
        import path from 'path'
        import { fileURLToPath } from 'url'
    import admin from './routes/admin.js'
    import mongoose from 'mongoose'
    import session from 'express-session'
    import flash from 'connect-flash'
    import Postagem from './models/Postagem.js'
    import Categoria from './models/Categoria.js'
    import usuarios from './routes/usuario.js'
    import passport from 'passport'
    import auth from '../config/auth.js'
    auth(passport)

    const app = express()

    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)

// CONFIGS
    // Session
        app.use(session({
            secret: 'cursodenodejs',
            resave: true,
            saveUninitialized: true
        }))

        app.use(passport.initialize())
        app.use(passport.session())

        app.use(flash())

    // Middlewares
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash('success_msg')
            res.locals.error_msg = req.flash('error_msg')
            next()
        })

    // BodyParser
        app.use(express.urlencoded({ extended: true }))
        app.use(express.json())

    // Handlebars
        app.engine('handlebars', engine({ 
            defaultLayout: 'main',
            runtimeOptions: {
                allowProtoPropertiesByDefault: true
            }
        }));
        app.set('view engine', 'handlebars');
        app.set('views', path.join(__dirname, 'views'));
        Handlebars.registerHelper('ifCond', function(v1, v2, options) {
            if (v1.equals(v2)) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        });

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
    

    app.get('/', (req, res) => {
        Postagem.find().populate('categoria').sort({data: 'desc'}).then((postagens) => {
            res.render('index', {postagens})
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao carregar as postagens, tente novamente!')
            res.redirect('/404')
        })
    })

    app.get('/postagens/:slug', (req, res) => {
        Postagem.findOne({slug: req.params.slug}).then((postagem) => {
            if (postagem) {
                res.render('postagens/index', {postagem})
            } else {
                req.flash('error_msg', 'Houve um erro ao carregar a postagem, tente novamente!')
                res.redirect('/')
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao carregar a postagem, tente novamente!')
            res.redirect('/')
        })
    })

    app.get('/404', (req, res) => {
        res.send('Erro 404!')
    })

    app.get('/categorias', (req, res) => {
        Categoria.find().then((categorias) => {
            res.render('categorias/index', {categorias})
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao listar categorias, tente novamente!')
            res.redirect('/')
        })
    })

    app.get('/categorias/:slug', (req, res) => {
        Categoria.findOne({slug: req.params.slug}).then((categoria) => {
            if (categoria) {
                Postagem.find({categoria: categoria._id}).then((postagens) => {
                    res.render('categorias/postagens', {postagens, categoria})
                }).catch((err) => {
                    req.flash('error_msg', 'Houve um erro ao carregar as postagens, tente novamente!')
                    res.redirect('/')
                })
            } else {
                req.flash('error_msg', 'Houve um erro ao carregar a categoria, tente novamente!')
                res.redirect('/')
            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao carregar a págine, tente novamente!')
            res.redirect('/')
        })
    })

    app.use('/admin', admin)
    app.use('/usuarios', usuarios)

// OUTROS
    const PORT = 9091
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`)
    })
