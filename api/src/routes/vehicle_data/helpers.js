const VehicleData = require('./model');

async function fetch(query) {
	return new Promise((resolve, reject) => {
		// Fetch all data(multiple Documents) for that vehicle.
		if (query.vehicleId) {
			console.log(query.vehicleId);
			query = VehicleData.find({vehicleId: {$eq: query.vehicleId}});
		}

		// Fetch vehicle's data (single Document) for a specific vehicle route.
		if (query.startRouteDate && query.vehicleId) {
			query = VehicleData.find({
				startRouteDate: {$eq: new Date(parseInt(query.startRouteDate, 10))},
				vehicleId: {$eq: query.vehicleId},
			});
		}

		// Fetch vehicle's data(multiple Documents) for a specified date.
		if (query.date && query.vehicleId) {
			query = VehicleData.find({
				createdAt: {$eq: new Date(query.date)},
				vehicleId: {$eq: query.vehicleId},
			});
		}

		// Fetch vehicle's data(multiple Data) in from a date until now.
		if (query.startDate && query.vehicleId) {
			query = VehicleData.find({
				createdAt: {$gte: new Date(query.startDate)},
			});
		}

		// Fetch vehicle's data(multiple Data) in a given date range.
		if (query.startDate && query.endDate && query.vehicleId) {
			query = VehicleData.find({
				createdAt: {$gte: new Date(query.startDate), $lte: new Date(query.endDate)},
			});
		}

		query
			.exec((error, data) => {
				if (error) {
					reject(error);
				}

				resolve(data);
			});
	});
}

async function create(data, vehicleName) {
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

async function update(data, vehicleName, startTime) {
	return new Promise((resolve, reject) => {
		const filter = {
			vehicleId: {$eq: vehicleName},
			startRouteDate: {$eq: new Date(startTime)},
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

		VehicleData.findOneAndUpdate(filter, updateDoc, (error, data) => {
			if (error) {
				reject(error);
			}

			resolve(`Sucessfully updated ${data.measurements.length}`);
		});
	});
}

module.exports = {fetch, create, update};
