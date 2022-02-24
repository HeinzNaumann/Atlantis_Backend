var express = require('express');
var router = express.Router();
const {Usuario} = require('../../models')
const jwtAuthMiddleware = require('../../lib/jwtAuthMiddleware')
const bcrypt = require('bcrypt');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


/**
* DELETE user
* Habrá que borrar todos sus anuncios creados
*/


router.delete('/:id', jwtAuthMiddleware, async (req, res, next)=> {

  try {
    console.log(`El usuario ${_id} ha sido eliminado`);
    await User.deleteOne({ _id: _id });
    res.json();
  } catch (error) {
    next(error);
  };
})

router.post("/", async (req, res, next) =>{
    
  console.log("crear usuario");
  try{
      const clave = await bcrypt.hash(req.body.password, 7)
      const usuarioData = {
        ...req.body, 
        password:clave
      };        

      const usuario = new Usuario(usuarioData);

      const createdUsuario = await usuario.save();
      console.log(createdUsuario)
      res.status(201).json({ result: createdUsuario });

  } catch (err){
      next(err);
  }
});


module.exports = router;
