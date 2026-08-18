/* Multi-Remote Card - self-contained HACS build. Remote designs remain in remote-designs/ as source files; this distributed entry file is self-contained so HACS does not need to serve submodule URLs. */

const THEME_OPTIONS=[{value:'auto',label:'Auto'},{value:'light',label:'Light'},{value:'dark',label:'Dark'}];
// Basic Ceiling Fan remote — shared press feedback on all non-speed controls.
const fanRemote = {
  id: 'fan',
  label: 'Fan',
  defaultName: 'Basic Celling Fan',
  controls: [
    { key: 'fan', label: 'Fan', type: 'entity' },
    { key: 'light', label: 'Light', type: 'entity' },
    ...Array.from({ length: 6 }, (_, i) => ({ key: `speed_${i + 1}`, label: `Speed ${i + 1}`, type: 'entity' })),
    { key: 'reverse', label: 'Reverse', type: 'entity' },
    { key: 'eco', label: 'ECO', type: 'entity' },
    { key: 'max', label: 'MAX', type: 'entity' },
    { key: 'timer_1h', label: 'Timer 1H', type: 'entity' },
    { key: 'timer_4h', label: 'Timer 4H', type: 'entity' },
    { key: 'timer_8h', label: 'Timer 8H', type: 'entity' },
  ],
  render(ctx) {
    const fan = ctx.state(ctx.room.fan);
    const on = fan?.state === 'on';
    const pct = Number(fan?.attributes?.percentage || 0);
    const speed = pct ? Math.max(1, Math.min(6, Math.round(pct / 100 * 6))) : 0;
    return `
      <div class="fan-area">
        ${[1,2,3,4,5,6].map(n => `<button class="speed s${n} ${speed === n ? 'active' : ''}" data-action="speed_${n}">${n}</button>`).join('')}
        <button class="fan-button ${on ? 'on' : ''}" data-action="fan">
          <svg class="fan-icon" viewBox="0 0 64 64" aria-hidden="true">
            <g fill="var(--button-text)">
              <path d="M32 30C27 27 27 18 30 11c2-5 7-8 10-5 5 4 2 14-2 21-1 2-3 3-6 3z"/>
              <path d="M35 32c2-5 11-7 18-4 5 2 8 7 5 10-4 5-14 2-21-2-2-1-3-3-2-4z"/>
              <path d="M32 35c5 1 7 10 4 17-2 5-7 8-10 5-5-4-2-14-2-21-1-2 3-3 4-1z"/>
              <path d="M29 33c-1 5-10 7-17 4-5-2-8-7-5-10 4-5 14-2 21 2 2 1 3 3 1 4z"/>
              <circle cx="32" cy="32" r="6" fill="var(--button-text)"/>
            </g>
          </svg>
        </button>
      </div>
      <button class="wide-button" data-action="reverse">⇄ &nbsp; REVERSE</button>
      <div class="three-buttons">
        <button class="mode-button" data-action="eco">ECO</button>
        <button class="mode-button" data-action="light">💡</button>
        <button class="mode-button" data-action="max">MAX</button>
      </div>
      <div class="section-title">TIMER</div>
      <div class="three-buttons">
        <button class="mode-button" data-action="timer_1h">◷ &nbsp; 1H</button>
        <button class="mode-button" data-action="timer_4h">◷ &nbsp; 4H</button>
        <button class="mode-button" data-action="timer_8h">◷ &nbsp; 8H</button>
      </div>
      <div class="design-title design-title-bottom">${ctx.escape(ctx.room.device_name || this.defaultName)}</div>`;
  },
};
// Modern segmented Walton remote layout.
// Walton Ceiling Fan remote - compact circular design with balanced mobile spacing.
const waltonCeilingFanRemote = {
  id: 'walton-ceiling-fan',
  label: 'Walton Ceiling Fan',
  defaultName: 'Walton Ceiling Fan',
  controls: [
    { key: 'power', label: 'Power', type: 'entity' },
    { key: 'led', label: 'LED', type: 'entity' },
    ...Array.from({ length: 6 }, (_, i) => ({ key: `speed_${i + 1}`, label: `Speed ${i + 1}`, type: 'entity' })),
    { key: 'max', label: 'Max Speed', type: 'entity' },
    { key: 'timer_2h', label: 'Timer 2H', type: 'entity' },
    { key: 'timer_4h', label: 'Timer 4H', type: 'entity' },
    { key: 'timer_8h', label: 'Timer 8H', type: 'entity' },
    { key: 'eco', label: 'ECO', type: 'entity' },
    { key: 'reverse', label: 'Reverse', type: 'entity' },
  ],
  render(ctx) {
    const power = ctx.state(ctx.room.actions?.power);
    const on = power?.state === 'on';
    const powerIcon = `<svg viewBox="0 0 64 64" class="walton-control-icon" aria-hidden="true"><path d="M32 8v25"/><path d="M18 16a24 24 0 1 0 28 0"/></svg>`;
    const ledIcon = `<svg viewBox="0 0 64 64" class="walton-control-icon" aria-hidden="true"><path d="M22 39h20M25 46h14M28 53h8"/><path d="M20 28a12 12 0 1 1 24 0c0 5-3 7-6 11H26c-3-4-6-6-6-11z"/><path d="M32 4v6M9 13l5 4M55 13l-5 4"/></svg>`;
    const clockIcon = `<svg viewBox="0 0 64 64" class="walton-timer-icon" aria-hidden="true"><circle cx="32" cy="32" r="22"/><path d="M32 18v15l10 6"/></svg>`;
    const revIcon = `<svg viewBox="0 0 64 64" class="walton-rev-icon" aria-hidden="true"><path d="M12 27h28c9 0 14 5 14 13s-5 13-14 13H25"/><path d="M25 45l-8 8 8 8"/><path d="M52 37H24c-9 0-14-5-14-13s5-13 14-13h15"/><path d="M39 3l8 8-8 8"/></svg>`;
    return `
      <style>
        .walton-modern{width:100%;max-width:520px;margin:0 auto;color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .walton-modern *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        .walton-top{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 8px}
        .walton-pill,.walton-timers button,.walton-bottom button{border:0;background:var(--button);color:var(--button-text);box-shadow:0 6px 14px var(--shadow);cursor:pointer}
        .walton-pill{height:44px;border-radius:23px;display:flex;align-items:center;justify-content:center;gap:7px;font-size:14px;font-weight:750;transition:transform .1s,box-shadow .1s,filter .1s!important}
        .walton-pill:active,.walton-timers button:active,.walton-bottom button:active{transform:translateY(2px)!important;box-shadow:0 3px 8px var(--shadow),inset 0 2px 5px var(--shadow)!important;filter:brightness(.96)!important}
        .walton-control-icon,.walton-timer-icon,.walton-rev-icon{fill:none;stroke:currentColor;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;flex:none}
        .walton-control-icon{width:16px;height:16px}.walton-timer-icon{width:15px;height:15px}.walton-rev-icon{width:17px;height:17px}
        .walton-circle{position:relative;width:min(390px,94vw);aspect-ratio:1;margin:0 auto 8px;border-radius:50%;background:radial-gradient(circle,var(--c1),var(--c2));border:1px solid var(--border);box-shadow:inset 0 0 22px var(--border),0 12px 25px var(--shadow);overflow:visible}
        .walton-speed{position:absolute!important;width:66px!important;height:66px!important;min-width:66px!important;min-height:66px!important;padding:0!important;border:0!important;border-radius:50%!important;background:var(--button)!important;color:var(--button-text)!important;font-size:19px!important;font-weight:650!important;line-height:1!important;box-shadow:0 7px 16px var(--shadow)!important;cursor:pointer!important;transform:translate(-50%,-50%)!important;transition:transform .1s,box-shadow .1s,filter .1s!important}
        .walton-speed.w3{left:50%;top:13%}.walton-speed.w2{left:20%;top:31%}.walton-speed.w4{left:80%;top:31%}.walton-speed.w1{left:20%;top:69%}.walton-speed.w5{left:80%;top:69%}.walton-speed.w6{left:50%;top:87%}
        .walton-speed:active{transform:translate(-50%,-50%) translateY(2px)!important;box-shadow:0 3px 8px var(--shadow),inset 0 2px 5px var(--shadow)!important;filter:brightness(.96)!important}
        .walton-center{position:absolute!important;left:50%;top:50%;width:78px!important;height:78px!important;min-width:78px!important;min-height:78px!important;padding:0!important;transform:translate(-50%,-50%)!important;border:0!important;border-radius:50%!important;background:var(--button)!important;color:var(--button-text)!important;display:grid!important;place-items:center;cursor:pointer;box-shadow:inset 0 2px 7px var(--shadow),0 7px 16px var(--shadow)!important;transition:transform .1s,box-shadow .1s,filter .1s!important}
        .walton-center:active{transform:translate(-50%,-50%) translateY(2px)!important;box-shadow:inset 0 4px 9px var(--shadow),0 3px 8px var(--shadow)!important;filter:brightness(.96)!important}.walton-fan-icon{width:38px;height:38px}
        .walton-timers{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:0 0 7px}.walton-timers button{height:40px;border-radius:21px;font-size:13px;font-weight:750;display:flex;align-items:center;justify-content:center;gap:5px}
        .walton-bottom{display:grid;grid-template-columns:1fr 1fr;gap:7px;align-items:stretch}.walton-bottom button{height:44px;border-radius:22px;font-size:14px;font-weight:750;display:flex;align-items:center;justify-content:center;gap:7px;margin:0!important}
        .walton-device-name{margin:3px 0 0;text-align:center;font-size:12px;font-weight:700;line-height:1.15;opacity:.82}
        @media (max-width:420px){.walton-top{gap:7px;margin-bottom:7px}.walton-pill{height:42px;font-size:13px}.walton-circle{width:100%;max-width:360px}.walton-speed{width:60px!important;height:60px!important;min-width:60px!important;min-height:60px!important;font-size:18px!important}.walton-center{width:70px!important;height:70px!important;min-width:70px!important;min-height:70px!important}.walton-fan-icon{width:35px;height:35px}.walton-timers button{height:39px}.walton-bottom button{height:42px}}
      </style>
      <div class="walton-body walton-modern">
        <div class="walton-top"><button class="mode-button walton-pill" data-action="power">${powerIcon}<span>POWER</span></button><button class="mode-button walton-pill" data-action="led">${ledIcon}<span>LED</span></button></div>
        <div class="walton-circle ${on ? 'on' : ''}">
          <button class="speed walton-speed w1" data-action="speed_1">1</button><button class="speed walton-speed w2" data-action="speed_2">2</button><button class="speed walton-speed w3" data-action="speed_3">3</button><button class="speed walton-speed w4" data-action="speed_4">4</button><button class="speed walton-speed w5" data-action="speed_5">5</button><button class="speed walton-speed w6" data-action="speed_6">6</button>
          <button class="fan-button walton-center" data-action="max" aria-label="Max Speed"><svg class="walton-fan-icon" viewBox="0 0 64 64" aria-hidden="true"><g fill="currentColor"><path d="M32 30C27 27 27 18 30 11c2-5 7-8 10-5 5 4 2 14-2 21-1 2-3 3-6 3z"/><path d="M35 32c2-5 11-7 18-4 5 2 8 7 5 10-4 5-14 2-21-2-2-1-3-3-2-4z"/><path d="M32 35c5 1 7 10 4 17-2 5-7 8-10 5-5-4-2-14-2-21-1-2 3-3 4-1z"/><path d="M29 33c-1 5-10 7-17 4-5-2-8-7-5-10 4-5 14-2 21 2 2 1 3 3 1 4z"/><circle cx="32" cy="32" r="6"/></g></svg></button>
        </div>
        <div class="walton-timers"><button class="mode-button" data-action="timer_2h">${clockIcon}<span>2H</span></button><button class="mode-button" data-action="timer_4h">${clockIcon}<span>4H</span></button><button class="mode-button" data-action="timer_8h">${clockIcon}<span>8H</span></button></div>
        <div class="walton-bottom"><button class="mode-button" data-action="eco">ECO</button><button class="wide-button" data-action="reverse">${revIcon}<span>REV</span></button></div>
        <div class="walton-device-name">${ctx.escape(ctx.room.device_name || this.defaultName)}</div>
      </div>`;
  },
};
const boxRemote={id:'box',label:'Box',defaultName:'Fenda Sound Box',controls:[],render(ctx){return `<div class="coming"><div class="coming-icon">▣</div><div class="coming-title">${ctx.escape(ctx.room.device_name||this.defaultName)}</div><div class="coming-text">Box remote design is ready to be configured.</div></div>`;}};
const REMOTE_DESIGNS=[fanRemote,waltonCeilingFanRemote,boxRemote],DESIGN_MAP=Object.fromEntries(REMOTE_DESIGNS.map(d=>[d.id,d]));

