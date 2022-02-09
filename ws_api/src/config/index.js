const subject = {
	name: 'test-bus-1',
};

const nats = {
	port: 4222,
};

const websocket = {
	port: 8080,
};

const test = {
	expectedMessages: 300,
};

module.exports = {subject, nats, websocket, test};
