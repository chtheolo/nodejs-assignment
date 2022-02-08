const {logger} = require('../../logs');

async function subscribe(nats, subject) {
	try {
		const sub = nats.subscribe(`vehicle.${subject}`);
		logger.info(`subscribed to ${subject} using subscription id ${sub.getID()}`);
		return sub;
	} catch (error) {
		return error;
	}
}

module.exports = {subscribe};
