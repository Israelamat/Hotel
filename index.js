const express = require("express");
const mongoose = require("mongoose");
const nunjucks = require('nunjucks');
const dateFilter = require("nunjucks-date-filter");
const methodOverride = require('method-override');
const session = require('express-session');
const dotenv = require('dotenv');

dotenv.config();

const Habitacion = require(__dirname + "/models/habitacion");
const Limpieza = require(__dirname + "/models/limpieza");
const Usuario = require(__dirname + "/models/usuario")

const habitaciones = require("./routes/habitaciones"); 
const limpiezas = require("./routes/limpiezas");
const auth = require(__dirname + '/routes/auth');
//const methodOverride = require('method-override');

let app = express();

app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb://127.0.0.1:27017/hotel", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

mongoose.connection.once('open', async () => {
    try {
        await Usuario.createCollection();
        console.log('Tabla de Usuario creada con éxito');
    } catch (error) {
        console.error('Error al crear la tabla de Usuario:', error);
    }
});

nunjucks.configure("views", {
    autoescape: true,
    express: app
}).addFilter("date", dateFilter);

app.set("view engine", "njk");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inicializar session
app.use(session({
    secret: '1234',
    resave: true,
    saveUninitialized: false,
    expires: new Date(Date.now() + (30 * 60 * 1000))
  }));
  app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
  });
  // Middleware para procesar otras peticiones que no sean GET o POST
  app.use(methodOverride(function (req, res) {
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        let method = req.body._method;
        delete req.body._method;
        return method;
      } 
  }));

app.use('/public', express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/auth', auth);    
app.use("/habitaciones", habitaciones);
app.use("/limpiezas", limpiezas);
//app.use("/habitaciones", habitacionRoute);
//app.use("/limpiezas", limpiezaRoute);
//app.use("/habitacionesViews", habitacionRouteViews);

//En la direccion raiz devuelve el json entero para hacer comporbaciones:
app.get("/", (req, res) => {
    Habitacion.find().then(hab => {
        res.status(200).send({ok:true, Habitaciones: hab});
    }).catch(err => {
        res.status(500).send({ok:false, err : "Error listando Habitaciones"});
    });
})

app.get("/habitaciones", (req, res) => {
    Habitacion.find().then(hab => {
        res.status(200).send({ok:true, Habitaciones: hab});
    }).catch(err => {
        res.status(500).send({ok:false, err : "Error listando Habitaciones"});
    });
})

app.get("/limpiezas", (req, res) => {
    Limpieza.find().then(limp => {
        res.status(200).send({ok:true, Limpiezas: limp});
    }).catch(err => {
        res.status(500).send({ok:false, err : "Error listando las limpiezas"});
    });
});

app.get("/auth", (req, res) => {
    Limpieza.find().then(limp => {
        res.status(200).send({ok:true, Limpiezas: limp});
    }).catch(err => {
        res.status(500).send({ok:false, err : "Error auth"});
    });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Servidor en funcionamiento en http://localhost:${PORT}`);
});