const http = require('./web').http;
const gate = require('./gate');
const io = require('socket.io')(http);
const config = require('config');

console.log('Creating socket interface');

function sendStatus(socket) {
	//send the current gate state
	socket = socket ||io;
	socket.emit('gateState', gate.isOpen ? 'open' : 'closed');
}

function sendTimers(socket) {
	//send the currently running timers
	socket = socket ||io;
	let data = gate.timers.map(({ id, cmd, triggerTime }) => ({ id, cmd, triggerTime }));
	socket.emit('timers', data);
}

function commandGate(socket, code, seconds, cmd) {
	if (config.code && code !== config.code) {
		socket.emit('input-error', 'Incorrect code.');
		return;
	}

	if (seconds) {
		//set timout
		gate.addTimer(seconds, cmd);
	} else {
		// toggle immediatly
		gate.action(cmd);
	}
}

// subscribe to gate state changes
gate.on('change', function() {
	sendStatus();
});
gate.on('timers', function() {
	sendTimers();
});

io.on('connection', function(socket){
	console.log('a user connected');
	sendStatus(socket);
	sendTimers(socket);
	
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});

	socket.on('commandGate', function({ code, seconds, cmd }) {
		commandGate(socket, code, seconds, cmd);
	});
	socket.on('cancelTimer', function(id) {
		gate.cancelTimer(id);
	});
});


module.exports = io;
