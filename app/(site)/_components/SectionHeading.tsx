type SectionHeadingProps = {
  index: string;
  label: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
};

export default function SectionHeading({
  index,
  label,
  title,
  lead,
}: SectionHeadingProps) {
  return (
    <header className="section-heading" data-reveal>
      <p className="eyebrow">
        <span>{index}</span>
        {label}
      </p>
      <div>
        <h2>{title}</h2>
        {lead && <p className="lead">{lead}</p>}
      </div>
    </header>
  );
}
