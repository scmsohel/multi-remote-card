class UniversalRemoteCard extends HTMLElement {
  constructor(){super();this.attachShadow({mode:'open'});this._hass=null;this._config={};this._room='remote1';}
  setConfig(c){if(!c)throw new Error('Invalid configuration');this._config=c;this._ensureRoom();this.render();}
  set hass(h){this._hass=h;this.render();}
  getCardSize(){return 12;}
  multi(){return this._config.multiple_remotes===true;}
  rooms(){const r=this._config.rooms||{};const out={remote1:r.remote1||r.bedroom||{name:'BEDROOM'}};if(this.multi())out.remote2=r.remote2||r.lounge||{name:'LOUNGE'};return out;}
  _ensureRoom(){if(!this.rooms()[this._room])this._room='remote1';}
  room(){return this.rooms()[this._room]||{};}
  state(id){return id&&this._hass?this._hass.states[id]:undefined;}
  blink(){const d=this.shadowRoot?.querySelector('.dot');if(!d)return;d.classList.remove('blink');void d.offsetWidth;d.classList.add('blink');}
  async run(action){this.blink();if(!action||!this._hass)return;if(typeof action==='string'){const [domain]=action.split('.');if(domain==='script'||domain==='scene')return this._hass.callService(domain,'turn_on',{entity_id:action});if(domain==='button')return this._hass.callService(domain,'press',{entity_id:action});if(domain==='fan'||domain==='light')return this._hass.callService(domain,'toggle',{entity_id:action});}else if(action.service){const [domain,service]=action.service.split('.');if(domain&&service)return this._hass.callService(domain,service,{...(action.target||{}),...(action.data||{})});}}
  action(name){return this.room().actions?.[name] ?? this._config.actions?.[name];}
  render(){
    if(!this.shadowRoot)return;
    this._ensureRoom();const r=this.room(),fan=this.state(r.fan),on=fan?.state==='on',pct=Number(fan?.attributes?.percentage||0),speed=pct?Math.max(1,Math.min(6,Math.round(pct/100*6))):0;
    const rooms=this.rooms();
    this.shadowRoot.innerHTML=`<style>
:host{display:block}*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}.card{width:100%;max-width:720px;margin:auto;padding:28px;border-radius:42px;background:linear-gradient(145deg,#f5f3f0,#e5e1db);color:#292929;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:inset 0 1px 0 #fff,0 10px 35px #0002}.dot{width:15px;height:15px;margin:0 auto 22px;border-radius:50%;background:#cfcfcb}.dot.blink{animation:b .45s ease-out}@keyframes b{0%{background:#cfcfcb;box-shadow:none}35%{background:#4da3ff;box-shadow:0 0 0 7px #4da3ff29,0 0 18px #4da3fb}100%{background:#cfcfcb;box-shadow:none}}.rooms{display:grid;grid-template-columns:${this.multi()?'1fr 1fr':'1fr'};padding:6px;border-radius:50px;background:#d8d6d2;box-shadow:inset 0 2px 6px #0002}.room{border:0;min-height:68px;border-radius:42px;background:transparent;color:#8d8a86;font-size:20px;font-weight:700;letter-spacing:.8px;cursor:pointer}.room.active{background:#292a2b;color:#fff;box-shadow:0 5px 12px #0003}.title{margin:38px 0 18px;text-align:center;color:#8f8d89;font-size:18px;font-weight:700;letter-spacing:4px}.fan-area{position:relative;width:min(430px,100%);aspect-ratio:1;margin:auto;border-radius:50%;background:radial-gradient(circle,#fff9,#e0dcd675);border:1px solid #fff;box-shadow:inset 0 0 20px #fff8,0 15px 30px #0001}.speed{position:absolute;width:78px;height:78px;border:0;border-radius:50%;background:#fbfaf8;color:#272727;font-size:25px;font-weight:600;box-shadow:0 8px 18px #0002,0 2px 5px #0001;cursor:pointer;transform:translate(-50%,-50%);transition:filter .15s}.speed.active{background:#292a2b;color:#fff}.s1{left:20%;top:72%}.s2{left:20%;top:28%}.s3{left:50%;top:13%}.s4{left:80%;top:28%}.s5{left:80%;top:72%}.s6{left:50%;top:87%}.fan-button{position:absolute;left:50%;top:50%;width:112px;height:112px;transform:translate(-50%,-50%);border:0;border-radius:50%;background:#faf9f7;display:grid;place-items:center;cursor:pointer;box-shadow:inset 0 2px 7px #0001,0 7px 16px #0001}.fan-button.on{background:#292a2b}.fan-icon{width:52px;height:52px}.reverse{display:block;margin:22px auto 0;min-width:180px;height:58px;border:0;border-radius:40px;background:#fbfaf8;color:#292929;box-shadow:0 8px 18px #0002,0 2px 5px #0001;font-size:17px;font-weight:700;letter-spacing:1px;cursor:pointer}.modes,.timer{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.modes{margin-top:38px}.mode,.timer button{min-height:65px;border:0;border-radius:35px;background:#fbfaf8;color:#292929;box-shadow:0 8px 18px #0002,0 2px 5px #0001;cursor:pointer}.mode{font-size:20px;font-weight:600}.timer-title{margin-top:38px}.timer button{font-size:19px;font-weight:700}.mode:active,.timer button:active,.reverse:active{filter:brightness(.97)}@media(max-width:520px){.card{padding:22px 16px 24px;border-radius:30px}.room{min-height:56px;font-size:16px}.fan-area{width:min(360px,100%)}.speed{width:62px;height:62px;font-size:21px}.fan-button{width:92px;height:92px}.fan-icon{width:44px;height:44px}.modes,.timer{gap:10px}.mode,.timer button{min-height:58px;font-size:17px}}
</style><div class="card"><div class="dot"></div><div class="rooms">${Object.entries(rooms).map(([id,c])=>`<button class="room ${id===this._room?'active':''}" data-room="${id}">${c.name||id.toUpperCase()}</button>`).join('')}</div><div class="title">FAN</div><div class="fan-area">${[1,2,3,4,5,6].map(n=>`<button class="speed s${n} ${speed===n?'active':''}" data-speed="${n}">${n}</button>`).join('')}<button class="fan-button ${on?'on':''}" id="power"><svg class="fan-icon" viewBox="0 0 64 64"><g fill="${on?'#fff':'#111'}"><path d="M32 30C27 27 27 18 30 11c2-5 7-8 10-5 5 4 2 14-2 21-1 2-3 3-6 3z"/><path d="M35 32c2-5 11-7 18-4 5 2 8 7 5 10-4 5-14 2-21-2-2-1-3-3-2-4z"/><path d="M32 35c5 1 7 10 4 17-2 5-7 8-10 5-5-4-2-14 2-21-1-2 3-3 4-1z"/><path d="M29 33c-1 5-10 7-17 4-5-2-8-7-5-10 4-5 14-2 21 2 2 1 3 3 1 4z"/><circle cx="32" cy="32" r="6" fill="${on?'#292a2b':'#fff'}"/></g></svg></button></div><button class="reverse" id="reverse">⇄ &nbsp; REVERSE</button><div class="modes"><button class="mode" id="eco">ECO</button><button class="mode" id="light">💡</button><button class="mode" id="max">MAX</button></div><div class="title timer-title">TIMER</div><div class="timer"><button id="timer-1">◷ &nbsp; 1H</button><button id="timer-4">◷ &nbsp; 4H</button><button id="timer-8">◷ &nbsp; 8H</button></div></div>`;
    this.shadowRoot.querySelectorAll('.room').forEach(b=>b.addEventListener('click',()=>{this._room=b.dataset.room;this.render()}));
    this.shadowRoot.querySelector('#power')?.addEventListener('click',()=>this.run(r.fan?{service:'fan.toggle',target:{entity_id:r.fan}}:null));
    this.shadowRoot.querySelector('#light')?.addEventListener('click',()=>this.run(r.light?{service:'light.toggle',target:{entity_id:r.light}}:null));
    [['reverse','reverse'],['eco','eco'],['max','max'],['timer-1','timer_1h'],['timer-4','timer_4h'],['timer-8','timer_8h']].forEach(([id,key])=>this.shadowRoot.querySelector('#'+id)?.addEventListener('click',()=>this.run(this.action(key))));
    this.shadowRoot.querySelectorAll('.speed').forEach(b=>b.addEventListener('click',()=>this.run(this.action('speed_'+b.dataset.speed))));
  }
}

