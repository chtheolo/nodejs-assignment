/* eslint-disable arrow-body-style */
const {createLogger, format, transports} = require('winston');
const {combine, timestamp, printf} = format;

const devFormats = printf(({message, level, timestamp}) => {
	return `${timestamp} [${level}] : ${message}`;
});

const prodLogger = () => {
	return createLogger({
		level: 'debug',
		format: combine(
			timestamp(),
			devFormats,
		),
		transports: [
			new transports.File({filename: 'error.log', level: 'error'}),
			new transports.File({filename: 'output.log'}),
		],
	});
};

module.exports = prodLogger;
