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

      <p className="mt-5 max-w-xl text-base leading-relaxed text-(--muted)">
        See the first read. Test a controlled revision. Compare what changes.
      </p>

      <button
        type="button"
        onClick={onStart}
        className="mt-9 border border-(--ink) bg-(--ink) px-6 py-3 text-sm font-medium text-(--paper) transition-colors hover:bg-(--paper) hover:text-(--ink)"
      >
        Run a Mirror check
      </button>

      <div className="mt-10 grid max-w-xl grid-cols-3 border-y border-(--line) py-5">
        <div className="border-r border-(--line) pr-4">
          <p className="text-xs font-medium uppercase tracking-widest text-(--accent)">
            01
          </p>

          <p className="mt-2 text-sm font-medium">
            Read
          </p>

          <p className="mt-1 text-xs leading-relaxed text-(--muted)">
            See how the application might be interpreted.
          </p>
        </div>

        <div className="border-r border-(--line) px-4">
          <p className="text-xs font-medium uppercase tracking-widest text-(--accent)">
            02
          </p>

          <p className="mt-2 text-sm font-medium">
            Revise
          </p>

          <p className="mt-1 text-xs leading-relaxed text-(--muted)">
            Test a targeted Version B.
          </p>
        </div>

        <div className="pl-4">
          <p className="text-xs font-medium uppercase tracking-widest text-(--accent)">
            03
          </p>

          <p className="mt-2 text-sm font-medium">
            Compare
          </p>

          <p className="mt-1 text-xs leading-relaxed text-(--muted)">
            See what changes in the simulated read.
          </p>
        </div>
      </div>

      <p className="mt-5 max-w-md text-xs leading-relaxed text-(--muted)">
        An educational simulation — not a prediction of any employer&apos;s
        actual hiring system.
      </p>
    </section>
  );
}