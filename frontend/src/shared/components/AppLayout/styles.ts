export const appLayoutStyles = {
  shell: 'min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f5f7fb_40%,#eef4f2_100%)] text-foreground',
  topBar: 'sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur',
  topBarContent: 'mx-auto flex min-h-20 w-full max-w-6xl flex-col gap-5 px-6 py-5 lg:flex-row lg:items-center lg:justify-between',
  brand: 'flex items-center gap-3',
  brandMark: 'flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground text-background shadow-sm',
  brandName: 'text-lg font-semibold tracking-tight text-foreground',
  brandDescription: 'text-sm text-muted-foreground',
  status: 'inline-flex items-center rounded-full bg-card px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground shadow-[0_12px_30px_-18px_rgba(15,23,42,0.35)]',
  content: 'mx-auto flex w-full max-w-6xl flex-col px-6',
};