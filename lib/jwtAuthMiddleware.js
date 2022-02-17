"use strict";

const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
	// recoger el jwtToken
	const jwtToken =
		req.get("Authorization") || req.query.token || req.body.token;
	// comprobar que tenemos token
	if (!jwtToken) {
		const error = new Error("no token provided");
		error.status = 401;
		next(error);
		return;
	}
	// comprobar que el token es válido
	jwt.verify(jwtToken, process.env.JWT_SECRET, (err, payload) => {
		if (err) {
			err.messag = "invalid token";
			err.status = 401;
			next(err);
			return;
		}

        req.apiAuthUserId = payload._id;
		// si es válido, continuar
		next();
	});
};
