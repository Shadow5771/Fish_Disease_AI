const navItems = [
  { label: "Screening", href: "#screening" },
  { label: "Models", href: "#models" },
  { label: "Robustness", href: "#robustness" },
  { label: "Research", href: "#research" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ink-950/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a
          href="#top"
          className="flex items-center gap-3"
          aria-label="Fish Disease Screening home"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/30 bg-accent/10">
            <span className="text-sm font-bold text-accent">FD</span>
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold tracking-wide text-snow">
              FISH SCREENING
            </p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
              AI Research System
            </p>
          </div>
        </a>

        <nav
          className="flex h-full items-center gap-4 sm:gap-6"
          aria-label="Main navigation"
        >
          {navItems.map((item, index) => (
            <a
              key={item.label}
              href={item.href}
              aria-current={index === 0 ? "page" : undefined}
              className={
                index === 0
                  ? "relative flex h-full items-center text-sm text-snow after:absolute after:inset-x-0 after:-bottom-px after:h-px after:bg-accent"
                  : "flex h-full items-center text-sm text-muted transition-colors hover:text-snow"
              }
            >
              {item.label}
            </a>
          ))}

          <a
            href="#screening"
            className="hidden rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition-all hover:border-accent hover:bg-accent/15 sm:inline-flex"
          >
            Start Screening
          </a>
        </nav>
      </div>
    </header>
  );
}