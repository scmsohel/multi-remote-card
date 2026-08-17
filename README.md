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

## Installation

### Method 1 — HACS (Recommended)

This repository is installed through HACS as a **Dashboard** custom repository. HACS previously called this type **Lovelace** or **Plugin**.

1. Open **HACS** in Home Assistant.
2. Open the **⋮** menu in the top-right corner.
3. Select **Custom repositories**.
4. Add:

   `https://github.com/scmsohel/universal-remote-card`

5. Select repository type **Dashboard** (called **Lovelace** in some HACS versions).
6. Click **Add**.
7. Find **Universal Remote Card** in HACS and click **Download**.
8. HACS registers the dashboard resource automatically.
9. Hard-refresh the browser if the card does not appear immediately.
10. Add the card to a dashboard using the YAML below.

> No manual `/config/www` copy or manual resource entry is required when installing through HACS.

### Method 2 — Manual

1. Copy `universal-remote-card.js` to:

   `/config/www/universal-remote-card.js`

2. Add a resource in **Settings → Dashboards → Resources**:

```yaml
url: /local/universal-remote-card.js
type: module
```

3. Add the card to a dashboard using `custom:universal-remote-card`.

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
- Add proper HACS releases and versioning
- Add support for additional remote/device layouts
- Connect the card to RF/IR/ESPHome-based remotes

## License

License will be selected before the first stable release.
