const {connect} = require('nats');
const {logger} = require('../../logs');

async function connection(port) {
	let nc;
	try {
		nc = await connect(
			{servers: `nats://nats:${port}`},
		);

		logger.info(
			`connected to ${nc.options.servers}`,
		);
		return nc;
	} catch (error) {
		return new Error(`error connecting to nats: ${error.message}`);
	}
}

module.exports = {connection};
