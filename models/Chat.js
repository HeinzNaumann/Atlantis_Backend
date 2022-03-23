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
  mensajes: { type: [{nombre:{type: String},mensaje:{type: String},createdAtMsg: { type: Date, default: Date.now }}] },
  nuevo_msj: { type: Boolean, default:true}, 
  updatedAt: { type: Date, default: Date.now }
});


chatSchema.statics.getChatUser = async function(user,ad){
  let chatad=[];
  let arraybuyer=[];
  let result=[];
  //let arrayseller=[];
  if(ad){
    // chatad = await Chat.find({anuncio:ad});
     arraybuyer = await Chat.existChatUserAd(user,ad);  //si es comprador
  }
  if(!ad){ //Viene del header propietario o usuario
    chatad = await Chat.getAllChat(user);
    result = [...chatad]
  }
  //si es comprador
  // const arraybuyer = chatad.filter(ad =>ad.usuario_int == user);
  //si es vendedor 
  //arrayseller = chatad.filter(ad =>ad.propietario == user);
  
  if(arraybuyer.length>0){
     const allchat = await Chat.getAllChat(user); // obtiene todos sus chats
     result =[...arraybuyer, ...allchat];

    /* if(arrayseller.length>0){
       result = arrayseller.length>1? arrayseller.sort((t1, t2) => t2.updatedAt.localeCompare(t1.updatedAt)): arrayseller;
       result =[...arraybuyer,...result];
    }else{ // es comprador y ya tiene un chat con ese anuncio
       const allchat = await getAllChat(user); // obtiene todos sus chats
       //result = allchat.sort((t1, t2) => t2.updatedAt.localeCompare(t1.updatedAt))
       result =[...arraybuyer, ...allchat];
    } */
  }else{
   /*  if(arrayseller.length>0){
      result = arrayseller.length>1? arrayseller.sort((t1, t2) => t2.updatedAt.localeCompare(t1.updatedAt)): arrayseller;
    } */
    //es comprador pero no tiene chat con ese anuncio, devolver el resto de sus chats
    if((arraybuyer.length==0)&&(ad)){
      const allchat = await Chat.getAllChat(user); // obtiene todos sus chats
      result = [...allchat];
    }
  }
  return result;
}



chatSchema.statics.existChatUserAd = async function(user,ad){
  const chatad = await Chat.find({anuncio:ad});
  //si es comprador
  const arraybuyer = chatad.filter(ad =>ad.usuario_int == user);
  return arraybuyer;
}


chatSchema.statics.getAllChat = async function(user){
  let chatad = await Chat.find({propietario:user}); // como propietario
  let chatad2 = await Chat.find({usuario_int:user}); // como cliente
  chatad = [...chatad,...chatad2]
    if(chatad.length>0){
    chatad = chatad.sort((t1, t2) => t2.updatedAt.toString().localeCompare(t1.updatedAt.toString()))
  }

  return chatad;
}

// creo el modelo
const Chat = mongoose.model('Chat', chatSchema);

// exporto el modelo
module.exports = Chat;
