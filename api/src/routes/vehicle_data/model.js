const mongoose = require('mongoose');

const {Schema} = mongoose;
const schemaOpts = {
	timestamps: true,
};

const VehicleDataSchema = new Schema({
	vehicleId: {type: String},
	startRouteDate: {type: Date, default: new Date()},
	// D date: {type: Date, default: new Date()},
	measurements: [
		{type: Object},
	],
	transactionCount: {type: Number, default: 1},
	energyStart: {type: Number},
	energyEnd: {type: Number},
	sumSpeed: {type: Number},
	odoStart: {type: Number},
	odoEnd: {type: Number},
	socStart: {type: Number},
	socEnd: {type: Number},
}, schemaOpts);

module.exports = mongoose.model('VehicleData', VehicleDataSchema);
