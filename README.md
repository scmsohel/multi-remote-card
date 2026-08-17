# Universal Remote Card

A modern, customizable universal remote card for Home Assistant.

## Current status

🚧 **Early development / prototype**

The repository currently contains the first working interactive card prototype. The visual direction is based on the fan remote interface we are recreating, while the configuration is designed to grow into a reusable universal remote.

## Current UI

- Bedroom / Lounge room selector
- Fan power
- Fan speed 1–6
- Reverse
- Light power
- Color temperature controls
- Brightness controls
- 1H / 4H / 8H timers
- Responsive mobile/tablet layout
- Custom Home Assistant script/action support

## Installation for testing

The card is currently installed manually as a Lovelace JavaScript Module.

1. Download or copy `universal-remote-card.js` from this repository.
2. Put it in `/config/www/` on Home Assistant, or serve the file from a web-accessible location.
3. Add the following resource in **Settings → Dashboards → Resources**:

```yaml
url: /local/universal-remote-card.js
type: module
```

4. Add the card to a dashboard using `custom:universal-remote-card`.

## Example configuration

```yaml
type: custom:universal-remote-card

rooms:
  bedroom:
    name: BEDROOM
    fan: fan.bedroom_fan
    light: light.bedroom_light
  lounge:
    name: LOUNGE
    fan: fan.lounge_fan
    light: light.lounge_light

actions:
  speed_1: script.fan_speed_1
  speed_2: script.fan_speed_2
  speed_3: script.fan_speed_3
  speed_4: script.fan_speed_4
  speed_5: script.fan_speed_5
  speed_6: script.fan_speed_6
  reverse: script.fan_reverse
  color_temp_minus: script.light_temp_down
  color_temp_plus: script.light_temp_up
  brightness_minus: script.light_brightness_down
  brightness_plus: script.light_brightness_up
  timer_1h: script.fan_timer_1h
  timer_4h: script.fan_timer_4h
  timer_8h: script.fan_timer_8h
```

## Roadmap

- Match the reference interface more closely
- Replace placeholder symbols with consistent vector icons
- Improve fan speed state detection for different Home Assistant fan integrations
- Add configurable themes and dimensions
- Add richer action/service configuration
- Add proper HACS installation metadata and release workflow
- Add support for additional remote/device layouts
- Connect the card to RF/IR/ESPHome-based remotes

## License

License will be selected before the first stable release.
