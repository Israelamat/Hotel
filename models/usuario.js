const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema({
    login: {
        type: String,
        required: true,
        minLength: 4
    },
    password: {
        type: String,
        required: true,
        minLength: 7
    }
});

const Usuario = mongoose.model("Usuario", usuarioSchema);

module.exports = Usuario;

if(Usuario){
    console.log("Se creo bien el Schema Usuario");
} else{
    console.log("Error!!");
}
