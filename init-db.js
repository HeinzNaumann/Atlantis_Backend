"use strict";

require('dotenv').config();
// conexión a la base de datos
const dbConnection = require("./lib/connectMongoose");

const { Anuncio, Usuario } = require("./models");
const anuncioData = require("./anunciosiniciales.json");

main().catch((err) => console.log("hubo un error", err));

async function main() {
// inicializo la colección de anuncios
	await initAnuncios();
	
	// inicializo la colección de usuarios
	await initUsuarios();
	
	dbConnection.close();
}

async function initAnuncios() {
	// Elimino todos los documentos de la colección de anuncios
	const deleted = await Anuncio.deleteMany();
	console.log(`Eliminados ${deleted.deletedCount} anuncios`);

	// Crear anuncios iniciales
	const anuncios = await Anuncio.insertMany(anuncioData.anuncios);
	console.log(`Creados ${anuncios.length} anuncios`);
}

async function initUsuarios() {
	// Elimino todos los documentos de la colección de usuarios
	const deleted = await Usuario.deleteMany();
	console.log(`Eliminados ${deleted.deletedCount} usuarios`);

	// Crear usuario inicial
	const result = await Usuario.insertMany([
		{
			email: 'emailuser@example.com',
			password: await Usuario.hashPassword('1234')
		}
	]);
	console.log(`Creados ${result.length} usuario`);
}
