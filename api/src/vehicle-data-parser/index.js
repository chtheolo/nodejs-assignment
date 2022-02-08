/* eslint-disable max-depth */
/* eslint-disable arrow-body-style */
const config = require('../config');
const {logger} = require('../logs');
const {post, update} = require('../routes/vehicle_data');
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
		let i = 0;
		for await (const m of sub) {
			try {
				const d = await transformToObj(m.data);

				i++;
				if (i <= 2) {
					// Vehicle start its route
					if (await arraysEqual(d.gps, config.routes.r1.gpsStart) && d.speed === 0) {
						config.routes.r1.startTime = d.time;
						try {
							const res = await post(d, config.subject.name);
							logger.info(res);
						} catch (error) {
							logger.error(error.message);
						}
					} else {
						try {
							const res = await update(d);
							logger.info(res);
						} catch (error) {
							logger.error(error.message);
						}
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
