"use strict";
require("dotenv").config();
const mongoose = require("mongoose");
const readLine = require("readline");
const async = require("async");

const db = require("./lib/connectMongoose");

// Cargamos las definiciones de todos nuestros modelos
const { Anuncio, Usuario } = require("./models");

db.once("open", async function () {
	try {
		const answer = await askUser(
			"Are you sure you want to empty DB? (no) "
		);
		if (answer.toLowerCase() === "yes") {
			// Inicializar nuestros modelos
			await initAnuncios();
			// inicializo la colección de usuarios
			await initUsuarios();
		} else {
			console.log("DB install aborted!");
		}
		return process.exit(0);
	} catch (err) {
		console.log("Error!", err);
		return process.exit(1);
	}
});

function askUser(question) {
	return new Promise((resolve, reject) => {
		const rl = readLine.createInterface({
			input: process.stdin,
			output: process.stdout,
		});
		rl.question(question, (answer) => {
			rl.close();
			resolve(answer);
		});
	});
}

async function initAnuncios() {
	await Anuncio.deleteMany({});
	console.log("Anuncios borrados.");
}

async function initUsuarios() {
	//const { deletedCount } = await Usuario;
	await Usuario.deleteMany({});
	console.log("Usuarios borrados.");
	//console.log(`Eliminados ${deletedCount} usuarios.`);

	const result = await Usuario.insertMany([
		{
			nombre: "admin",
			email: "admin@example.com",
			password: await Usuario.hashPassword("1234"),
		},
		{
			nombre: "user",
			email: "user@example.com",
			password: await Usuario.hashPassword("1234"),
		},
	]);
	console.log(`Insertados ${result.length} usuarios.`);
}
