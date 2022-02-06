const WebSocket = require('ws');
const crypto = require('crypto');
const {logger} = require('./logs');

const wss = new WebSocket.Server({port: 8080});

const clients = new Map();

wss.on('connection', ws => {
	const id = crypto.randomBytes(16).toString('hex');
	clients.set(ws, id);
	logger.debug(clients.size);
}).on('close', ws => {
	console.log(`The client ${ws} close his connection`);
	clients.delete(ws);
	logger.debug(clients.size);
});

async function broadcastToClients(message) {
	return new Promise((resolve, reject) => {
		if (!message) {
			reject(new Error('undefined argument'));
		}

		if (typeof message !== 'object') {
			reject(new Error('"message" is not type of json object'));
		}

		if (clients.size === 0) {
			reject(new Error('No connected clients'));
		} else {
			for (const [client, id] of clients) {
				logger.debug(`Send ${message} to ${client} with ${id}`);
				if (client !== wss && client.readyState === WebSocket.OPEN) {
					client.send(message);
				} else {
					clients.delete(client);
					logger.debug(clients.size);
				}
			}

			resolve('finished');
		}
	});
}

wss.on('error', () => {
	clients.clear();
	logger.error('Error cause close connection');
});

module.exports = {broadcastToClients};
