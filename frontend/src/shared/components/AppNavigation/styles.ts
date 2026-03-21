export const appNavigationStyles = {
  nav: 'min-w-0',
  navHeader: 'hidden items-center gap-2 overflow-x-auto pb-1 md:flex [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
  navSidebar: 'grid gap-1',
  link: 'inline-flex min-h-11 items-center rounded-2xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  linkHeader: 'gap-2 px-4 text-foreground/78 hover:bg-card hover:text-foreground',
  linkHeaderActive: 'bg-accent text-accent-foreground shadow-[0_18px_40px_-24px_rgba(15,23,42,0.48)] hover:bg-accent hover:text-accent-foreground',
  linkSidebar: 'gap-3 px-3 text-sidebar-foreground hover:bg-card hover:text-foreground',
  linkSidebarCollapsed: 'justify-center px-0',
  linkSidebarActive: 'bg-accent/10 text-foreground ring-1 ring-accent/15 hover:bg-accent/10 hover:text-foreground',
  icon: 'h-4.5 w-4.5 shrink-0 text-current transition-colors',
  iconActive: 'text-current',
};