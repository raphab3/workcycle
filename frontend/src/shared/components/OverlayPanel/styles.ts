export const overlayPanelStyles = {
  root: 'fixed inset-0 z-50',
  backdrop: 'absolute inset-0 bg-slate-950/45 backdrop-blur-sm',
  panel: 'absolute bg-card shadow-[0_24px_80px_-36px_rgba(15,23,42,0.44)]',
  panelResponsive: 'inset-x-0 bottom-0 max-h-[86vh] rounded-t-[2rem] border border-border/70 md:inset-y-0 md:right-0 md:left-auto md:w-[40rem] md:max-h-none md:rounded-none md:rounded-l-[2rem]',
  header: 'flex items-start justify-between gap-4 border-b border-border/60 px-5 py-5 md:px-6',
  title: 'text-xl font-semibold tracking-tight text-foreground',
  description: 'mt-2 text-sm leading-6 text-muted-foreground',
  closeButton: 'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background/80 text-foreground/80 transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  content: 'max-h-[calc(86vh-5.75rem)] overflow-y-auto px-5 py-5 md:max-h-screen md:px-6 md:py-6',
};