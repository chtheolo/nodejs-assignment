const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const router = require('./routes');
const config = require('./config');
const natsParser = require('./vehicle-data-parser');
const {logger} = require('./logs');

async function main() {
	/** If there is not define a PORT variable in .env file, then stop the service. */
	if (!config.service.port) {
		logger.debug('No PORT variable');
		process.exit(-1);
	}

	mongoose.connect(config.dbClient.database, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	app.use(cors());
	app.use(bodyParser.urlencoded({extended: false})); // For parsing req.body (json and normal)
	app.use(bodyParser.json());

	const server = app.listen(config.service.port);
	logger.info(`Server :: Running @ 'http://localhost:${config.service.port}.`);

	// Import routes to be served
	router(app);

	// Start nats subscriber.
	try {
		natsParser.parser(config.nats.port);
	} catch (error) {
		logger.error(error.message);
	}

	return server;
}

const server = main();

module.exports = server;
