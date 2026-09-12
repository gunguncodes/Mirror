export default function HeroContent({ onStart }) {
  return (
    <section>
      <p className="mb-6 text-sm font-medium uppercase tracking-[0.16em] text-(--accent)">
        Before the human sees it
      </p>

      <h1 className="max-w-3xl font-serif text-6xl leading-[0.95] tracking-[-0.035em] sm:text-7xl lg:text-8xl">
        What does the algorithm see?
      </h1>

      <p className="mt-8 max-w-xl text-xl leading-relaxed">
        Mirror lets job seekers examine how an automated hiring system
        might interpret their application.
      </p>

      <button
        type="button"
        onClick={onStart}
        className="mt-10 border border-(--ink) bg-(--ink) px-6 py-3 text-sm font-medium text-(--paper) transition-colors hover:bg-(--paper) hover:text-(--ink)"
      >
        Run a Mirror check
      </button>

      <p className="mt-5 max-w-md text-xs leading-relaxed text-(--muted)">
        An educational simulation — not a prediction of any employer&apos;s
        actual hiring system.
      </p>
    </section>
  );
}