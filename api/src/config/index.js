// eslint-disable-next-line no-unused-vars
const dotenv = require('dotenv').config();

const subject = {
	name: 'test-bus-1',
};

const routes = {
	r1: {
		startTime: 0,
		gpsStart: ['52.093448638916016', '5.117378234863281'],
		gpsEnd: ['52.089332580566406', '5.1061015129089355'],
	},
};

const nats = {
	port: 4222,
};

const service = {
	port: process.env.PORT,
};

const dbClient = {
	database: `mongodb://mongo:${process.env.MONGO_PORT}/${process.env.DATABASE}`,
};

module.exports = {service, dbClient, subject, routes, nats};
