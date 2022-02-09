const config = require('./config');
const WebSocket = require('ws');

var count = 0;

console.log("Wait for websocket service...");
setTimeout(() => {
	const client = new WebSocket(`ws://${config.container.name}:${config.container.port}`);
	client.onopen = () => {
		console.log(`Client Connected, ${new Date().toLocaleString()}`)
	};

	client.onmessage = (message) => {
		var obj = JSON.parse(message.data);
		count++;
	};

	client.onerror = (error) => {
		console.log(`Websocket Connection failed, ${new Date().toLocaleString()}`);
	};

	client.close = () => {
		if (count === config.test.numOfMessages) {
			console.log(`
			Expected ${config.test.numOfMessages} number of messages\n
			Received succesfully ${count} messages.\n
			Test PASSED!.
			`);
			// client.close();
			process.exit(0); // exit container
		} else {
			console.log(`
			Expected ${config.test.numOfMessages} number of messages\n
			Received succesfully ${count} messages.\n
			Test FAILED!.
			`);
			process.exit(1); // exit container
		}
		console.log(`Client Disconnected, ${new Date().toLocaleString()}`);
	};
}, 1000);



