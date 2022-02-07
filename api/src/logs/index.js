const developLogger = require('./developLogger');
const prodLogger = require('./prodLogger');

let logger = null;

if (process.env.NODE_ENV === 'development') {
	logger = developLogger();
}

if (process.env.NODE_ENV === 'production') {
	logger = prodLogger();
}

module.exports = {logger};
