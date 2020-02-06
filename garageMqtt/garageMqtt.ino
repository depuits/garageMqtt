#include "config.h"

#ifdef ENC28J60
#include <UIPEthernet.h>
#else
#include <Ethernet.h>
#endif

// https://github.com/depuits/AButt
#include <AButt.h>
#include "PubSubClient.h"

#include <avr/wdt.h>

EthernetClient ethClient;
PubSubClient mqttClient(ethClient);

#ifdef CONFIG_IS_OPEN_ON_TRIGGER
AButt stateInput(CONFIG_PIN_STATE, false);
#else
AButt stateInput(CONFIG_PIN_STATE, true);
#endif

bool isOpen = false;

void doorOpen() {
	// the door is now open
#ifdef CONFIG_DEBUG
	Serial.print("Door open");
#endif
	mqttClient.publish(CONFIG_MQTT_TOPIC_STATE, CONFIG_MQTT_PAYLOAD_OPEN, true);
}
void doorClose() {
	// the door has closed
#ifdef CONFIG_DEBUG
	Serial.print("Door closed");
#endif
	mqttClient.publish(CONFIG_MQTT_TOPIC_STATE, CONFIG_MQTT_PAYLOAD_CLOSE, true);
}

void processMessage(char* message) {
	if (strcmp(message, CONFIG_MQTT_PAYLOAD_OPEN) == 0) {
		if (!isOpen) {
			digitalWrite(CONFIG_PIN_TOGGLE, LOW);
			delay(500);
			digitalWrite(CONFIG_PIN_TOGGLE, HIGH);
		}
	}
	else if (strcmp(message, CONFIG_MQTT_PAYLOAD_CLOSE) == 0) {
		digitalWrite(CONFIG_PIN_CLOSE, LOW);
		delay(500);
		digitalWrite(CONFIG_PIN_CLOSE, HIGH);
	}
	else if (strcmp(message, CONFIG_MQTT_PAYLOAD_TOGGLE) == 0) {
		digitalWrite(CONFIG_PIN_TOGGLE, LOW);
		delay(500);
		digitalWrite(CONFIG_PIN_TOGGLE, HIGH);
	}
	else if (strcmp(message, CONFIG_MQTT_PAYLOAD_OPENHALF) == 0) {
		if (!isOpen) {
			digitalWrite(CONFIG_PIN_TOGGLE50, LOW);
			delay(500);
			digitalWrite(CONFIG_PIN_TOGGLE50, HIGH);
		}
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
	wdt_disable(); //always good to disable it, if it was left 'on' or you need init time

	// setup serial communication
#ifdef CONFIG_DEBUG
	Serial.begin(9600);
	Serial.println("Setup");
#endif

	pinMode(CONFIG_PIN_STATE, INPUT_PULLUP);

	pinMode(CONFIG_PIN_TOGGLE, OUTPUT);
	digitalWrite(CONFIG_PIN_TOGGLE, HIGH);

	pinMode(CONFIG_PIN_CLOSE, OUTPUT);
	digitalWrite(CONFIG_PIN_CLOSE, HIGH);
	
	pinMode(CONFIG_PIN_TOGGLE50, OUTPUT);
	digitalWrite(CONFIG_PIN_TOGGLE50, HIGH);

	stateInput.onHold(doorOpen, doorClose);
	stateInput.setHoldDelay(500); // set the hold delay low so it's called quickly

#ifdef CONFIG_DEBUG
	Serial.println("setup mac");
#endif
	// setup ethernet communication using DHCP
	if(Ethernet.begin(mac) == 0)
	{
#ifdef CONFIG_DEBUG
		Serial.println("Ethernet configuration using DHCP failed");
#endif
		delay(5000);
		asm volatile ("jmp 0");
	}

#ifdef CONFIG_DEBUG
	Serial.println("Connecting to client");
#endif

	// setup mqtt client
	mqttClient.setServer(CONFIG_MQTT_HOST, CONFIG_MQTT_PORT);
	mqttClient.setCallback(mqttCallback);

	// start watchdog so if the ethernet setup fails it restarts every 8 seconds
	wdt_enable(WDTO_8S); //enable it, and set it to 8s
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
			wdt_reset();
		}
	}
}

void loop()
{
	wdt_reset();
	Ethernet.maintain();
	if (!mqttClient.connected())
	{
		reconnect();
	}

	mqttClient.loop();

	stateInput.update();
	isOpen = stateInput.getState();

	unsigned long time = millis();
	unsigned long target = 1000l * 60l * 60l * 12l;
	if (time > target) {
		//never keep the device running for longer then 12 hours
		asm volatile ("jmp 0");
	}
}
