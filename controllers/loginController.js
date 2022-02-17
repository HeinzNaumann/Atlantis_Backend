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
			const { email, password } = req.body;

			// buscar el usuario en la base de datos
			const usuario = await Usuario.findOne({ email });

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
			res.redirect("/privado");

		} catch (err) {
			next(err);
		}
	}

    logout(req, res, next) {
        req.session.regenerate(err => {
          if (err) {
            next(err);
            return;
          }
          res.redirect('/');
        })
      }
    
    // POST /api/login
    async postJWT(req, res, next) {
        try {
          const { email, password } = req.body;
    
          // buscar el usuario en la BD
          const usuario = await Usuario.findOne({ email });
    
          // si no lo encuentro o no coincide la contraseña --> error
          if (!usuario || !(await usuario.comparePassword(password))) {
            res.json({ error: 'Invalid credentials' });
            return;
          }
    
          // si el usuario existe y valida la contraseña
          // crear un JWT con el _id del usuario dentro
          jwt.sign({ _id: usuario._id }, process.env.JWT_SECRET, { 
            expiresIn: '2d' 
          }, (err, jwtToken) => {
            if (err) {
              next(err);
              return;
            }
            // devolver al cliente el token generado
            res.json({ token: jwtToken });
          });
    
        } catch (err) {
          next();
        }
      }
    
}

module.exports = LoginController;
