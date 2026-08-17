# Universal Remote Card

A modern and customizable universal remote card for Home Assistant.

## Status

🚧 **Early development / prototype**

The first interactive UI prototype is now included in the repository. The design is based on the fan remote interface we are developing, with support for multiple rooms, fan speeds, power, reverse, light controls, and timers.

## Planned features

- Fan speed 1–6
- Fan power
- Reverse
- Light power
- Color temperature controls
- Brightness controls
- 1H / 4H / 8H timers
- Multiple rooms/devices
- Custom Home Assistant actions
- Responsive mobile/tablet layout
- HACS support
- Additional remote/device types

## Installation

This project is currently under development and is not yet a stable HACS release.

For development, add the JavaScript file from this repository as a Home Assistant Lovelace JavaScript Module resource.

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

## License

License will be selected before the first stable release.
