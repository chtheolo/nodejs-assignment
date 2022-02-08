const mongoose = require('mongoose');

const d = new Date();
const {Schema} = mongoose;
const schemaOpts = {
	timestamps: {
		currentTime: () => d.getDate() + '-' + (d.getMonth() + 1) + '-' + d.getFullYear(),
	},
};

const VehicleDataSchema = new Schema({
	vehicleId: {type: String},
	startRouteDate: {type: Date, default: new Date()},
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
