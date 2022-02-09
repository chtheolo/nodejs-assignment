/*

In this file you will find how we send raw data to other services via nats
There are 2 question points for you to tell us the answer on your presentation
If you're up for it

*/
const csvParse      = require ( "csv-parse")
const fs            = require ( "fs")
const Writable      = require ("stream").Writable
const { pipeline }  = require ("stream")
const config		= require ("./config")
const {logger}		= require ("./logs")

// NATS Server is a simple, high performance open source messaging system
// for cloud native applications, IoT messaging, and microservices architectures.
// https://nats.io/
// It acts as our pub-sub (https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern)
// mechanism for other service that needs raw data
const { connect, JSONCodec } = require("nats")

// At this point, do not forget to run NATS server!

// This function will start reading out csv data from file and publish it on nats
const readOutLoud = (vehicleName, nats) => {
	let fileStream
	// Read out meta/route.csv and turn it into readable stream
	if (process.env.NODE_ENV === 'test') {
		fileStream = fs.createReadStream(__dirname + "/meta/test.csv")
	} else {
		fileStream = fs.createReadStream(__dirname + "/meta/route.csv")
	}
	
	// =========================
	// Question Point 1:
	// What's the difference betweeen fs.createReadStream, fs.readFileSync, and fs.readFileAsync?
	// And when to use one or the others
	// =========================

	// Now comes the interesting part,
	// Handling this filestream requires us to create pipeline that will transform the raw string
	// to object and sent out to nats
	// The pipeline should looks like this
	//
	//  File -> parse each line to object -> published to nats
	//

	const jc = JSONCodec();
	let i = 0

	return pipeline(
		fileStream,
		csvParse({ delimiter: ",", columns: true, cast: true }),
		new Writable({
			objectMode: true,
			write(obj, enc, cb) {
				// setTimeout in this case is there to emulate real life situation
				// data that came out of the vehicle came in with irregular interval
				// Hence the Math.random() on the second parameter
				setTimeout(() => {

					i++
					if((i % 100) === 0)
						console.log(`vehicle ${vehicleName} sent have sent ${i} messages`)

					// The first parameter on this function is topics in which data will be broadcasted
					// it also includes the vehicle name to seggregate data between different vehicle

					nats.publish(`vehicle.${vehicleName}`, jc.encode(obj))
					process.nextTick(cb)
				}, Math.ceil(Math.random() * 150))
			}
		}),
		(error) => {
			if (error) {
				logger.error(error.message);
			}
			else {
				logger.info("Pipeline succeeded");
			}
		}
	)
	// =========================
	// Question Point 2:
	// What would happend if it failed to publish to nats or connection to nats is slow?
	// Maybe you can try to emulate those slow connection
	// =========================
}


const main = async () => {
    try {
        var nats = await connect(
          {servers: `nats://nats:${config.nats.port}`}
        );
    } catch (error) {
		logger.error(`error connecting to nats: ${error.message}`)
        return;
    }

    logger.info(
        `connected to ${nats.options.servers}`
    );

    nats.closed()
    .then(error => {
      logger.info('connection has been closed')
      if (error) {
        logger.error(error.message);
      }
    })
    .catch((error) => {
      logger.error(error)
    })

	// This next few lines simulate Henk's (our favorite driver) shift
	if (process.env.NODE_ENV === 'test') {
		console.log("--Test MODE --\nWaiting for clients to connecct");
		setTimeout(() => {
			console.log("Henk checks in on test-bus-1 starting his shift...")
			readOutLoud(config.subject.name, nats)
				.once("finish", () => {
					console.log("henk is on the last stop and he is taking a cigarrete while waiting for his next trip")
					return;
				})
		}, 20000);
	} else {
		console.log("Henk checks in on test-bus-1 starting his shift...")
		readOutLoud(config.subject.name, nats)
			.once("finish", () => {
				console.log("henk is on the last stop and he is taking a cigarrete while waiting for his next trip")
				return;
			})
	}


	// To make your presentation interesting maybe you can make henk drive again in reverse
	
}

main()