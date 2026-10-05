export function Hero() {
  return (
    <div className="animate-rise min-w-0">
      <p className="eyebrow">Research prototype</p>
      <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.06] tracking-tight sm:text-5xl lg:text-6xl">
        AI-ASSISTED
        <br />
        FISH DISEASE
        <br />
        SCREENING
      </h1>
      <p className="mt-6 max-w-md text-base leading-relaxed text-mist">
        Image-based screening powered by three deep-learning detection models with transparent
        multi-model consensus.
      </p>

      <ul className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-line pt-5">
        <li className="flex items-baseline gap-2">
          <span className="font-display text-xl font-semibold">3</span>
          <span className="eyebrow">Models</span>
        </li>
        <li className="flex items-baseline gap-2">
          <span className="font-display text-xl font-semibold">5</span>
          <span className="eyebrow">Classes</span>
        </li>
        <li className="eyebrow">Image-based screening</li>
      </ul>
    </div>
  );
}