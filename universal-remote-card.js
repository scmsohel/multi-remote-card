class UniversalRemoteCard extends HTMLElement {
  constructor() { super(); this.attachShadow({mode:"open"}); this._hass=null; this._config={}; this._room="bedroom"; }
  setConfig(config) { if(!config) throw new Error("Invalid configuration"); this._config=config; this.render(); }
  set hass(hass) { this._hass=hass; this.render(); }
  getCardSize() { return 12; }
  _rooms() { return this._config.rooms || {}; }
  _roomConfig() { return this._rooms()[this._room] || {}; }
  _state(entityId) { return entityId && this._hass ? this._hass.states[entityId] : undefined; }
  async _call(action) {
    if(!action || !this._hass) return;
    if(typeof action === "string") {
      const [domain]=action.split("."); if(!domain) return;
      if(domain==="script"||domain==="scene") await this._hass.callService(domain,"turn_on",{entity_id:action});
      else if(domain==="button") await this._hass.callService(domain,"press",{entity_id:action});
      else if(domain==="fan"||domain==="light") await this._hass.callService(domain,"toggle",{entity_id:action});
      return;
    }
    if(typeof action === "object" && action.service) {
      const [domain,service]=action.service.split("."); if(!domain||!service) return;
      await this._hass.callService(domain,service,{...(action.target||{}),...(action.data||{})});
    }
  }
  _blink() { const dot=this.shadowRoot?.querySelector(".dot"); if(!dot)return; dot.classList.remove("blink"); void dot.offsetWidth; dot.classList.add("blink"); }
  async _run(action) { this._blink(); await this._call(action); }
  render() {
    if(!this.shadowRoot)return;
    const room=this._roomConfig(); const fan=this._state(room.fan); const fanOn=fan?.state==="on";
    const percentage=Number(fan?.attributes?.percentage||0); const currentSpeed=percentage?Math.max(1,Math.min(6,Math.round(percentage/100*6))):0;
    const actions=this._config.actions||{};
    this.shadowRoot.innerHTML=`
<style>
:host{display:block;--ur-white:#fbfaf8;--ur-dark:#292a2b;--ur-muted:#8f8d89;--ur-shadow:0 8px 18px rgba(0,0,0,.10),0 2px 5px rgba(0,0,0,.06)}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
.card{width:100%;max-width:720px;margin:auto;padding:28px 28px 30px;border-radius:42px;background:linear-gradient(145deg,#f5f3f0,#e5e1db);color:#292929;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:inset 0 1px 0 rgba(255,255,255,.85),0 10px 35px rgba(0,0,0,.15)}
.dot{width:15px;height:15px;margin:0 auto 22px;border-radius:50%;background:#cfcfcb}.dot.blink{animation:dotBlink .45s ease-out}@keyframes dotBlink{0%{background:#cfcfcb;box-shadow:none}35%{background:#4da3ff;box-shadow:0 0 0 7px rgba(77,163,255,.16),0 0 18px rgba(77,163,255,.75)}100%{background:#cfcfcb;box-shadow:none}}
.rooms{display:grid;grid-template-columns:1fr 1fr;padding:6px;border-radius:50px;background:#d8d6d2;box-shadow:inset 0 2px 6px rgba(0,0,0,.10),0 2px 4px rgba(255,255,255,.7)}
.room{border:0;min-height:68px;border-radius:42px;background:transparent;color:#8d8a86;font-size:20px;font-weight:700;letter-spacing:.8px;cursor:pointer}.room.active{background:var(--ur-dark);color:#fff;box-shadow:0 5px 12px rgba(0,0,0,.18)}
.title{margin:38px 0 18px;text-align:center;color:var(--ur-muted);font-size:18px;font-weight:700;letter-spacing:4px}
.fan-area{position:relative;width:min(430px,100%);max-width:100%;aspect-ratio:1;margin:auto;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.72),rgba(224,220,214,.45));border:1px solid rgba(255,255,255,.9);box-shadow:inset 0 0 20px rgba(255,255,255,.55),0 15px 30px rgba(0,0,0,.06)}
.speed{position:absolute;width:78px;height:78px;border:0;border-radius:50%;background:var(--ur-white);color:#272727;font-size:25px;font-weight:600;box-shadow:var(--ur-shadow);cursor:pointer;transform:translate(-50%,-50%);transition:background .18s,box-shadow .18s}.speed.active{background:var(--ur-dark);color:#fff}
.s1{left:20%;top:72%}.s2{left:20%;top:28%}.s3{left:50%;top:13%}.s4{left:80%;top:28%}.s5{left:80%;top:72%}.s6{left:50%;top:87%}
.fan-button{position:absolute;left:50%;top:50%;width:112px;height:112px;transform:translate(-50%,-50%);border:0;border-radius:50%;background:#faf9f7;color:#171717;display:grid;place-items:center;cursor:pointer;box-shadow:inset 0 2px 7px rgba(0,0,0,.06),0 7px 16px rgba(0,0,0,.08)}
.speed:active{transform:translate(-50%,-50%) scale(.97)}.fan-button:active{transform:translate(-50%,-50%) scale(.97)}
.fan-icon{width:52px;height:52px;display:block}.reverse{display:block;margin:22px auto 0;min-width:180px;height:58px;border:0;border-radius:40px;background:var(--ur-white);color:#292929;box-shadow:var(--ur-shadow);font-size:17px;font-weight:700;letter-spacing:1px;cursor:pointer}
.modes{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:38px}.mode{min-height:65px;border:0;border-radius:35px;background:var(--ur-white);color:#292929;box-shadow:var(--ur-shadow);font-size:20px;font-weight:600;cursor:pointer}.light-icon{width:31px;height:31px;vertical-align:middle}.timer-title{margin-top:38px}.timer{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.timer button{min-height:65px;border:0;border-radius:35px;background:var(--ur-white);color:#292929;box-shadow:var(--ur-shadow);font-size:19px;font-weight:700;cursor:pointer}
button:active{box-shadow:inset 0 2px 6px rgba(0,0,0,.08)}
@media(max-width:520px){.card{padding:22px 16px 24px;border-radius:30px}.room{min-height:56px;font-size:16px}.fan-area{width:min(360px,100%)}.speed{width:62px;height:62px;font-size:21px}.fan-button{width:92px;height:92px}.fan-icon{width:44px;height:44px}.modes,.timer{gap:10px}.mode,.timer button{min-height:58px;font-size:17px}}
</style>
<div class="card">
<div class="dot"></div>
<div class="rooms">${Object.entries(this._rooms()).map(([id,cfg])=>`<button class="room ${id===this._room?"active":""}" data-room="${id}">${cfg.name||id.toUpperCase()}</button>`).join("")}</div>
<div class="title">FAN</div>
<div class="fan-area">${[1,2,3,4,5,6].map(n=>`<button class="speed s${n} ${currentSpeed===n?"active":""}" data-speed="${n}">${n}</button>`).join("")}
<button class="fan-button" id="power" aria-label="Power"><svg class="fan-icon" viewBox="0 0 64 64"><g fill="#111"><path d="M32 30C27 27 27 18 30 11c2-5 7-8 10-5 5 4 2 14-2 21-1 2-3 3-6 3z"/><path d="M35 32c2-5 11-7 18-4 5 2 8 7 5 10-4 5-14 2-21-2-2-1-3-3-2-4z"/><path d="M32 35c5 1 7 10 4 17-2 5-7 8-10 5-5-4-2-14 2-21 1-2 3-3 4-1z"/><path d="M29 33c-1 5-10 7-17 4-5-2-8-7-5-10 4-5 14-2 21 2 2 1 3 3 1 4z"/><circle cx="32" cy="32" r="6" fill="#fff"/></g></svg></button></div>
<button class="reverse" id="reverse">⇄ &nbsp; REVERSE</button>
<div class="modes"><button class="mode" id="eco">ECO</button><button class="mode" id="light"><svg class="light-icon" viewBox="0 0 32 32"><path d="M16 4a8 8 0 0 0-5 14c1 1 2 2 2 4h6c0-2 1-3 2-4a8 8 0 0 0-5-14z" fill="none" stroke="#111" stroke-width="2"/><path d="M13 25h6M14 28h4" stroke="#111" stroke-width="2" stroke-linecap="round"/></svg></button><button class="mode" id="max">MAX</button></div>
<div class="title timer-title">TIMER</div><div class="timer"><button id="timer-1">◷ &nbsp; 1H</button><button id="timer-4">◷ &nbsp; 4H</button><button id="timer-8">◷ &nbsp; 8H</button></div>
</div>`;
    this.shadowRoot.querySelectorAll(".room").forEach(btn=>btn.addEventListener("click",()=>{this._room=btn.dataset.room;this.render()}));
    this.shadowRoot.querySelector("#power")?.addEventListener("click",()=>this._run(room.fan?{service:"fan.toggle",target:{entity_id:room.fan}}:null));
    this.shadowRoot.querySelector("#reverse")?.addEventListener("click",()=>this._run(actions.reverse));
    this.shadowRoot.querySelector("#eco")?.addEventListener("click",()=>this._run(actions.eco));
    this.shadowRoot.querySelector("#light")?.addEventListener("click",()=>this._run(room.light?{service:"light.toggle",target:{entity_id:room.light}}:null));
    this.shadowRoot.querySelector("#max")?.addEventListener("click",()=>this._run(actions.max));
    this.shadowRoot.querySelector("#timer-1")?.addEventListener("click",()=>this._run(actions.timer_1h));
    this.shadowRoot.querySelector("#timer-4")?.addEventListener("click",()=>this._run(actions.timer_4h));
    this.shadowRoot.querySelector("#timer-8")?.addEventListener("click",()=>this._run(actions.timer_8h));
    this.shadowRoot.querySelectorAll(".speed").forEach(btn=>btn.addEventListener("click",()=>this._run(actions[`speed_${btn.dataset.speed}`])));
  }
}
customElements.define("universal-remote-card",UniversalRemoteCard);
window.customCards=window.customCards||[];
window.customCards.push({type:"universal-remote-card",name:"Universal Remote Card",description:"A modern universal remote card for Home Assistant",preview:true});
