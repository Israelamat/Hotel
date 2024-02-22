const express = require("express");
const router = express.Router();
const {autenticacion} = require("../utils/auth");
let upload = require(__dirname + "/../utils/uploads.js");
let uploadIncidencia = require(__dirname + "/../utils/uploads.js");
const Habitacion = require("../models/habitacion");


const Limpieza = require("../models/limpieza");

//Metdodo de prueba para ver si las limpiezas aparecen bien  
router.get("/", (req, res) => {
    Limpieza.find().then(resultado => {
        res.render("limpiezas_listado", {limpiezas: resultado});
    }).catch(error => {
        res.render("error", {error : "Error listando Limpiezas"});
    })
})

router.get("/nueva/:id", autenticacion, (req, res) => {
    Habitacion.findById(req.params.id).then((resultado) => {
        if (resultado) {
        const fecha = new Date();
        res.render("limpiezas_nueva", { habitacion: resultado, fecha: fecha});
        }else{
        res.render("error", { error: "Error obteniendo habitación" });
        }
    })
    .catch((error) => {
        res.render("error", { error: "Error obteniendo habitación" });
    });
});


router.post("/:id", (req, res) => {
    let nuevaLimpieza = new Limpieza({
      idHabitacion: req.params.id,
      fechaHora: req.body.fecha,
      observaciones: req.body.observaciones,
    });
    if (req.body.observaciones) {
      nuevaLimpieza.observaciones = req.body.observaciones;
    }
  
    nuevaLimpieza
      .save()
      .then((resultado) => {
        if (resultado) {
          Habitacion.findById(req.params.id)
            .then((habitacion) => {
              Limpieza.find({ idHabitacion: habitacion.id })
                .sort({ fechaHora: -1 })
                .then((resultadoLimpieza) => {
                  habitacion.ultimaLimpieza = resultadoLimpieza[0].fechaHora;
                  habitacion
                    .save()
                    .then((resultadoHabitacion) => {
                      res.render("limpiezas_listado", {
                        limpiezas: resultadoLimpieza,
                        habitacion: resultadoHabitacion,
                      });
                    })
                    .catch((error) => {
                      res.render("error", {
                        error: "Error actualizando habitación",
                      });
                    });
                })
                .catch((error) => {
                  res.render("error", { error: "Error obteniendo limpiezas" });
                });
            })
            .catch((error) => {
              res.render("error", { error: "Error obteniendo habitación" });
            });
        }
      })
      .catch((error) => {
        res.render("error", { error: "Error actualizando limpieza" });
      });
  });

// router.get("/:id", (req, res) => {
//     const idHabitacion = req.params.id;
//     Limpieza.find({idHabitacion: idHabitacion})
//         .then(resultado => {
//             res.render("limpiezas_listado", {limpiezas : resultado});
//         }).catch(error => {
//             res.render("error", {error: "Error buscando limpiezas para esta Habitación"});
//         })
// })

router.get("/:id", (req, res) => {
    const idHabitacion = req.params.id;
  
    if (idHabitacion) {
      Limpieza.find({ idHabitacion: idHabitacion })
        .sort({ fechaHora: -1 })
        .then((resultado) => {
          Habitacion.findById(idHabitacion).then((resultadoHabitacion) => {
            res.render("limpiezas_listado", {
              limpiezas: resultado,
              habitacion: resultadoHabitacion,
            });
          });
        })
        .catch((error) => {
          res.render("error", {
            error: "No hay limpiezas registradas para esa habitación",
          });
        });
    }
  });



module.exports = router;