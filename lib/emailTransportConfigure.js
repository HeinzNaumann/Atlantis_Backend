const nodemailer = require("nodemailer");
module.exports = async function () {
	console.log("transport");
	const prodTransport = {
		host: "smtp.sendgrid.net",
		port: 587,
		secure: false,
		auth: {
			user: process.env.EMAIL_SERVICE_USER,
			pass: process.env.EMAIL_SERVICE_PASSWORD,
		},
	};

	const transport = nodemailer.createTransport(prodTransport);

	return transport;
};
