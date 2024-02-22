const moment = require('moment');

function formateadorFechas(fecha) {
    // Parsea la fecha
    const fechaParseada = moment(fecha);

    // Formatea la fecha en el formato DD/MM/YYYY
    const fechaFormateada = fechaParseada.format('DD/MM/YYYY');

    return fechaFormateada;
}

module.exports = formateadorFechas;
