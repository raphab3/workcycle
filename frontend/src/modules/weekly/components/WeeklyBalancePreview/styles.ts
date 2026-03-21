export const weeklyBalancePreviewStyles = {
  layout: 'grid gap-6',
  board: 'overflow-hidden rounded-[1.75rem] border border-border/60 bg-card/90 shadow-[0_18px_55px_-30px_rgba(15,23,42,0.28)]',
  row: 'grid grid-cols-[1.2fr_repeat(6,minmax(0,1fr))_0.8fr] items-center gap-3 px-5 py-4 text-sm',
  rowHeader: 'bg-muted/45 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground',
  rowAlt: 'bg-background/70',
  projectCell: 'font-medium text-foreground',
  statusGood: 'text-emerald-700',
  statusWarn: 'text-amber-700',
  statusCritical: 'text-rose-700',
};