const express = require('express');
const Usuario = require('../models/usuario');
const mongoose = require("mongoose");
const bcrypt = require('bcrypt'); // Asegúrate de importar bcrypt

let router = express.Router();

//Los Añadia como se añade de normal (.save())y no me funcionaba
mongoose.connection.once('open', async () => {
    try {
        await Usuario.createCollection();
        console.log('Tabla de Usuario creada con éxito');

        // Crear usuarios iniciales si no existen
        const usuariosIniciales = [
            { login: 'Israel', password: 'password123' },
            { login: 'Admin', password: 'admin1234' }
        ];

        for (const usuarioInicial of usuariosIniciales) {
            try {
                const usuarioExistente = await Usuario.findOne({ login: usuarioInicial.login });
        
                if (!usuarioExistente) {
                    const hashedPassword = await bcrypt.hash(usuarioInicial.password, 10);
                    await Usuario.create({ login: usuarioInicial.login, password: hashedPassword });
                    console.log(`Usuario ${usuarioInicial.login} creado con éxito`);
                } else {
                    console.log(`El usuario ${usuarioInicial.login} ya existe en la base de datos`);
                }
            } catch (error) {
                console.error(`Error al crear el usuario ${usuarioInicial.login}:`, error.message);
            }
        }

    } catch (error) {
        console.error('Error al crear la tabla de Usuario o usuarios iniciales:', error);
    }
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/habitaciones');
});

router.post('/login', async (req, res) => {
    try {
        const login = req.body.login;
        const password = req.body.password;

        const usuario = await Usuario.findOne({ login: login });

        if (usuario && await bcrypt.compare(password, usuario.password)) {
            req.session.usuario = usuario.login; 
            res.redirect('/habitaciones');
        } else {
            res.render('login', { error: "Usuario o contraseña incorrectos" });
        }
    } catch (error) {
        res.render('login', { error: "Ocurrió un error al procesar la solicitud" });
    }
});

module.exports = router;
