const axios = require('axios');

function mostrarResultado(texto, resultado) {
    console.log(`\n-- ${texto}:`, resultado.data.resultado);
}

function mostrarError(error) {
    console.error(`\n-- Error ${error.response?.status}: ${error.response?.data.error}`);
}

// Configuración base de Axios
const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Autenticación del usuario
const autenticarUsuario = async () => {
    try {
        const resultado = await axiosInstance.post('/auth/login', {
            login: 'fernando', // Reemplazar con el nombre de usuario real
            password: '1234567'  // Reemplazar con la contraseña real
        });
        mostrarResultado('Login correcto', resultado);
        return resultado.data.resultado;
    } catch (error) {
        mostrarError(error);
    }
};

// Configuración del token de autenticación para las siguientes solicitudes
const setAuthToken = (token) => {
    if (token) {
        axiosInstance.defaults.headers.common['authorization'] = `Bearer ${token}`;
    } else {
        delete axiosInstance.defaults.headers.common['authorization'];
    }
};

// Crear varias habitaciones (requiere autenticación)
const crearHabitaciones = async (token) => {
    setAuthToken(token);
    const habitaciones = [{
        numero: 10,
        tipo: 'individual',
        descripcion: 'Habitación con vistas al mar',
        precio: 100
    }, {
        numero: 20,
        tipo: 'doble',
        descripcion: 'Habitación con dos camas, muy espaciosa',
        precio: 200
    }, {
        numero: 30,
        tipo: 'familiar',
        descripcion: 'Habitación con cama de matrimonio y literas',
        precio: 200
    }, {
        numero: 40,
        tipo: 'suite',
        descripcion: 'Habitación con dos salas, una cama de matrimonio y dos camas inviduales',
        precio: 250
    }, {
        numero: 50,
        tipo: 'suite',
        descripcion: 'Habitación con una sala y sofá, con vistas al mar',
        precio: 250
    }];

    for (let habitacion of habitaciones) {
        try {
            const resultado = await axiosInstance.post('/habitaciones', habitacion);
            mostrarResultado('Habitación creada', resultado);
        } catch (error) {
            mostrarError(error);
        }
    }
};

// Obtener todas las habitaciones
const obtenerHabitaciones = async () => {
    try {
        const resultado = await axiosInstance.get('/habitaciones');
        mostrarResultado('Datos de habitaciones', resultado);
        return JSON.parse(JSON.stringify(resultado.data.resultado));
    } catch (error) {
        mostrarError(error);
        return [];
    }
};

// Obtener detalles de una habitación específica
const obtenerHabitacion = async (id) => {
    try {
        const resultado = await axiosInstance.get(`/habitaciones/${id}`);
        mostrarResultado('Datos de habitación', resultado);
    } catch (error) {
        mostrarError(error);
    }
};

// Actualizar los datos de una habitación específica (requiere autenticación)
const actualizarHabitacion = async (token, habitacion) => {
    setAuthToken(token);
    try {
        const resultado = await axiosInstance.put(`/habitaciones/${habitacion._id}`, habitacion);
        mostrarResultado('Habitación actualizada', resultado);
    } catch (error) {
        mostrarError(error);
    }
};

// Eliminar una habitación específica (requiere autenticación)
const eliminarHabitacion = async (token, id) => {
    setAuthToken(token);
    try {
        const resultado = await axiosInstance.delete(`/habitaciones/${id}`);
        mostrarResultado('Habitación borrada', resultado);
    } catch (error) {
        mostrarError(error);
    }
};

// Añadir una incidencia a una habitación específica (requiere autenticación)
const crearIncidencia = async (token, id) => {
    setAuthToken(token);
    try {
        const resultado = await axiosInstance.post(`/habitaciones/${id}/incidencias`, {
            descripcion: 'El grifo del aseo gotea'
        });
        mostrarResultado('Incidencia creada', resultado);
        return JSON.parse(JSON.stringify(resultado.data.resultado));
    } catch (error) {
        mostrarError(error);
    }
};

// Marca una incidencia como finalizada para una habitación específica (requiere autenticación)
const actualizarIncidencia = async (token, idH, idI) => {
    setAuthToken(token);
    try {
        const resultado = await axiosInstance.put(`/habitaciones/${idH}/incidencias/${idI}`);
        mostrarResultado('Incidencia actualizada', resultado);
    } catch (error) {
        mostrarError(error);
    }
};

// Obtiene los datos de las limpiezas de una habitación específica
const obtenerLimpiezas = async (id) => {
    try {
        const resultado = await axiosInstance.get(`/limpiezas/${id}`);
        mostrarResultado('Datos de limpieza', resultado);
    } catch (error) {
        mostrarError(error);
    }
};

// Obtiene el estado de una limpieza de una habitación específica
const obtenerEstadoLimpieza = async (id) => {
    try {
        const resultado = await axiosInstance.get(`/limpiezas/${id}/estadolimpieza`);
        mostrarResultado('Datos de limpieza', resultado);
    } catch (error) {
        mostrarError(error);
    }
};

// Actualiza la fecha de limpieza de una habitación específica (requiere autenticación)
const actualizarLimpieza = async (token, id) => { 
    setAuthToken(token);
    try {
        const resultado = await axiosInstance.post(`/limpiezas/${id}`, {
            idHabitacion: id,
            observaciones: 'Limpieza completa por checkout del cliente'
        });
        mostrarResultado('Limpieza actualizada', resultado);
    } catch (error) {
        mostrarError(error);
    }
};

// Ejecución secuencial de las pruebas
const ejecutarPruebas = async () => {
    let habitacion, habitaciones;

    // Login
    console.log("** LOGIN **");
    const token = await autenticarUsuario();
    if (token) {
        // Habitaciones
        console.log("\n\n** PRUEBAS HABITACIONES **");
        habitaciones = await obtenerHabitaciones();
        for(let habitacion of habitaciones) {
            await eliminarHabitacion(token, habitacion._id);
        }
        await crearHabitaciones(token);
        habitaciones = await obtenerHabitaciones();

        //Da este error por el array habitaciones esta vacio 
        console.log("-- Datos de habitaciones:", habitaciones);
        //No lo arreglo porque entiendo que no puedo tocar este test.js
        //Todo funciona a la perfecion en Postman


        await obtenerHabitacion(habitaciones[0]._id);
        habitaciones[0].precio = 115;
        await actualizarHabitacion(token, habitaciones[0]);
        await eliminarHabitacion(token, habitaciones[0]._id);
        await obtenerHabitacion(habitaciones[0]._id);

        // Incidencias
        console.log("\n\n** PRUEBAS INCIDENCIAS **");
        habitacion = await crearIncidencia(token, habitaciones[1]._id);
        await actualizarIncidencia(token, habitacion._id, habitacion.incidencias[0]._id);

        // Limpiezas
        console.log("\n\n** PRUEBAS LIMPIEZAS **");
        await obtenerLimpiezas(habitacion._id);
        await obtenerEstadoLimpieza(habitacion._id);
        await actualizarLimpieza(token, habitacion._id);
    }
};

ejecutarPruebas();
