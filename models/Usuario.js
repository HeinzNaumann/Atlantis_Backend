'use strict';

const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const emailTransportConfigure = require('../lib/emailTransportConfigure')

// creo el esquema
const usuarioSchema = mongoose.Schema({
  nombre: { type: String, unique: true },
  email: { type: String, unique: true },
  password: { type: String, require:true },
  favs: { type: [String], index: true },
  conectado: { type: Boolean},
});

usuarioSchema.statics.hashPassword = function(passwordEnClaro) {
  return bcrypt.hash(passwordEnClaro, 7);
}

usuarioSchema.methods.comparePassword = function(passwordEnClaro) {
  return bcrypt.compare(passwordEnClaro, this.password);
}


usuarioSchema.methods.enviarEmail = async function(asunto, cuerpo) {

  const transport = await emailTransportConfigure();

  // enviar el email
  const result = await transport.sendMail({
    from: process.env.EMAIL_SERVICE_FROM,
    to: this.email,
    subject: asunto,
    html: cuerpo
  });

  result.getTestMessageUrl = nodemailer.getTestMessageUrl(result);

  return result;

}  

// creo el modelo
const Usuario = mongoose.model('Usuario', usuarioSchema);

// exporto el modelo
module.exports = Usuario;
