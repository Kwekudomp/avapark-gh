interface SectionHeaderProps {
  tag: string;
  title: string;
  description?: string;
  light?: boolean;
}

export default function SectionHeader({
  tag,
  title,
  description,
  light = false,
}: SectionHeaderProps) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-16">
      <p
        className={`text-xs tracking-[3px] uppercase font-semibold ${light ? "text-secondary-light" : "text-accent"}`}
      >
        {tag}
      </p>
      <h2
        className={`font-display text-4xl md:text-5xl font-semibold mt-4 leading-tight ${light ? "text-white" : "text-primary"}`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-6 text-lg leading-relaxed ${light ? "text-white/70" : "text-text-secondary"}`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
