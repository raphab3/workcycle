export const appLayoutStyles = {
  shell: 'min-h-screen overflow-x-clip bg-[linear-gradient(180deg,#f8fafc_0%,#f5f7fb_40%,#eef4f2_100%)] text-foreground',
  skipLink: 'sr-only fixed left-4 top-4 z-50 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  topBar: 'sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur',
  topBarContent: 'mx-auto flex min-h-20 w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between',
  brand: 'flex items-center gap-3',
  brandMark: 'flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground text-background shadow-sm',
  brandName: 'text-lg font-semibold tracking-tight text-foreground',
  brandDescription: 'text-sm text-muted-foreground',
  status: 'inline-flex self-start items-center rounded-full bg-card px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground shadow-[0_12px_30px_-18px_rgba(15,23,42,0.35)] lg:self-auto',
  content: 'mx-auto flex w-full max-w-6xl flex-col px-4 pb-10 sm:px-6',
};