# ViriCiti Nodejs Assignment
![
](https://imgs.xkcd.com/comics/code_quality_3.png)

## Contents
* [How to install](#how-to-install)
* [How to run](#how-to-run)
* [Architecture](#arch)
  1. [Vehicle Data Generator](#data-generator)
  2. [Nats Messaging](#nats)
  3. [REST API (for Mongo)](#api)
  4. [Websocket API](#ws)
  5. [MongoDB](#mongo)
  6. [Tests](#tests)
* [Packages](#pkg)
* [Future Work](#future)


<a name="how-to-install"></a>
* ## How to install

The project was developed to run in docker containers, so firstly you have to install [**docker**](https://docs.docker.com/engine/install/ubuntu/) and [**docker-compose**](https://docs.docker.com/compose/install/) in your machine.

<a name="how-to-run"></a>
* ## How to run
After installation finished you are ready to start running the project. Very important is the .env file locating in the api folder.
The .env has the below form:

```.env
PORT=3000
DATABASE=db
DEV_DATABASE=db_dev
TEST_DATABASE=db_test
CONTAINER_DATABASE_TEST=mongo_test
CONTAINER_DATABASE=mongo
MONGO_PORT=27017
```

To run the project all you need to do is to run the script **start-services.sh** which is located in the root folder of our project, */nodejs-assignment*.

```bash
bash start-services.sh
```

This script will offer you two options, either run the project in DEVELOPMENT mode, which prints logs and saves data in the development
database, or in PRODUCTION mode in which we don't have logs (logs only from the vehicle-data-generator service) and data are being saved in the production database.
In both of these modes tests are being runned in docker containers before starting the main services and log files are created, 
storing useful information extracted from the runtime.

<a name="arch"></a>
* ## Architecture

The solution was developed in 5 different services.
1. [Vehicle Data Generator](#data-generator)
2. [Nats Messaging](#nats)
3. [REST API (for Mongo)](#api)
4. [Websocket API](#ws)
5. [MongoDB](#mongo)
6. [Tests](#tests)

Each of the afforementioned services are running separately in docker containers.


<a name="data-generator"></a>

### Vehicle Data Generator
This service is responsible for reading a large .csv file and streaming it in Nats subject. This generator functionality was given 
as a plug an play solution, although some changes were made.

In the initial file, streaming data to Nats was implemented by using the **pipe** method. In newer versions of node, module pipeline 
outweigh pipes as in case of occuring an error anywhere in the pipeline, the pipeline will end, and the callback will be invoked 
with the error avoiding memory leaks. Also, if the pipeline successfully ends, the callback function is invoked.
Also improves readability and we can use [**async generator functions**](https://javascript.info/async-iterators-generators).

```javascript
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
```

Finally, we add a condition where we check if the **NODE_ENV** value is *test* or *start-broadcast*. If NODE_ENV=test then, generator
reads and streams a smaller file, **test.csv**, in order to test our websocket api.

<a name="nats"></a>

### Nats
Nats is responsible for addressing, discovery and exchanging of messages that drive the common patterns in distributed systems; 
asking and answering questions, aka services/microservices. 
In our project we used the Node.js Client, [NATS.js](https://github.com/nats-io/nats.js). In the initial **vehicle-data-generator** 
was ^1.0.1 version but I upgrade in the latest 2.6.0.

<a name="api"></a>

### REST API
This service is responsible for the interaction between the world and the mongoDB. It has 3 basic operations, the server which runs
in port 3000, that is responsible for the routing, the HTTP serving requests and eventually the subscribe operation to Nats 
container.

The server runs in 3 modes depending on the NODE_ENV variable.

### API MODES
| MODE | DATABASE | LOGS | LOG FILES |
| ----------- | --- | ------ | --- |
|production| db | NO | YES |
|development| db_dev | YES | YES |
|test| db_test | YES | YES |

There is a **/config** folder where all the variables are setted up depending on the mode and pass these info to the rest program.

```javascript
	switch (process.env.NODE_ENV) {
		case 'production':
			db = config.dbClient.database;
			break;
		case 'development':
			db = config.dbClient.devDatabase;
			break;
		case 'test':
			db = config.dbClient.testDatabase;
			break;

		default:
	}

	mongoose.connect(db, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	}, error => {
		if (error) {
			logger.error(error);
		}

		logger.info(`Connected to :: ${db}`);
	});

 ...

	server = app.listen(config.service.port, error => {
		if (error) {
			console.error(error.message);
		}

		logger.info(`Server :: Running @ 'http://localhost:${config.service.port}.`);
	});
  
  ...
```

The folder **/routes** is responsible for the routing to the endpoints.

The **index.js** is the file where we define the Express.Router() that acts as a mini application. You can call an instance of it 
(like we do for Express) and then define routes on that. This is very powerful because we can create multiple express.Router()s and then apply them to our application, which makes our application more modular and flexible.

```javascript
// Route Groups
const routes = {
	// eslint-disable-next-line new-cap
	vehicleData: express.Router(),
	// eslint-disable-next-line new-cap
	api: express.Router(),
};

module.exports = function (app) {
	/*		Vehicle Data        */
	routes.api.use('/vehicle_data', routes.vehicleData);
	routes.vehicleData
		.get('/', controllers.vehicleData.get);

	// Set url for API group routes
	app.use('/', routes.api);
};
```

Moreover, inside the /routes we set a folder for each endpoint our API serves. In that case we have only one, the **vehicle_data**.
Inside we have 3 different files:

* models.js, 
where we declare the Schema of our data. We choose to use the **Bucket Pattern**, which is particularly effective when working with Internet of Things (IoT), Real-Time Analytics, or Time-Series data in general. By bucketing data together we make it easier to organize specific groups of data, increasing the ability to discover historical trends or provide future forecasting and optimize our use of storage. Instead of having every single measurement in a separate Document, we "bucket" the data, into documents that 
hold measurements for a specific vehicle in a day and route span.

Example:

```json

  "vehicleId": "test-bus-1",
  "date": "2017-11-23T00:00:00.000Z",
  "startRouteDate": "2017-11-23T11:25:38.000Z",
  "measurements": [
      {
          "time": 1511436338000,
          "energy": 53.2,
          "gps": [
              "52.093448638916016",
              "5.117378234863281"
          ],
          "odo": 88526.413,
          "speed": 0,
          "soc": 72.8
      },
      {
          "time": 1511436339000,
          "energy": 53.2,
          "gps": [
              "52.093448638916016",
              "5.117378234863281"
          ],
          "odo": 88526.414,
          "speed": 4,
          "soc": 72.8
      },

      ...

      {
          "time": 1511436669000,
          "energy": 54.552,
          "gps": [
              "52.093509674072266",
              "5.117839813232422"
          ],
          "odo": 88527.689,
          "speed": 28,
          "soc": 66
      }
  ],
  "transactionCount": 244,
  "energyStart": 53.2,
  "sumSpeed": 4602,
  "odoStart": 88526.413,
  "socStart": 72.8,
  "createdAt": new Date("2022-02-09T10:43:31.393Z"),
  "updatedAt": new Date("2022-02-09T10:43:49.948Z"),
  "energyEnd": 54.552,
  "odoEnd": 88527.689,
  "socEnd": 66
```

With Bucket Pattern we got the benefit of reducing indexing size, potential query simplification, and the ability to use that pre-aggregated data in our documents.

As an example, we can see above that we had 244 transactions in that route and a total Speed 4602km/h. So, we can result that 
average Speed for the vehicle='test-bus-1', route started at "startRouteDate": "2017-11-23T11:25:38.000Z", is 18.860 km/h.


* index.js
In this file we are hanfling all the incoming http requests.

```javascript
const helper = require('./helpers');

// A HTTP GET method for vehicle_data endpoint.
async function get(req, res) {
	try {
		const data = await helper.fetch(req.query);
		// OK
		return res.status(200).send(data);
	} catch (error) {
		// Not found
		return res.status(404).send(error);
	}
}

...

```

* helpers.js
is the file where we keep the code that communicates with the mongo. If the, data parser receives a new packet from Nats, 
it will the create function from the helpers.js . In the same way, if the index.js receives a post request, it will call 
again the create function from the helpers.js .


Finally, for my solution, I have made an assumption that every vehicle that starts a new trip, in some way updates for that new 
trip by sending the gps and startTime. This, could be happen, either by pushing a start button from the vehicle's app, or a device which is connected with the power system of the electric car, sending a signal when the car powers on, or if the it is a city bus 
that serves a specific route. These were some ideas, but this functionality was not part of the current project.

### HTTP Verbs
| HTTP GET | PARAMS |
| ----------- | ------ |
| /vehicle_data?vehicleId= | vehicleId='test-bus-1'|
| /vehicle_data?vehicleId= & startRouteDate= | vehicleId='test-bus-1' <br /> startRouteDate: 1511436338000 <br />|
| /vehicle_data?vehicleId= & startRouteDate= | vehicleId='test-bus-1' <br /> startRouteDate: 2017-11-23T11:25:38.000Z <br />|
| /vehicle_data?vehicleId= & date= | vehicleId='test-bus-1' <br /> date: 2017-11-23<br />|
| /vehicle_data?vehicleId= & startDate= & endDate=| vehicleId='test-bus-1' <br /> startDate: 2017-11-23<br /> <br /> endDate: 2017-11-25<br />|

<a name="ws"></a>

### Websocket API

The websocket API is responsible for forwarding and updating the clients real-time with all the new measurements.
Again, we have 3 modes, depending on the NODE_ENV. It has two basic functionalities. The one is listening on Nats subject,
and the second one is the broadcasting to all connected clients.

```javascript
const nats = await connection(config.nats.port);
const sub = await subscribe(nats, config.subject.name)

...

for await (const m of sub) {
  wss.clients.forEach(client => {
    if (client !== wss && client.readyState === WebSocket.OPEN) {
      client.send(m.data);
    }
  });
}
```

In the above code, we can see the **connection** and **subscribe** methods that are initializing the connection to nats and subscribing to the specified topic(from /config folder) respectively. The implementation of those two functions is located in the
Nats folder inside src of the websocket api. 
The for - await loop is the one that listens for every new message and sending each message to every connected client excluding the
server for the broadcast.

<a name="data-generator"></a>

### MongoDB
Many of this functionality described in the REST API section. Although, I would like to add the **/database** folder that exists in 
the root of our project. This, folder keeps the docker volume folder and an init script for our database. The mongo-init.js is the script that inits our test database with data in order to run our tests.

<a name="tests"></a>

### Tests

Running tests is crucial for software development. Tests are never enough!!! For the purposes of this project, I have tested the 
REST api and the Websocket api. I have implemented test for the enpoints serving our api by using mocha & chai framework, validating 
the responses, status codes and size of responses. These tests run in docker containers, in different db, without affecting our 
production or development modes.

For testing the websocket functionality, I have made a simple webosocket client which runs also in docker containers. The code for that client is located in the **/websocket_client_test** which is in the project root folder. The generator service, running in 
test mode, streams 300 packets from the test.csv. The websocket api broadcasts these data to 3 clients docker replicas. The replicas
were denoted inside the testing_websockets.yml file. The websocket server, after broadcasting 300 pakcets, waits for 3 seconds and close the connection with every replica client. 
From the client side, every one counts the receved packets. If the client has received also, 300 messages, the test passes and terminates docker with exit code 0, otherwise test fails and terminates with code 1.


<a name="pkg"></a>
* ## Packages

1. Nats.js
2. body-parser, The body-parser middleware converts text sent through an HTTP request to a target format. Exposes 4 different parsers: text, JSON, URL encoded, and raw.
3. cors, CORS is a node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.
4. dotenv, reading variables from a .env file.
5. express, popular framework that offers flexibility, efficiency, minimalism and scalability.
6. mongoose, abstraction advantage , Schemas and Model abstractions and creates objects that make easier to work with instead of using raw data.
7. winston, simple logger and easy to use, configurable, log levels, logging channels(transports) and log formats.
8. ws, imple to use, blazing fast, and thoroughly tested WebSocket client and server implementation.