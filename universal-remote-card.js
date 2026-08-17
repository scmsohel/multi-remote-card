import { fanRemote } from './remote-designs/fan.js';
import { boxRemote } from './remote-designs/box.js';
import { waltonCeilingFanRemote } from './remote-designs/walton-ceiling-fan.js';

const REMOTE_DESIGNS = [fanRemote, waltonCeilingFanRemote, boxRemote];
const DESIGN_MAP = Object.fromEntries(REMOTE_DESIGNS.map(d => [d.id, d]));
const THEME_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

class UniversalRemoteCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._config = {};
    this._roomId = 'remote1';
  }

  setConfig(config) { this._config = config || {}; this._roomId = 'remote1'; this.render(); }
  set hass(value) { this._hass = value; this.render(); }
  getCardSize() { return 12; }
  _multiple() { return this._config.multiple_remotes === true; }
  _theme() {
    const mode = this._config.theme || 'auto';
    if (mode === 'dark') return 'dark';
    if (mode === 'light') return 'light';
    return this._hass?.themes?.darkMode ? 'dark' : 'light';
  }
  _escape(v) { return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  _state(id) { return id && this._hass ? this._hass.states[id] : null; }
  _rooms() {
    const rooms = this._config.rooms || {};
    const get = n => {
      const old = rooms[`remote${n}`] || rooms[n === 1 ? 'bedroom' : 'lounge'] || {};
      const design = old.design || (n === 2 ? 'box' : 'fan');
      const d = DESIGN_MAP[design] || fanRemote;
      const actions = { ...(old.actions || {}) };
      for (const c of d.controls) if (old[c.key] && actions[c.key] == null) actions[c.key] = old[c.key];
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
  _action(key) {
    const r = this._room();
    if (key === 'fan') return r.fan;
    if (key === 'light') return r.light;
    return r.actions?.[key] || '';
  }
  _blink() {
    const dot = this.shadowRoot?.querySelector('.dot');
    if (!dot) return;
    dot.classList.remove('blink'); void dot.offsetWidth; dot.classList.add('blink');
  }
  async _run(action) {
    this._blink();
    if (!action || !this._hass) return;
    if (typeof action === 'string') {
      const [domain] = action.split('.');
      if (domain === 'button') return this._hass.callService('button', 'press', { entity_id: action });
      if (domain === 'script' || domain === 'scene') return this._hass.callService(domain, 'turn_on', { entity_id: action });
      if (['fan','light','switch','input_boolean'].includes(domain)) return this._hass.callService(domain, 'toggle', { entity_id: action });
      return;
    }
    if (action.service) {
      const [domain, service] = action.service.split('.');
      if (domain && service) return this._hass.callService(domain, service, { ...(action.target || {}), ...(action.data || {}) });
    }
  }
  _style() { return `<style>
:host{display:block}*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}.card{--bg1:#f5f3f0;--bg2:#e5e1db;--text:#292929;--muted:#8f8d89;--button:#fbfaf8;--button-text:#292929;--c1:#ffffff99;--c2:#e0dcd675;--border:#fff;--shadow:#0002;--active:#292a2b;--active-text:#fff;--fan:#111;--fan-center:#fff;--dot:#cfcfcb;--accent:#4da3ff;width:100%;max-width:720px;margin:auto;padding:28px;border-radius:42px;background:linear-gradient(145deg,var(--bg1),var(--bg2));color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:inset 0 1px 0 var(--border),0 10px 35px var(--shadow)}.card.theme-dark{--bg1:#20232a;--bg2:#14161b;--text:#f2f2f2;--muted:#a9a9ad;--button:#252830;--button-text:#f2f2f2;--c1:#ffffff0d;--c2:#171a20;--border:#ffffff12;--shadow:#0007;--active:#f1f1f1;--active-text:#17181b;--fan:#fff;--fan-center:#252830;--dot:#5d6068}.dot{width:15px;height:15px;margin:0 auto 22px;border-radius:50%;background:var(--dot)}.dot.blink{animation:b .45s ease-out}@keyframes b{35%{background:var(--accent);box-shadow:0 0 0 7px #4da3ff29,0 0 18px #4da3fb}}.rooms{display:grid;grid-template-columns:1fr 1fr;padding:6px;border-radius:50px;background:var(--c2);margin-bottom:8px}.rooms.hidden{display:none}.room{border:0;min-height:68px;border-radius:42px;background:transparent;color:var(--muted);font-size:20px;font-weight:700}.room.active{background:var(--active);color:var(--active-text)}.design-title,.section-title{margin:28px 0 18px;text-align:center;color:var(--muted);font-size:18px;font-weight:700;letter-spacing:3px}.fan-area{position:relative;width:min(430px,100%);aspect-ratio:1;margin:auto;border-radius:50%;background:radial-gradient(circle,var(--c1),var(--c2));border:1px solid var(--border);box-shadow:inset 0 0 20px var(--border),0 15px 30px var(--shadow)}.speed{position:absolute;width:78px;height:78px;border:0;border-radius:50%;background:var(--button);color:var(--button-text);font-size:25px;font-weight:600;box-shadow:0 8px 18px var(--shadow);cursor:pointer;transform:translate(-50%,-50%)}.speed.active{background:var(--active);color:var(--active-text)}.s1{left:20%;top:72%}.s2{left:20%;top:28%}.s3{left:50%;top:13%}.s4{left:80%;top:28%}.s5{left:80%;top:72%}.s6{left:50%;top:87%}.fan-button{position:absolute;left:50%;top:50%;width:112px;height:112px;transform:translate(-50%,-50%);border:0;border-radius:50%;background:var(--button);display:grid;place-items:center;box-shadow:0 7px 16px var(--shadow)}.fan-button.on{background:var(--active)}.fan-icon{width:52px;height:52px}.wide-button{display:block;margin:22px auto 0;min-width:180px;height:58px;border:0;border-radius:40px;background:var(--button);color:var(--button-text);box-shadow:0 8px 18px var(--shadow);font-size:17px;font-weight:700}.three-buttons{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:38px}.mode-button{min-height:65px;border:0;border-radius:35px;background:var(--button);color:var(--button-text);box-shadow:0 8px 18px var(--shadow);font-size:19px;font-weight:700}.walton-body{max-width:420px;margin:auto;padding:20px;border-radius:42px;background:linear-gradient(145deg,var(--button),var(--c2));box-shadow:inset 0 1px 0 var(--border),0 14px 30px var(--shadow)}.walton-top{display:grid;grid-template-columns:1fr 1fr;gap:16px}.walton-pill,.walton-timers button,.walton-bottom button{border:0;border-radius:30px;background:var(--button);color:var(--button-text);min-height:58px;box-shadow:0 7px 16px var(--shadow);font-weight:700}.walton-circle{position:relative;width:min(330px,100%);aspect-ratio:1;margin:24px auto;border-radius:50%;background:radial-gradient(circle,var(--c1),var(--c2));border:1px solid var(--border);box-shadow:inset 0 0 22px var(--border),0 12px 25px var(--shadow)}.walton-speed{position:absolute;width:62px;height:62px;border:0;border-radius:50%;background:var(--button);color:var(--button-text);font-size:21px;font-weight:700;box-shadow:0 7px 15px var(--shadow);transform:translate(-50%,-50%)}.w1{left:22%;top:70%}.w2{left:22%;top:30%}.w3{left:50%;top:14%}.w4{left:78%;top:30%}.w5{left:78%;top:70%}.w6{left:50%;top:86%}.walton-center{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:100px;height:100px;border-radius:50%;display:grid;place-items:center;background:var(--button);color:var(--button-text);box-shadow:0 8px 18px var(--shadow)}.walton-circle.on .walton-center{background:var(--active);color:var(--active-text)}.walton-fan-icon{width:50px;height:50px}.walton-timers,.walton-bottom{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.walton-bottom{grid-template-columns:1fr 1fr;margin-top:14px}.walton-timers button,.walton-bottom button{min-height:58px;font-size:17px}.coming{padding:100px 25px;text-align:center;color:var(--muted)}@media(max-width:520px){.card{padding:22px 16px 24px;border-radius:30px}.room{min-height:56px;font-size:16px}.speed{width:62px;height:62px;font-size:21px}.fan-button{width:92px;height:92px}.fan-icon{width:44px;height:44px}.three-buttons{gap:10px}.mode-button{min-height:58px;font-size:17px}.walton-body{padding:14px;border-radius:30px}.walton-speed{width:54px;height:54px}.walton-center{width:88px;height:88px}}
</style>`; }
  render() {
    const rooms=this._rooms(), room=rooms[this._roomId]||rooms.remote1, design=DESIGN_MAP[room.design]||fanRemote;
    this.shadowRoot.innerHTML=this._style()+`<div class="card theme-${this._theme()}"><div class="dot"></div><div class="rooms ${this._multiple()?'':'hidden'}">${Object.entries(rooms).map(([id,r])=>`<button class="room ${id===this._roomId?'active':''}" data-room="${id}">${this._escape(r.name)}</button>`).join('')}</div>${design.render({room,state:id=>this._state(id),escape:v=>this._escape(v)})}</div>`;
    this.shadowRoot.querySelectorAll('.room').forEach(b=>b.addEventListener('click',()=>{this._roomId=b.dataset.room;this.render();}));
    this.shadowRoot.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>this._run(this._action(b.dataset.action))));
  }
}

