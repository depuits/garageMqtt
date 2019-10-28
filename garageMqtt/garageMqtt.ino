#ifdef ENC28J60
#include <UIPEthernet.h>
#else
#include <Ethernet.h>
#endif
#include "PubSubClient.h"

// https://github.com/depuits/AButt
#include <AButt.h>

#include "config.h"

EthernetClient ethClient;
PubSubClient mqttClient(ethClient);
AButt stateInput(CONFIG_PIN_STATE, true);

void doorOpen() {
	// the door is now open
	Serial.print("Door open");
    mqttClient.publish(CONFIG_MQTT_TOPIC_STATE, "1", true);
}
void doorClose() {
	// the door has closed
	Serial.print("Door closed");
    mqttClient.publish(CONFIG_MQTT_TOPIC_STATE, "0", true);
}

void processMessage(char* message) {
	if (strcmp(message, CONFIG_MQTT_PAYLOAD_OPEN) == 0) {
		//TODO implement 
	}
	else if (strcmp(message, CONFIG_MQTT_PAYLOAD_CLOSE) == 0) {
		//TODO implement 
	}
	else if (strcmp(message, CONFIG_MQTT_PAYLOAD_TOGGLE) == 0) {
		digitalWrite(CONFIG_PIN_TRIGGER, LOW);
		delay(500);
		digitalWrite(CONFIG_PIN_TRIGGER, LOW);
	}
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
#ifdef CONFIG_DEBUG
	Serial.print("Message arrived [");
	Serial.print(topic);
	Serial.print("] ");
#endif

	char message[length + 1];
	for (int i = 0; i < length; i++) {
		message[i] = (char)payload[i];
	}
	message[length] = '\0';

#ifdef CONFIG_DEBUG
	Serial.println(message);
#endif

	processMessage(message);
}

void setup() 
{
    pinMode(CONFIG_PIN_STATE, INPUT_PULLUP);
	pinMode(CONFIG_PIN_TRIGGER, OUTPUT);

    stateInput.onHold(doorOpen, doorClose);
    stateInput.setHoldDelay(500); // set the hold delay low so it's called quickly

	// setup serial communication
#ifdef CONFIG_DEBUG
	Serial.begin(9600);
#endif
	// setup ethernet communication using DHCP
	if(Ethernet.begin(mac) == 0) 
	{
#ifdef CONFIG_DEBUG
		Serial.println("Ethernet configuration using DHCP failed");
#endif
		while(true);
	}

	// setup mqtt client
	mqttClient.setServer(CONFIG_MQTT_HOST, CONFIG_MQTT_PORT);
	mqttClient.setCallback(mqttCallback);
}

void reconnect() 
{
	// Loop until we're reconnected
	while (!mqttClient.connected()) 
	{
#ifdef CONFIG_DEBUG
		Serial.print("Attempting MQTT connection...");
#endif
		// Attempt to connect
		if (mqttClient.connect(CONFIG_MQTT_CLIENT_ID, CONFIG_MQTT_USER, CONFIG_MQTT_PASS)) 
		{
#ifdef CONFIG_DEBUG
			Serial.println("connected");
#endif
			mqttClient.subscribe(CONFIG_MQTT_TOPIC_SET);
		}
		else 
		{
#ifdef CONFIG_DEBUG
			Serial.print("failed, rc=");
			Serial.print(mqttClient.state());
			Serial.println(" try again in 5 seconds");
#endif
			// Wait 5 seconds before retrying
			delay(5000);
		}
	}
}

void loop() 
{
  Ethernet.maintain(); 
	if (!mqttClient.connected()) 
	{
		reconnect();
	}

	mqttClient.loop();

    stateInput.update();
}
