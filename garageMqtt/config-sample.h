/*
 * This is a sample configuration file for the "mqtt_esp8266" light.
 *
 * Change the settings below and save the file as "config.h"
 * You can then upload the code using the Arduino IDE.
 */

// Network mac address
uint8_t mac[6] = {0x00,0x01,0x02,0x03,0x04,0x05};

// Button pin number, change to actual pin number
#define CONFIG_PIN_STATE 3
#define CONFIG_PIN_TOGGLE 5
#define CONFIG_PIN_CLOSE 6
#define CONFIG_PIN_TOGGLE50 7

// comment out if not using dht sensor
// https://github.com/adafruit/DHT-sensor-library
#include "DHT.h"
#define CONFIG_PIN_DHT 2
#define CONFIG_DHT_TYPE DHT11
#define CONFIG_DHT_FAHRENHEIT false

#define CONFIG_MQTT_TOPIC_TEMPERATURE "home/garage/temp"
#define CONFIG_MQTT_TOPIC_HUMIDITY "home/garage/humid"

// MQTT
#define CONFIG_MQTT_HOST "{MQTT-SERVER}"
#define CONFIG_MQTT_PORT 1883 // Usually 1883
#define CONFIG_MQTT_USER "{MQTT-USERNAME}"
#define CONFIG_MQTT_PASS "{MQTT-PASSWORD}"
#define CONFIG_MQTT_CLIENT_ID "GARAGE_DOOR" // Must be unique on the MQTT network

// MQTT Birth and Last will
#define CONFIG_MQTT_BLW_TOPIC "home/garage/status"
#define CONFIG_MQTT_BLW_QOS 0
#define CONFIG_MQTT_BLW_RETAIN true
#define CONFIG_MQTT_BLW_WILL "offline"
#define CONFIG_MQTT_BLW_BIRTH "online"

#define CONFIG_MQTT_TOPIC_STATE "home/garage"
#define CONFIG_MQTT_TOPIC_SET "home/garage/set"

#define CONFIG_MQTT_PAYLOAD_OPEN "open"
#define CONFIG_MQTT_PAYLOAD_CLOSE "close"
#define CONFIG_MQTT_PAYLOAD_TOGGLE "toggle"
#define CONFIG_MQTT_PAYLOAD_OPENHALF "open50"

// Use this define when the door is open when the trigger is hit
//#define CONFIG_IS_OPEN_ON_TRIGGER

// Enables Serial and print statements, comment out to disable
//#define CONFIG_DEBUG

// Uncomment the line with the correct module name
//#define W5100
#define ENC28J60
