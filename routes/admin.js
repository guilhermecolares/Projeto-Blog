import express from 'express';
const router = express.Router();
import mongoose from 'mongoose';
import '../models/Categoria.js'
const Categoria = mongoose.model('categorias')

router.get('/', (req, res) => {
    res.render('admin/index')
})

router.get('/posts', (req, res) => {
    res.send('Pagina de Posts')
})

router.get('/categorias', (req, res) =>{
    Categoria.find().sort({date: 'desc'}).then((categorias) => {
        res.render('admin/categorias', {categorias})
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar categorias, tente novamente!')
        res.redirect('/admin')
    })
})

router.get('/categorias/add', (req, res) => {
    res.render('admin/addcategorias')
})

router.post('/categorias/nova', (req, res) =>{

    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'Campo "Nome" vazio!'})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Campo "Slug" vazio!'})
    }

    if(req.body.nome.length < 2 || req.body.slug.length < 2){
        erros.push({texto: 'Número de caracteres insuficiente!'})
    }

    if(erros.length > 0){
        res.render('admin/addcategorias', {erros})
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(() => {
            req.flash('success_msg', 'Categoria criada com sucesso!')
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao criar categoria, tente novamente!')
            res.redirect('/admin')
        })
    }
})

router.get('/categorias/edit/:id', (req, res) => {
    Categoria.findOne({_id: req.params.id}).then((categoria) => {
        res.render('admin/editcategorias', {categoria})
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao editar categoria, tente novamente!')
        res.redirect('/admin/categorias')
    })  
})

router.post('/categorias/edit', (req, res) => {
    Categoria.findOne({_id: req.body.id}).then((categoria) => {
        const { nome, slug } = req.body

        var erros = []

        if(!nome || nome == undefined || nome == null) {
            erros.push({texto: 'Campo "nome" vazio!'})
        }

        if(!slug || slug == undefined || req.body.slug == null) {
            erros.push({texto: 'Campo "slug" vazio!'})
        }

        if(nome.length < 2 || slug.length < 2) {
            erros.push({texto: 'Número de caracteres insuficiente!'})
        }

        if(erros.length > 0) {
            return res.render('admin/editcategorias', {categoria: categoria, erros})
        } else {
            categoria.nome = req.body.nome
            categoria.slug = req.body.slug
            return categoria.save().then(() => {
                req.flash('success_msg', 'Categoria editada com sucesso!')
                res.redirect('/admin/categorias')
            }).catch((err) => {
                req.flash('error_msg', 'Erro ao editar categoria, tente novamente!')
                res.redirect('/admin/categorias')
            })
        }
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao editar categoria, tente novamente!')
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/deletar', (req, res) => {
    const { id } = req.body
    
    var erros = []

    if(!id || id == undefined || id == null) {
        
        erros.push({texto: 'Categoria não encontrada, tente novamente!'})
    }

    if(!mongoose.Types.ObjectId.isValid(id)) {

    }




    Categoria.remove({_id: req.body.id}).then(() => {})
})

export default router;