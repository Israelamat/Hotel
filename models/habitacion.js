const mongoose = require("mongoose");

let incidenciasSchema = new mongoose.Schema({
    descripcion: {
        type: String,
        required: [true, "La descripción es obligatoria"],
    },

    fechaInicio: {
        type: Date,
        required: true,
        default: Date.now
    },

    _idIncidencia: {
        type: mongoose.Schema.Types.ObjectId,
        //default: mongoose.Types.ObjectId,  //Se comenta para podercrear hab sin incidencias
        required: false //Para poder crear habitaciones sin incidencias 
    },

    fechaFin: {
        type: Date
    },

    imagen: {
        type:String
    },
});

let habitacionSchema = new mongoose.Schema({
    numero: {
        type: Number,
        required: [true, "El número de habitación es obligatorio"],
        unique: [true, "El número de habitación debe ser único"],
        min: [1, "El número de habitaciones tiene que ser mayor que 1"],
        max: [100, "El numero de habitaciones tiene que ser menor que 100"],
    },

    tipo: {
        type: String,
        enum: ["individual", "doble", "familiar", "suite"],
        required: true
    },

    descripcion: {
        type: String,
        required: [true, "Es necesario indicar una descripción de la habitación"]
    },

    ultimaLimpieza: {
        type: Date,
        required: true,
        default: Date.now
    },

    precio: {
        type: Number,
        required: [true, "El precio es obligatorio"],
        min: [0, "El precio mínimo es de 0€"],
        max: [300, "El precio no puede exceder los 300€"]
    },

    incidencias: [incidenciasSchema],

    //No pongo el error de la imagen aqui para que se añada el archivo al 
    //proyecto pero no se añada la habitación
    imagen:{
        type:String
    },
});

const Habitacion = mongoose.model("Habitacion", habitacionSchema);

module.exports = Habitacion;

if (Habitacion) {
    console.log("Se creó correctamente el esquema de Habitacion");
} else {
    console.error("¡Error!");
}
