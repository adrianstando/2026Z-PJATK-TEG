/** Atom: klawisz skrótu. */
export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-md border border-[var(--line-strong)] bg-[var(--panel)] px-1.5 py-0.5 font-mono text-[0.7rem] text-fg-muted">
      {children}
    </kbd>
  );
}
