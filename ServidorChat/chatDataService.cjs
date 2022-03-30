const axios = require("axios");

function getUserWithFav(article) {
	const url = `http://localhost:3002/api/users/users?ad=${article}`;
	return axios.get(url);
}

module.exports.getUserWithFav = getUserWithFav;
