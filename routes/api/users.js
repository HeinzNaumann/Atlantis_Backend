var express = require("express");
var router = express.Router();
const { Usuario, Anuncio } = require("../../models");
const jwtAuth = require("../../lib/jwtAuthMiddleware");
const bcrypt = require("bcrypt");
const { query } = require("express");
const jwt = require("jsonwebtoken");

router.delete("/:id", jwtAuth, async (req, res, next) => {
	const _id = req.params.id;

	try {
		console.log(`El usuario ${_id} ha sido eliminado`);
		await Usuario.deleteOne({ _id: _id });

		//Borrar anuncios del usuario
		await Anuncio.deleteAdsByUser(_id);

		res.json();
	} catch (error) {
		next(error);
	}
});

router.post("/", async (req, res, next) => {
	//para recuperar contraseña del usuario que solo envia nombre
	if (req.body.nombre && !req.body.email && !req.body.password) {
		const nombre = { nombre: req.body.nombre };
		const resu = await Usuario.notExistName(nombre);
		const user = resu[0];

		if (user.length === 0) {
			res.json({
				result: "No existe un usuario con ese nombre en el sistema",
			});
			return;
		}

		//Si existe el usuario generamos un token por 5min para restaurar la contraseña
		jwt.sign(
			{ _id: user._id },
			process.env.JWT_SECRET,
			{
				expiresIn: "5m",
			},
			async (err, jwtToken) => {
				if (err) {
					next(err);
					return;
				}
				// enviar email al usuario
				const url=`${process.env.REACT_APP_FRONT_ATLANTIS_URL}/change-password/${jwtToken}`;
				//console.log("Entra URL", url);
				const result = await Usuario.enviarEmail(
					"Recuperación de clave - Atlantis",
					`Hola ${nombre.nombre}, puede crear una nueva contraseña desde: ${url}`,
					user.email
				);
				
				console.log("Mensaje enviado", result.messageId);

				if (result.messageId) {
					res.json({ result: `Se ha enviado un correo con las instrucciones a su correo` });
					return;
				}
			}
		);

		return;
		//generamos una clave aleatoria
		/* const clave =
			Math.random().toString(36).slice(2) +
			Math.random().toString(36).toUpperCase().slice(2); */

	}

	//si no envia todos los datos obligatorios para el registro
	if (!req.body.nombre || !req.body.email || !req.body.password) {
		res.json({
			result: "Los campos nombre, email y contraseña son obligatorios",
		});
		return;
	}

	//si existe el nombre o correo no se crea
	const nombre = { nombre: req.body.nombre };
	const email = { email: req.body.email };
	const existeNombre = await Usuario.notExistName(nombre);
	const existeEmail = await Usuario.notExistEmail(email);

	if (existeNombre.length > 0 || existeEmail.length > 0) {
		res.json({
			msg: "Name or Email allready exits in our system, pleaser try with another one.",
		});
		return;
	}
	try {
		const clave = await bcrypt.hash(req.body.password, 7);
		const usuarioData = {
			...req.body,
			password: clave,
		};

		const usuario = new Usuario(usuarioData);
		const createdUsuario = await usuario.save();

		// enviar email al usuario
		const result = await Usuario.enviarEmail(
			"Registro de usuario",
			"Bienvenido a Atlantis",
			usuario.email
		);
		console.log("Mensaje enviado", result.messageId);

		res.status(201).json({ msg: "User created succesfully" });
	} catch (err) {
		next(err);
	}
});

// /api/users:id
//metodo para obtener un usuario
router.get("/:identificador", async (req, res, next) => {
	try {
		const user = req.params.identificador;
		//Si la peticion es de usuarios que tenga un anuncio concreto como fav
		if (user == "users" && req.query.ad) {
			const arrayUsrWithFav = await Usuario.getUserWithFav(req.query.ad);
			res.json({ result: arrayUsrWithFav });
			return;
		}

		let usuario = "";
		if (user.match(/^[0-9a-fA-F]{24}$/)) {
			usuario = await Usuario.find({ _id: user });
		}
		const usuario2 = await Usuario.find({ nombre: user });
		if (usuario || usuario2) {
			// recuperar los anuncios fav del usuario antes de devolver los datos del usuario
			res.json({ result: usuario || usuario2 });
		} else {
			res.json({ result: "null" });
		}
	} catch (err) {
		next(err);
	}
});

