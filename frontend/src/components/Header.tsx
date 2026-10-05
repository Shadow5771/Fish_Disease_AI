import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Screening", href: "#screening" },
  { label: "Models", href: "#models" },
  { label: "Robustness", href: "#research" },
  { label: "Methodology", href: "#methodology" },
];

export function Header() {
  const [active, setActive] = useState("screening");

  useEffect(() => {
    const sections = navItems
      .map((item) => document.querySelector(item.href))
      .filter((section): section is Element => Boolean(section));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActive(visible.target.id);
        }
      },
      {
        rootMargin: "-25% 0px -55% 0px",
        threshold: [0.1, 0.25, 0.5],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink-950/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => scrollTo("#top")}
          className="group flex items-center gap-3 text-left"
          aria-label="Go to top"
        >
          <motion.div
            whileHover={{ scale: 1.06 }}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/30 bg-accent-soft font-display text-sm font-bold text-accent"
          >
            FD
          </motion.div>

          <div className="hidden sm:block">
            <p className="font-display text-sm font-bold tracking-[0.18em] text-snow">
              FISH SCREENING
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-muted">
              AI Research System
            </p>
          </div>
        </button>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Primary navigation"
        >
          {navItems.map((item) => {
            const id = item.href.replace("#", "");
            const isActive = active === id;

            return (
              <button
                key={item.href}
                type="button"
                onClick={() => scrollTo(item.href)}
                className="relative rounded-lg px-3.5 py-2 text-xs font-medium tracking-wide text-mist transition-colors duration-200 hover:text-snow"
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-nav"
                    className="absolute inset-0 rounded-lg border border-line-bright bg-white/[0.035]"
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 32,
                    }}
                  />
                )}

                <span className="relative z-10">{item.label}</span>

                {isActive && (
                  <motion.span
                    layoutId="active-dot"
                    className="absolute bottom-1 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-accent"
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 32,
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <motion.button
          type="button"
          onClick={() => scrollTo("#screening")}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="btn whitespace-nowrap"
        >
          Start Screening
        </motion.button>
      </div>
    </header>
  );
}