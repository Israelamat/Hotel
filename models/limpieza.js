const mongoose = require("mongoose");

let limpiezaSchema = new mongoose.Schema({

    idHabitacion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Habitacion",
        required: true
    },

    fechaHora: {
        type: Date,
        required: true,
        default: Date.now
    }, 

    observaciones: {
        type: String
    }
});

const Limpieza = mongoose.model("Limpieza", limpiezaSchema);

module.exports = Limpieza;

if(Limpieza){
    console.log("Se creo bien el Schema Limpieza");
} else{
    console.log("Error!!");
}