class UniversalRemoteCardEditor extends HTMLElement{
  constructor(){super();this.attachShadow({mode:'open'});this._multi=false;}
  setConfig(c){this._config={...c};this._multi=c.multiple_remotes===true;this.render();}
  set hass(h){this._hass=h;this.render();}
  _remoteData(n){const key=n===1?'remote1':'remote2';const old=this._config.rooms?.[key]||this._config.rooms?.[n===1?'bedroom':'lounge']||{};const a=old.actions||{};const prefix=`remote${n}_`;return {name:old.name||(n===1?'BEDROOM':'LOUNGE'),fan:old.fan,light:old.light,...Object.fromEntries([1,2,3,4,5,6].map(i=>[prefix+'speed_'+i,a['speed_'+i]||this._config.actions?.[n===1?'speed_'+i:prefix+'speed_'+i]])),[prefix+'reverse']:a.reverse,[prefix+'eco']:a.eco,[prefix+'max']:a.max,[prefix+'timer_1h']:a.timer_1h,[prefix+'timer_4h']:a.timer_4h,[prefix+'timer_8h']:a.timer_8h};}
  _schema(n){const p=`remote${n}_`,label=`Remote ${n}`;return [
    {name:p+'name',label:`${label} Name`,selector:{text:{}}},
    {name:p+'fan',label:`${label} Fan`,selector:{entity:{domain:'fan'}}},
    {name:p+'light',label:`${label} Light`,selector:{entity:{domain:'light'}}},
    ...[1,2,3,4,5,6].map(i=>({name:p+'speed_'+i,label:`${label} Speed ${i}`,selector:{entity:{}}})),
    {name:p+'reverse',label:`${label} Reverse`,selector:{entity:{}}},
    {name:p+'eco',label:`${label} ECO`,selector:{entity:{}}},
    {name:p+'max',label:`${label} MAX`,selector:{entity:{}}},
    {name:p+'timer_1h',label:`${label} Timer 1H`,selector:{entity:{}}},
    {name:p+'timer_4h',label:`${label} Timer 4H`,selector:{entity:{}}},
    {name:p+'timer_8h',label:`${label} Timer 8H`,selector:{entity:{}}}
  ];}
  collect(v){const rooms={remote1:{name:v.remote1_name||'BEDROOM',fan:v.remote1_fan,light:v.remote1_light,actions:{...Object.fromEntries([1,2,3,4,5,6].map(i=>['speed_'+i,v['remote1_speed_'+i]])),reverse:v.remote1_reverse,eco:v.remote1_eco,max:v.remote1_max,timer_1h:v.remote1_timer_1h,timer_4h:v.remote1_timer_4h,timer_8h:v.remote1_timer_8h}}};if(this._multi)rooms.remote2={name:v.remote2_name||'LOUNGE',fan:v.remote2_fan,light:v.remote2_light,actions:{...Object.fromEntries([1,2,3,4,5,6].map(i=>['speed_'+i,v['remote2_speed_'+i]])),reverse:v.remote2_reverse,eco:v.remote2_eco,max:v.remote2_max,timer_1h:v.remote2_timer_1h,timer_4h:v.remote2_timer_4h,timer_8h:v.remote2_timer_8h}};return {...this._config,multiple_remotes:this._multi,rooms,actions:undefined};}
  emit(v){this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:this.collect(v)},bubbles:true,composed:true}));}
  render(){
    if(!this._hass)return;
    if(!this._switch){this.shadowRoot.innerHTML='<div class="wrap"><ha-switch></ha-switch><span>Multiple Remote</span><ha-form></ha-form></div><style>.wrap{display:flex;align-items:center;gap:12px;flex-direction:column;align-items:flex-start}span{font-size:14px}</style>';this._switch=this.shadowRoot.querySelector('ha-switch');this._form=this.shadowRoot.querySelector('ha-form');this._switch.addEventListener('change',()=>{this._multi=this._switch.checked;this.render();});this._form.addEventListener('value-changed',e=>{e.stopPropagation();this.emit(e.detail.value||{});});}
    this._switch.checked=this._multi;
    this._form.schema=this._schema(1).concat(this._multi?this._schema(2):[]);
    const d={...this._remoteData(1),...(this._multi?this._remoteData(2):{})};
    this._form.data={remote1_name:d.name,remote1_fan:d.fan,remote1_light:d.light,...Object.fromEntries([1,2,3,4,5,6].map(i=>['remote1_speed_'+i,d['remote1_speed_'+i]])),remote1_reverse:d.remote1_reverse,remote1_eco:d.remote1_eco,remote1_max:d.remote1_max,remote1_timer_1h:d.remote1_timer_1h,remote1_timer_4h:d.remote1_timer_4h,remote1_timer_8h:d.remote1_timer_8h,...(this._multi?{remote2_name:this._remoteData(2).name,remote2_fan:this._remoteData(2).fan,remote2_light:this._remoteData(2).light,...Object.fromEntries([1,2,3,4,5,6].map(i=>['remote2_speed_'+i,this._remoteData(2)['remote2_speed_'+i])),remote2_reverse:this._remoteData(2).remote2_reverse,remote2_eco:this._remoteData(2).remote2_eco,remote2_max:this._remoteData(2).remote2_max,remote2_timer_1h:this._remoteData(2).remote2_timer_1h,remote2_timer_4h:this._remoteData(2).remote2_timer_4h,remote2_timer_8h:this._remoteData(2).remote2_timer_8h}: {})};
  }
}
customElements.define('universal-remote-card',UniversalRemoteCard);
customElements.define('universal-remote-card-editor',UniversalRemoteCardEditor);
UniversalRemoteCard.getConfigElement=()=>document.createElement('universal-remote-card-editor');
UniversalRemoteCard.getStubConfig=()=>({multiple_remotes:false,rooms:{remote1:{name:'BEDROOM'}},});
window.customCards=window.customCards||[];window.customCards.push({type:'universal-remote-card',name:'Universal Remote Card',description:'A modern universal remote card for Home Assistant',preview:true});
