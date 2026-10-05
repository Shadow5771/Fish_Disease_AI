import { useEffect, useState } from "react";

function useMatch(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

export function usePrefersReducedMotion(): boolean {
  return useMatch("(prefers-reduced-motion: reduce)");
}

/** Fine pointer + hover = desktop-style tracking. Touch is coarse. */
export function useFinePointer(): boolean {
  return useMatch("(hover: hover) and (pointer: fine)");
}
