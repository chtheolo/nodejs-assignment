const config = require('./config');
const {connect} = require('nats');
const {post, update} = require('');

function arraysEqual(gps, point) {
	return Array.isArray(gps)
		&& gps.length === point.length
		&& gps.every((val, index) => val === point[index]);
}

const main = async () => {
	let nc;
	try {
		nc = await connect(
			// {json: true},
			{servers: 'nats://nats:4222'},
		);
	} catch (error) {
		console.error(
			`error connecting to nats: ${error.message}`,
		);
		return;
	}

	console.info(
		`connected to ${nc.options.servers}`,
	);

	nc.closed()
		.then(error => {
			console.log('connection has been closed');
			if (error) {
				console.error(error);
			}
		})
		.catch(error => {
			console.dir(error);
		});

	const sub = nc.subscribe(`vehicle.${config.subject.name}`);
	console.log(`subscribed to ${config.subject.name} using subscription id ${sub.getID()}`);
	for await (const m of sub) {
		// Vehicle start its route
		if (arraysEqual(m.gps, config.routes.r1.start)) {
			const res = post(m, config.subject.name);
			console.log(res);
		}

		// Vehicle end its route
		if (arraysEqual(m.gps, config.routes.r1.end)) {
			update(m);
		}


		console.log(`[${sub.getProcessed()}]: ${m.subject}: ${m.data}`);
	}

	console.log('subscription closed!');
};

main();
