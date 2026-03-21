export const tasksBoardPreviewStyles = {
  layout: 'grid gap-6 xl:grid-cols-[1.2fr_0.8fr]',
  list: 'grid gap-4',
  item: 'rounded-[1.5rem] border border-border/60 bg-card/90 p-5 shadow-[0_18px_55px_-30px_rgba(15,23,42,0.28)]',
  top: 'flex items-start justify-between gap-4',
  title: 'text-lg font-semibold tracking-tight text-foreground',
  meta: 'mt-2 text-sm leading-6 text-muted-foreground',
  chips: 'mt-4 flex flex-wrap gap-2',
  chip: 'inline-flex min-h-10 items-center rounded-full px-3 text-xs font-medium uppercase tracking-[0.18em]',
  chipCritical: 'bg-rose-100 text-rose-800',
  chipHigh: 'bg-amber-100 text-amber-800',
  chipStatus: 'bg-slate-200 text-slate-700',
};