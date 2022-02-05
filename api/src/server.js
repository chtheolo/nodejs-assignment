const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const router = require('./routes');
const config = require('../config');

const main = async () => {
	/** If there is not define a PORT variable in .env file, then stop the service. */
	if (!config.service.port) {
		console.log('No PORT variable!');
		process.exit(-1);
	}

	mongoose.connect(config.db_client.database, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	mongoose.set('useFindAndModify', false);
	mongoose.set('useCreateIndex', true);

	app.use(cors());
	app.use(bodyParser.urlencoded({extended: false})); // For parsing req.body (json and normal)
	app.use(bodyParser.json());

	const server = app.listen(config.service.port);
	console.log(`Server :: Running @ 'http://localhost:${config.service.port}.`);

	// Import routes to be served
	router(app);
	return server;
};

const server = main();

module.exports = server;
