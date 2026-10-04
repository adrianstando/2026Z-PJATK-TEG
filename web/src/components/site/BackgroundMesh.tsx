/**
 * Organizm: tło całej aplikacji — trzy niebieskie poświaty i siatka.
 * Stoi za treścią (fixed, -z-10), więc sekcje nie muszą malować własnego tła.
 *
 * Poświaty to radial-gradient, a nie rozmyte (filter: blur) i animowane plamy:
 * blur 140–160 px na warstwach wielkości ekranu przegrzewał telefony, a na iOS
 * powodował migotanie (białe przebłyski) przy przewijaniu.
 */
export function BackgroundMesh() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(ellipse 70% 55% at 10% 0%, color-mix(in srgb, var(--color-brand-500) 32%, transparent), transparent 70%)",
            "radial-gradient(ellipse 50% 40% at 95% 45%, color-mix(in srgb, var(--color-cyan-400) 12%, transparent), transparent 70%)",
            "radial-gradient(ellipse 55% 40% at 50% 105%, color-mix(in srgb, var(--color-brand-600) 25%, transparent), transparent 70%)",
            "linear-gradient(to bottom, var(--color-ink-900), var(--color-ink-950) 50%)",
          ].join(", "),
        }}
      />
      <div className="bg-grid absolute inset-0 opacity-40" />
    </div>
  );
}
