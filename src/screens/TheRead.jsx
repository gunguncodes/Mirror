import { useEffect, useState } from "react";
import Header from "../components/Header";
import { evaluateApplication } from "../services/evaluateApplication";

export default function TheRead({
  applicationText,
  applicationType,
  role,
  focusAreas,
  onOpenMirrorTest,
}) {
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function runEvaluation() {
      setEvaluation(null);
      setError("");

      try {
        const result = await evaluateApplication({
          text: applicationText,
          applicationType,
          role,
          focusAreas,
        });

        if (!cancelled) {
          setEvaluation(result);
        }
      } catch (evaluationError) {
        console.error("Mirror evaluation failed:", evaluationError);

        if (!cancelled) {
          setError(
            evaluationError.message ||
              "Mirror could not complete the analysis right now."
          );
        }
      }
    }

    runEvaluation();

    return () => {
      cancelled = true;
    };
  }, [applicationText, applicationType, role, focusAreas]);

  return (
    <div className="min-h-screen bg-(--paper) text-(--ink)">
      <Header />

      <main className="mx-auto max-w-6xl px-6 py-16 sm:px-10 lg:px-16">
        <header className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium uppercase tracking-[0.16em] text-(--muted)">
            <span>The read</span>
            <span aria-hidden="true">/</span>
            <span>{applicationType}</span>

            {role && (
              <>
                <span aria-hidden="true">/</span>
                <span>{role}</span>
              </>
            )}
          </div>

          <h1 className="mt-5 font-serif text-5xl leading-[0.95] tracking-[-0.03em] sm:text-6xl">
            Here&apos;s how the system might read you.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-(--muted)">
            Mirror examines your application for patterns that may influence
            an automated screening process. This is an educational simulation,
            not a prediction of any employer&apos;s decision.
          </p>
        </header>

        {!evaluation && !error && (
          <section
            className="mt-16 border border-(--line) p-8"
            aria-live="polite"
          >
            <div className="flex items-center gap-4">
              <div
                className="h-5 w-5 animate-spin rounded-full border-2 border-(--line) border-t-(--ink)"
                aria-hidden="true"
              />

              <div>
                <p className="text-sm font-medium">
                  Mirror is reading the application…
                </p>

                <p className="mt-1 text-sm text-(--muted)">
                  The simulation is analyzing the language and signals in your
                  application.
                </p>
              </div>
            </div>
          </section>
        )}

        {error && (
          <section
            className="mt-16 border border-(--accent) p-8"
            role="alert"
          >
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--accent)">
              Evaluation unavailable
            </p>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed">
              {error}
            </p>

            <p className="mt-4 max-w-2xl text-xs leading-relaxed text-(--muted)">
              Make sure the Mirror API is running in your terminal with{" "}
              <code className="font-mono">npm run api</code>, then refresh this
              page and try again.
            </p>
          </section>
        )}

        {evaluation && (
          <>
            <section className="mt-16 grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
              <div className="border border-(--ink) p-8">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--muted)">
                  Simulated screening signal
                </p>

                <div className="mt-6 flex items-end gap-3">
                  <span className="font-serif text-8xl leading-none">
                    {evaluation.score}
                  </span>

                  <span className="mb-2 text-sm text-(--muted)">/ 100</span>
                </div>

                <div className="mt-8 border-t border-(--line) pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-(--muted)">
                      Simulation confidence
                    </p>

                    <span className="text-sm font-medium">
                      {evaluation.confidence}
                    </span>
                  </div>

                  <p className="mt-5 text-sm leading-relaxed text-(--muted)">
                    This number represents a simulated signal generated from
                    the current evaluation model. It is not an employability
                    score.
                  </p>
                </div>
              </div>

              <div className="border border-(--line) p-6">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--muted)">
                  Overall reasoning
                </p>

                <p className="mt-5 max-w-2xl text-base leading-relaxed">
                  {evaluation.overallReasoning}
                </p>

                <div className="mt-8 border-t border-(--line) pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--muted)">
                      Evaluation focus
                    </p>

                    <span className="text-xs text-(--muted)">
                      {focusAreas.length} selected
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {focusAreas.map((area) => (
                      <span
                        key={area}
                        className="border border-(--line) px-3 py-2 text-xs"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-10 border border-(--line)">
              <div className="border-b border-(--line) px-6 py-5">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--muted)">
                  What the system may notice
                </p>
              </div>

              <div className="divide-y divide-(--line)">
                {evaluation.signals.map((signal, index) => (
                  <article
                    key={`${signal.category}-${index}`}
                    className="grid gap-6 p-6 sm:grid-cols-[180px_1fr]"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {signal.category}
                      </p>

                      <p className="mt-2 text-xs uppercase tracking-wide text-(--accent)">
                        {signal.status}
                      </p>
                    </div>

                    <div>
                      <p className="max-w-2xl text-sm leading-relaxed">
                        {signal.explanation}
                      </p>

                      {signal.quotes?.length > 0 && (
                        <div className="mt-5 border-l-2 border-(--accent) pl-5">
                          <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-(--muted)">
                            Evidence from your application
                          </p>

                          <div className="space-y-2">
                            {signal.quotes.map((quote, quoteIndex) => (
                              <p
                                key={`${quote}-${quoteIndex}`}
                                className="text-sm italic leading-relaxed"
                              >
                                &ldquo;{quote}&rdquo;
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-10 border border-(--ink)">
              <div className="border-b border-(--line) px-6 py-6">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--accent)">
                  What you can actually do
                </p>

                <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
                  Turn the read into an action.
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-(--muted)">
                  These suggestions focus on changes you control: clarity,
                  specificity, evidence, and how your existing experience is
                  expressed.
                </p>
              </div>

              <div className="divide-y divide-(--line)">
                {evaluation.recommendations?.length > 0 ? (
                  evaluation.recommendations.map((recommendation, index) => (
                    <article
                      key={`${recommendation.issue}-${index}`}
                      className="p-6 sm:p-8"
                    >
                      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--muted)">
                            {String(index + 1).padStart(2, "0")}
                          </p>

                          <h3 className="mt-3 text-base font-medium">
                            {recommendation.issue}
                          </h3>
                        </div>

                        <div>
                          {recommendation.evidence?.length > 0 && (
                            <div>
                              <p className="text-xs font-medium uppercase tracking-[0.12em] text-(--muted)">
                                Evidence
                              </p>

                              <div className="mt-3 space-y-2 border-l-2 border-(--line) pl-4">
                                {recommendation.evidence.map(
                                  (evidence, evidenceIndex) => (
                                    <p
                                      key={`${evidence}-${evidenceIndex}`}
                                      className="text-sm italic leading-relaxed"
                                    >
                                      &ldquo;{evidence}&rdquo;
                                    </p>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          <div className="mt-6">
                            <p className="text-xs font-medium uppercase tracking-[0.12em] text-(--muted)">
                              Why it may matter
                            </p>

                            <p className="mt-3 max-w-2xl text-sm leading-relaxed">
                              {recommendation.whyItMatters}
                            </p>
                          </div>

                          <div className="mt-6">
                            <p className="text-xs font-medium uppercase tracking-[0.12em] text-(--muted)">
                              Action
                            </p>

                            <p className="mt-3 max-w-2xl text-sm leading-relaxed">
                              {recommendation.action}
                            </p>
                          </div>

                          {recommendation.suggestedRevision && (
                            <div className="mt-6 border border-(--line) p-5">
                              <p className="text-xs font-medium uppercase tracking-[0.12em] text-(--muted)">
                                Possible revision
                              </p>

                              <p className="mt-3 text-sm leading-relaxed">
                                {recommendation.suggestedRevision}
                              </p>

                              <p className="mt-4 text-xs leading-relaxed text-(--muted)">
                                Use this only if it accurately represents your
                                real experience.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="p-8">
                    <p className="text-sm leading-relaxed text-(--muted)">
                      Mirror did not identify a high-value wording change from
                      the supplied application.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="mt-10 border border-(--ink) p-8">
              <div className="max-w-3xl">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--accent)">
                  Next experiment
                </p>

                <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
                  What happens if you change the wording?
                </h2>

                <p className="mt-4 text-sm leading-relaxed text-(--muted)">
                  Run a controlled comparison between your original application
                  and a revised version. Keep the underlying experience the
                  same and see which observable screening signals change.
                </p>

                <button
                  type="button"
                  onClick={onOpenMirrorTest}
                  className="mt-7 border border-(--ink) bg-(--ink) px-7 py-3 text-sm font-medium text-(--paper) transition-colors hover:bg-(--paper) hover:text-(--ink)"
                >
                  Open Mirror Test →
                </button>
              </div>
            </section>

            <section className="mt-10 grid gap-10 border-t border-(--line) pt-10 lg:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--muted)">
                  What this means
                </p>

                <div className="mt-5 border border-(--line) p-6">
                  <p className="text-sm leading-relaxed text-(--muted)">
                    {evaluation.disclaimer}
                  </p>

                  <p className="mt-5 text-sm leading-relaxed">
                    Your disability status or disclosure should never be
                    treated as something you are required to hide.
                  </p>
                </div>
              </div>
            </section>

            <div className="mt-12 border-l-2 border-(--accent) pl-5">
              <p className="text-sm leading-relaxed">
                Educational simulation only. Mirror does not predict hiring
                outcomes, determine employability, or represent the actual
                screening system used by an employer.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}