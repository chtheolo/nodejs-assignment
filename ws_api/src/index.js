/* eslint-disable new-cap */
const config = require('./config');
const {logger} = require('./logs');
const {subscribe} = require('./Nats/subscription');
const {connection} = require('./Nats/connect');
const {JSONCodec} = require('nats');
const WebSocket = require('ws');

const wss = new WebSocket.Server({port: config.websocket.port});

wss.on('connection', ws => {
	console.log(wss.clients);
	ws.on('close', () => {
		console.log('A client closed his connection!');
	});
}).on('close', ws => {
	logger.info(`The client ${ws} close his connection`);
});

async function main() {
	try {
		const nats = await connection(config.nats.port);
		const sub = await subscribe(nats, config.subject.name);

		const jc = JSONCodec();
		for await (const m of sub) {
			wss.clients.forEach(client => {
				if (client !== wss && client.readyState === WebSocket.OPEN) {
					client.send(jc.decode(m.data));
				}
			});
		}

		logger.info('subscription closed!');
	} catch (error) {
		logger.error(error.message);
	}
}

main();
