'use strict';

// TODO:
// verificar que si no existe el usuario el error es que no existe usuario

const mongoose = require('mongoose');
//const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
//const emailTransportConfigure = require('../lib/emailTransportConfigure');

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

usuarioSchema.statics.notExistEmail = function(email){
  const query = Usuario.find(email); 
   //const res = await query.exec();
   //console.log("ResE: ", res);
  return query.exec();
}

usuarioSchema.statics.notExistName = function(nombre){
  const query = Usuario.find(nombre); 
   //const res = await query.exec();
   //console.log("ResN: ", res);
  return query.exec();
}

usuarioSchema.statics.updateFav = async function(usuario,fav){

  // buscar el usuario en la base de datos
  const user = await Usuario.findOne({ _id:usuario });
  let arrayFavs = [...user.favs];
  let res=[];
  // si existe ese anuncio en favoritos se elimina
  if(arrayFavs.filter(element=>element === fav).length>0){
     res = arrayFavs.filter(element=>element !== fav);
  }else{ // si no existe lo añado
     res = [...arrayFavs,fav];
  }

  // actualizo la BD con el nuevo array de fav de ese usuario
  const usuarioData = { favs: res }
  const updatedUsuario = await Usuario.findOneAndUpdate({ _id: usuario}, usuarioData, {
    new: true
  });

   if(!updatedUsuario){
        //res.status(404).json({error: "not found"});
        return res="Error al actualizar favoritos";
    }
  return res; 
}

/*
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

}  */

// creo el modelo
const Usuario = mongoose.model('Usuario', usuarioSchema);

// exporto el modelo
module.exports = Usuario;
