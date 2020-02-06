'use strict';

const MQTT = require("async-mqtt");
const eventEmitter = require('events').EventEmitter;

const Gate = function(config) {
	let gate = new eventEmitter();

	return Object.assign(gate, {
		// timer vatiables
		timers: [],
		idCounter: 0,
		closingTimerId: -1,

		init: async function() {
			const mqttConfig = Object.assign({}, config.connection); // we copy the config because it must be editable
			gate.client = await MQTT.connectAsync(mqttConfig);
			await gate.client.subscribe(config.topicState);
			console.log('connected to mqtt');

			const autoCloseTime = +config.autoClose;
			gate.client.on('message', function (topic, message) {
				console.log('Gate receive: ' + message);
				gate.isOpen = (message == config.payloadOpen);
				if (gate.isOpen) {
					if (autoCloseTime && gate.closingTimerId === -1) {
						let timer = gate.addTimer(autoCloseTime, 'Close');
						gate.closingTimerId = timer.id;
					}
				} else {
					if (gate.closingTimerId > -1) {
						gate.cancelTimer(gate.closingTimerId);
					}
				}

				gate.emit('change', gate, message);
			});
		},

		// command functions
		action(cmd) {
			console.log('Gate action: ' + cmd);
			switch (cmd) {
				case 'Toggle':
					return gate.toggle();
				case 'Open':
					return gate.open();
				case 'Open50':
					return gate.open50();
				case 'Close':
					return gate.close();
			}
		},

		async open() {
			console.log('Gate send: open');
			await gate.client.publish(config.topicSet, config.payloadOpen);
		},
		async close() {
			console.log('Gate send: close');
			await gate.client.publish(config.topicSet, config.payloadClose);
		},
		async toggle() {
			console.log('Gate send: toggle');
			await gate.client.publish(config.topicSet, config.payloadToggle);
		},
		async open50() {
			console.log('Gate send: open50');
			await gate.client.publish(config.topicSet, config.payloadOpen50);
		},

		// timer functions
		addTimer(time, cmd) {
			let id = gate.idCounter++;
			let to = setTimeout(function() {
				console.log('timer finished');
				gate.action(cmd);
				gate.removeTimer(id);
			}, time * 1000);

			let timer = {
				id: id,
				cmd: cmd,
				timeout: to,
				triggerTime: new Date(Date.now() + time * 1000).getTime(),
			};
			gate.timers.push(timer);

			console.log('timer added ' + id);

			gate.emit('timers', gate);
			return timer;
		},
		cancelTimer(id) {
			let index = gate.timers.findIndex(t => t.id == id);
			if (index > -1) {
				console.log('canceling timer ' + id);
				clearTimeout(gate.timers[index].timeout);
				gate.removeTimer(id);
			}
		},
		removeTimer(id) {
			if (id === gate.closingTimerId) {
				gate.closingTimerId = -1;
			}

			let index = gate.timers.findIndex(t => t.id == id);
			if (index > -1) {
				console.log('timer removed ' + id);
				gate.timers.splice(index, 1);
				gate.emit('timers', gate);
			}
		},
	});
};

const config = require('config');
const gate = Gate(config.get('mqtt'));
gate.init();

module.exports = gate;