class MultiRemoteCard extends HTMLElement{
 constructor(){super();this.attachShadow({mode:'open'});this._hass=null;this._config={};this._roomId='remote1';}
 setConfig(c){this._config=c||{};this._roomId='remote1';this.render();} set hass(v){this._hass=v;this.render();} getCardSize(){return 12;}
 _multiple(){return this._config.multiple_remotes===true;} _theme(){const m=this._config.theme||'auto';if(m==='dark')return'dark';if(m==='light')return'light';return this._hass?.themes?.darkMode?'dark':'light';}
 _escape(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));} _state(id){return id&&this._hass?this._hass.states[id]:null;}
 _rooms(){const rooms=this._config.rooms||{},get=n=>{const old=rooms[`remote${n}`]||rooms[n===1?'bedroom':'lounge']||{},design=old.design||(n===2?'box':'fan'),d=DESIGN_MAP[design]||fanRemote,actions={...(old.actions||{})};for(const c of d.controls)if(old[c.key]&&actions[c.key]==null)actions[c.key]=old[c.key];return{name:old.name||(n===1?'BEDROOM':'LOUNGE'),design,device_name:old.device_name||old.fan_name||d.defaultName,fan:old.fan||'',light:old.light||'',actions};};const out={remote1:get(1)};if(this._multiple())out.remote2=get(2);return out;}
 _room(){return this._rooms()[this._roomId]||{};} _action(k){const r=this._room();if(k==='fan')return r.fan;if(k==='light')return r.light;return r.actions?.[k]||'';}
 _blink(){const d=this.shadowRoot?.querySelector('.dot');if(!d)return;d.classList.remove('blink');void d.offsetWidth;d.classList.add('blink');}
 async _run(a){this._blink();if(!a||!this._hass)return;if(typeof a==='string'){const [domain]=a.split('.');if(domain==='button')return this._hass.callService('button','press',{entity_id:a});if(domain==='script'||domain==='scene')return this._hass.callService(domain,'turn_on',{entity_id:a});if(['fan','light','switch','input_boolean'].includes(domain))return this._hass.callService(domain,'toggle',{entity_id:a});return;}if(a.service){const [domain,service]=a.service.split('.');if(domain&&service)return this._hass.callService(domain,service,{...(a.target||{}),...(a.data||{})});}}
 _style(){return `<style>:host{display:block}*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}.card{--bg1:#f5f3f0;--bg2:#e5e1db;--text:#292929;--muted:#8f8d89;--button:#fbfaf8;--button-text:#292929;--c1:#ffffff99;--c2:#e0dcd675;--border:#fff;--shadow:#0002;--active:#292a2b;--active-text:#fff;--fan:#111;--fan-center:#fff;--fan-on:#fff;--fan-on-center:#292a2b;--dot:#cfcfcb;--accent:#4da3ff;width:100%;max-width:720px;margin:auto;padding:28px;border-radius:42px;background:linear-gradient(145deg,var(--bg1),var(--bg2));color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:inset 0 1px 0 var(--border),0 10px 35px var(--shadow)}.card.theme-dark{--bg1:#20232a;--bg2:#14161b;--text:#f2f2f2;--muted:#a9a9ad;--button:#252830;--button-text:#f2f2f2;--c1:#ffffff0d;--c2:#171a20;--border:#ffffff12;--shadow:#0007;--active:#f1f1f1;--active-text:#17181b;--fan:#fff;--fan-center:#252830;--fan-on:#111;--fan-on-center:#f1f1f1;--dot:#5d6068}.dot{width:15px;height:15px;margin:0 auto 22px;border-radius:50%;background:var(--dot)}.dot.blink{animation:b .45s ease-out}@keyframes b{35%{background:var(--accent);box-shadow:0 0 0 7px #4da3ff29,0 0 18px #4da3fb}}.rooms{display:grid;grid-template-columns:1fr 1fr;padding:6px;border-radius:50px;background:var(--c2);margin-bottom:8px}.rooms.hidden{display:none}.room{border:0;min-height:68px;border-radius:42px;background:transparent;color:var(--muted);font-size:20px;font-weight:700;cursor:pointer}.room.active{background:var(--active);color:var(--active-text);box-shadow:0 5px 12px var(--shadow)}.design-title,.section-title{margin:28px 0 18px;text-align:center;color:var(--muted);font-size:18px;font-weight:700;letter-spacing:3px}.fan-area{position:relative;width:min(430px,100%);aspect-ratio:1;margin:auto;border-radius:50%;background:radial-gradient(circle,var(--c1),var(--c2));border:1px solid var(--border);box-shadow:inset 0 0 20px var(--border),0 15px 30px var(--shadow)}.speed{position:absolute;width:78px;height:78px;border:0;border-radius:50%;background:var(--button);color:var(--button-text);font-size:25px;font-weight:600;box-shadow:0 8px 18px var(--shadow);cursor:pointer;transform:translate(-50%,-50%);transition:.1s}.speed:active{transform:translate(-50%,-50%) scale(.97)}.speed.active{background:var(--active);color:var(--active-text)}.s1{left:20%;top:72%}.s2{left:20%;top:28%}.s3{left:50%;top:13%}.s4{left:80%;top:28%}.s5{left:80%;top:72%}.s6{left:50%;top:87%}.fan-button{position:absolute;left:50%;top:50%;width:112px;height:112px;transform:translate(-50%,-50%);border:0;border-radius:50%;background:var(--button);display:grid;place-items:center;cursor:pointer;box-shadow:inset 0 2px 7px var(--shadow),0 7px 16px var(--shadow)}.fan-button.on{background:var(--active)}.fan-icon{width:52px;height:52px}.wide-button{display:block;margin:22px auto 0;min-width:180px;height:58px;border:0;border-radius:40px;background:var(--button);color:var(--button-text);box-shadow:0 8px 18px var(--shadow);font-size:17px;font-weight:700;cursor:pointer}.three-buttons{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:38px}.mode-button{min-height:65px;border:0;border-radius:35px;background:var(--button);color:var(--button-text);box-shadow:0 8px 18px var(--shadow);cursor:pointer;font-size:19px;font-weight:700}.walton-body{max-width:420px;margin:auto;padding:20px;border-radius:42px;background:linear-gradient(145deg,var(--button),var(--c2));box-shadow:inset 0 1px 0 var(--border),0 14px 30px var(--shadow)}.walton-control-icon{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}.walton-rev-icon{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}.walton-pill{display:flex;align-items:center;justify-content:center;gap:8px}.walton-bottom button{display:flex;align-items:center;justify-content:center;gap:8px}.walton-top{display:grid;grid-template-columns:1fr 1fr;gap:16px}.walton-pill,.walton-timers button,.walton-bottom button{border:0;border-radius:30px;background:var(--button);color:var(--button-text);min-height:58px;box-shadow:0 7px 16px var(--shadow);font-weight:700;cursor:pointer}.walton-circle{position:relative;width:min(330px,100%);aspect-ratio:1;margin:24px auto;border-radius:50%;background:radial-gradient(circle,var(--c1),var(--c2));border:1px solid var(--border);box-shadow:inset 0 0 22px var(--border),0 12px 25px var(--shadow)}.walton-speed{position:absolute;width:62px;height:62px;border:0;border-radius:50%;background:var(--button);color:var(--button-text);font-size:21px;font-weight:700;box-shadow:0 7px 15px var(--shadow);cursor:pointer;transform:translate(-50%,-50%)}.w1{left:22%;top:70%}.w2{left:22%;top:30%}.w3{left:50%;top:14%}.w4{left:78%;top:30%}.w5{left:78%;top:70%}.w6{left:50%;top:86%}.walton-center{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:100px;height:100px;border-radius:50%;display:grid;place-items:center;background:var(--button);color:var(--button-text);box-shadow:inset 0 2px 7px var(--shadow),0 8px 18px var(--shadow)}.walton-circle.on .walton-center{background:var(--active);color:var(--active-text)}.walton-fan-icon{width:50px;height:50px}.walton-timers,.walton-bottom{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.walton-bottom{grid-template-columns:1fr 1fr;margin-top:14px}.walton-timers button,.walton-bottom button{min-height:58px;font-size:17px}.coming{padding:100px 25px;text-align:center;color:var(--muted)}.coming-icon{font-size:55px}.coming-title{font-size:22px;font-weight:700;letter-spacing:2px;margin-top:15px}.coming-text{margin-top:10px;font-size:14px}@media(max-width:520px){.card{padding:22px 16px 24px;border-radius:30px}.room{min-height:56px;font-size:16px}.speed{width:62px;height:62px;font-size:21px}.fan-button{width:92px;height:92px}.fan-icon{width:44px;height:44px}.three-buttons{gap:10px}.mode-button{min-height:58px;font-size:17px}.walton-body{padding:14px;border-radius:30px}.walton-speed{width:54px;height:54px}.walton-center{width:88px;height:88px}}\n/* Walton modern segmented remote */\n.walton-modern .walton-circle{position:relative;width:min(430px,100%);aspect-ratio:1;margin:18px auto 24px;border-radius:50%;background:radial-gradient(circle,var(--c1),var(--c2));border:1px solid var(--border);box-shadow:inset 0 0 20px var(--border),0 15px 30px var(--shadow)}\n.walton-modern .walton-speed{position:absolute;width:31%;height:31%;border:0;border-radius:24px;background:var(--button);color:var(--button-text);font-size:25px;font-weight:600;box-shadow:0 8px 18px var(--shadow);cursor:pointer;transition:.12s;z-index:2}\n.walton-modern .walton-speed:active,.walton-modern .walton-center:active,.walton-modern .walton-timers button:active,.walton-modern .walton-bottom button:active,.walton-modern .walton-pill:active{transform:scale(.96)}\n.walton-modern .w3{left:34.5%;top:4%}.walton-modern .w2{left:8%;top:24%}.walton-modern .w4{right:8%;top:24%}.walton-modern .w1{left:8%;bottom:23%}.walton-modern .w5{right:8%;bottom:23%}.walton-modern .w6{left:34.5%;bottom:4%}\n.walton-modern .walton-center{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:31%;height:31%;border:0;border-radius:50%;background:var(--button);color:var(--button-text);display:grid;place-items:center;cursor:pointer;box-shadow:inset 0 2px 7px var(--shadow),0 8px 18px var(--shadow);z-index:3}\n.walton-modern .walton-fan-icon{width:52%;height:52%}.walton-modern .walton-timers,.walton-modern .walton-bottom{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.walton-modern .walton-bottom{grid-template-columns:1fr 1fr;margin-top:14px}.walton-modern .walton-timers button,.walton-modern .walton-bottom button{min-height:58px;border:0;border-radius:32px;background:var(--button);color:var(--button-text);box-shadow:0 8px 18px var(--shadow);font-weight:700;font-size:17px;cursor:pointer}.walton-modern .walton-top{display:grid;grid-template-columns:1fr 1fr;gap:14px}.walton-modern .walton-pill{min-height:58px;border:0;border-radius:32px;background:var(--button);color:var(--button-text);box-shadow:0 8px 18px var(--shadow);font-weight:700;font-size:16px;cursor:pointer}.walton-modern .walton-control-icon,.walton-modern .walton-rev-icon{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}\n</style>`}
 render(){const rooms=this._rooms(),room=rooms[this._roomId]||rooms.remote1,design=DESIGN_MAP[room.design]||fanRemote;this.shadowRoot.innerHTML=this._style()+`<div class="card theme-${this._theme()}"><div class="dot"></div><div class="rooms ${this._multiple()?'':'hidden'}">${Object.entries(rooms).map(([id,r])=>`<button class="room ${id===this._roomId?'active':''}" data-room="${id}">${this._escape(r.name)}</button>`).join('')}</div>${design.render({room,state:id=>this._state(id),escape:v=>this._escape(v)})}</div>`;this.shadowRoot.querySelectorAll('.room').forEach(b=>b.addEventListener('click',()=>{this._roomId=b.dataset.room;this.render()}));this.shadowRoot.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>this._run(this._action(b.dataset.action))));}
}

