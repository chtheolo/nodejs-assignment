/* eslint-disable arrow-body-style */
const config = require('../../config');
const {connect} = require('nats');
const {logger} = require('../logs');
const {post, update} = require('../routes/vehicle_data');

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

async function subscribe() {
	let nc;
	try {
		nc = await connect(
			{servers: 'nats://nats:4222'},
		);
	} catch (error) {
		return new Error(`error connecting to nats: ${error.message}`);
	}

	logger.info(
		`connected to ${nc.options.servers}`,
	);

	nc.closed()
		.then(error => {
			if (error) {
				return new Error(`connection has been closed: ${error.message}`);
			}
		})
		.catch(error => {
			return new Error(`Closed connection error: ${error.message}`);
		});

	const sub = nc.subscribe(`vehicle.${config.subject.name}`);
	console.log(`subscribed to ${config.subject.name} using subscription id ${sub.getID()}`);
	logger.info(`subscribed to ${config.subject.name} using subscription id ${sub.getID()}`);

	for await (const m of sub) {
		try {
			const d = await transformToObj(m.data);

			// Vehicle start its route
			if (arraysEqual(d.gps, config.routes.r1.gpsStart) && d.speed === 0) {
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
		} catch (error) {
			logger.error(error.message);
		}
	}

	logger.info('subscription closed!');
}

subscribe();

module.exports = {subscribe};
