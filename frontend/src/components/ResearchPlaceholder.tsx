interface Props {
  id: string;
  title: string;
  note: string;
}

export function ResearchPlaceholder({ id, title, note }: Props) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-line py-14">
      <p className="eyebrow">Research interface</p>
      <h2 className="mt-2 font-display text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-mist">{note}</p>
    </section>
  );
}
