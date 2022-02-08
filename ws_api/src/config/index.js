const subject = {
	name: 'test-bus-1',
};

const nats = {
	port: 4222,
};

const websocket = {
	port: 8080,
};

const service = {
	port: process.env.PORT,
};

module.exports = {service, subject, nats, websocket};
