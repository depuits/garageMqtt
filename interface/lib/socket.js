const http = require('./web').http;
const gate = require('./gate');
const io = require('socket.io')(http);
const config = require('config');

console.log('Creating socket interface');

const timers = [];

function sendGateStatus(socket) {
	//send the current gate state
	socket = socket ||io;
	socket.emit('gateState', gate.isOpen ? 'open' : 'closed');
}

function sendTimers(socket) {
	//send the current gate state
	socket = socket ||io;
	socket.emit('timers', timers);
}

function addTimer(time) {
	let id = setTimeout(function() {
		gate.toggle();
		removeTimer(id);
	}, time * 1000);

	timers.push({
		id: id,
		triggerTime: new Date(Date.now() + time * 1000).getTime(),

	});
	sendTimers();
}
function cancelTimer(id) {
	clearTimeout(id);
	removeTimer(id);
}
function removeTimer(id) {
	var index = timers.findIndex(t => t.id == id);
	if (index > -1) {
		timers.splice(index, 1);
	}
	sendTimers();
}

function toggleGate(socket, code, seconds) {
	if (config.code && code !== config.code) {
		socket.emit('error', 'Incorrect code.');
		return;
	}

	if (seconds) {
		//set timout
		addTimer(seconds);
	} else {
		// toggle immediatly
		gate.toggle();
	}
}

//TODO subscribe to gate state changes
gate.on('change', function() {
	sendGateStatus();
});


io.on('connection', function(socket){
	console.log('a user connected');
	sendGateStatus(socket);
	sendTimers(socket);
	
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});

	socket.on('gateToggle', function(code, seconds) {
		toggleGate(socket, code, seconds);
	});
	socket.on('cancelTimer', function(id) {
		cancelTimer(id);
	});
});


module.exports = io;
