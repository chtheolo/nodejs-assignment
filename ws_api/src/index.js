/* eslint-disable new-cap */
const config = require('./config');
const {logger} = require('./logs');
const {subscribe} = require('./Nats/subscription');
const {connection} = require('./Nats/connect');
const WebSocket = require('ws');

const wss = new WebSocket.Server({port: config.websocket.port});

wss.on('connection', ws => {
	ws.on('close', () => {
		console.log('A client closed his connection!');
	});
});

wss.on('close', () => {
	logger.info('Connection Closed!');
});

async function main() {
	try {
		const nats = await connection(config.nats.port);
		const sub = await subscribe(nats, config.subject.name);

		if (process.env.NODE_ENV === 'test') {
			let count = 0;
			for await (const m of sub) {
				wss.clients.forEach(client => {
					if (client !== wss && client.readyState === WebSocket.OPEN) {
						client.send(m.data);
					}
				});

				count++;
				if (count === config.test.expectedMessages) {
					logger.info('Wait 3 seconds before close the conection...');

					setTimeout(() => {
						for (const client of wss.clients) {
							client.close();
						}
					}, 3000);
				}
			}
		} else {
			for await (const m of sub) {
				wss.clients.forEach(client => {
					if (client !== wss && client.readyState === WebSocket.OPEN) {
						client.send(m.data);
					}
				});
			}
		}

		logger.info('subscription closed!');
	} catch (error) {
		logger.error(error.message);
	}
}

main();
