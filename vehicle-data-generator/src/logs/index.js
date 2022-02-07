const developLogger = require('./developLogger');

let logger = null;

if (process.env.NODE_ENV !== 'production') {
	logger = developLogger();
}

module.exports = {logger};
