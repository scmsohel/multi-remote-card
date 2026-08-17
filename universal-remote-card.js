class UniversalRemoteCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hass = null;
    this._config = {};
    this._room = "remote1";
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = config;
    this._room = "remote1";
    this.render();
  }

  set hass(value) {
    this._hass = value;
    this.render();
  }

  getCardSize() { return 12; }

  _multiple() {
    return this._config.multiple_remotes === true;
  }

  _rooms() {
    const rooms = this._config.rooms || {};
    const first = rooms.remote1 || rooms.bedroom || {};
    const result = {
      remote1: { name: first.name || "BEDROOM", ...first }
    };
    if (this._multiple()) {
      const second = rooms.remote2 || rooms.lounge || {};
      result.remote2 = { name: second.name || "LOUNGE", ...second };
    }
    return result;
  }

  _room() {
    return this._rooms()[this._room] || {};
  }

  _state(entity) {
    return entity && this._hass ? this._hass.states[entity] : undefined;
  }

  _action(name) {
    const room = this._room();
    return (room.actions && room.actions[name]) ||
      (this._config.actions && this._config.actions[name]);
  }

  _blink() {
    const dot = this.shadowRoot && this.shadowRoot.querySelector(".dot");
    if (!dot) return;
    dot.classList.remove("blink");
    void dot.offsetWidth;
    dot.classList.add("blink");
  }

  async _run(action) {
    this._blink();
    if (!action || !this._hass) return;

    if (typeof action === "string") {
      const parts = action.split(".");
      const domain = parts[0];
      if (domain === "script" || domain === "scene") {
        return this._hass.callService(domain, "turn_on", { entity_id: action });
      }
      if (domain === "button") {
        return this._hass.callService(domain, "press", { entity_id: action });
      }
      if (domain === "fan" || domain === "light") {
        return this._hass.callService(domain, "toggle", { entity_id: action });
      }
      return;
    }

    if (action.service) {
      const parts = action.service.split(".");
      if (parts.length !== 2) return;
      return this._hass.callService(parts[0], parts[1], {
        ...(action.target || {}),
        ...(action.data || {})
      });
    }
  }

  render() {
    if (!this.shadowRoot) return;

    const room = this._room();
    const fan = this._state(room.fan);
    const isOn = fan && fan.state === "on";
    const percentage = Number((fan && fan.attributes && fan.attributes.percentage) || 0);
    const speed = percentage ? Math.max(1, Math.min(6, Math.round(percentage / 100 * 6))) : 0;
    const rooms = this._rooms();

    this.shadowRoot.innerHTML = `
      <style>
        :host { display:block; }
        * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
        .card { width:100%; max-width:720px; margin:auto; padding:28px; border-radius:42px; background:linear-gradient(145deg,#f5f3f0,#e5e1db); color:#292929; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; box-shadow:inset 0 1px 0 #fff,0 10px 35px rgba(0,0,0,.15); }
        .dot { width:15px; height:15px; margin:0 auto 22px; border-radius:50%; background:#cfcfcb; }
        .dot.blink { animation:blink .45s ease-out; }
        @keyframes blink { 0%{background:#cfcfcb;box-shadow:none} 35%{background:#4da3ff;box-shadow:0 0 0 7px rgba(77,163,255,.16),0 0 18px rgba(77,163,255,.75)} 100%{background:#cfcfcb;box-shadow:none} }
        .rooms { display:grid; grid-template-columns:${this._multiple() ? "1fr 1fr" : "1fr"}; gap:0; padding:6px; border-radius:50px; background:#d8d6d2; box-shadow:inset 0 2px 6px rgba(0,0,0,.1); }
        .room { border:0; min-height:68px; border-radius:42px; background:transparent; color:#8d8a86; font-size:20px; font-weight:700; letter-spacing:.8px; cursor:pointer; }
        .room.active { background:#292a2b; color:#fff; box-shadow:0 5px 12px rgba(0,0,0,.18); }
        .title { margin:38px 0 18px; text-align:center; color:#8f8d89; font-size:18px; font-weight:700; letter-spacing:4px; }
        .fan-area { position:relative; width:min(430px,100%); aspect-ratio:1; margin:auto; border-radius:50%; background:radial-gradient(circle,rgba(255,255,255,.6),rgba(224,220,214,.45)); border:1px solid rgba(255,255,255,.9); box-shadow:inset 0 0 20px rgba(255,255,255,.55),0 15px 30px rgba(0,0,0,.06); }
        .speed { position:absolute; width:78px; height:78px; border:0; border-radius:50%; background:#fbfaf8; color:#272727; font-size:25px; font-weight:600; box-shadow:0 8px 18px rgba(0,0,0,.1),0 2px 5px rgba(0,0,0,.06); cursor:pointer; transform:translate(-50%,-50%); transition:filter .15s; }
        .speed.active { background:#292a2b; color:#fff; }
        .s1{left:20%;top:72%}.s2{left:20%;top:28%}.s3{left:50%;top:13%}.s4{left:80%;top:28%}.s5{left:80%;top:72%}.s6{left:50%;top:87%}
        .fan-button { position:absolute; left:50%; top:50%; width:112px; height:112px; transform:translate(-50%,-50%); border:0; border-radius:50%; background:#faf9f7; display:grid; place-items:center; cursor:pointer; box-shadow:inset 0 2px 7px rgba(0,0,0,.06),0 7px 16px rgba(0,0,0,.08); }
        .fan-button.on { background:#292a2b; }
        .fan-icon { width:52px; height:52px; }
        .reverse { display:block; margin:22px auto 0; min-width:180px; height:58px; border:0; border-radius:40px; background:#fbfaf8; color:#292929; box-shadow:0 8px 18px rgba(0,0,0,.1),0 2px 5px rgba(0,0,0,.06); font-size:17px; font-weight:700; letter-spacing:1px; cursor:pointer; }
        .modes,.timer { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .modes { margin-top:38px; }
        .mode,.timer button { min-height:65px; border:0; border-radius:35px; background:#fbfaf8; color:#292929; box-shadow:0 8px 18px rgba(0,0,0,.1),0 2px 5px rgba(0,0,0,.06); cursor:pointer; }
        .mode { font-size:20px; font-weight:600; }
        .timer-title { margin-top:38px; }
        .timer button { font-size:19px; font-weight:700; }
        .mode:active,.timer button:active,.reverse:active { filter:brightness(.97); }
        @media(max-width:520px){ .card{padding:22px 16px 24px;border-radius:30px}.room{min-height:56px;font-size:16px}.fan-area{width:min(360px,100%)}.speed{width:62px;height:62px;font-size:21px}.fan-button{width:92px;height:92px}.fan-icon{width:44px;height:44px}.modes,.timer{gap:10px}.mode,.timer button{min-height:58px;font-size:17px} }
      </style>
      <div class="card">
        <div class="dot"></div>
        <div class="rooms">
          ${Object.entries(rooms).map(([id, value]) => `<button class="room ${id === this._room ? "active" : ""}" data-room="${id}">${value.name || id.toUpperCase()}</button>`).join("")}
        </div>
        <div class="title">FAN</div>
        <div class="fan-area">
          ${[1,2,3,4,5,6].map(n => `<button class="speed s${n} ${speed === n ? "active" : ""}" data-speed="${n}">${n}</button>`).join("")}
          <button class="fan-button ${isOn ? "on" : ""}" id="power" aria-label="Power">
            <svg class="fan-icon" viewBox="0 0 64 64">
              <g fill="${isOn ? "#fff" : "#111"}">
                <path d="M32 30C27 27 27 18 30 11c2-5 7-8 10-5 5 4 2 14-2 21-1 2-3 3-6 3z"/>
                <path d="M35 32c2-5 11-7 18-4 5 2 8 7 5 10-4 5-14 2-21-2-2-1-3-3-2-4z"/>
                <path d="M32 35c5 1 7 10 4 17-2 5-7 8-10 5-5-4-2-14 2-21-1-2 3-3 4-1z"/>
                <path d="M29 33c-1 5-10 7-17 4-5-2-8-7-5-10 4-5 14-2 21 2 2 1 3 3 1 4z"/>
                <circle cx="32" cy="32" r="6" fill="${isOn ? "#292a2b" : "#fff"}"/>
              </g>
            </svg>
          </button>
        </div>
        <button class="reverse" id="reverse">⇄ &nbsp; REVERSE</button>
        <div class="modes"><button class="mode" id="eco">ECO</button><button class="mode" id="light">💡</button><button class="mode" id="max">MAX</button></div>
        <div class="title timer-title">TIMER</div>
        <div class="timer"><button id="timer-1">◷ &nbsp; 1H</button><button id="timer-4">◷ &nbsp; 4H</button><button id="timer-8">◷ &nbsp; 8H</button></div>
      </div>`;

    this.shadowRoot.querySelectorAll(".room").forEach(button => button.addEventListener("click", () => { this._room = button.dataset.room; this.render(); }));
    this.shadowRoot.querySelector("#power")?.addEventListener("click", () => this._run(room.fan ? {service:"fan.toggle",target:{entity_id:room.fan}} : null));
    this.shadowRoot.querySelector("#light")?.addEventListener("click", () => this._run(room.light ? {service:"light.toggle",target:{entity_id:room.light}} : null));
    [["reverse","reverse"],["eco","eco"],["max","max"],["timer-1","timer_1h"],["timer-4","timer_4h"],["timer-8","timer_8h"]].forEach(([id,key]) => this.shadowRoot.querySelector("#"+id)?.addEventListener("click", () => this._run(this._action(key))));
    this.shadowRoot.querySelectorAll(".speed").forEach(button => button.addEventListener("click", () => this._run(this._action("speed_" + button.dataset.speed))));
  }
}

class UniversalRemoteCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode:"open" });
    this._config = {};
    this._hass = null;
    this._multiple = false;
    this._form = null;
  }

  setConfig(config) {
    this._config = config || {};
    this._multiple = this._config.multiple_remotes === true;
    this.render();
  }

  set hass(value) {
    this._hass = value;
    this.render();
  }

  _oldRemote(number) {
    const rooms = this._config.rooms || {};
    const key = number === 1 ? "remote1" : "remote2";
    const legacy = number === 1 ? "bedroom" : "lounge";
    return rooms[key] || rooms[legacy] || {};
  }

  _value(number, key) {
    const remote = this._oldRemote(number);
    if (key === "name") return remote.name || (number === 1 ? "BEDROOM" : "LOUNGE");
    if (key === "fan" || key === "light") return remote[key] || "";
    const actions = remote.actions || {};
    if (actions[key]) return actions[key];
    const global = this._config.actions || {};
    return global[key] || "";
  }

  _schema(number) {
    const p = `r${number}_`;
    const label = `Remote ${number}`;
    const fields = [
      {name:p+"name",label:`${label} Name`,selector:{text:{}}},
      {name:p+"fan",label:`${label} Fan`,selector:{entity:{domain:"fan"}}},
      {name:p+"light",label:`${label} Light`,selector:{entity:{domain:"light"}}}
    ];
    for (let i=1;i<=6;i++) fields.push({name:p+`speed_${i}`,label:`${label} Speed ${i}`,selector:{entity:{}}});
    fields.push(
      {name:p+"reverse",label:`${label} Reverse`,selector:{entity:{}}},
      {name:p+"eco",label:`${label} ECO`,selector:{entity:{}}},
      {name:p+"max",label:`${label} MAX`,selector:{entity:{}}},
      {name:p+"timer_1h",label:`${label} Timer 1H`,selector:{entity:{}}},
      {name:p+"timer_4h",label:`${label} Timer 4H`,selector:{entity:{}}},
      {name:p+"timer_8h",label:`${label} Timer 8H`,selector:{entity:{}}}
    );
    return fields;
  }

  _data(number) {
    const data = {};
    const p = `r${number}_`;
    const keys = ["name","fan","light","reverse","eco","max","timer_1h","timer_4h","timer_8h"];
    keys.forEach(key => data[p+key] = this._value(number,key));
    for (let i=1;i<=6;i++) data[p+`speed_${i}`] = this._value(number,`speed_${i}`);
    return data;
  }

  _buildConfig(values) {
    const makeRoom = number => {
      const p = `r${number}_`;
      const actions = {};
      for (let i=1;i<=6;i++) actions[`speed_${i}`] = values[p+`speed_${i}`] || "";
      actions.reverse = values[p+"reverse"] || "";
      actions.eco = values[p+"eco"] || "";
      actions.max = values[p+"max"] || "";
      actions.timer_1h = values[p+"timer_1h"] || "";
      actions.timer_4h = values[p+"timer_4h"] || "";
      actions.timer_8h = values[p+"timer_8h"] || "";
      return {name:values[p+"name"] || (number === 1 ? "BEDROOM" : "LOUNGE"),fan:values[p+"fan"] || "",light:values[p+"light"] || "",actions};
    };
    const config = {...this._config,multiple_remotes:this._multiple,rooms:{remote1:makeRoom(1)}};
    if (this._multiple) config.rooms.remote2 = makeRoom(2);
    delete config.actions;
    return config;
  }

  render() {
    if (!this.shadowRoot || !this._hass) return;
    if (!this._form) {
      this.shadowRoot.innerHTML = `<div class="editor"><div class="toggle"><span>Multiple Remote</span><ha-switch id="multiple"></ha-switch></div><ha-form id="form"></ha-form></div><style>.editor{display:block;padding:8px 0}.toggle{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;font-size:16px}</style>`;
      this._form = this.shadowRoot.querySelector("#form");
      this._form.addEventListener("value-changed", event => {
        event.stopPropagation();
        this.dispatchEvent(new CustomEvent("config-changed", {detail:{config:this._buildConfig(event.detail.value || {})},bubbles:true,composed:true}));
      });
      this.shadowRoot.querySelector("#multiple").addEventListener("change", event => {
        this._multiple = event.target.checked;
        this.render();
        const values = {...this._data(1), ...(this._multiple ? this._data(2) : {})};
        this.dispatchEvent(new CustomEvent("config-changed", {detail:{config:this._buildConfig(values)},bubbles:true,composed:true}));
      });
    }

    const toggle = this.shadowRoot.querySelector("#multiple");
    toggle.checked = this._multiple;
    this._form.schema = this._schema(1).concat(this._multiple ? this._schema(2) : []);
    this._form.data = {...this._data(1), ...(this._multiple ? this._data(2) : {})};
  }
}

if (!customElements.get("universal-remote-card")) {
  customElements.define("universal-remote-card", UniversalRemoteCard);
}
if (!customElements.get("universal-remote-card-editor")) {
  customElements.define("universal-remote-card-editor", UniversalRemoteCardEditor);
}

UniversalRemoteCard.getConfigElement = () => document.createElement("universal-remote-card-editor");
UniversalRemoteCard.getStubConfig = () => ({
  multiple_remotes:false,
  rooms:{remote1:{name:"BEDROOM",fan:"",light:"",actions:{}}}
});

window.customCards = window.customCards || [];
if (!window.customCards.some(card => card.type === "universal-remote-card")) {
  window.customCards.push({
    type:"universal-remote-card",
    name:"Universal Remote Card",
    description:"A modern universal remote card for Home Assistant",
    preview:true
  });
}
