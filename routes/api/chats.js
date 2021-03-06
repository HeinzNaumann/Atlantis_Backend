var express = require("express");
var router = express.Router();
const { Usuario, Anuncio, Chat } = require("../../models");
const jwtAuth = require("../../lib/jwtAuthMiddleware");
const bcrypt = require("bcrypt");

router.post("/", async (req, res, next) => {
	console.log("crear chat");
	console.log("Body", req.body);
	try {
		const chatData = {
			...req.body,
		};

		const chat = new Chat(chatData);
		const createdChat = await chat.save();

		res.status(201).json({ chat: createdChat });
	} catch (err) {
		next(err);
	}
});

// /api/chats:id
//metodo para obtener un chat
router.get("/:identificador", async (req, res, next) => {
	try {
		const chatId = req.params.identificador;
		const chat = await Chat.find({ _id: chatId });
		if (chat.length > 0) {
			res.json({ result: chat });
		} else {
			res.json({ result: "Chat no found" });
		}
	} catch (err) {
		next(err);
	}
});

//PUT /api/users:id (body)lo que quiero actualizar
//Actualizar un usuario
router.put("/:id", async (req, res, next) => {
	console.log("Entra en PUT");
	try {
		const _id = req.params.id;
		const existeChat = await Chat.findById({ _id: _id });
		// actualiza el estado nuevo_msj a false cuando ya se ha leido
		if (req.query.read) {
			await Chat.updateOne(
				{ _id: { $eq: _id } },
				{ $set: { nuevo_msj: false } }
			);
			res.json({ msg: "Chat updated, no new msj" });
			return;
		}

		if (!existeChat.length === 0) {
			res.json({ msg: "Chat not found" });
			return;
		}
		let msjs = existeChat.mensajes;
		msjs = [
			...msjs,
			{ nombre: req.body.nombre, mensaje: req.body.mensaje },
		];
		let chatData = {
			...req.body,
			mensajes: msjs,
			nuevo_msj: true,
			updatedAt: Date.now(),
		};

		const updatedChat = await Chat.findOneAndUpdate(
			{ _id: _id },
			chatData,
			{
				new: true,
			}
		);
		// actualizo usuario_nombre en los anuncios de los usuarios

		if (!updatedChat) {
			res.status(404).json({ error: "Chat not updated" });
			return;
		}
		res.json({ result: updatedChat });
	} catch (err) {
		next(err);
	}
});

//crear un chat de forma temporal en front cuando no hay de ese anuncio con ese usuario y a??adirlo al principio del array

//GET /api/chat.. puede venir de: listado de anuncio, detalle, menu header
//A??adir o eliminar favoritos
router.get(
	"/",
	/* jwtAuth,*/ async (req, res, next) => {
		try {
			const ad = req.query.ad ? req.query.ad : 0; // id anuncio
			const user = req.query.user; // id usuario
			const existChat = await Chat.existChatUserAd(user, ad);
			const arrayChats = await Chat.getChatUser(user, ad);

			// si es una petici??n que viene de listado o detalle de anuncio
			if (ad && user) {
				if (existChat.length > 0) {
					// si tiene chat con ese anuncio
					res.json({ result: arrayChats, existChatAd: 1 });
				} else {
					// si no tiene chat con ese anuncio
					res.json({ result: arrayChats, existChatAd: 0 });
				}
			}

			// si es una petici??n que viene del menu de header asumiendo que siempre hay user
			if (user && !ad) {
				res.json({ result: arrayChats, existChatAd: 2 });
			}
		} catch (err) {
			next(err);
		}
	}
);

module.exports = router;
