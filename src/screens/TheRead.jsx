import Header from "../components/Header";
import { evaluateApplication } from "../services/evaluateApplication";

export default function TheRead({ applicationText }) {
  const evaluation = evaluateApplication(applicationText);

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
              Your application
            </p>

            <div className="mt-6 max-h-80 overflow-y-auto border-t border-(--line) pt-6">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {applicationText}
              </p>
            </div>
          </div>

          <div className="border border-(--line) p-8">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--muted)">
              Simulated screening score
            </p>

            <div className="mt-6 flex items-end gap-3">
              <span className="font-serif text-8xl leading-none">
                {evaluation.score}
              </span>

              <span className="mb-2 text-sm text-(--muted)">/ 100</span>
            </div>

            <p className="mt-8 border-t border-(--line) pt-6 text-sm leading-relaxed text-(--muted)">
              This is a simulated signal, not a prediction of whether you
              will receive an interview or job offer.
            </p>
          </div>
        </section>

        <section className="mt-10 border border-(--line)">
          <div className="border-b border-(--line) px-6 py-5">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--muted)">
              What the system may notice
            </p>
          </div>

          <div className="divide-y divide-(--line)">
            {evaluation.signals.map((signal) => (
              <div
                key={signal.category}
                className="grid gap-3 p-6 sm:grid-cols-[160px_1fr]"
              >
                <p className="text-sm font-medium">{signal.category}</p>

                <div>
                  <p className="text-sm font-medium text-(--accent)">
                    {signal.status}
                  </p>

                  <p className="mt-2 text-sm leading-relaxed text-(--muted)">
                    {signal.explanation}
                  </p>

                  {signal.quotes?.length > 0 && (
                    <div className="mt-4 border-l border-(--line) pl-4">
                      {signal.quotes.map((quote) => (
                        <p
                          key={quote}
                          className="text-sm italic text-(--ink)"
                        >
                          &ldquo;{quote}&rdquo;
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12 border-l-2 border-(--accent) pl-5">
          <p className="text-sm leading-relaxed">
            {evaluation.disclaimer}
          </p>
        </div>
      </main>
    </div>
  );
}