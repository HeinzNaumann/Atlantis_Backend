'use strict';


const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const emailTransportConfigure = require('../lib/emailTransportConfigure');

// creo el esquema
const chatSchema = mongoose.Schema({
  anuncio_nombre: { type: String },
  anuncio: { type: String},
  propietario: { type: String },
  propietario_nombre: { type: String },
  usuario_int: { type: String, index: true },
  usuario_int_nombre: { type: String, index: true },
  mensajes: { type: [String] },
  createdAt: { type: Date, default: Date.now }
});

/* 
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


 usuarioSchema.statics.enviarEmail = async function(asunto, cuerpo, email) {

  const transport = await emailTransportConfigure();

  // enviar el email
  const result = await transport.sendMail({
    from: process.env.EMAIL_SERVICE_FROM,
    to: email,
    subject: asunto,
    html: cuerpo
  });

  result.getTestMessageUrl = nodemailer.getTestMessageUrl(result);

  return result;

}  
 */
// creo el modelo
const Chat = mongoose.model('Chat', chatSchema);

// exporto el modelo
module.exports = Chat;