class UniversalRemoteCardEditor extends HTMLElement {
  constructor(){super();this.attachShadow({mode:'open'});this._config={};this._hass=null;this._multiple=false;this._form=null;this._switch=null;}
  setConfig(c){this._config=c||{};this._multiple=this._config.multiple_remotes===true;this._build();}
  set hass(v){this._hass=v;if(this._form)this._form.hass=v;else this._build();}
  _old(n){const r=this._config.rooms||{};return r[`remote${n}`]||r[n===1?'bedroom':'lounge']||{};}
  _design(n){return this._old(n).design||(n===2?'box':'fan');}
  _value(n,k){const r=this._old(n);if(k==='design')return this._design(n);if(k==='name')return r.name||(n===1?'BEDROOM':'LOUNGE');if(k==='device_name')return r.device_name||r.fan_name||(DESIGN_MAP[this._design(n)]||fanRemote).defaultName;if(k==='fan'||k==='light')return r[k]||'';return r.actions?.[k]||r[k]||'';}
  _schema(n){const p=`remote${n}_`,d=DESIGN_MAP[this._design(n)]||fanRemote,fields=[{name:p+'design',label:`Remote ${n} Design`,selector:{select:{options:REMOTE_DESIGNS.map(x=>({value:x.id,label:x.label})),mode:'dropdown'}}}];if(this._multiple)fields.push({name:p+'name',label:`Remote ${n} Name`,selector:{text:{}}});fields.push({name:p+'device_name',label:`Remote ${n} Device Name`,selector:{text:{}}});for(const c of d.controls)fields.push({name:p+c.key,label:`Remote ${n} ${c.label}`,selector:{entity:{}}});return fields;}
  _data(n){const d=DESIGN_MAP[this._design(n)]||fanRemote,o={};for(const k of ['design','name','device_name'])o[`remote${n}_${k}`]=this._value(n,k);for(const c of d.controls)o[`remote${n}_${c.key}`]=this._value(n,c.key);return o;}
  _collect(v){const make=n=>{const id=v[`remote${n}_design`]||this._design(n),d=DESIGN_MAP[id]||fanRemote,a={};for(const c of d.controls){const x=v[`remote${n}_${c.key}`];if(x)a[c.key]=x;}return{name:this._multiple?(v[`remote${n}_name`]||`REMOTE ${n}`):undefined,design:id,device_name:v[`remote${n}_device_name`]||d.defaultName,fan:v[`remote${n}_fan`]||'',light:v[`remote${n}_light`]||'',actions:a};};return{...this._config,multiple_remotes:this._multiple,theme:v.theme||this._config.theme||'auto',rooms:{remote1:make(1),...(this._multiple?{remote2:make(2)}:{})}};}
  _build(){if(!this._hass)return;this.shadowRoot.innerHTML=`<div class="box"><div class="row"><span>Multiple Remote</span><ha-switch id="multi"></ha-switch></div><ha-form id="form"></ha-form></div><style>.box{padding:8px 0}.row{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;font-weight:500}</style>`;this._switch=this.shadowRoot.querySelector('#multi');this._form=this.shadowRoot.querySelector('#form');this._switch.checked=this._multiple;this._form.hass=this._hass;this._form.schema=[{name:'theme',label:'Theme',selector:{select:{options:THEME_OPTIONS,mode:'dropdown'}}},...this._schema(1),...(this._multiple?this._schema(2):[])];this._form.data={theme:this._config.theme||'auto',...this._data(1),...(this._multiple?this._data(2):{})};this._switch.addEventListener('change',()=>{this._multiple=this._switch.checked;this._build();});this._form.addEventListener('value-changed',e=>{e.stopPropagation();this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:this._collect(e.detail.value||{})},bubbles:true,composed:true}));});}
}

if(!customElements.get('universal-remote-card')) customElements.define('universal-remote-card',UniversalRemoteCard);
if(!customElements.get('universal-remote-card-editor')) customElements.define('universal-remote-card-editor',UniversalRemoteCardEditor);
UniversalRemoteCard.getConfigElement=()=>document.createElement('universal-remote-card-editor');
UniversalRemoteCard.getStubConfig=()=>({multiple_remotes:false,theme:'auto',rooms:{remote1:{design:'fan',device_name:'Basic Celling Fan'}}});
window.customCards=window.customCards||[];
if(!window.customCards.some(c=>c.type==='universal-remote-card'))window.customCards.push({type:'universal-remote-card',name:'Universal Remote Card',description:'Modern universal remote card',preview:true});
