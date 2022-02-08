const helper = require('./helpers');

// A HTTP GET method for vehicle_data endpoint.
async function get(req, res) {
	try {
		const data = await helper.fetch(req.query);
		// OK
		return res.status(200).send(data);
	} catch (error) {
		// Not found
		return res.status(404).send(error);
	}
}

// A HTTP POST method to create new Documents in mongoDB.
async function post(req, res) {
	try {
		const data = await helper.create(req.body, req.params.vehicleId);
		// Created
		return res.status(201).send(data);
	} catch (error) {
		// Bad Request
		return res.status(400).send(error);
	}
}

// HTTP PUT methods for updating the data in a single document.
async function put(req, res) {
	try {
		const data = await helper.update(req.body, req.params.vehicleId, req.params.startRouteDate);
		// OK
		return res.status(200).send(data);
	} catch (error) {
		// Bad Request
		return res.status(400).send(error);
	}
}

module.exports = {get, post, put};
