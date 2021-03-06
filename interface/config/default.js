'use strict';

var config = {
	port: 1991,
	code: 'password',

	mqtt: {
		topicState: 'home/garage',
		topicSet: 'home/garage/set',
		
		connection: {
			host: '{MQTT-SERVER}',
			port: 1883, // Usually 1883
			username: '{MQTT-USERNAME}',
			password: '{MQTT-PASSWORD}',
		},

		payloadOpen: 'open',
		payloadClose: 'close',
		payloadToggle: 'toggle',
		payloadOpen50:'open50',

		autoClose: 5 * 60,
	},
};

module.exports = config;
