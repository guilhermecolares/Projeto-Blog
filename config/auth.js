import localAuth from 'passport-local'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import Usuario from '../models/Usuario.js'

const Usuarios = mongoose.model('usuarios')

export default passport => {
    passport.use(new localAuth({ usernameField: 'email', passwordField: 'senha' }, async (email, senha, done) => {
        try {
            const usuario = await Usuarios.findOne({ email })
    
            if (!usuario) {
                return done(null, false, { message: 'Esta conta não existe!' })
            }
    
            const batem = await bcrypt.compare(senha, usuario.senha)
    
            if (batem) {
                return done(null, usuario)
            } else {
                return done(null, false, { message: 'Senha incorreta!' })
            }
        } catch (err) {
            return done(err)
        }
    }))

    passport.serializeUser((usuario, done) => {
        done(null, usuario.id)
    })

    passport.deserializeUser(async (id, done) => {
        try {
            const usuario = await Usuarios.findById(id)
            done(null, usuario)
        } catch (err) {
            done(err, null)
        }
    })
}