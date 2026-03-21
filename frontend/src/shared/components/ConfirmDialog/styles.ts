export const confirmDialogStyles = {
  root: 'fixed inset-0 z-[60]',
  backdrop: 'absolute inset-0 bg-slate-950/45 backdrop-blur-sm',
  panel: 'absolute left-1/2 top-1/2 flex w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-5 rounded-[2rem] border border-border/70 bg-card px-5 py-5 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.44)] md:px-6 md:py-6',
  copy: 'grid gap-2',
  title: 'text-xl font-semibold tracking-tight text-foreground',
  description: 'text-sm leading-6 text-muted-foreground',
  extra: 'mt-2 rounded-2xl bg-muted/40 px-4 py-3 text-sm text-foreground/82',
  actions: 'flex flex-wrap justify-end gap-3',
};