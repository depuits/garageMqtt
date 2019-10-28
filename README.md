# GarageMqtt

Mqtt module which notifies if the garage door is open and that can also open and close it.

## Supported modules
- W5100
- ENC28J60

## Installation/Configuration
1. Install [PubSubClient](http://pubsubclient.knolleary.net/), and [AButt](https://github.com/depuits/AButt). Depending on the ethernet module you are using you will also need to install [UIPEthernet](https://github.com/ntruchsess/arduino_uip).
2. Update the `config-sample.h` file with your settings. Review the comments to help with the options.
3. Save the configuration file as `config.h`.
4. Open the `.ino` file in the Arduino IDE and upload.

### Wiring
TODO add example
