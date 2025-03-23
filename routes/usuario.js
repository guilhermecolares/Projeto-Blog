import express from 'express'
import mongoose from 'mongoose'
import Usuario from '../models/Usuario.js'
import bcrypt from 'bcryptjs'
import passport from 'passport'

const router = express.Router()
const Usuarios = mongoose.model('usuarios')

router.get('/registro', (req, res) => {
    res.render('usuarios/registro')
})

router.post('/registro', async (req, res) => {
    const { nome, email, senha, senha2 } = req.body

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const senhaRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/

    let erros = []

    if(!nome || typeof nome == undefined || nome == null){
        erros.push({texto: 'Campo "Nome" vazio!'})
    }

    if(nome.length < 3) {
        erros.push({texto: 'Nome muito curto! (3 caracteres ou mais)'})
    }

    if(!email || typeof email == undefined || email == null){
        erros.push({texto: 'Campo "Email" vazio!'})
    }

    if(!emailRegex.test(email)) {
        erros.push({texto: 'Email inválido!'})
    }

    if(!senha || typeof senha == undefined || senha == null){
        erros.push({texto: 'Campo "Senha" vazio!'})
    }

    if(!senhaRegex.test(senha)){
        erros.push({texto: 'A senha deve ter pelo menos 6 caracteres, uma letra maiúscula e um número!'})
    }

    if(senha != senha2) {
        erros.push({texto: 'As senhas não coincidem. Tente novamente!'})
    }

    if(erros.length > 0) {
        return res.render('usuarios/registro', {erros, usuario: { nome, email} })
    }

    try {
        const usuarioExistente = await Usuarios.findOne({ email })

        if (!usuarioExistente) {
            const salt = await bcrypt.genSalt(12)
            const senhaHash = await bcrypt.hash(senha, salt)


            const novoUsuario = new Usuarios({
                nome,
                email,
                senha: senhaHash
            })

            await novoUsuario.save()

            req.flash('success_msg', 'Conta criada com sucesso!')
            res.redirect('/')
        } else {
            req.flash('error_msg', 'Email ja cadastrado!')
            res.redirect('/usuarios/registro')
        }
    } catch (err) {
        req.flash('error_msg', 'Erro ao criar conta, tente novamente!')
        res.redirect('/usuarios/registro')
    }
})

router.get('/login', (req, res) => {
    res.render('usuarios/login')
})

router.post('/login', async (req, res, next) => {
    const { email, senha } = req.body


    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req, res, next)
})

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        req.flash('success_msg', 'Deslogado com sucesso!')
        res.redirect('/')
    })
})


export default router