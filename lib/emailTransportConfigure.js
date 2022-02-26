const nodemailer = require("nodemailer");
module.exports = async function () {
	const testAccount = await nodemailer.createTestAccount();

	const developTransport = {
		host: "smtp.ethereal.email",
		port: 587,
		secure: false,
		auth: {
			user: testAccount.user,
			pass: testAccount.pass,
		},
	};

	const prodTransport = {
		service: process.env.EMAI_SERVICE_NAME,
		host: process.env.EMAIL_SERVICE_HOST,
		port: process.env.EMAIL_SERVICE_PORT,
		secure: process.env.EMAIL_SERVICE_SECURE,
		auth: {
			user: testAccount.user,
			pass: testAccount.pass,
		},
	};

	const activeTransport =
		process.env.NODE_ENV === "development"
			? developTransport
			: prodTransport;

	const transport = nodemailer.createTransport(developTransport);

	return transport;
};
