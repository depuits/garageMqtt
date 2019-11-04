const http = require('./web').http;
const gate = require('./gate');
const io = require('socket.io')(http);
const config = require('config');

console.log('Creating socket interface');

const timers = [];
let idCounter = 0;

function sendGateStatus(socket) {
	//send the current gate state
	socket = socket ||io;
	socket.emit('gateState', gate.isOpen ? 'open' : 'closed');
}

function sendTimers(socket) {
	//send the currently running timers
	socket = socket ||io;
	let data = timers.map(({ id, triggerTime }) => ({ id, triggerTime }));
	socket.emit('timers', data);
}

function addTimer(time) {
	let id = idCounter++;
	let to = setTimeout(function() {
		console.log('timer finished');
		gate.toggle();
		removeTimer(id);
	}, time * 1000);

	timers.push({
		id: id,
		timeout: to,
		triggerTime: new Date(Date.now() + time * 1000).getTime(),
	});
	console.log('timer added');

	sendTimers();
}
function cancelTimer(id) {
	console.log('timer canceled');
	let index = timers.findIndex(t => t.id == id);
	clearTimeout(timers[index].timeout);
	removeTimer(id);
}
function removeTimer(id) {
	let index = timers.findIndex(t => t.id == id);
	if (index > -1) {
		timers.splice(index, 1);
	}
	sendTimers();
}

function toggleGate(socket, code, seconds) {
	if (config.code && code !== config.code) {
		socket.emit('input-error', 'Incorrect code.');
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

// subscribe to gate state changes
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

	socket.on('gateToggle', function({ code, seconds }) {
		toggleGate(socket, code, seconds);
	});
	socket.on('cancelTimer', function(id) {
		cancelTimer(id);
	});
});


module.exports = io;
