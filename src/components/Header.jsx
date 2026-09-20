export default function Header() {
  return (
    <header className="flex items-center justify-between border-b border-(--line) px-6 py-4 sm:px-8">
      <p className="font-serif text-xl tracking-tight">
        Mirror
      </p>

      <p className="text-[11px] font-medium uppercase tracking-widest text-(--muted)">
        Educational simulation
      </p>
    </header>
  );
}