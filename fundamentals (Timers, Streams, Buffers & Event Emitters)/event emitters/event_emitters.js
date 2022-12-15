const EventEmitter = require('events');

const emitter = new EventEmitter();

emitter.on('start', () => {
	console.log('started');
});

setTimeout(() => {
	emitter.emit('start');
}, 1000);
