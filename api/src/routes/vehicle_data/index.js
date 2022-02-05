const VehicleData = require('./model');
const config = require('../../../config');

// A function that retrieves obj from the nats server and
// save them in mongo.
async function post(data, vehicleName) {
	return new Promise((resolve, reject) => {
		if (data) {
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
		startRouteDate: {$eq: new Date(config.routes.r1.start)},
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
		const res = await VehicleData.findOneAndUpdate(filter, updateDoc);
		return res;
	} catch (error) {
		return error;
	}
}

module.exports = {post, update};
