import localAuth from 'passport-local'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import Usuario from '../models/Usuario.js'

const Usuarios = mongoose.model('usuarios')

export default passport => {
    passport.use(new localAuth({usernameField: 'email'}, async (email, senha, done) => {
        Usuarios.findOne({email}).then(usuario => {
            if(!usuario) {
                return done(null, false, {message: 'Esta conta nao existe!'})
            }
        
        bcrypt.compare(senha, usuario.senha, (erro, batem) => {
            if (batem) {
                return done(null, usuario)
            } else {
                return done(null, false, {message: 'Senha incorreta!'})
            }
        })
        })
    }))

    passport.serializeUser((usuario, done) => {
        done(null, usuario.id)
    })

    passport.deserializeUser((id, done) => {
        Usuarios.findById(id, (err, usuario) => {
            done(err, usuario)
        })
    })
}