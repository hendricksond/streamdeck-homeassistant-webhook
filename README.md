# Home Assistant Webhooks for Elgato Stream Deck
> Use the Elgato Stream Deck to call Home Assistant webhooks.

This plugin should work on both Windows 10 and macOS.

Based on the [streamdeck-ifttt plugin](https://github.com/tobimori/streamdeck-ifttt) by tobimori.

## How to use

You will need to define webhooks in your Home Assistant automations configuration, then configure the Stream Deck's buttons to call the webhooks.

### Installation

Download the [latest release](https://github.com/hendricksond/streamdeck-homeassistant-webhook/releases/latest), then execute the file. You will be asked if you want to install the file. Click yes, and the plugin will be installed.

### Creating an Automation

You will need to create a [Webhook Trigger](https://www.home-assistant.io/docs/automation/trigger/#webhook-trigger) in your Home Assistant automations configuration. Here is an example of a basic trigger:

```
- id: webhook_brightness
  alias: "Brightness Webhook"
  trigger:
  - platform: webhook
    webhook_id: replace_this_with_some_random_text
  action:
  - service: light.turn_on
    data:
      entity_id: light.office, light.living_room
      brightness_pct: 50
```

For generating the webhook_id, I recommend using a CodeIgniter Encryption Key from [randomkeygen.com](https://randomkeygen.com/), but you are welcome to use any text you want. Just be aware that there is no additional authentication on the URL. Anyone with access to the webhook_id can run your automation.

For a more advanced configuration, you can use the optional `service`, `entities`, and `parameter` fields. Here is an example of a configuration using the optional fields:

```
- id: webhook_brightness
  alias: "Brightness Webhook"
  trigger:
  - platform: webhook
    webhook_id: replace_this_with_some_random_text
  action:
  - service_template: '{{ trigger.json.service }}'
    data_template:
      entity_id: '{{ trigger.json.entities }}'
      brightness_pct: '{{ trigger.json.parameter }}'
```

### Configuring a button

Drag and drop the Webhook Button action from the Home Assistant category in the action list to an open button. Click the button to configure it. Fill out the fields.

#### Server URL
The base URL of your server. Do not include a trailing slash.

Example: `http://192.168.1.2:8123`

#### Webhook ID
The random text that you generated (or picked) for the `webhook_id` in your automation configuration.

Example: `replace_this_with_some_random_text`

#### Service
The optional service you would like to call. Accessible in your automation configuration as `trigger.json.service`.

Example: `light.turn_on`

#### Entities
One or more comma-separated entities. Accessible in your automation configuration as `trigger.json.entities`.

Example: `light.office, light.living_room`

#### Parameter
A raw value that you can use in your automation. Maybe a brightness level, or a color name, or some other useful data. Accessible in your automation configuration as `trigger.json.parameter`.

Example: `50`

## Support

If you find a bug, please [create an issue](https://github.com/hendricksond/streamdeck-homeassistant-webhook/issues/new). Provide as much information as possible.
