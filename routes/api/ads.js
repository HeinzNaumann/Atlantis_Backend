const express = require("express");
const router = express.Router();
const Anuncio = require("../../models/Anuncio.js");
const Usuario = require("../../models/Usuario.js");
const jwtAuth = require("../../lib/jwtAuthMiddleware");
const multer = require("multer");
const path = require("path");
const notification = require("../../controllers/notificationContoller");

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, "../../public/images/anuncios"));
	},
	filename: function (req, file, cb) {
		// cb(null, file.fieldname + Date.now(), file.originalname);
		cb(null, file.originalname);
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
			const user = req.query.user; // para filtrar por anuncios de ese usuario

			//Si es un usuario registrado el que hace la petición, devuelve su array de fav
			let arryUserFav = 0;
			if (req.header("Authorization")) {
				arryUserFav = await Usuario.getFavByToken(
					req.header("Authorization")
				);
			}

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

			let anuncios = await Anuncio.lista(
				filter,
				skip,
				limit,
				select,
				sort
			);

			//si es usuario registrado el que hace la peticion, añado un campo marcando cuales son los ads fav del usuario
			if (arryUserFav && arryUserFav.length > 0) {
				anuncios = Anuncio.adsWithFavs(anuncios, arryUserFav);
			}

			res.json({ results: anuncios, totalads: anuncios.length });
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

//POST /api/ads (body)
//Crear un anuncio
router.post("/", upload.single("imagen"), jwtAuth, async (req, res, next) => {
	console.log("Entra en API POST");

	//busca el usuario el nombre del usuario para insertarlo
	user = await Usuario.findById({ _id: req.apiAuthUserId });

	console.log("Entra en API POST");

	try {
		const filename = req.file ? req.file.filename : "imagen_generica";

		const anuncioData = {
			...req.body,
			imagen: filename,
			usuario: req.apiAuthUserId,
			usuario_nombre: user.nombre,
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
router.delete("/:id", jwtAuth, async (req, res, next) => {
	try {
		const _id = req.params.id;

		const anuncio = await Anuncio.findOne({ _id: _id });
		//Si el propietario del anuncio es quien hace la pet de borrado
		if (anuncio.usuario === req.apiAuthUserId) {
			await Anuncio.deleteOne({ _id: _id });
			res.json();
		} else {
			res.json({
				result: "Debe ser propietario del anuncio para borrarlo",
			});
		}
	} catch (err) {
		next(err);
	}
});

//PUT /api/ads:id (body)lo que quiero actualizar
//Actualizar un anuncio
router.put("/:id", upload.single("imagen"), jwtAuth, async (req, res, next) => {
	try {
		const _id = req.params.id;
		const filename = req.file ? req.file.filename : ""; // si no envio nada en la imagen lo deja en blanco

		//Si es una peticion de actualizar campo reservado
		if (req.query.res) {
			let state = "";
			let ad = await Anuncio.findOne({ _id: _id });
			state = ad.reservado === true ? false : true;
			await Anuncio.updateOne(
				{ _id: { $eq: _id } },
				{ $set: { reservado: state } }
			);
			res.json({
				result: state ? "Anuncio reservado" : "Anuncio disponible",
			});
			return;
		}

		//Si es una peticion de actualizar campo vendido
		if (req.query.vend) {
			let state = "";
			let ad = await Anuncio.findOne({ _id: _id });
			state = ad.vendido === true ? false : true;
			await Anuncio.updateOne(
				{ _id: { $eq: _id } },
				{ $set: { vendido: state } }
			);
			res.json({
				result: state ? "Anuncio vendido" : "Anuncio en venta",
			});
			return;
		}

		let anuncioData = req.body;

		if (filename) {
			anuncioData = { ...req.body, imagen: filename };
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
});

module.exports = router;
