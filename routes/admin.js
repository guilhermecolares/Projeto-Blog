import express from 'express';
import mongoose from 'mongoose';
import '../models/Categoria.js'
import '../models/Postagem.js'
import eAdminHelper from '../helpers/eAdmin.js'

const router = express.Router();
const Categoria = mongoose.model('categorias')
const Postagem = mongoose.model('postagens')
const { eAdmin } = eAdminHelper

router.get('/', eAdmin, (req, res) => {
    res.render('admin/index')
})

// ROTA DE CATEGORIAS

router.get('/categorias', eAdmin, (req, res) =>{
    Categoria.find().sort({date: 'desc'}).then((categorias) => {
        res.render('admin/categorias', {categorias})
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar categorias, tente novamente!')
        res.redirect('/admin')
    })
})

router.get('/categorias/add', eAdmin, (req, res) => {
    res.render('admin/addcategorias')
})

router.post('/categorias/nova', eAdmin, (req, res) =>{

    let erros = []

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

router.get('/categorias/edit/:id', eAdmin, (req, res) => {
    Categoria.findOne({_id: req.params.id}).then((categoria) => {
        res.render('admin/editcategorias', {categoria})
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao editar categoria, tente novamente!')
        res.redirect('/admin/categorias')
    })  
})

router.post('/categorias/edit', eAdmin, (req, res) => {
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

router.post('/categorias/deletar', eAdmin, (req, res) => {
    const { id } = req.body
    
    var erros = []

    if(!id || id == undefined || id == null) {
        erros.push({texto: 'Categoria não encontrada, tente novamente!'})
        return res.redirect('/admin/categorias')
    }

    if(!mongoose.Types.ObjectId.isValid(id)) {
        erros.push({texto: "Categoria não encontrada, tente novamente!"})
        return res.redirect('/admin/categorias')
    }

    Categoria.findOne({_id: id}).then((categoria) => {
        if(!categoria) {
            erros.push({texto: 'Categoria não encontrada, tente novamente!'})
            return res.redirect('/admin/categorias')
        } else {
            Categoria.deleteOne({_id: id}).then(() => {
                req.flash('success_msg', 'Categoria deletada com sucesso!')
                res.redirect('/admin/categorias')
            }).catch((err) => {
                req.flash('error_msg', 'Falha ao deletar categoria, tente novamente!')
                res.redirect('/admin/categorias')
            })
        }
    })
})

// ROTA DE POSTS

router.get('/postagens', eAdmin, (req, res) => { // LISTAR POSTAGENS
    Postagem.find().lean().populate('categoria').sort({date: 'desc'}).then((postagens) => {
        res.render('admin/postagens', { postagens })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar postagens, tente novamente!')
        res.redirect('/admin')
    })
})

router.get('/postagens/add', eAdmin, (req, res) => { // ADICIONAR POSTAGENS
    Categoria.find().then((categorias) => {
        res.render('admin/addpostagens', {categorias})
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar o formulário, tente novamente!')
        res.redirect('/admin')
    })
})

router.post('/postagens/nova', eAdmin, (req, res) => { // ADICIONAR POSTAGENS
    const { titulo, slug, descricao, conteudo, categoria } = req.body
    
    const campos = { 
        titulo: 'título', 
        slug: 'slug',
        descricao: 'descrição',
        conteudo: 'conteúdo', 
        categoria: 'categoria'
    }

    var erros = []

    Object.keys(campos).forEach((campo) => {
        if(!req.body[campo] || req.body[campo] == undefined || req.body[campo] == null) {
            erros.push({texto: `Campo ${campos[campo]} vazio!`})
        }
    })
    
    if(erros.length > 0) {
        Categoria.find().then((categorias) => {
            req.flash('error_msg', erros.map(err => err.texto).join(', '));
            return res.render('admin/addpostagens', {
                erros, 
                categorias
            });
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao carregar categorias');
            res.redirect('/admin/postagens');
        });
    } else {
        const novaPostagem = {
            titulo,
            slug,
            descricao,
            conteudo,
            categoria
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg', 'Postagem criada com sucesso!')
            res.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao criar postagem, tente novamente!')
            res.redirect('/admin/postagens')
        })
    }
})

router.get('/postagens/edit/:id', eAdmin, (req, res) => { // EDITAR POSTAGENS
    Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {
        Categoria.find().then((categorias) => {
            res.render('admin/editpostagens', {categorias, postagem})
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao carregar categorias, tente novamente!')
            res.redirect('/admin/postagens')
        })
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao carregar postagem, tente novamente!')
        res.redirect('/admin/postagens')
    })
})

router.post('/postagens/edit/:id', eAdmin, (req, res) => { // EDITAR POSTAGENS
    Postagem.findOne({ _id: req.params.id }).then((postagem) => {
        if (!postagem) {
            req.flash('error_msg', 'Postagem não encontrada!');
            return res.redirect('/admin/postagens');
        }

        const { titulo, slug, descricao, conteudo, categoria } = req.body;

        const campos = {
            titulo: 'título',
            slug: 'slug',
            descricao: 'descrição',
            conteudo: 'conteúdo',
            categoria: 'categoria'
        };

        var erros = [];

        Object.keys(campos).forEach((campo) => {
            if (!req.body[campo] || req.body[campo] == undefined || req.body[campo] == null) {
                erros.push({ texto: `Campo ${campos[campo]} vazio!` });
            }
        });

        if (erros.length > 0) {
            Categoria.find().then((categorias) => {
                req.flash('error_msg', erros.map((err) => err.texto).join(', '));
                return res.render('admin/editpostagens', {
                    erros,
                    categorias,
                    postagem: postagem,
                    categoriaSelecionada: postagem.categoria
                });
            }).catch((err) => {
                req.flash('error_msg', 'Erro ao carregar as categorias');
                res.redirect('/admin/postagens');
            });
        } else {
            postagem.titulo = req.body.titulo;
            postagem.slug = req.body.slug;
            postagem.descricao = req.body.descricao;
            postagem.conteudo = req.body.conteudo;
            postagem.categoria = req.body.categoria;
            postagem.save().then(() => {
                req.flash('success_msg', 'Postagem editada com sucesso!');
                res.redirect('/admin/postagens');
            }).catch((err) => {
                req.flash('error_msg', 'Erro ao editar postagem, tente novamente!');
                res.redirect('/admin/postagens');
            });
        }
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao acessar postagem, tente novamente!');
        res.redirect('/admin/postagens');
    });
});

router.post('/postagens/deletar', eAdmin, (req, res) => {
    const { id } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash('error_msg', 'Postagem nao encontrada, tente novamente!')
        return res.redirect('/admin/postagens')
    }

        Postagem.findByIdAndDelete(id).then((postagem) => {
            if (!postagem) {
                req.flash('error_msg', 'Postagem nao encontrada, tente novamente!')
                return res.redirect('/admin/postagens')
            }
            req.flash('success_msg', 'Postagem deletada com sucesso!')
            res.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash('error_msg', 'Falha ao deletar postagem, tente novamente!')
            res.redirect('/admin/postagens')
        })
    })


export default router;