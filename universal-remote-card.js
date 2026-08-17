const REMOTE_DESIGNS = [
  { value: 'fan', label: 'Fan' },
  { value: 'box', label: 'Box' }
];

const THEME_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' }
];

class UniversalRemoteCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._config = {};
    this._roomId = 'remote1';
  }

  setConfig(c) {
    this._config = c || {};
    this._roomId = 'remote1';
    this.render();
  }

  set hass(v) {
    this._hass = v;
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
    const r = this._config.rooms || {};
    const a = r.remote1 || r.bedroom || {};
    const out = {
      remote1: {
        name: a.name || 'BEDROOM',
        design: a.design || 'fan',
        fan_name: a.fan_name || (a.design === 'box' ? 'Fenda Sound Box' : 'Basic Celling Fan'),
        ...a
      }
    };
    if (this._multiple()) {
      const b = r.remote2 || r.lounge || {};
      out.remote2 = {
        name: b.name || 'LOUNGE',
        design: b.design || 'box',
        fan_name: b.fan_name || (b.design === 'fan' ? 'Basic Celling Fan' : 'Fenda Sound Box'),
        ...b
      };
    }
    return out;
  }

  _currentRoom() { return this._rooms()[this._roomId] || {}; }
  _state(id) { return id && this._hass ? this._hass.states[id] : null; }

  _action(k) {
    const r = this._currentRoom();
    return r.actions?.[k] ?? this._config.actions?.[k];
  }

  _blink() {
    const d = this.shadowRoot?.querySelector('.dot');
    if (!d) return;
    d.classList.remove('blink');
    void d.offsetWidth;
    d.classList.add('blink');
  }

  async _run(a) {
    this._blink();
    if (!a || !this._hass) return;
    if (typeof a === 'string') {
      const [d] = a.split('.');
      if (d === 'script' || d === 'scene') return this._hass.callService(d, 'turn_on', { entity_id: a });
      if (d === 'button') return this._hass.callService(d, 'press', { entity_id: a });
      if (d === 'fan' || d === 'light' || d === 'switch') return this._hass.callService(d, 'toggle', { entity_id: a });
    } else if (a.service) {
      const [d, s] = a.service.split('.');
      if (d && s) return this._hass.callService(d, s, { ...(a.target || {}), ...(a.data || {}) });
    }
  }

  _fanMarkup(r) {
    const fan = this._state(r.fan);
    const on = fan?.state === 'on';
    const pct = Number(fan?.attributes?.percentage || 0);
    const speed = pct ? Math.max(1, Math.min(6, Math.round(pct / 100 * 6))) : 0;
    return `
      <div class="title">${r.fan_name || 'Basic Celling Fan'}</div>
      <div class="fan-area">
        ${[1,2,3,4,5,6].map(n => `<button class="speed s${n} ${speed === n ? 'active' : ''}" data-speed="${n}">${n}</button>`).join('')}
        <button class="fan-button ${on ? 'on' : ''}" id="power">
          <svg class="fan-icon" viewBox="0 0 64 64">
            <g fill="${on ? 'var(--fan-on-icon)' : 'var(--fan-icon)'}">
              <path d="M32 30C27 27 27 18 30 11c2-5 7-8 10-5 5 4 2 14-2 21-1 2-3 3-6 3z"/>
              <path d="M35 32c2-5 11-7 18-4 5 2 8 7 5 10-4 5-14 2-21-2-2-1-3-3-2-4z"/>
              <path d="M32 35c5 1 7 10 4 17-2 5-7 8-10 5-5-4-2-14 2-21-1-2 3-3 4-1z"/>
              <path d="M29 33c-1 5-10 7-17 4-5-2-8-7-5-10 4-5 14-2 21 2 2 1 3 3 1 4z"/>
              <circle cx="32" cy="32" r="6" fill="${on ? 'var(--fan-on-center)' : 'var(--fan-center)'}"/>
            </g>
          </svg>
        </button>
      </div>
      <button class="reverse" id="reverse">⇄ &nbsp; REVERSE</button>
      <div class="modes">
        <button class="mode" id="eco">ECO</button>
        <button class="mode" id="light">💡</button>
        <button class="mode" id="max">MAX</button>
      </div>
      <div class="title timer-title">TIMER</div>
      <div class="timer">
        <button id="timer-1">◷ &nbsp; 1H</button>
        <button id="timer-4">◷ &nbsp; 4H</button>
        <button id="timer-8">◷ &nbsp; 8H</button>
      </div>`;
  }

  _boxMarkup(r) {
    return `<div class="coming"><div class="coming-icon">▣</div><div class="coming-title">${r.fan_name || 'Fenda Sound Box'}</div><div class="coming-text">Box remote design is ready to be configured.</div></div>`;
  }

  render() {
    const r = this._currentRoom();
    const rooms = this._rooms();
    const isFan = (r.design || 'fan') === 'fan';
    const theme = this._theme();

    this.shadowRoot.innerHTML = `<style>
      :host{display:block}
      *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
      .card{--card-bg-1:#f5f3f0;--card-bg-2:#e5e1db;--text:#292929;--muted:#8f8d89;--button:#fbfaf8;--button-text:#292929;--circle-1:#ffffff99;--circle-2:#e0dcd675;--border:#ffffff;--shadow:#0002;--active:#292a2b;--active-text:#fff;--fan-icon:#111;--fan-center:#fff;--fan-on-icon:#fff;--fan-on-center:#292a2b;--dot:#cfcfcb;--accent:#4da3ff;width:100%;max-width:720px;margin:auto;padding:28px;border-radius:42px;background:linear-gradient(145deg,var(--card-bg-1),var(--card-bg-2));color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:inset 0 1px 0 var(--border),0 10px 35px var(--shadow);transition:background .25s,color .25s,box-shadow .25s}
      .card.theme-dark{--card-bg-1:#20232a;--card-bg-2:#14161b;--text:#f2f2f2;--muted:#a9a9ad;--button:#252830;--button-text:#f2f2f2;--circle-1:#ffffff0d;--circle-2:#171a20;--border:#ffffff12;--shadow:#0007;--active:#f1f1f1;--active-text:#17181b;--fan-icon:#fff;--fan-center:#252830;--fan-on-icon:#111;--fan-on-center:#f1f1f1;--dot:#5d6068}
      .dot{width:15px;height:15px;margin:0 auto 22px;border-radius:50%;background:var(--dot);transition:background .25s}.dot.blink{animation:b .45s ease-out}
      @keyframes b{0%{background:var(--dot);box-shadow:none}35%{background:var(--accent);box-shadow:0 0 0 7px #4da3ff29,0 0 18px #4da3fb}100%{background:var(--dot);box-shadow:none}}
      .rooms{display:${this._multiple()?'grid':'none'};grid-template-columns:1fr 1fr;padding:6px;border-radius:50px;background:var(--circle-2)}
      .room{border:0;min-height:68px;border-radius:42px;background:transparent;color:var(--muted);font-size:20px;font-weight:700;cursor:pointer}.room.active{background:var(--active);color:var(--active-text);box-shadow:0 5px 12px var(--shadow)}
      .title{margin:38px 0 18px;text-align:center;color:var(--muted);font-size:18px;font-weight:700;letter-spacing:4px}
      .fan-area{position:relative;width:min(430px,100%);aspect-ratio:1;margin:auto;border-radius:50%;background:radial-gradient(circle,var(--circle-1),var(--circle-2));border:1px solid var(--border);box-shadow:inset 0 0 20px var(--border),0 15px 30px var(--shadow)}
      .speed{position:absolute;width:78px;height:78px;border:0;border-radius:50%;background:var(--button);color:var(--button-text);font-size:25px;font-weight:600;box-shadow:0 8px 18px var(--shadow),0 2px 5px var(--shadow);cursor:pointer;transform:translate(-50%,-50%);transition:background .2s,color .2s,transform .1s}.speed:active{transform:translate(-50%,-50%) scale(.97)}.speed.active{background:var(--active);color:var(--active-text)}
      .s1{left:20%;top:72%}.s2{left:20%;top:28%}.s3{left:50%;top:13%}.s4{left:80%;top:28%}.s5{left:80%;top:72%}.s6{left:50%;top:87%}
      .fan-button{position:absolute;left:50%;top:50%;width:112px;height:112px;transform:translate(-50%,-50%);border:0;border-radius:50%;background:var(--button);display:grid;place-items:center;cursor:pointer;box-shadow:inset 0 2px 7px var(--shadow),0 7px 16px var(--shadow);transition:background .2s}.fan-button.on{background:var(--active)}.fan-icon{width:52px;height:52px}
      .reverse{display:block;margin:22px auto 0;min-width:180px;height:58px;border:0;border-radius:40px;background:var(--button);color:var(--button-text);box-shadow:0 8px 18px var(--shadow),0 2px 5px var(--shadow);font-size:17px;font-weight:700;cursor:pointer}
      .modes,.timer{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.modes{margin-top:38px}.mode,.timer button{min-height:65px;border:0;border-radius:35px;background:var(--button);color:var(--button-text);box-shadow:0 8px 18px var(--shadow),0 2px 5px var(--shadow);cursor:pointer;transition:background .2s,color .2s}.mode{font-size:20px;font-weight:600}.timer-title{margin-top:38px}.timer button{font-size:19px;font-weight:700}
      .coming{padding:100px 25px;text-align:center;color:var(--muted)}.coming-icon{font-size:55px}.coming-title{font-size:22px;font-weight:700;letter-spacing:2px;margin-top:15px}.coming-text{margin-top:10px;font-size:14px}
      @media(max-width:520px){.card{padding:22px 16px 24px;border-radius:30px}.room{min-height:56px;font-size:16px}.fan-area{width:min(360px,100%)}.speed{width:62px;height:62px;font-size:21px}.fan-button{width:92px;height:92px}.fan-icon{width:44px;height:44px}.modes,.timer{gap:10px}.mode,.timer button{min-height:58px;font-size:17px}}
    </style>
    <div class="card theme-${theme}">
      <div class="dot"></div>
      <div class="rooms">${Object.entries(rooms).map(([id,v]) => `<button class="room ${id === this._roomId ? 'active' : ''}" data-room="${id}">${v.name}</button>`).join('')}</div>
      ${isFan ? this._fanMarkup(r) : this._boxMarkup(r)}
    </div>`;

    this.shadowRoot.querySelectorAll('.room').forEach(b => b.addEventListener('click', () => { this._roomId = b.dataset.room; this.render(); }));
    if (!isFan) return;
    this.shadowRoot.querySelector('#power')?.addEventListener('click', () => this._run(r.fan ? {service:'fan.toggle',target:{entity_id:r.fan}} : null));
    this.shadowRoot.querySelector('#light')?.addEventListener('click', () => this._run(r.light ? {service:'light.toggle',target:{entity_id:r.light}} : null));
    [['reverse','reverse'],['eco','eco'],['max','max'],['timer-1','timer_1h'],['timer-4','timer_4h'],['timer-8','timer_8h']].forEach(([id,k]) => this.shadowRoot.querySelector('#'+id)?.addEventListener('click', () => this._run(this._action(k))));
    this.shadowRoot.querySelectorAll('.speed').forEach(b => b.addEventListener('click', () => this._run(this._action('speed_'+b.dataset.speed))));
  }
}

class UniversalRemoteCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode:'open'});
    this._config={};this._hass=null;this._multiple=false;this._form=null;this._switch=null;this._built=false;
  }

  setConfig(c) {
    this._config=c||{};
    const next=this._config.multiple_remotes===true;
    const changed=next!==this._multiple;
    this._multiple=next;
    if(!this._built||changed)this._buildEditor();else this._syncData();
  }

  set hass(v){this._hass=v;if(this._form)this._form.hass=v;else this._buildEditor();}
  _old(n){const r=this._config.rooms||{};return r['remote'+n]||r[n===1?'bedroom':'lounge']||{};}

  _defaultName(n,r){
    if(r.fan_name)return r.fan_name;
    if(r.design==='box')return 'Fenda Sound Box';
    return 'Basic Celling Fan';
  }

  _val(n,k){
    const r=this._old(n);
    if(k==='design')return r.design||(n===2?'box':'fan');
    if(k==='fan_name')return this._defaultName(n,r);
    if(k==='fan'||k==='light')return r[k]||'';
    return r.actions?.[k]||this._config.actions?.[k]||'';
  }

  _schema(n){
    const p=`remote${n}_`,f=[];
    f.push({name:p+'design',label:`Remote ${n} Design`,selector:{select:{options:REMOTE_DESIGNS,mode:'dropdown'}}});
    if(this._multiple)f.push({name:p+'name',label:`Remote ${n} Name`,selector:{text:{}}});
    f.push({name:p+'fan_name',label:`Remote ${n} Device Name`,selector:{text:{}}});
    f.push({name:p+'fan',label:`Remote ${n} Fan`,selector:{entity:{}}});
    f.push({name:p+'light',label:`Remote ${n} Light`,selector:{entity:{}}});
    for(let i=1;i<=6;i++)f.push({name:p+`speed_${i}`,label:`Remote ${n} Speed ${i}`,selector:{entity:{}}});
    ['reverse','eco','max'].forEach(k=>f.push({name:p+k,label:`Remote ${n} ${k.toUpperCase()}`,selector:{entity:{}}}));
    ['1h','4h','8h'].forEach(k=>f.push({name:p+`timer_${k}`,label:`Remote ${n} Timer ${k.toUpperCase()}`,selector:{entity:{}}}));
    return f;
  }

  _data(n){
    const d={},p=`remote${n}_`;
    ['design','name','fan_name','fan','light','reverse','eco','max','timer_1h','timer_4h','timer_8h'].forEach(k=>d[p+k]=this._val(n,k));
    for(let i=1;i<=6;i++)d[p+`speed_${i}`]=this._val(n,`speed_${i}`);
    return d;
  }

  _collect(v){
    const room=n=>{
      const p=`remote${n}_`,a={};
      for(let i=1;i<=6;i++)a['speed_'+i]=v[p+`speed_${i}`];
      ['reverse','eco','max','timer_1h','timer_4h','timer_8h'].forEach(k=>a[k]=v[p+k]);
      const design=v[p+'design']||(n===2?'box':'fan');
      const fallback=design==='box'?'Fenda Sound Box':'Basic Celling Fan';
      return {name:this._multiple?(v[p+'name']||`REMOTE ${n}`):undefined,design,fan_name:v[p+'fan_name']||fallback,fan:v[p+'fan'],light:v[p+'light'],actions:a};
    };
    const rooms={remote1:room(1)};
    if(this._multiple)rooms.remote2=room(2);
    return {...this._config,multiple_remotes:this._multiple,theme:this._themeValue(v),rooms};
  }

  _themeValue(v){return v.theme||this._config.theme||'auto';}

  _syncData(){
    if(!this._form)return;
    this._form.hass=this._hass;
    this._form.data={theme:this._themeValue({}),...this._data(1),...(this._multiple?this._data(2):{})};
  }

  _buildEditor(){
    if(!this._hass)return;
    this._built=false;
    this.shadowRoot.innerHTML=`<div class="box"><div class="row"><span>Multiple Remote</span><ha-switch id="multi"></ha-switch></div><div class="hint">Enable to show Remote 2 and a second tab on the card.</div><ha-form id="form"></ha-form></div><style>.box{padding:8px 0}.row{display:flex;align-items:center;justify-content:space-between;font-size:16px;font-weight:500;margin-bottom:4px}.hint{font-size:12px;opacity:.65;margin:0 0 16px}.row ha-switch{flex:none}</style>`;
    this._switch=this.shadowRoot.querySelector('#multi');
    this._form=this.shadowRoot.querySelector('#form');
    this._switch.checked=this._multiple;
    this._form.hass=this._hass;
    const themeSchema={name:'theme',label:'Theme',selector:{select:{options:THEME_OPTIONS,mode:'dropdown'}}};
    this._form.schema=[themeSchema,...this._schema(1).concat(this._multiple?this._schema(2):[])];
    this._syncData();
    this._switch.addEventListener('change',()=>{this._multiple=this._switch.checked;this._buildEditor();this._emit(this._form.data||{});});
    this._form.addEventListener('value-changed',e=>{e.stopPropagation();this._emit(e.detail.value||{});});
    this._built=true;
  }

  _emit(v){this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:this._collect(v)},bubbles:true,composed:true}));}
}

customElements.define('universal-remote-card',UniversalRemoteCard);
customElements.define('universal-remote-card-editor',UniversalRemoteCardEditor);
UniversalRemoteCard.getConfigElement=()=>document.createElement('universal-remote-card-editor');
UniversalRemoteCard.getStubConfig=()=>({multiple_remotes:false,theme:'auto',rooms:{remote1:{design:'fan',fan_name:'Basic Celling Fan'}}});
window.customCards=window.customCards||[];
if(!window.customCards.some(c=>c.type==='universal-remote-card'))window.customCards.push({type:'universal-remote-card',name:'Universal Remote Card',description:'Modern universal remote card',preview:true});
