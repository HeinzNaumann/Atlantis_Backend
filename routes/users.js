var express = require('express');
var router = express.Router();
const Usuario = require('../models')
const jwtAuthMiddleware = require('../lib/jwtAuthMiddleware')
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

module.exports = router;
