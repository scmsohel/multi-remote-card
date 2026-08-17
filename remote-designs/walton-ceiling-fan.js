// Walton Ceiling Fan remote - final circular design with icons.
export const waltonCeilingFanRemote = {
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
        .walton-top{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 18px}
        .walton-pill,.walton-timers button,.walton-bottom button{border:0;background:var(--button);color:var(--button-text);box-shadow:0 7px 16px var(--shadow);cursor:pointer}
        .walton-pill{height:52px;border-radius:28px;display:flex;align-items:center;justify-content:center;gap:7px;font-size:15px;font-weight:750}
        .walton-pill:active{transform:translateY(3px) scale(.98)}
        .walton-control-icon{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;flex:none}
        .walton-circle{position:relative;width:min(430px,100%);aspect-ratio:1;margin:0 auto 16px;border-radius:50%;background:radial-gradient(circle,var(--c1),var(--c2));border:1px solid var(--border);box-shadow:inset 0 0 24px var(--border),0 15px 30px var(--shadow);overflow:visible}
        .walton-speed{position:absolute!important;width:72px!important;height:72px!important;min-width:72px!important;min-height:72px!important;padding:0!important;border:0!important;border-radius:50%!important;background:var(--button)!important;color:var(--button-text)!important;font-size:21px!important;font-weight:650!important;line-height:1!important;box-shadow:0 8px 18px var(--shadow)!important;cursor:pointer!important;transform:translate(-50%,-50%);transition:box-shadow .1s}
        .walton-speed.w3{left:50%;top:13%}.walton-speed.w2{left:20%;top:31%}.walton-speed.w4{left:80%;top:31%}.walton-speed.w1{left:20%;top:69%}.walton-speed.w5{left:80%;top:69%}.walton-speed.w6{left:50%;top:87%}
        .walton-speed:active{transform:translate(-50%,-50%) scale(.98)}
        .walton-speed:hover{box-shadow:0 10px 22px var(--shadow)!important}
        .walton-center{position:absolute!important;left:50%;top:50%;width:82px!important;height:82px!important;min-width:82px!important;min-height:82px!important;padding:0!important;transform:translate(-50%,-50%);border:0!important;border-radius:50%!important;background:var(--button)!important;color:var(--button-text)!important;display:grid!important;place-items:center;cursor:pointer;box-shadow:inset 0 2px 7px var(--shadow),0 8px 18px var(--shadow)!important;transition:box-shadow .1s}
        .walton-center:active{transform:translate(-50%,-50%) scale(.98)}
        .walton-fan-icon{width:42px;height:42px}
        .walton-timers{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:0 0 10px}
        .walton-timers button{height:46px;border-radius:24px;font-size:14px;font-weight:750;transition:transform .1s;display:flex;align-items:center;justify-content:center;gap:6px}
        .walton-timers button:active{transform:translateY(3px) scale(.98)}
        .walton-timer-icon{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;flex:none}
        .walton-bottom{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .walton-bottom button{height:50px;border-radius:26px;font-size:15px;font-weight:750;display:flex;align-items:center;justify-content:center;gap:7px;transition:transform .1s}
        .walton-bottom button:active{transform:translateY(3px) scale(.98)}
        .walton-rev-icon{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;flex:none}
        @media (max-width:420px){.walton-pill{height:48px;font-size:14px}.walton-circle{width:100%;}.walton-speed{width:64px!important;height:64px!important;min-width:64px!important;min-height:64px!important;font-size:19px!important}.walton-center{width:74px!important;height:74px!important;min-width:74px!important;min-height:74px!important}.walton-fan-icon{width:38px;height:38px}}
      </style>
      <div class="walton-body walton-modern">
        <div class="walton-top">
          <button class="walton-pill" data-action="power">${powerIcon}<span>POWER</span></button>
          <button class="walton-pill" data-action="led">${ledIcon}<span>LED</span></button>
        </div>
        <div class="walton-circle ${on ? 'on' : ''}">
          <button class="walton-speed w1" data-action="speed_1">1</button>
          <button class="walton-speed w2" data-action="speed_2">2</button>
          <button class="walton-speed w3" data-action="speed_3">3</button>
          <button class="walton-speed w4" data-action="speed_4">4</button>
          <button class="walton-speed w5" data-action="speed_5">5</button>
          <button class="walton-speed w6" data-action="speed_6">6</button>
          <button class="walton-center" data-action="max" aria-label="Max Speed">
            <svg class="walton-fan-icon" viewBox="0 0 64 64" aria-hidden="true"><g fill="currentColor"><path d="M32 30C27 27 27 18 30 11c2-5 7-8 10-5 5 4 2 14-2 21-1 2-3 3-6 3z"/><path d="M35 32c2-5 11-7 18-4 5 2 8 7 5 10-4 5-14 2-21-2-2-1-3-3-2-4z"/><path d="M32 35c5 1 7 10 4 17-2 5-7 8-10 5-5-4-2-14-2-21-1-2 3-3 4-1z"/><path d="M29 33c-1 5-10 7-17 4-5-2-8-7-5-10 4-5 14-2 21 2 2 1 3 3 1 4z"/><circle cx="32" cy="32" r="6"/></g></svg>
          </button>
        </div>
        <div class="walton-timers">
          <button data-action="timer_2h">${clockIcon}<span>2H</span></button>
          <button data-action="timer_4h">${clockIcon}<span>4H</span></button>
          <button data-action="timer_8h">${clockIcon}<span>8H</span></button>
        </div>
        <div class="walton-bottom">
          <button data-action="eco">ECO</button>
          <button data-action="reverse">${revIcon}<span>REV</span></button>
        </div>
      </div>`;
  },
};
