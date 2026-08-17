export const boxRemote = {
  id: 'box',
  label: 'Box',
  defaultName: 'Fenda Sound Box',
  controls: [],
  render(ctx) {
    return `<div class="coming"><div class="coming-icon">▣</div><div class="coming-title">${ctx.escape(ctx.room.device_name || this.defaultName)}</div><div class="coming-text">Box remote design is ready to be configured.</div></div>`;
  },
};