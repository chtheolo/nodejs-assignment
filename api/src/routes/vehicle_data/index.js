const VehicleData = require('./model');
const config = require('../../config');

function get(req, res) {
	// let query;

	const query = VehicleData.find();
	// if (res.query.vehicleId) {
	// 	query = VehicleData.find({vehicleId: {$eq: req.query.vehicleId}});
	// }

	// if (res.query.startRouteDate) {
	// 	query = VehicleData.find({startRouteDate: {$eq: req.query.startRouteDate}});
	// }

	// if (req.query.startRouteDate && req.query.vehicleId) {
	// 	query = VehicleData.find({
	// 		$and: {
	// 			startRouteDate: {$eq: req.query.startRouteDate},
	// 		},
	// 	});
	// }

	// I if (req.query.date && req.query.vehicleId) {
	// 	query = VehicleData.find({
	// 		$and: {
	// 			createdAt: {}
	// 		}
	// 	});
	// }

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

	const updateDoc = {
		$push: {
			measurements: data,
		},
		$inc: {
			transactionCount: 1,
			sumSpeed: data.speed,
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
