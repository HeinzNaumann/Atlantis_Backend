const express = require("express");
const Anuncio = require("../../models/Anuncio.js");
//const jwtAuth = require("../../lib/jwtAuthMiddleware");



const router = express.Router();


// /api/ads
//Lista de anuncios
router.get("/ads", /*jwtAuth*/ async (req, res, next) =>{
    try{
        console.log("entrando en api")
        const name = req.query.name;
        const price = req.query.price;
        const tag = req.query.tag;
        const skip = parseInt(req.query.skip);
        const limit = parseInt(req.query.limit);
        const select = req.query.select; // campos
        const sort = req.query.sort;
        

        const filter = {};
        if(name){
            filter.name = name;
        }
        if(price){
            filter.price = price;
        }
        if(tag){
            filter.tag = tag;
        }

        const anuncios = await Anuncio.lista(filter, skip, limit, select, sort);
        console.log("AQUI", anuncios)
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
router.post("/", async (req, res, next) =>{
    
    try{

        const anuncioData = {
          ...req.body,
          //image: req.file.path,
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

        const _id = req.params.id;
        const anuncioData = req.body;

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


module.exports = router;