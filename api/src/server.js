const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const router = require('./routes');
const config = require('./config');
const natsParser = require('./vehicle-data-parser');
const {logger} = require('./logs');

let server;

async function main() {
	/** If there is not define a PORT variable in .env file, then stop the service. */
	if (!config.service.port) {
		logger.debug('No PORT variable');
		process.exit(-1);
	}

	let db;
	switch (process.env.NODE_ENV) {
		case 'production':
			db = config.dbClient.database;
			break;
		case 'development':
			db = config.dbClient.devDatabase;
			break;
		case 'test':
			db = config.dbClient.testDatabase;
			break;

		default:
	}

	mongoose.connect(db, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	}, error => {
		if (error) {
			logger.error(error);
		}

		logger.info(`Connected to :: ${db}`);
	});

	app.use(cors());
	app.use(bodyParser.urlencoded({extended: false})); // For parsing req.body (json and normal)
	app.use(bodyParser.json());

	server = app.listen(config.service.port, error => {
		if (error) {
			console.error(error.message);
		}

		logger.info(`Server :: Running @ 'http://localhost:${config.service.port}.`);
	});

	// Import routes to be served
	router(app);

	// Start nats subscriber.
	try {
		natsParser.parser(config.nats.port);
	} catch (error) {
		logger.error(error.message);
	}
}

main();

module.exports = server;
