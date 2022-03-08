const express = require("express");
const router = express.Router();
const Anuncio = require("../../models/Anuncio.js");
//const jwtAuth = require("../../lib/jwtAuthMiddleware");
const multer = require("multer");
const path = require("path");
const notification = require('../../controllers/notificationContoller')

//TODO
//Borrar imagenes con el delete, posibles problema con permisos en servidor
//actualizar con PUT la imagen
//validar borrar anuncio solo si es propietario del mismo
//Marcar/desmarcar reservadp y vendido
//ver anuncios favoritos del usuario

//Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../public/images/anuncios"));
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + Date.now(), file.originalname);
  },
});

const upload = multer({ storage: storage });

// /api/ads
//Lista de anuncios
router.get(
  "/",
  /*jwtAuth*/ async (req, res, next) => {
    try {
      //console.log("entrando en api")
      const name = req.query.name;
      const price = req.query.price;
      const tag = req.query.tag;
      const skip = parseInt(req.query.skip);
      const limit = parseInt(req.query.limit) || 1000; // nuestro api devuelve max 1000 registros;
      const select = req.query.select; // campos
      const sort = req.query.sort;
      //const start = parseInt(req.query.start) || 0;
      const user = req.query.user; // para filtrar por anuncios de ese usuario

      const filter = {};
      if (name) {
        filter.nombre = name;
      }
      if (price) {
        filter.precio = price;
      }
      if (tag) {
        filter.tags = tag;
      }
      if (user) {
        filter.usuario = user;
      }

      const anuncios = await Anuncio.lista(filter, skip, limit, select, sort);
      //console.log("ANUNCIOS", anuncios)
      res.json({ results: anuncios });
    } catch (err) {
      next(err);
    }
  }
);

// /api/ads/tags
//Lista de tags
router.get("/tags", async (req, res, next) => {
  try {
    const tags = await Anuncio.listTags();
    res.json({ results: tags });
  } catch (err) {
    next(err);
  }
});

// /api/ads:id
//metodo para obtener un anuncio
router.get("/:identificador", async (req, res, next) => {
  try {
    const _id = req.params.identificador;

    const anuncio = await Anuncio.find({ _id: _id });
    res.json({ result: anuncio });
  } catch (err) {
    next(err);
  }
});

//const path = require("path");
//POST /api/ads (body)
//Crear un anuncio
router.post("/", upload.single("imagen"), async (req, res, next) => {
  console.log("Entra en API POST");

  //console.log("req.apiAuthUserId", req.apiAuthUserId);

  console.log("Entra en API POST");
  try {
    const filename = req.file.filename;
    //console.log("req.apiAuthUserId", req.apiAuthUserId);
    const anuncioData = {
      ...req.body,
      //image: req.file.path,
      imagen: filename,
      usuario: req.apiAuthUserId,
    };

    const anuncio = new Anuncio(anuncioData);

    const createdAnuncio = await anuncio.save();

    res.status(201).json({ result: createdAnuncio });
  } catch (err) {
    next(err);
  }
});

//DELETE /api/ads:id
//Elimina un anuncio
router.delete("/:id", async (req, res, next) => {
  try {
    const _id = req.params.id;

    const anuncio = await Anuncio.findOne({ _id: _id });
    //Si el propietario del anuncio es quien hace la pet de borrado
    if (anuncio.usuario === req.apiAuthUserId) {
      await Anuncio.deleteOne({ _id: _id });
      res.json();
    } else {
      res.json({ result: "Debe ser propietario del anuncio para borrarlo" });
    }
  } catch (err) {
    next(err);
  }
});

//PUT /api/ads:id (body)lo que quiero actualizar
//Actualizar un anuncio
router.put("/:id", async (req, res, next) => {
  try {
    //console.log("Entra en PUT");
    const _id = req.params.id;
    const anuncioData = req.body;

    //Si es una peticion de actualizar campo reservado
    //console.log("res: ", req.query.res)
    if (req.query.res === "true") {
      await Anuncio.updateOne(
        { _id: { $eq: _id } },
        { $set: { reservado: true } }
      );
      res.json({ result: "Anuncio reservado" });
      return;
    }
    if (req.query.res === "false") {
      await Anuncio.updateOne(
        { _id: { $eq: _id } },
        { $set: { reservado: false } }
      );
      res.json({ result: "Anuncio disponible" });
      return;
    }
    //Si es una peticion de actualizar campo vendido
    if (req.query.vend === "true") {
      await Anuncio.updateOne(
        { _id: { $eq: _id } },
        { $set: { vendido: true } }
      );
      notification(_id)
      res.json({ result: "Anuncio vendido" });
      return;
    }
    if (req.query.vend === "false") {
      await Anuncio.updateOne(
        { _id: { $eq: _id } },
        { $set: { vendido: false } }
      );
      res.json({ result: "Anuncio en venta" });
      return;
    }

    const updatedAnuncio = await Anuncio.findOneAndUpdate(
      { _id: _id },
      anuncioData,
      {
        new: true,
      }
    );

    if (!updatedAnuncio) {
      res.status(404).json({ error: "not found" });
      return;
    }
    res.json({ result: updatedAnuncio });
  } catch (err) {
    next(err);
  }
  //res.json({ result: '-1' });
});

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
