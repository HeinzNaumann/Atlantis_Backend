'use strict'

const { Usuario } = require('../models')
const emailTransportConfigure = require('../lib/emailTransportConfigure')
const nodemailer = require('nodemailer');

module.exports = async function notification(idanuncio) {
    const usersWithFav = await Usuario.find ({
        favs: {$in: [idanuncio]}
    })
    usersWithFav.forEach(async (e) => {
        //console.log('usuarios con favoritos',e)

        // Mandar email a cada usuario
        const result = await Usuario.enviarEmail(
            "Venta de producto",
            `El anuncio, ${idanuncio} que marcaste como favorito, se ha vendido`,
            e.email
        );
    })

    
}