"use strict";

const jwt = require('jsonwebtoken')
const { Usuario } = require("../models");

class LoginController {
	index(req, res, next) {
		res.locals.error = "";
		res.render("login");
	}

	async post(req, res, next) {
		try {
			const { nombre, password } = req.body;

      

			// buscar el usuario en la base de datos
			const usuario = await Usuario.findOne({ nombre });

			// si no lo encuentro o no coincide la contrasela le muestro un error
			if (!usuario || !(await usuario.comparePassword(password))) {
				res.locals.error = "Invalid credentials";
				res.render("login");
				return;
			}
			// si lo encuentro y la contraseña coincide le muestro su zona privada
			// apuntar en su sesión que está autenticado

			req.session.usuarioLogado = {
				_id: usuario._id,
			};
			//res.redirect("/privado");

		} catch (err) {
			next(err);
		}
	}

    async logout(req, res, next) {

        //poner el estado de conectado a true de ese usuario en la BD
        // apiAuthUserId viene creado en el paso previo de verificar el token en jwtAuth antes pasar a logout
        await Usuario.updateOne({ _id: {$eq: req.apiAuthUserId}}, {$set: {conectado:false}} );
        res.redirect('/');
       
      }
    
    // POST /api/auth
    async postJWT(req, res, next) {
        try {
          const { nombre, password } = req.body;

           // buscar el usuario en la BD
          const usuario = await Usuario.findOne({ nombre });
    
          // si no lo encuentro el usuario en el sistema --> error
          if (!usuario) {
            res.json({ error: 'No existe ese usuario en el sistema' });
            return;
          }

           // si lo encuentro pero no coincide la contraseña --> error
           if (!await usuario.comparePassword(password)) {
            res.json({ error: 'Invalid credentials' });
            return;
          }
    
          // si el usuario existe y valida la contraseña
          // crear un JWT con el _id del usuario dentro
          jwt.sign({ _id: usuario._id }, process.env.JWT_SECRET, { 
            expiresIn: '2d' 
          }, async (err, jwtToken) => {
            if (err) {
              next(err);
              return;
            }
          
            //poner el estado de conectado a true de ese usuario en la BD
            await Usuario.updateOne({ _id: {$eq: usuario._id}}, {$set: {conectado:true}} );

            // devolver al cliente el token generado
            res.json({ token: jwtToken });
          });
    
        } catch (err) {
          next();
        }
      }
    
}

module.exports = LoginController;
