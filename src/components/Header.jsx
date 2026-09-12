export default function Header() {
  return (
    <header className="flex items-center justify-between border-b border-(--line) px-6 py-4">
      <p className="font-serif text-xl tracking-tight">
        Mirror
      </p>

      <p className="text-xs font-medium uppercase tracking-[0.18em] text-(--muted)">
        Educational simulation
      </p>
    </header>
  );
}