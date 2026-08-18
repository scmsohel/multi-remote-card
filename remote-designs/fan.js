export const fanRemote = {
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
      <style>
        .fan-button{transition:box-shadow .1s,filter .1s!important}
        .fan-button:active{box-shadow:0 3px 8px var(--shadow),inset 0 2px 5px var(--shadow)!important;filter:brightness(.96)!important}
      </style>
      <div class="fan-area">
        ${[1,2,3,4,5,6].map(n => `<button class="speed s${n} ${speed === n ? 'active' : ''}" data-action="speed_${n}">${n}</button>`).join('')}
        <button class="fan-button ${on ? 'on' : ''}" data-action="fan">
          <svg class="fan-icon" style="color:var(--text)!important;fill:var(--text)!important;opacity:1!important" viewBox="0 0 64 64" aria-hidden="true">
            <g fill="currentColor">
              <path d="M32 30C27 27 27 18 30 11c2-5 7-8 10-5 5 4 2 14-2 21-1 2-3 3-6 3z"/>
              <path d="M35 32c2-5 11-7 18-4 5 2 8 7 5 10-4 5-14 2-21-2-2-1-3-3-2-4z"/>
              <path d="M32 35c5 1 7 10 4 17-2 5-7 8-10 5-5-4-2-14-2-21-1-2 3-3 4-1z"/>
              <path d="M29 33c-1 5-10 7-17 4-5-2-8-7-5-10 4-5 14-2 21 2 2 1 3 3 1 4z"/>
              <circle cx="32" cy="32" r="6" fill="currentColor"/>
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
      `;
  },
};
