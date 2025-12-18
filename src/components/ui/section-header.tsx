interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeaderProps) {
  return (
    <div className={`space-y-2 ${align === "center" ? "text-center" : "text-left"}`}>
      {eyebrow ? (
        <p className="pill mx-auto w-fit text-xs uppercase tracking-[0.2em] text-[var(--accent-deep)]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-3xl md:text-4xl font-bold leading-tight">{title}</h2>
      {description ? (
        <p className={`text-[var(--muted)] max-w-3xl ${align === "center" ? "mx-auto" : ""}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
