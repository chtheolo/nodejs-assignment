/* eslint-disable max-depth */
/* eslint-disable arrow-body-style */
const config = require('../config');
const {logger} = require('../logs');
const {create, update} = require('../routes/vehicle_data/helpers');
const {subscribe} = require('./Nats/subscription');
const {connection} = require('./Nats/connect');

function arraysEqual(gps, point) {
	return Array.isArray(gps)
		&& gps.length === point.length
		&& gps.every((val, index) => val === point[index]);
}

async function transformToObj(data) {
	return new Promise((resolve, reject) => {
		if (!data) {
			reject(new Error('Variable "data" is undefined.'));
		}

		if (typeof data !== 'object') {
			reject(new Error('Argument data is not type ofl"string".'));
		}

		const obj = JSON.parse(data);
		obj.gps = obj.gps.split('|');
		resolve(obj);
	});
}

async function parser(port) {
	try {
		const nats = await connection(port);
		const sub = await subscribe(nats, config.subject.name);

		for await (const m of sub) {
			try {
				const d = await transformToObj(m.data);

				// Vehicle start its route
				if (await arraysEqual(d.gps, config.routes.r1.gpsStart) && d.speed === 0) {
					config.routes.r1.startTime = d.time;
					try {
						const res = await create(d, config.subject.name);
						logger.info(res);
					} catch (error) {
						logger.error(error.message);
					}
				} else {
					// The rest of the data will call update
					// in order to add data to our newly created Document
					try {
						const res = await update(d, config.subject.name, config.routes.r1.startTime);
						logger.info(res);
					} catch (error) {
						logger.error(error.message);
					}
				}
			} catch (error) {
				logger.error(error.message);
			}
		}
	} catch (error) {
		logger.error(error.message);
	}

	logger.info('subscription closed!');
}

module.exports = {parser};