// para cambiar la contraseña desde el enlace generado en el POST
router.put("/",async (req, res, next) => {
	try {
		const jwtToken = req.body.token;
		const password = req.body.password;
		let userId="";
		// comprobar que el token es válido
		jwt.verify(jwtToken, process.env.JWT_SECRET, async (err, payload) => {
			if (err) {
				res.json({ msg: `El enlace ha expirado, vuelva a solicitarlo` });
				return;
			}else{
			
			userId = payload._id;
			const user = await Usuario.findById({_id:userId});
			console.log("Usuario", user.nombre);
	
			//actualizamos la contraseña en la BD
			const pass = await bcrypt.hash(password, 7);
			const userUpdate = await Usuario.updateOne(
				{ _id: { $eq: userId } },
				{ $set: { password: pass } }
			);
	
	
			if(userUpdate){
				res.json({ msg: `Contraseña actualizada!` });
			}else{
				res.json({ msg: `La contraseña no fue actualizada` });
			}
		
		}

		});
		
	} catch (err) {
		next(err);
	}
});

//PUT /api/users:id (body)lo que quiero actualizar
//Actualizar un usuario
router.put("/:id", jwtAuth, async (req, res, next) => {
	console.log("Entra en PUT");
	try {
		//si existe el nombre o correo no se actualiza
		if (req.body.nombre || req.body.email) {
			const nombre = { nombre: req.body.nombre };
			const email = { email: req.body.email };
			const existeNombre = await Usuario.notExistName(nombre);
			const existeEmail = await Usuario.notExistEmail(email);

			if (existeNombre.length > 0 || existeEmail.length > 0) {
				res.json({
					result: "ya existe el email o nombre en el sistema",
				});
				return;
			}
		}

		const _id = req.params.id;
		let usuarioData = { ...req.body };
		//Si existe datos en el campo password sobrescribo usuarioData con pass encriptada
		if (req.body.password) {
			const clave = await bcrypt.hash(req.body.password, 7);
			usuarioData = {
				...req.body,
				password: clave,
			};
		}

		const updatedUsuario = await Usuario.findOneAndUpdate(
			{ _id: _id },
			usuarioData,
			{
				new: true,
			}
		);
		// actualizo usuario_nombre en los anuncios de los usuarios
		if (updatedUsuario && req.body.nombre) {
			await Anuncio.UpdateUserName(_id, req.body.nombre);
		}

		if (!updatedUsuario) {
			res.status(404).json({ error: "not found" });
			return;
		}
		res.json({ result: updatedUsuario });
	} catch (err) {
		next(err);
	}
});


//GET /api/users?fav
//Añadir o eliminar favoritos
router.get("/", jwtAuth, async (req, res, next) => {
	try {
		const fav = req.query.fav; // id anuncio fav
		const usuario = req.apiAuthUserId; // id usuario generado en jwtAuth
		const favs = req.query.favs; // si peticion ads favoritos
		// si es una petición de añadir/eliminar fav
		if (fav) {
			const arrayFavs = await Usuario.updateFav(usuario, fav);
			res.json({ result: arrayFavs });
		}
		// si es una peticion de ver favoritos del usuario
		if (favs === "true") {
			const arrayf = await Usuario.findOne({ _id: usuario });
			const arrayFavs = [...arrayf.favs];
			const adsFavs = await Anuncio.adsFavs(arrayFavs);
			res.json({ result: adsFavs });
		}
	} catch (err) {
		next(err);
	}
});

module.exports = router;
