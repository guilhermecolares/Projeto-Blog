import mongoose from "mongoose";
const Schema = mongoose.Schema;

const usuarioSchema = new Schema({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    eAdmin:{
        type: Number,
        default: 0
    },
    senha: {
        type: String,
        required: true
    }
})

export default mongoose.model('usuarios', usuarioSchema)
