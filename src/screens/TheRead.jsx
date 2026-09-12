import Header from "../components/Header";

export default function TheRead() {
  return (
    <div className="min-h-screen bg-(--paper) text-(--ink)">
      <Header />

      <main className="mx-auto max-w-6xl px-6 py-16 sm:px-10 lg:px-16">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.16em] text-(--accent)">
            The read
          </p>

          <h1 className="font-serif text-5xl leading-[0.95] tracking-[-0.03em] sm:text-6xl">
            Here&apos;s how the system might read you.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-(--muted)">
            This is a simulated screening read based on documented patterns
            in automated hiring systems — not a prediction of any specific
            employer&apos;s decision.
          </p>
        </div>

        <section className="mt-16 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="border border-(--line) p-8">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--muted)">
              Simulated screening score
            </p>

            <div className="mt-6 flex items-end gap-3">
              <span className="font-serif text-8xl leading-none">68</span>
              <span className="mb-2 text-sm text-(--muted)">/ 100</span>
            </div>

            <div className="mt-8 border-t border-(--line) pt-6">
              <p className="text-sm leading-relaxed text-(--muted)">
                A score like this should be treated as a signal to investigate,
                not as a prediction of whether you will get an interview.
              </p>
            </div>
          </div>

          <div className="border border-(--line)">
            <div className="border-b border-(--line) px-6 py-5">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--muted)">
                Signals detected
              </p>
            </div>

            <div className="divide-y divide-(--line)">
              <div className="grid gap-3 p-6 sm:grid-cols-[160px_1fr]">
                <p className="text-sm font-medium">Experience</p>

                <div>
                  <p className="text-sm font-medium text-(--accent)">
                    Strong signal
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-(--muted)">
                    Relevant experience is stated directly and maps clearly
                    to the role.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 p-6 sm:grid-cols-[160px_1fr]">
                <p className="text-sm font-medium">Language</p>

                <div>
                  <p className="text-sm font-medium text-(--accent)">
                    Mixed signal
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-(--muted)">
                    Some statements rely on indirect or hedged phrasing that
                    may be interpreted differently by automated systems.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 p-6 sm:grid-cols-[160px_1fr]">
                <p className="text-sm font-medium">Disclosure</p>

                <div>
                  <p className="text-sm font-medium text-(--accent)">
                    Potential risk
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-(--muted)">
                    Disability-related information may become a screening
                    signal depending on how an automated system is designed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-12 border-l-2 border-(--accent) pl-5">
          <p className="text-sm leading-relaxed">
            Mirror does not know how a real employer will evaluate you. It
            makes possible screening signals visible so you can decide what
            to do next.
          </p>
        </div>
      </main>
    </div>
  );
}