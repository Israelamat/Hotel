const multer = require("multer");

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/habitaciones");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

let uploadIncidencias = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/incidencias");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

let upload = multer({ storage: storage });
let uploadIncidencia = multer({ storage: uploadIncidencias }); 

module.exports = { upload: upload, uploadIncidencia: uploadIncidencia };
