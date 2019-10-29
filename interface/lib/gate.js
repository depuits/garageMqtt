'use strict';

const MQTT = require("async-mqtt");
const eventEmitter = require('events').EventEmitter;

const Gate = async function(config) {
	const mqttConfig = Object.assign({}, config.connection); // we copy the config because it must be editable
	const client = await MQTT.connectAsync(mqttConfig)
	await client.subscribe(config.topicState);

	const gate = new eventEmitter();
	
	client.on('message', function (topic, message) {
		gate.isOpen = (message == config.payloadOpen);
		gate.emit('change', message);
	});

	return Object.assign(gate, {
		open: async function() {
			await client.publish(config.topicSet, config.payloadOpen);
		},
		close: async function() {
			await client.publish(config.topicSet, config.payloadClose);
		},
		toggle: async function() {
			await client.publish(config.topicSet, config.payloadToggle);
		},
	});
};

const config = require('config');
const gate = Gate(config.get('mqtt'));

module.exports = gate;
