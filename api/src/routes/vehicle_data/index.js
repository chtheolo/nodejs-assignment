const VehicleData = require('./model');
const config = require('../../config');

function get(req, res) {
	let query;

	// Fetch all data(multiple Documents) for that vehicle.
	if (req.query.vehicleId) {
		console.log(req.query.vehicleId);
		query = VehicleData.find({vehicleId: {$eq: req.query.vehicleId}});
	}

	// Fetch vehicle's data (single Document) for a specific vehicle route.
	if (req.query.startRouteDate && req.query.vehicleId) {
		query = VehicleData.find({
			startRouteDate: {$eq: new Date(parseInt(req.query.startRouteDate, 10))},
			vehicleId: {$eq: req.query.vehicleId},
		});
	}

	// Fetch vehicle's data(multiple Documents) for a specified date.
	if (req.query.date && req.query.vehicleId) {
		query = VehicleData.find({
			createdAt: {$eq: new Date(req.query.date)},
			vehicleId: {$eq: req.query.vehicleId},
		});
	}

	// Fetch vehicle's data(multiple Data) in from a date until now.
	if (req.query.startDate && req.query.vehicleId) {
		query = VehicleData.find({
			createdAt: {$gte: new Date(req.query.startDate)},
		});
	}

	// Fetch vehicle's data(multiple Data) in a given date range.
	if (req.query.startDate && req.query.endDate && req.query.vehicleId) {
		query = VehicleData.find({
			createdAt: {$gte: new Date(req.query.startDate), $lte: new Date(req.query.endDate)},
		});
	}

	query
		.exec((error, data) => {
			if (error) {
				return res.status(422).send(error);
			}

			return res.status(200).send(data);
		});
}

// A function that retrieves obj from the nats server and
// save them in mongo.
async function post(data, vehicleName) {
	return new Promise((resolve, reject) => {
		if (!data) {
			reject(new Error('undefined data arguments'));
		}

		if (typeof data !== 'object') {
			reject(new Error('You have to pass an object parameter'));
		}

		const vehicleData = new VehicleData({
			vehicleId: vehicleName,
			startRouteDate: new Date(data.time),
			measurements: data,
			energyStart: data.energy,
			sumSpeed: data.speed,
			odoStart: data.odo,
			socStart: data.soc,
		});

		vehicleData.save((error, vd) => {
			if (error) {
				reject(error);
			}

			resolve(`Succesfully create a new Document with value: ${vd._id}`);
		});
	});
}

// Update data in a single Document for a specific vehicle and route.
async function update(data) {
	const filter = {
		vehicleId: {$eq: config.subject.name},
		startRouteDate: {$eq: new Date(config.routes.r1.startTime)},
	};

	const speed = () => {
		if (data.speed === null || data.speed === undefined) {
			return 0;
		}

		return data.speed;
	};

	const updateDoc = {
		$push: {
			measurements: data,
		},
		$inc: {
			transactionCount: 1,
			sumSpeed: speed(),
		},
		$set: {
			energyEnd: data.energy,
			odoEnd: data.odo,
			socEnd: data.soc,
		},
	};

	try {
		await VehicleData.findOneAndUpdate(filter, updateDoc);
		return 'Sucessfully updated!';
	} catch (error) {
		return error;
	}
}

module.exports = {get, post, update};
