# Multi-Remote Card

A modern, customizable **multi-remote card for Home Assistant**.

> **Entity-based by design:** every remote control can be connected to a Home Assistant entity or action. It is not limited to `fan.*` or `light.*`, making it suitable for ESPHome switches/buttons, scripts, helpers, and custom setups.

![Multi-Remote Card preview](https://github.com/scmsohel/multi-remote-card/blob/main/assets/multi-remote-card-preview.svg?raw=true)

## Current status

🚧 **Early development / prototype**

The project uses a **modular remote-design architecture**. Each physical remote has its own file, while the main card handles themes, entities, multiple remotes, and the Visual Editor.

## Remote designs

### Fan

The original **Basic Celling Fan** design remains the stable baseline.

- Speed 1–6
- Fan power
- Reverse
- ECO
- Light
- MAX
- 1H / 4H / 8H timers
- Press feedback / indicator blink

File: `remote-designs/fan.js`

### Walton Ceiling Fan

A separate design based on the Walton ceiling-fan remote.

- Power
- LED
- Speed 1–6
- 2H / 4H / 8H timers
- ECO
- Reverse

Default device name: **Walton Ceiling Fan**

File: `remote-designs/walton-ceiling-fan.js`

### Box

Reserved for the Fenda sound-box remote. It currently uses a placeholder layout.

Default device name: **Fenda Sound Box**

File: `remote-designs/box.js`

## Entity-based controls

Every remote control is configured through Home Assistant entities/actions. The Visual Editor intentionally uses broad **entity selectors**, so the card can work with native HA entities, ESPHome devices, switches, buttons, scripts, and other custom setups.

## Theme

The Visual Editor provides:

- **Auto** — follows Home Assistant's Light/Dark mode
- **Light** — force light theme
- **Dark** — force dark theme

Auto is the default.

## Single / Multiple Remote

With **Multiple Remote OFF**, only one remote is shown.

With **Multiple Remote ON**, Remote 1 and Remote 2 can each have their own:

- Remote name
- Remote design
- Device name
- Entity/action mappings

Example: **Remote 1 → Walton Ceiling Fan**, **Remote 2 → Fan**.

## Visual Editor

The editor uses clear labels such as:

- Remote 1 Design
- Remote 1 Device Name
- Remote 1 Power
- Remote 1 LED
- Remote 1 Speed 1
- Remote 2 Design
- Remote 2 Device Name
- Remote 2 Speed 1

The available controls are generated from the selected remote-design module.

## Installation

### HACS

1. Open HACS → **Custom repositories**.
2. Add `https://github.com/scmsohel/multi-remote-card`.
3. Select **Dashboard** (called **Lovelace/Plugin** in some HACS versions).
4. Add/download **Multi-Remote Card**.
5. Refresh the browser if necessary.

### Manual

Copy `multi-remote-card.js` **and the complete `remote-designs/` folder** to `/config/www/`, then add:

```yaml
url: /local/multi-remote-card.js
type: module
```

## Configuration

Example Walton remote:

```yaml
type: custom:multi-remote-card
multiple_remotes: false
theme: auto
rooms:
  remote1:
    design: walton-ceiling-fan
    device_name: Walton Ceiling Fan
    actions:
      power: switch.walton_fan_power
      led: switch.walton_fan_led
      speed_1: script.walton_speed_1
      speed_2: script.walton_speed_2
      speed_3: script.walton_speed_3
      speed_4: script.walton_speed_4
      speed_5: script.walton_speed_5
      speed_6: script.walton_speed_6
      timer_2h: script.walton_timer_2h
      timer_4h: script.walton_timer_4h
      timer_8h: script.walton_timer_8h
      eco: script.walton_eco
      reverse: script.walton_reverse
```

## Project structure

```text
multi-remote-card.js
remote-designs/
├── fan.js
├── walton-ceiling-fan.js
└── box.js
```

Adding another physical remote means adding another design file instead of rewriting the existing remote designs.

## Roadmap

- Complete the Fenda sound-box design
- Add more fan/AC/TV/light/curtain/media remotes
- Richer tap / double-tap / hold actions
- Better state-aware animations
- More configurable layouts and icons
- RF/IR/ESPHome remote integrations
- HACS releases and versioning

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.
