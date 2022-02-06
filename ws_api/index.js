const config = require('./config');
const {connect} = require('nats');
const ws = require('./ws');
const {logger} = require('./logs');

async function subscribe() {
	let nc;
	try {
		nc = await connect(
			{servers: 'nats://nats:4222'},
		);
	} catch (error) {
		logger.error(error);
		return new Error(`error connecting to nats: ${error.message}`);
	}

	console.info(
		`connected to ${nc.options.servers}`,
	);

	logger.info(
		`connected to ${nc.options.servers}`,
	);

	nc.closed()
		.then(error => {
			logger.info('connection has been closed');
			if (error) {
				return new Error(error.message);
			}
		})
		.catch(error => {
			logger.error(error.message);
			return new Error(error.message);
		});

	const sub = nc.subscribe(`vehicle.${config.subject.name}`);
	console.log(`subscribed to ${config.subject.name} using subscription id ${sub.getID()}`);
	logger.info(`subscribed to ${config.subject.name} using subscription id ${sub.getID()}`);

	for await (const m of sub) {
		try {
			await ws.broadcastToClients(m.data);
		} catch (error) {
			logger.error(error.message);
		}
	}

	logger.info('subscription closed!');
}

subscribe();

module.exports = {subscribe};
