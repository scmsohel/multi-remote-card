import { fanRemote } from './remote-designs/fan.js';
import { boxRemote } from './remote-designs/box.js';
import { waltonCeilingFanRemote } from './remote-designs/walton-ceiling-fan.js';

const REMOTE_DESIGNS = [fanRemote, waltonCeilingFanRemote, boxRemote];
const THEME_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const designMap = Object.fromEntries(REMOTE_DESIGNS.map(d => [d.id, d]));

class UniversalRemoteCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._config = {};
    this._roomId = 'remote1';
  }

  setConfig(config) {
    this._config = config || {};
    this._roomId = 'remote1';
    this.render();
  }

  set hass(value) {
    this._hass = value;
    this.render();
  }

  getCardSize() { return 12; }
  _multiple() { return this._config.multiple_remotes === true; }

  _theme() {
    const mode = this._config.theme || 'auto';
    if (mode === 'dark') return 'dark';
    if (mode === 'light') return 'light';
    return this._hass?.themes?.darkMode ? 'dark' : 'light';
  }

  _rooms() {
    const rooms = this._config.rooms || {};
    const get = (n) => {
      const old = rooms[`remote${n}`] || rooms[n === 1 ? 'bedroom' : 'lounge'] || {};
      const design = old.design || (n === 2 ? 'box' : 'fan');
      const d = designMap[design] || fanRemote;
      const actions = { ...(old.actions || {}) };
      for (const c of d.controls) {
        if (old[c.key] && actions[c.key] == null) actions[c.key] = old[c.key];
      }
      return {
        name: old.name || (n === 1 ? 'BEDROOM' : 'LOUNGE'),
        design,
        device_name: old.device_name || old.fan_name || d.defaultName,
        fan: old.fan || '',
        light: old.light || '',
        actions,
      };
    };
    const result = { remote1: get(1) };
    if (this._multiple()) result.remote2 = get(2);
    return result;
  }

  _room() { return this._rooms()[this._roomId] || {}; }
  _state(entity) { return entity && this._hass ? this._hass.states[entity] : null; }
  _escape(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

  _action(key) {
    const room = this._room();
    if (key === 'fan') return room.fan;
    if (key === 'light') return room.light;
    return room.actions?.[key] || '';
  }

  _blink() {
    const dot = this.shadowRoot?.querySelector('.dot');
    if (!dot) return;
    dot.classList.remove('blink');
    void dot.offsetWidth;
    dot.classList.add('blink');
  }

  async _run(action) {
    this._blink();
    if (!action || !this._hass) return;
    if (typeof action === 'string') {
      const [domain] = action.split('.');
      if (domain === 'button') return this._hass.callService('button', 'press', { entity_id: action });
      if (domain === 'script' || domain === 'scene') return this._hass.callService(domain, 'turn_on', { entity_id: action });
      if (domain === 'fan' || domain === 'light' || domain === 'switch' || domain === 'input_boolean') return this._hass.callService(domain, 'toggle', { entity_id: action });
      return;
    }
    if (action.service) {
      const [domain, service] = action.service.split('.');
      if (domain && service) return this._hass.callService(domain, service, { ...(action.target || {}), ...(action.data || {}) });
    }
  }

  _style() {
    return `<style>
      :host{display:block}*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
      .card{--card-bg-1:#f5f3f0;--card-bg-2:#e5e1db;--text:#292929;--muted:#8f8d89;--button:#fbfaf8;--button-text:#292929;--circle-1:#ffffff99;--circle-2:#e0dcd675;--border:#ffffff;--shadow:#0002;--active:#292a2b;--active-text:#fff;--fan-icon:#111;--fan-center:#fff;--fan-on-icon:#fff;--fan-on-center:#292a2b;--dot:#cfcfcb;--accent:#4da3ff;width:100%;max-width:720px;margin:auto;padding:28px;border-radius:42px;background:linear-gradient(145deg,var(--card-bg-1),var(--card-bg-2));color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:inset 0 1px 0 var(--border),0 10px 35px var(--shadow);transition:.25s}
      .card.theme-dark{--card-bg-1:#20232a;--card-bg-2:#14161b;--text:#f2f2f2;--muted:#a9a9ad;--button:#252830;--button-text:#f2f2f2;--circle-1:#ffffff0d;--circle-2:#171a20;--border:#ffffff12;--shadow:#0007;--active:#f1f1f1;--active-text:#17181b;--fan-icon:#fff;--fan-center:#252830;--fan-on-icon:#111;--fan-on-center:#f1f1f1;--dot:#5d6068}
      .dot{width:15px;height:15px;margin:0 auto 22px;border-radius:50%;background:var(--dot)}.dot.blink{animation:b .45s ease-out}@keyframes b{0%{background:var(--dot);box-shadow:none}35%{background:var(--accent);box-shadow:0 0 0 7px #4da3ff29,0 0 18px #4da3fb}100%{background:var(--dot);box-shadow:none}}
      .rooms{display:grid;grid-template-columns:1fr 1fr;padding:6px;border-radius:50px;background:var(--circle-2);margin-bottom:8px}.rooms.hidden{display:none}.room{border:0;min-height:68px;border-radius:42px;background:transparent;color:var(--muted);font-size:20px;font-weight:700;cursor:pointer}.room.active{background:var(--active);color:var(--active-text);box-shadow:0 5px 12px var(--shadow)}
      .design-title,.section-title{margin:28px 0 18px;text-align:center;color:var(--muted);font-size:18px;font-weight:700;letter-spacing:3px}.section-title{letter-spacing:4px}
      .fan-area{position:relative;width:min(430px,100%);aspect-ratio:1;margin:auto;border-radius:50%;background:radial-gradient(circle,var(--circle-1),var(--circle-2));border:1px solid var(--border);box-shadow:inset 0 0 20px var(--border),0 15px 30px var(--shadow)}
      .speed{position:absolute;width:78px;height:78px;border:0;border-radius:50%;background:var(--button);color:var(--button-text);font-size:25px;font-weight:600;box-shadow:0 8px 18px var(--shadow),0 2px 5px var(--shadow);cursor:pointer;transform:translate(-50%,-50%);transition:.1s}.speed:active{transform:translate(-50%,-50%) scale(.97)}.speed.active{background:var(--active);color:var(--active-text)}
      .s1{left:20%;top:72%}.s2{left:20%;top:28%}.s3{left:50%;top:13%}.s4{left:80%;top:28%}.s5{left:80%;top:72%}.s6{left:50%;top:87%}
      .fan-button{position:absolute;left:50%;top:50%;width:112px;height:112px;transform:translate(-50%,-50%);border:0;border-radius:50%;background:var(--button);display:grid;place-items:center;cursor:pointer;box-shadow:inset 0 2px 7px var(--shadow),0 7px 16px var(--shadow)}.fan-button.on{background:var(--active)}.fan-icon{width:52px;height:52px}
      .wide-button{display:block;margin:22px auto 0;min-width:180px;height:58px;border:0;border-radius:40px;background:var(--button);color:var(--button-text);box-shadow:0 8px 18px var(--shadow),0 2px 5px var(--shadow);font-size:17px;font-weight:700;cursor:pointer}.three-buttons{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:38px}.mode-button,.timer button{min-height:65px;border:0;border-radius:35px;background:var(--button);color:var(--button-text);box-shadow:0 8px 18px var(--shadow),0 2px 5px var(--shadow);cursor:pointer;font-size:19px;font-weight:700}
      .coming{padding:100px 25px;text-align:center;color:var(--muted)}.coming-icon{font-size:55px}.coming-title{font-size:22px;font-weight:700;letter-spacing:2px;margin-top:15px}.coming-text{margin-top:10px;font-size:14px}
      .walton-body{max-width:420px;margin:auto;padding:20px;border-radius:42px;background:linear-gradient(145deg,var(--button),var(--circle-2));box-shadow:inset 0 1px 0 var(--border),0 14px 30px var(--shadow)}.walton-top{display:grid;grid-template-columns:1fr 1fr;gap:16px}.walton-pill,.walton-timers button,.walton-bottom button{border:0;border-radius:30px;background:var(--button);color:var(--button-text);min-height:58px;box-shadow:0 7px 16px var(--shadow);font-weight:700;cursor:pointer}.power-icon,.led-icon{font-size:20px;margin-right:7px}.walton-circle{position:relative;width:min(330px,100%);aspect-ratio:1;margin:24px auto;border-radius:50%;background:radial-gradient(circle,var(--circle-1),var(--circle-2));border:1px solid var(--border);box-shadow:inset 0 0 22px var(--border),0 12px 25px var(--shadow)}.walton-speed{position:absolute;width:62px;height:62px;border:0;border-radius:50%;background:var(--button);color:var(--button-text);font-size:21px;font-weight:700;box-shadow:0 7px 15px var(--shadow);cursor:pointer;transform:translate(-50%,-50%)}.w1{left:22%;top:70%}.w2{left:22%;top:30%}.w3{left:50%;top:14%}.w4{left:78%;top:30%}.w5{left:78%;top:70%}.w6{left:50%;top:86%}.walton-center{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:100px;height:100px;border-radius:50%;display:grid;place-items:center;background:var(--button);color:var(--button-text);box-shadow:inset 0 2px 7px var(--shadow),0 8px 18px var(--shadow)}.walton-circle.on .walton-center{background:var(--active);color:var(--active-text)}.walton-fan-icon{width:50px;height:50px}.walton-timers,.walton-bottom{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.walton-bottom{grid-template-columns:1fr 1fr;margin-top:14px}.walton-timers button,.walton-bottom button{min-height:58px;font-size:17px}
      @media(max-width:520px){.card{padding:22px 16px 24px;border-radius:30px}.room{min-height:56px;font-size:16px}.fan-area{width:min(360px,100%)}.speed{width:62px;height:62px;font-size:21px}.fan-button{width:92px;height:92px}.fan-icon{width:44px;height:44px}.three-buttons{gap:10px}.mode-button{min-height:58px;font-size:17px}.walton-body{padding:14px;border-radius:30px}.walton-speed{width:54px;height:54px}.walton-center{width:88px;height:88px}.walton-fan-icon{width:44px;height:44px}}
    </style>`;
  }

  render() {
    const rooms = this._rooms();
    const room = rooms[this._roomId] || rooms.remote1;
    const design = designMap[room.design] || fanRemote;
    const multiple = this._multiple();
    this.shadowRoot.innerHTML = this._style() + `<div class="card theme-${this._theme()}"><div class="dot"></div><div class="rooms ${multiple ? '' : 'hidden'}">${Object.entries(rooms).map(([id,r]) => `<button class="room ${id === this._roomId ? 'active' : ''}" data-room="${id}">${this._escape(r.name)}</button>`).join('')}</div>${design.render({room,state:id=>this._state(id),escape:v=>this._escape(v)})}</div>`;
    this.shadowRoot.querySelectorAll('.room').forEach(button => button.addEventListener('click', () => { this._roomId = button.dataset.room; this.render(); }));
    this.shadowRoot.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => this._run(this._action(button.dataset.action))));
  }
}

class UniversalRemoteCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._multiple = false;
    this._form = null;
    this._switch = null;
    this._built = false;
  }

  setConfig(config) {
    this._config = config || {};
    this._multiple = this._config.multiple_remotes === true;
    this._buildEditor();
  }

  set hass(value) {
    this._hass = value;
    if (this._form) this._form.hass = value;
    else this._buildEditor();
  }

  _old(n) {
    const rooms = this._config.rooms || {};
    return rooms[`remote${n}`] || rooms[n === 1 ? 'bedroom' : 'lounge'] || {};
  }

  _design(n) {
    return this._old(n).design || (n === 2 ? 'box' : 'fan');
  }

  _value(n, key) {
    const room = this._old(n);
    if (key === 'design') return this._design(n);
    if (key === 'name') return room.name || (n === 1 ? 'BEDROOM' : 'LOUNGE');
    if (key === 'device_name') return room.device_name || room.fan_name || (this._design(n) === 'box' ? 'Fenda Sound Box' : this._design(n) === 'walton-ceiling-fan' ? 'Walton Ceiling Fan' : 'Basic Celling Fan');
    if (key === 'fan' || key === 'light') return room[key] || '';
    return room.actions?.[key] || room[key] || '';
  }

  _schema(n) {
    const prefix = `remote${n}_`;
    const design = designMap[this._design(n)] || fanRemote;
    const fields = [
      { name: prefix + 'design', label: `Remote ${n} Design`, selector: { select: { options: REMOTE_DESIGNS.map(d => ({ value: d.id, label: d.label })), mode: 'dropdown' } } },
    ];
    if (this._multiple) fields.push({ name: prefix + 'name', label: `Remote ${n} Name`, selector: { text: {} } });
    fields.push({ name: prefix + 'device_name', label: `Remote ${n} Device Name`, selector: { text: {} } });
    for (const control of design.controls) {
      if (control.key === 'fan' || control.key === 'light') {
        fields.push({ name: prefix + control.key, label: `Remote ${n} ${control.label}`, selector: { entity: {} } });
      } else {
        fields.push({ name: prefix + control.key, label: `Remote ${n} ${control.label}`, selector: { entity: {} } });
      }
    }
    return fields;
  }

  _data(n) {
    const design = designMap[this._design(n)] || fanRemote;
    const data = { [`remote${n}_design`]: this._value(n, 'design'), [`remote${n}_name`]: this._value(n, 'name'), [`remote${n}_device_name`]: this._value(n, 'device_name') };
    for (const c of design.controls) data[`remote${n}_${c.key}`] = this._value(n, c.key);
    return data;
  }

  _collect(values) {
    const makeRoom = n => {
      const designId = values[`remote${n}_design`] || this._design(n);
      const design = designMap[designId] || fanRemote;
      const actions = {};
      for (const c of design.controls) {
        const value = values[`remote${n}_${c.key}`];
        if (value) actions[c.key] = value;
      }
      const defaultName = design.defaultName;
      return {
        name: this._multiple ? (values[`remote${n}_name`] || `REMOTE ${n}`) : undefined,
        design: designId,
        device_name: values[`remote${n}_device_name`] || defaultName,
        fan: values[`remote${n}_fan`] || '',
        light: values[`remote${n}_light`] || '',
        actions,
      };
    };
    return { ...this._config, multiple_remotes: this._multiple, theme: values.theme || this._config.theme || 'auto', rooms: { remote1: makeRoom(1), ...(this._multiple ? { remote2: makeRoom(2) } : {}) } };
  }

  _buildEditor() {
    if (!this._hass) return;
    this._built = false;
    this.shadowRoot.innerHTML = `<div class="box"><div class="row"><span>Multiple Remote</span><ha-switch id="multi"></ha-switch></div><div class="hint">Enable to show Remote 2 and its own remote design.</div><ha-form id="form"></ha-form></div><style>.box{padding:8px 0}.row{display:flex;align-items:center;justify-content:space-between;font-size:16px;font-weight:500;margin-bottom:4px}.hint{font-size:12px;opacity:.65;margin:0 0 16px}</style>`;
    this._switch = this.shadowRoot.querySelector('#multi');
    this._form = this.shadowRoot.querySelector('#form');
    this._switch.checked = this._multiple;
    this._form.hass = this._hass;
    const schema = [{ name: 'theme', label: 'Theme', selector: { select: { options: THEME_OPTIONS, mode: 'dropdown' } } }, ...this._schema(1), ...(this._multiple ? this._schema(2) : [])];
    this._form.schema = schema;
    this._form.data = { theme: this._config.theme || 'auto', ...this._data(1), ...(this._multiple ? this._data(2) : {}) };
    this._switch.addEventListener('change', () => { this._multiple = this._switch.checked; this._buildEditor(); this._emit(this._form.data || {}); });
    this._form.addEventListener('value-changed', event => { event.stopPropagation(); this._emit(event.detail.value || {}); });
    this._built = true;
  }

  _emit(values) {
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._collect(values) }, bubbles: true, composed: true }));
  }
}

customElements.define('universal-remote-card', UniversalRemoteCard);
customElements.define('universal-remote-card-editor', UniversalRemoteCardEditor);
UniversalRemoteCard.getConfigElement = () => document.createElement('universal-remote-card-editor');
UniversalRemoteCard.getStubConfig = () => ({ multiple_remotes: false, theme: 'auto', rooms: { remote1: { design: 'fan', device_name: 'Basic Celling Fan' } } });
window.customCards = window.customCards || [];
if (!window.customCards.some(c => c.type === 'universal-remote-card')) window.customCards.push({ type: 'universal-remote-card', name: 'Universal Remote Card', description: 'Modern universal remote card', preview: true });