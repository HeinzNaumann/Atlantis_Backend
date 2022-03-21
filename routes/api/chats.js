var express = require('express');
var router = express.Router();
const {Usuario, Anuncio, Chat} = require('../../models')
const jwtAuth = require('../../lib/jwtAuthMiddleware')
const bcrypt = require('bcrypt');


router.post("/", async (req, res, next) =>{
    
  console.log("crear chat");
  console.log("Body", req.body);
  //const date= Date.now().toString();
  //console.log("Date",date)
 // console.log(typeof(date));
  try{
      const chatData = {
        ...req.body,
        mensajes:[{nombre:req.body.nombre, mensaje: req.body.mensaje }]
      };        
      

      const chat = new Chat(chatData);
      const createdChat = await chat.save();

      // enviar email al usuario
/* 			const result = await Usuario.enviarEmail(
						"Registro de usuario",
						"Bienvenido a Atlantis",
            usuario.email
            
			);
					console.log("Mensaje enviado", result.messageId); */


          
				//	console.log("ver mensaje", result.getTestMessageUrl);
     // console.log(createdUsuario)
         res.status(201).json({ msg: "Chat created succesfully", chat: createdChat });

  } catch (err){
      next(err);
  }
});

// /api/users:id
//metodo para obtener un usuario
router.get("/:identificador", async (req, res, next) =>{
  try{
      const user = req.params.identificador;
      let usuario="";
     // if (user.match(/^[0-9a-fA-F]{24}$/)) {
        // Yes, it's a valid ObjectId, proceed with `findById` call.
       //   usuario = await Usuario.find({_id: user});
      //}
      const usuario2 = await Usuario.find({nombre: user});
      if(usuario || usuario2){
           res.json({ result: usuario || usuario2 });
       }else{
           res.json({ result: "null" });
       }
  }catch(err){
      next (err);
  }
});


//PUT /api/users:id (body)lo que quiero actualizar
//Actualizar un usuario
router.put("/:id", async (req, res, next) =>{
  
   console.log("Entra en PUT");
   try{
      //si existe el nombre o correo no se actualiza
      const _id = req.params.id;
      const existeChat = await Chat.findById({_id:_id});
      
      if(!existeChat.length===0){
        res.json({ msg: "Chat not found"});
        return;
      }
      //console.log("existeChat",existeChat);
      let msjs = existeChat.mensajes;
      msjs = [...msjs,{nombre:req.body.nombre, mensaje: req.body.mensaje }]
      chatData = {
            ...req.body, 
              mensajes:msjs,
              updatedAt: Date.now()        
      };        
      
      // console.log("Body Req:", req.body);

      const updatedChat = await Chat.findOneAndUpdate({ _id: _id}, chatData, {
          new: true
      });
       // actualizo usuario_nombre en los anuncios de los usuarios
    
      if(!updatedChat){
          res.status(404).json({error: "Chat not updated"});
          return;
      }
      res.json({ result: updatedChat });

  }catch(err){
      next(err)
  }
});


//crear un chat de forma temporal en front cuando no hay de ese anuncio con ese usuario y añadirlo al principio del array

//GET /api/chat.. puede venir de: listado de anuncio, detalle, menu header
//Añadir o eliminar favoritos
router.get("/",/* jwtAuth,*/ async (req, res, next) =>{
  try{
    const ad = req.query.ad? req.query.ad: 0; // id anuncio
    const user = req.query.user; // id usuario 
    const existChat = await Chat.existChatUserAd(user,ad);
    const arrayChats = await Chat.getChatUser(user,ad);

     // si es una petición que viene de listado o detalle de anuncio
    if(ad && user){ 
      if(existChat.length>0){ // si tiene chat con ese anuncio
         res.json({result: arrayChats, existChatAd:1});
      }else{ // si no tiene chat con ese anuncio
         res.json({result: arrayChats, existChatAd:0});
      }
    }
   
   // si es una petición que viene del menu de header asumiendo que siempre hay user
    if(user && !ad){
      res.json({result: arrayChats, existChatAd:2});
    }
  }catch(err){
    next(err)
  }
});


module.exports = router;
