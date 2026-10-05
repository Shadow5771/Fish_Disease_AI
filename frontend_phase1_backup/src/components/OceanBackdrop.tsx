// Static CSS depth layers. The Three.js scene replaces/overlays this in a later phase.
export function OceanBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 520px at 78% -6%, rgb(34 90 160 / 0.34), transparent 60%)," +
            "radial-gradient(700px 520px at 4% 42%, rgb(20 110 130 / 0.14), transparent 65%)," +
            "linear-gradient(180deg, #060d1c 0%, #050a15 100%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgb(148 175 220) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgb(148 175 220) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at 50% 25%, black 0%, transparent 72%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 25%, black 0%, transparent 72%)",
        }}
      />
    </div>
  );
}