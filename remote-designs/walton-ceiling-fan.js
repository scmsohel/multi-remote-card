// Modern segmented Walton remote layout v3.
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
    const powerIcon = `<svg viewBox="0 0 64 64" class="walton-control-icon" aria-hidden="true"><path d="M32 8v23"/><path d="M18 14a25 25 0 1 0 28 0"/></svg>`;
    const ledIcon = `<svg viewBox="0 0 64 64" class="walton-control-icon" aria-hidden="true"><path d="M22 39h20M24 46h16M27 53h10"/><path d="M20 28a12 12 0 1 1 24 0c0 5-3 7-6 11H26c-3-4-6-6-6-11z"/><path d="M32 4v6M9 13l5 4M55 13l-5 4"/></svg>`;
    const revIcon = `<svg viewBox="0 0 64 64" class="walton-rev-icon" aria-hidden="true"><path d="M12 27h28c9 0 14 5 14 13s-5 13-14 13H25"/><path d="M25 45l-8 8 8 8"/><path d="M52 37H24c-9 0-14-5-14-13s5-13 14-13h15"/><path d="M39 3l8 8-8 8"/></svg>`;
    return `
      <div class="design-title">${ctx.escape(ctx.room.device_name || this.defaultName)}</div>
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
            <svg class="walton-fan-icon" viewBox="0 0 64 64" aria-hidden="true"><g fill="currentColor"><path d="M32 30C27 27 27 18 30 11c2-5 7-8 10-5 5 4 2 14-2 21-1 2-3 3-6 3z"/><path d="M35 32c2-5 11-7 18-4 5 2 8 7 5 10-4 5-14 2-21-2-2-1-3-3-2-4z"/><path d="M32 35c5 1 7 10 4 17-2 5-7 8-10 5-5-4-2-14-2-21-1-2 3-3 4-1z"/><path d="M29 33c-1 5-10 7-17 4-5-2-8-7-5-10 4-5 14-2 21 2 2 1 3 3 1 4z"/><circle cx="32" cy="32" r="6" fill="currentColor"/></g></svg>
          </button>
        </div>
        <div class="walton-timers">
          <button data-action="timer_2h">2H</button>
          <button data-action="timer_4h">4H</button>
          <button data-action="timer_8h">8H</button>
        </div>
        <div class="walton-bottom">
          <button data-action="eco">ECO</button>
          <button data-action="reverse">${revIcon}<span>REV</span></button>
        </div>
      </div>`;
  },
};