class MultiRemoteCardEditor extends HTMLElement{
 constructor(){super();this.attachShadow({mode:'open'});this._config={};this._hass=null;this._multiple=false;this._form=null;this._switch=null;}
 setConfig(c){this._config=c||{};this._multiple=this._config.multiple_remotes===true;this._build();} set hass(v){this._hass=v;if(this._form)this._form.hass=v;else this._build();}
 _old(n){const r=this._config.rooms||{};return r[`remote${n}`]||r[n===1?'bedroom':'lounge']||{};} _design(n){return this._old(n).design||(n===2?'box':'fan');}
 _value(n,k){const r=this._old(n);if(k==='design')return this._design(n);if(k==='name')return r.name||(n===1?'BEDROOM':'LOUNGE');if(k==='device_name')return r.device_name||r.fan_name||(DESIGN_MAP[this._design(n)]||fanRemote).defaultName;if(k==='fan'||k==='light')return r[k]||'';return r.actions?.[k]||r[k]||'';}
 _schema(n){const p=`remote${n}_`,d=DESIGN_MAP[this._design(n)]||fanRemote,fields=[{name:p+'design',label:`Remote ${n} Design`,selector:{select:{options:REMOTE_DESIGNS.map(x=>({value:x.id,label:x.label})),mode:'dropdown'}}}];if(this._multiple)fields.push({name:p+'name',label:`Remote ${n} Name`,selector:{text:{}}});fields.push({name:p+'device_name',label:`Remote ${n} Device Name`,selector:{text:{}}});for(const c of d.controls)fields.push({name:p+c.key,label:`Remote ${n} ${c.label}`,selector:{entity:{}}});return fields;}
 _data(n){const d=DESIGN_MAP[this._design(n)]||fanRemote,o={};for(const k of ['design','name','device_name'])o[`remote${n}_${k}`]=this._value(n,k);for(const c of d.controls)o[`remote${n}_${c.key}`]=this._value(n,c.key);return o;}
 _collect(v){const make=n=>{const id=v[`remote${n}_design`]||this._design(n),d=DESIGN_MAP[id]||fanRemote,a={};for(const c of d.controls){const x=v[`remote${n}_${c.key}`];if(x)a[c.key]=x;}return{name:this._multiple?(v[`remote${n}_name`]||`REMOTE ${n}`):undefined,design:id,device_name:v[`remote${n}_device_name`]||d.defaultName,fan:v[`remote${n}_fan`]||'',light:v[`remote${n}_light`]||'',actions:a};};return{...this._config,multiple_remotes:this._multiple,theme:v.theme||this._config.theme||'auto',rooms:{remote1:make(1),...(this._multiple?{remote2:make(2)}:{})}};}
 _build(){if(!this._hass)return;this.shadowRoot.innerHTML=`<div class="box"><div class="row"><span>Multiple Remote</span><ha-switch id="multi"></ha-switch></div><ha-form id="form"></ha-form></div><style>.box{padding:8px 0}.row{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;font-weight:500}</style>`;this._switch=this.shadowRoot.querySelector('#multi');this._form=this.shadowRoot.querySelector('#form');this._switch.checked=this._multiple;this._form.hass=this._hass;this._form.schema=[{name:'theme',label:'Theme',selector:{select:{options:THEME_OPTIONS,mode:'dropdown'}}},...this._schema(1),...(this._multiple?this._schema(2):[])];this._form.data={theme:this._config.theme||'auto',...this._data(1),...(this._multiple?this._data(2):{})};this._switch.addEventListener('change',()=>{this._multiple=this._switch.checked;this._build();this._emit(this._form.data||{})});this._form.addEventListener('value-changed',e=>{e.stopPropagation();this._emit(e.detail.value||{})});}
 _emit(v){this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:this._collect(v)},bubbles:true,composed:true}));}
}

if(!customElements.get('multi-remote-card'))customElements.define('multi-remote-card',MultiRemoteCard);
if(!customElements.get('multi-remote-card-editor'))customElements.define('multi-remote-card-editor',MultiRemoteCardEditor);
MultiRemoteCard.getConfigElement=()=>document.createElement('multi-remote-card-editor');
MultiRemoteCard.getStubConfig=()=>({multiple_remotes:false,theme:'auto',rooms:{remote1:{design:'fan',device_name:'Basic Celling Fan'}}});
window.customCards=window.customCards||[];if(!window.customCards.some(c=>c.type==='multi-remote-card'))window.customCards.push({type:'multi-remote-card',name:'Multi-Remote Card',description:'Modern universal remote card',preview:true});
