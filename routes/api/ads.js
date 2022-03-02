const express = require("express");
const router = express.Router();
const Anuncio = require("../../models/Anuncio.js");
//const jwtAuth = require("../../lib/jwtAuthMiddleware");
const multer  = require('multer');
const path = require('path');

//TODO
//Borrar imagenes con el delete, posibles problema con permisos en servidor
//actualizar con PUT
//capturar ID de usuario al crear anuncio generado en jwtAuthMiddleware antes de las peticiones (req.apiAuthUserId)


//Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../../public/images/anuncios'))
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
  const upload = multer({ storage: storage })


// /api/ads
//Lista de anuncios
router.get("/", /*jwtAuth*/ async (req, res, next) =>{
    try{
        //console.log("entrando en api")
        const name = req.query.name;
        const price = req.query.price;
        const tag = req.query.tag;
        const skip = parseInt(req.query.skip);
        const limit = parseInt(req.query.limit) || 1000; // nuestro api devuelve max 1000 registros;
        const select = req.query.select; // campos
        const sort = req.query.sort;
        //const start = parseInt(req.query.start) || 0;

        

        const filter = {};
        if(name){
            filter.nombre = name;
        }
        if(price){
            filter.precio = price;
        }
        if(tag){
            filter.tags = tag;
        }

        const anuncios = await Anuncio.lista(filter, skip, limit, select, sort);
        //console.log("ANUNCIOS", anuncios)
        res.json({ results: anuncios });
    }catch (err){
        next(err)
    }
});

// /api/ads:id
//metodo para obtener un anuncio
router.get("/:identificador", async (req, res, next) =>{
    try{
        const _id = req.params.identificador;

        const anuncio = await Anuncio.find({_id: _id});
        res.json({ result: anuncio });
    }catch(err){
        next (err);
    }
});

//const path = require("path");
//POST /api/ads (body)
//Crear un anuncio
router.post("/", upload.single('imagen'),async (req, res, next) =>{
    
    console.log("Entra en API POST");
    try{
        const filename =req.file.filename;
        const anuncioData = {
          ...req.body,
          //image: req.file.path,
         imagen: filename,
         usuario: req.apiAuthUserId
        };        

        const anuncio = new Anuncio(anuncioData);

        const createdAnuncio = await anuncio.save();

        res.status(201).json({ result: createdAnuncio });

    } catch (err){
        next(err);
    }
});

//DELETE /api/ads:id
//Elimina un anuncio
router.delete("/:id", async (req, res, next) =>{
    try{

        const _id = req.params.id;

        await Anuncio.deleteOne({ _id: _id});
        res.json();

    }catch(err){
        next(err)
    }
});

//PUT /api/ads:id (body)lo que quiero actualizar
//Actualizar un anuncio
router.put("/:id", async (req, res, next) =>{
    try{
        
        //console.log("Entra en PUT");
        const _id = req.params.id;
        const anuncioData = req.body;

        //
       // console.log("Body Req:", req.body);

        const updatedAnuncio = await Anuncio.findOneAndUpdate({ _id: _id}, anuncioData, {
            new: true
        });

        if(!updatedAnuncio){
            res.status(404).json({error: "not found"});
            return;
        }
        res.json({ result: updatedAnuncio });

    }catch(err){
        next(err)
    }
})

// /api/ads/tags 
//Lista de anuncios
/*
router.get('/tags',function(req, res){
    //tgs = Anuncio.listTags();
    console.log("Entra en tags");
    res.json({ result: "Tags" });
});
*/


module.exports = router;