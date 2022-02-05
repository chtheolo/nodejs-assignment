const dotenv = require('dotenv').config();

const service = {
	port: process.env.PORT,
};

const dbClient = {
	database: `mongodb://mongo:${process.env.MONGO_PORT}/${process.env.DATABASE}`,
};

const routes = {
	r1: {
		start: ['52.093448638916016', '5.117378234863281'],
		end: ['52.089332580566406', '5.1061015129089355'],
	},
};

module.exports = {service, dbClient, routes};
