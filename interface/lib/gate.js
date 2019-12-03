'use strict';

const MQTT = require("async-mqtt");
const eventEmitter = require('events').EventEmitter;

const Gate = function(config) {
	let gate = new eventEmitter();

	return Object.assign(gate, {
		init: async function() {
			const mqttConfig = Object.assign({}, config.connection); // we copy the config because it must be editable
			gate.client = await MQTT.connectAsync(mqttConfig)
			await gate.client.subscribe(config.topicState);

			gate.client.on('message', function (topic, message) {
				console.log('Gate receive: ' + message);
				gate.isOpen = (message == config.payloadOpen);
				gate.emit('change', message);
			});
		},
		open: async function() {
			console.log('Gate send: open');
			await gate.client.publish(config.topicSet, config.payloadOpen);
		},
		close: async function() {
			console.log('Gate send: close');
			await gate.client.publish(config.topicSet, config.payloadClose);
		},
		toggle: async function() {
			console.log('Gate send: toggle');
			await gate.client.publish(config.topicSet, config.payloadToggle);
		},
		open50: async function() {
			console.log('Gate send: open50');
			await gate.client.publish(config.topicSet, config.payloadOpen50);
		},
	});
};

const config = require('config');
const gate = Gate(config.get('mqtt'));
gate.init();

module.exports = gate;
