class UniversalRemoteCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._config = {};
    this._room = "bedroom";
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  get hass() {
    return this._hass;
  }

  getCardSize() {
    return 12;
  }

  _rooms() {
    return this._config.rooms || {};
  }

  _roomConfig() {
    return this._rooms()[this._room] || {};
  }

  _state(entityId) {
    return entityId && this._hass ? this._hass.states[entityId] : undefined;
  }

  async _call(action) {
    if (!action || !this._hass) return;

    if (typeof action === "string") {
      const [domain, service] = action.split(".");
      if (!domain || !service) return;

      if (domain === "script" || domain === "scene") {
        await this._hass.callService(domain, "turn_on", { entity_id: action });
      } else if (domain === "button") {
        await this._hass.callService(domain, "press", { entity_id: action });
      } else if (domain === "fan" || domain === "light") {
        await this._hass.callService(domain, "toggle", { entity_id: action });
      }
      return;
    }

    if (typeof action === "object" && action.service) {
      const [domain, service] = action.service.split(".");
      if (!domain || !service) return;
      await this._hass.callService(domain, service, {
        ...(action.target || {}),
        ...(action.data || {})
      });
    }
  }

  async _toggle(domain, entityId) {
    if (!entityId || !this._hass) return;
    await this._hass.callService(domain, "toggle", { entity_id: entityId });
  }

  render() {
    if (!this.shadowRoot) return;

    const room = this._roomConfig();
    const fan = this._state(room.fan);
    const light = this._state(room.light);
    const fanOn = fan?.state === "on";
    const lightOn = light?.state === "on";
    const percentage = Number(fan?.attributes?.percentage || 0);
    const currentSpeed = percentage ? Math.max(1, Math.min(6, Math.round(percentage / 100 * 6))) : 0;
    const actions = this._config.actions || {};

    this.shadowRoot.innerHTML = `
      <style>
        :host { display:block; --ur-bg:#ece9e4; --ur-white:#fbfaf8; --ur-dark:#292a2b; --ur-muted:#92908d; --ur-shadow:0 8px 18px rgba(0,0,0,.10),0 2px 5px rgba(0,0,0,.06); }
        * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
        .card { width:100%; max-width:720px; margin:auto; padding:28px 28px 30px; border-radius:42px; background:linear-gradient(145deg,#f5f3f0,#e5e1db); color:#292929; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; box-shadow:inset 0 1px 0 rgba(255,255,255,.85),0 10px 35px rgba(0,0,0,.15); }
        .dot { width:15px;height:15px;margin:0 auto 22px;border-radius:50%;background:#d0ceca; }
        .rooms { display:grid;grid-template-columns:1fr 1fr;padding:6px;border-radius:50px;background:#d8d6d2;box-shadow:inset 0 2px 6px rgba(0,0,0,.10),0 2px 4px rgba(255,255,255,.7); }
        .room { border:0;min-height:68px;border-radius:42px;background:transparent;color:#8d8a86;font-size:20px;font-weight:700;letter-spacing:.8px;cursor:pointer; }
        .room.active { background:var(--ur-dark);color:#fff;box-shadow:0 5px 12px rgba(0,0,0,.18); }
        .title { margin:38px 0 18px;text-align:center;color:var(--ur-muted);font-size:18px;font-weight:700;letter-spacing:4px; }
        .fan-area { position:relative;width:min(430px,82vw);aspect-ratio:1;margin:auto;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.72),rgba(224,220,214,.45));border:1px solid rgba(255,255,255,.9);box-shadow:inset 0 0 20px rgba(255,255,255,.55),0 15px 30px rgba(0,0,0,.06); }
        .speed { position:absolute;width:78px;height:78px;border:0;border-radius:50%;background:var(--ur-white);color:#272727;font-size:25px;font-weight:600;box-shadow:var(--ur-shadow);cursor:pointer;transform:translate(-50%,-50%); }
        .speed.active { background:var(--ur-dark);color:#fff; }
        .s1{left:20%;top:28%}.s2{left:50%;top:13%}.s3{left:80%;top:28%}.s4{left:80%;top:72%}.s5{left:50%;top:87%}.s6{left:20%;top:72%}
        .power { position:absolute;left:50%;top:50%;width:130px;height:130px;transform:translate(-50%,-50%);border:0;border-radius:50%;background:#dedbd6;color:#252525;font-size:54px;cursor:pointer;box-shadow:inset 0 2px 7px rgba(0,0,0,.08),0 7px 16px rgba(0,0,0,.08); }
        .power.on { background:var(--ur-dark);color:#fff; }
        .reverse { display:block;margin:22px auto 0;min-width:180px;height:58px;border:0;border-radius:40px;background:var(--ur-white);box-shadow:var(--ur-shadow);font-size:17px;font-weight:700;letter-spacing:1px;cursor:pointer; }
        .three,.timer { display:grid;grid-template-columns:repeat(3,1fr);gap:16px; }
        .control,.timer button { min-height:65px;border:0;border-radius:35px;background:var(--ur-white);color:#292929;box-shadow:var(--ur-shadow);font-size:25px;cursor:pointer; }
        .brightness { display:grid;grid-template-columns:repeat(3,1fr);min-height:68px;overflow:hidden;border-radius:36px;background:var(--ur-white);box-shadow:var(--ur-shadow); }
        .brightness button { border:0;border-right:1px solid #d3d0cc;background:transparent;font-size:28px;cursor:pointer; }
        .brightness button:last-child { border-right:0; }
        .timer button { font-size:19px;font-weight:700; }
        button:active { transform:scale(.95); }
        @media(max-width:520px){ .card{padding:22px 16px 24px;border-radius:30px}.room{min-height:56px;font-size:16px}.fan-area{width:min(350px,88vw)}.speed{width:62px;height:62px;font-size:21px}.power{width:105px;height:105px;font-size:44px}.three,.timer{gap:10px}.control,.timer button{min-height:58px} }
      </style>

      <div class="card">
        <div class="dot"></div>
        <div class="rooms">
          ${Object.entries(this._rooms()).map(([id, cfg]) => `
            <button class="room ${id === this._room ? "active" : ""}" data-room="${id}">${cfg.name || id.toUpperCase()}</button>
          `).join("")}
        </div>

        <div class="title">FAN</div>
        <div class="fan-area">
          ${[1,2,3,4,5,6].map(n => `<button class="speed s${n} ${currentSpeed === n ? "active" : ""}" data-speed="${n}">${n}</button>`).join("")}
          <button class="power ${fanOn ? "on" : ""}" id="power">⏻</button>
        </div>

        <button class="reverse" id="reverse">⇄ &nbsp; REVERSE</button>

        <div class="title">LIGHT — COLOR TEMP</div>
        <div class="three">
          <button class="control" id="temp-minus">⊖</button>
          <button class="control" id="light">${lightOn ? "💡" : "♧"}</button>
          <button class="control" id="temp-plus">⊕</button>
        </div>

        <div class="title">LIGHT — BRIGHTNESS</div>
        <div class="brightness">
          <button id="brightness-minus">☼</button>
          <button id="brightness-center">♧</button>
          <button id="brightness-plus">☀</button>
        </div>

        <div class="title">TIMER</div>
        <div class="timer">
          <button id="timer-1">1H</button>
          <button id="timer-4">4H</button>
          <button id="timer-8">8H</button>
        </div>
      </div>
    `;

    this.shadowRoot.querySelectorAll(".room").forEach(btn => btn.addEventListener("click", () => { this._room = btn.dataset.room; this.render(); }));
    this.shadowRoot.querySelector("#power")?.addEventListener("click", () => this._toggle("fan", room.fan));
    this.shadowRoot.querySelector("#light")?.addEventListener("click", () => this._toggle("light", room.light));
    this.shadowRoot.querySelector("#reverse")?.addEventListener("click", () => this._call(actions.reverse));
    this.shadowRoot.querySelector("#temp-minus")?.addEventListener("click", () => this._call(actions.color_temp_minus));
    this.shadowRoot.querySelector("#temp-plus")?.addEventListener("click", () => this._call(actions.color_temp_plus));
    this.shadowRoot.querySelector("#brightness-minus")?.addEventListener("click", () => this._call(actions.brightness_minus));
    this.shadowRoot.querySelector("#brightness-center")?.addEventListener("click", () => this._toggle("light", room.light));
    this.shadowRoot.querySelector("#brightness-plus")?.addEventListener("click", () => this._call(actions.brightness_plus));
    this.shadowRoot.querySelector("#timer-1")?.addEventListener("click", () => this._call(actions.timer_1h));
    this.shadowRoot.querySelector("#timer-4")?.addEventListener("click", () => this._call(actions.timer_4h));
    this.shadowRoot.querySelector("#timer-8")?.addEventListener("click", () => this._call(actions.timer_8h));
    this.shadowRoot.querySelectorAll(".speed").forEach(btn => btn.addEventListener("click", () => this._call(actions[`speed_${btn.dataset.speed}`])));
  }
}

customElements.define("universal-remote-card", UniversalRemoteCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "universal-remote-card",
  name: "Universal Remote Card",
  description: "A modern universal remote card for Home Assistant",
  preview: true
});
