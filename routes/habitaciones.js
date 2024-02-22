const express = require("express");
const router = express.Router();
const formateadorFechas = require('../funciones/formateadorFechas');
const {autenticacion} = require("../utils/auth");
let upload = require(__dirname + "/../utils/uploads.js");
let uploadIncidencia = require(__dirname + "/../utils/uploads.js");
//const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

let app = express();

//const methodOverride = require('method-override');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));

app.use(express.urlencoded({ extended: true }));

const Habitacion = require("../models/habitacion");


// router.get("/", (req, res) => {
//     res.redirect(__dirname + "/public/views/index.html");
// })

router.get("/", (req, res) => { 
    Habitacion.find().then(resultado => {
        res.render("habitaciones_listado", { habitaciones: resultado, fechaInicio: resultado.fechaInicio});
    }).catch(err => {
        res.render('error', { error: "Error listando habitaciones" });
    });
});

router.get("/:id", (req, res) => {
    const habitacionId = req.params.id;

    if (habitacionId === 'nueva') {
        res.render("habitaciones_nueva");
    } else {

    Habitacion.findById(habitacionId)
        .then(resultado => {
            if (resultado) {
                res.render("habitaciones_ficha", { habitacion: resultado });
            } else {
                res.render("error", { error: "Habitación no encontrada" });
            }
        })
        .catch(error => {
            res.render("error", { error: "Error buscando la habitación" });
        });
}});

router.get("/:tipo", (req, res) => {
    const tipo = req.params.tipo;

    Habitacion.find({tipo: tipo}).then(resultado => {
        res.render("habitaciones_listado", {tipos: resultado});
    })
    .catch(error => {
        res.render("error", {error:"Error listando Los tipos"})
    });
});

router.get("/nueva",autenticacion, (req, res) => {
    res.render("habitaciones_nueva");
  });
  
  router.post("/editar/:id", autenticacion, (req, res) => {
    Habitacion.findById(req.params.id).then(resultado => {
        if (resultado) {
            res.render('habitaciones_editar', { habitacion: resultado });
        } else {
            res.render('error', { error: "Habitacion no encontrada" });
        }
    }).catch(error => {
        res.render('error', { error: "Habitacion no encontrada" });
    });
});


const allowedImageFormats = ['jpg', 'jpeg', 'png'];

router.post("/", upload.upload.single('imagen'), async (req, res) => {
  try {
    const habitacionExistente = await Habitacion.findOne({ numero: req.body.numero });

    if (habitacionExistente) {
      let errores = { numero: "Ya existe una habitación con este número." };
      return res.render("habitaciones_nueva", { error: errores });
    }

    if (req.file) {
      const fileExtension = req.file.originalname.split('.').pop().toLowerCase();

      if (!allowedImageFormats.includes(fileExtension)) {
        let errores = { imagen: "Formato de imagen no permitido. Por favor, sube una imagen jpg, jpeg o png." };
        return res.render("habitaciones_nueva", { error: errores });
      }
    }

    let nuevaHabitacion = new Habitacion({
      numero: req.body.numero,
      tipo: req.body.tipo,
      descripcion: req.body.descripcion,
      precio: req.body.precio,
    });

    if (req.file) {
      nuevaHabitacion.imagen = req.file.filename;
    }

    await nuevaHabitacion.save();
    res.redirect(req.baseUrl);
  } catch (error) {
    let errores = {};

    if (error && error.errors) {
      Object.keys(error.errors).forEach((clave) => {

          errores[clave] = error.errors[clave].message;
        
      });
    } else {
      errores.general = "Error insertando la habitación";
    }

    res.render("habitaciones_nueva", { error: errores });
  }
});



router.post("/:id", upload.upload.single('imagen'), (req, res) => {
  Habitacion.findById(req.params.id).then(habitacion => {
    if (habitacion) {
      habitacion.numero = req.body.numero;
      habitacion.tipo = req.body.tipo;
      habitacion.descripcion = req.body.descripcion;
      if(req.body.ultimaLimpieza != null){
        habitacion.ultimaLimpieza = req.body.ultimaLimpieza ;
      }
      habitacion.precio = req.body.precio;

      if (req.file) {
        habitacion.imagen = req.file.filename;
      }

      habitacion.save()
        .then(resultado => {
          res.redirect(req.baseUrl + "/" + req.params.id);
        })
        .catch(error => {
          let errores = {};

          if (error && error.errors) {
            Object.keys(error.errors).forEach((clave) => {
              errores[clave] = error.errors[clave].message;
            });
          } else {
            errores.general = "Error actualizando los datos de la habitación";
          }

          //TO DO: Enviar también la habitacion
          res.render("habitaciones_editar", { error: errores });
          //console.log(error);
        });
    } else {
      //res.render("habitaciones_editar", { error: errores });
      res.render("error", { error: "Error actualizando los datos de la habitación" });
    }
  })
  .catch(error => {
    console.error("Error al buscar la habitación:", error);
    res.render("error", { error: "Error actualizando los datos de la habitación (buscar)" });
  });
});


router.delete("/:id",autenticacion, (req, res) => {
Habitacion.findByIdAndDelete(req.params.id)
    .then((resultado) => {
    res.redirect(req.baseUrl);
    })
    .catch((error) => {
    res.status(400).send({ error: "Error eliminando la habitación" });
    });
});


router.post("/:id/incidencias",autenticacion, uploadIncidencia.uploadIncidencia.single('imagen'), (req, res) => {
  let nuevaIncidencia = {
    descripcion: req.body.descripcion,
  };

  if (req.file) {
    nuevaIncidencia.imagen = req.file.filename;
  }

  Habitacion.findByIdAndUpdate(
    req.params.id,
    {
      $push: {
        incidencias: nuevaIncidencia,
      },
    },
    { new: true }
  )
    .then((resultado) => {
      res.redirect(req.baseUrl + "/" + req.params.id);
    })
    .catch((error) => {
      res.render("error", { error: "Error añadiendo la incidencia"});
    });
});
   

router.post("/:idH/incidencias/:idI", autenticacion, (req, res) => {
  Habitacion.findById(req.params.idH)
      .then((habitacion) => {
          if (habitacion) {
              const incidencia = habitacion.incidencias.id(req.params.idI);
              if (incidencia) {
                  incidencia.fechaFin = new Date();
                  habitacion.save()
                      .then(() => {
                          res.redirect(req.baseUrl + "/" + req.params.idH);
                      })
                      .catch((error) => {
                          res.status(500).render("error", { error: "Error cerrando la incidencia" });
                      });
              } else {
                  res.status(404).render("error", { error: "Incidencia no encontrada" });
              }
          } else {
              res.status(404).render("error", { error: "Habitación no encontrada" });
          }
      })
      .catch((error) => {
          res.status(500).render("error", { error: "Error cerrando la incidencia" });
      });
});

module.exports = router;