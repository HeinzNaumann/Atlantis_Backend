var express = require('express');
var router = express.Router();
const {Usuario, Anuncio} = require('../../models')
const jwtAuth = require('../../lib/jwtAuthMiddleware')
const bcrypt = require('bcrypt');


/* GET users listing. */
/* router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
 */

/**
* DELETE user
* Habrá que borrar todos sus anuncios creados
*/


router.delete('/:id', jwtAuth, async (req, res, next)=> {
 
  const _id = req.params.id;

  try {
    console.log(`El usuario ${_id} ha sido eliminado`);
    await Usuario.deleteOne({ _id: _id });
    
    //Borrar anuncios del usuario
    await Anuncio.deleteAdsByUser(_id);
    //console.log(`Se han eliminado ${ads} anuncios`);

    res.json();
  } catch (error) {
    next(error);
  };
})

router.post("/", async (req, res, next) =>{
    
  console.log("crear usuario");
  //si existe el nombre o correo no se crea
  const nombre ={'nombre':req.body.nombre}
  const email ={'email': req.body.email}
  const existeNombre = await Usuario.notExistName(nombre);
  const existeEmail = await Usuario.notExistEmail(email);
  
  if((existeNombre.length>0) || (existeEmail.length>0)){
    res.json({ result: "ya existe el email o nombre en el sistema" });
    return;
  }
  try{
      const clave = await bcrypt.hash(req.body.password, 7)
      const usuarioData = {
        ...req.body, 
        password:clave
      };        
      

      const usuario = new Usuario(usuarioData);
      const createdUsuario = await usuario.save();
     // console.log(createdUsuario)
      res.status(201).json({ result: createdUsuario });

  } catch (err){
      next(err);
  }
});

// /api/users:id
//metodo para obtener un usuario
router.get("/:identificador", async (req, res, next) =>{
  try{
      const _id = req.params.identificador;

      const usuario = await Usuario.find({_id: _id});
      // recuperar los anuncios fav del usuario antes de devolver los datos del usuario
      res.json({ result: usuario });
  }catch(err){
      next (err);
  }
});


//PUT /api/users:id (body)lo que quiero actualizar
//Actualizar un usuario
router.put("/:id", async (req, res, next) =>{
  
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
