const pinoInspector = require('pino-inspector')

const logger = require('pino')({
  level: 'debug',
  prettyPrint: true,
  prettifier: pinoInspector
});

// const pino = require('pino')
// const transport = pino.transport({
//   target: 'pino-pretty',
//   options: { destination: 2 } // use 2 for stderr
// })
// const logger = pino(transport)

module.exports = logger;
