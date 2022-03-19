var express = require('express');
var router = express.Router();
const {Usuario, Anuncio, Chat} = require('../../models')
const jwtAuth = require('../../lib/jwtAuthMiddleware')
const bcrypt = require('bcrypt');


router.post("/", async (req, res, next) =>{
    
  console.log("crear chat");

  try{
      const chatData = {
        ...req.body
      };        
      

      const chat = new Chat(chatData);
      const createdChat = await Chat.save();

      // enviar email al usuario
/* 			const result = await Usuario.enviarEmail(
						"Registro de usuario",
						"Bienvenido a Atlantis",
            usuario.email
            
			);
					console.log("Mensaje enviado", result.messageId); */


          
				//	console.log("ver mensaje", result.getTestMessageUrl);
     // console.log(createdUsuario)
         res.status(201).json({ msg: "User created succesfully", chat: createdChat });

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
      if (user.match(/^[0-9a-fA-F]{24}$/)) {
        // Yes, it's a valid ObjectId, proceed with `findById` call.
          usuario = await Usuario.find({_id: user});
      }
      const usuario2 = await Usuario.find({nombre: user});
      if(usuario || usuario2){
      // recuperar los anuncios fav del usuario antes de devolver los datos del usuario
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
router.put("/:id", jwtAuth, async (req, res, next) =>{
  
   console.log("Entra en PUT");
   try{
      //si existe el nombre o correo no se actualiza
      if(req.body.nombre || req.body.email){
          const nombre ={'nombre':req.body.nombre}
          const email ={'email': req.body.email}
          const existeNombre = await Usuario.notExistName(nombre);
          const existeEmail = await Usuario.notExistEmail(email);
          
          if((existeNombre.length>0) || (existeEmail.length>0)){
            res.json({ result: "ya existe el email o nombre en el sistema"});
            return;
          }
       }
      

      //console.log("Entra en PUT");
      const _id = req.params.id;
      let usuarioData = {...req.body}
      //Si existe datos en el campo password sobrescribo usuarioData con pass encriptada
      if(req.body.password){
          const clave = await bcrypt.hash(req.body.password, 7)
          usuarioData = {
            ...req.body, 
            password:clave
          };        
      }
      
     // console.log("Body Req:", req.body);

      const updatedUsuario = await Usuario.findOneAndUpdate({ _id: _id}, usuarioData, {
          new: true
      });
       // actualizo usuario_nombre en los anuncios de los usuarios
      if(updatedUsuario && req.body.nombre){
         await Anuncio.UpdateUserName(_id,req.body.nombre);
      }

      if(!updatedUsuario){
          res.status(404).json({error: "not found"});
          return;
      }
      res.json({ result: updatedUsuario });

  }catch(err){
      next(err)
  }
});

//GET /api/users?fav 
//Añadir o eliminar favoritos
router.get("/", jwtAuth, async (req, res, next) =>{
  try{
    const fav = req.query.fav; // id anuncio fav 
    const usuario = req.apiAuthUserId; // id usuario generado en jwtAuth
    const favs = req.query.favs; // si peticion ads favoritos
    // si es una petición de añadir/eliminar fav
    if(fav){
      const arrayFavs = await Usuario.updateFav(usuario, fav);
      res.json({result: arrayFavs});
    }
    // si es una peticion de ver favoritos del usuario
    if(favs === "true"){
      const arrayf = await Usuario.findOne({_id:usuario});
      const arrayFavs = [...arrayf.favs];
      const adsFavs = await Anuncio.adsFavs(arrayFavs);
      res.json({ result: adsFavs});
    }

  }catch(err){
    next(err)
  }
});


module.exports = router;
