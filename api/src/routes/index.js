const express = require('express');

// Route Controllers
const controllers = {
	vehicleData: require('./vehicle_data'),
};

// Route Groups
const routes = {
	// eslint-disable-next-line new-cap
	vehicleData: express.Router(),
	// eslint-disable-next-line new-cap
	api: express.Router(),
};

module.exports = function (app) {
	/*		Vehicle Data        */
	routes.api.use('/vehicle_data', routes.vehicleData);
	routes.vehicleData
		.get('/', controllers.vehicleData.get);

	// Set url for API group routes
	app.use('/', routes.api);
};
