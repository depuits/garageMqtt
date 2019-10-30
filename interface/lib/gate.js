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
				gate.isOpen = (message == config.payloadOpen);
				gate.emit('change', message);
			});
		},
		open: async function() {
			await gate.client.publish(config.topicSet, config.payloadOpen);
		},
		close: async function() {
			await gate.client.publish(config.topicSet, config.payloadClose);
		},
		toggle: async function() {
			await gate.client.publish(config.topicSet, config.payloadToggle);
		},
	});
};

const config = require('config');
const gate = Gate(config.get('mqtt'));
gate.init();

module.exports = gate;
