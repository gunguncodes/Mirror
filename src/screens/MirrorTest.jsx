import { useState } from "react";
import Header from "../components/Header";

export default function MirrorTest({
  originalText,
  applicationType,
  role,
  focusAreas,
  onBack,
}) {
  const [revisedText, setRevisedText] = useState(originalText);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const changed =
    revisedText.trim() !== originalText.trim() &&
    revisedText.trim().length > 0;

  async function handleCompare() {
    if (!changed) {
      setError("Change something in Version B before comparing.");
      return;
    }

    setLoading(true);
    setError("");
    setComparison(null);

    try {
      const response = await fetch("http://localhost:3001/api/compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalText,
          revisedText,
          applicationType,
          role,
          focusAreas,
        }),
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Mirror received an invalid response from the comparison API."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error || "Mirror could not compare the two versions."
        );
      }

      setComparison(data);
    } catch (comparisonError) {
      console.error("Mirror comparison failed:", comparisonError);

      setError(
        comparisonError.message ||
          "Mirror could not complete the comparison right now."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-(--paper) text-(--ink)">
      <Header />

      <main className="mx-auto max-w-6xl px-6 py-16 sm:px-10 lg:px-16">
        <header className="max-w-3xl">
          <button
            type="button"
            onClick={onBack}
            className="mb-8 text-xs font-medium uppercase tracking-[0.16em] text-(--muted) transition-colors hover:text-(--ink)"
          >
            ← Back to the read
          </button>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium uppercase tracking-[0.16em] text-(--muted)">
            <span>Mirror test</span>

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
            Change one thing. See what changes.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-(--muted)">
            Mirror Test lets you compare your original application with a
            controlled revision. The goal is to make the effect of language
            changes visible — not to tell you what you should hide.
          </p>
        </header>

        <section className="mt-16 grid gap-6 lg:grid-cols-2">
          <article className="border border-(--line)">
            <div className="flex items-center justify-between border-b border-(--line) px-6 py-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--muted)">
                  Version A
                </p>

                <h2 className="mt-2 font-serif text-2xl">
                  Original application
                </h2>
              </div>

              <span className="text-xs text-(--muted)">Reference</span>
            </div>

            <div className="p-6">
              <div className="min-h-96 border border-(--line) p-5">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {originalText}
                </p>
              </div>
            </div>
          </article>

          <article className="border border-(--ink)">
            <div className="border-b border-(--line) px-6 py-5">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--accent)">
                Version B
              </p>

              <h2 className="mt-2 font-serif text-2xl">
                Controlled revision
              </h2>
            </div>

            <div className="p-6">
              <textarea
                value={revisedText}
                onChange={(event) => {
                  setRevisedText(event.target.value);
                  setComparison(null);

                  if (error) {
                    setError("");
                  }
                }}
                className="min-h-96 w-full resize-y border border-(--line) bg-transparent p-5 text-sm leading-relaxed outline-none transition-colors focus:border-(--ink)"
                aria-label="Revised application"
              />

              <div className="mt-4 flex items-center justify-between gap-6">
                <p className="max-w-md text-xs leading-relaxed text-(--muted)">
                  Change a small part of the application while keeping the
                  underlying experience and qualifications the same.
                </p>

                <span className="shrink-0 text-xs text-(--muted)">
                  {revisedText.length} characters
                </span>
              </div>
            </div>
          </article>
        </section>

        <section className="mt-10 border-t border-(--line) pt-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--muted)">
                What changed?
              </p>

              <h2 className="mt-3 font-serif text-3xl">
                Run the comparison
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-(--muted)">
                Mirror will compare both versions using the same simulation
                framework, then show which observable signals changed.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCompare}
              disabled={!changed || loading}
              className="border border-(--ink) bg-(--ink) px-7 py-3 text-sm font-medium text-(--paper) transition-colors hover:bg-(--paper) hover:text-(--ink) disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Comparing the two reads…" : "Compare the two reads"}
            </button>
          </div>

          {error && (
            <div
              className="mt-6 border border-(--accent) p-5"
              role="alert"
            >
              <p className="text-sm leading-relaxed">{error}</p>
            </div>
          )}
        </section>

        {comparison && (
          <section className="mt-16 border-t border-(--line) pt-10">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--accent)">
                The difference
              </p>

              <h2 className="mt-3 font-serif text-4xl">
                Same application. Different wording.
              </h2>

              <p className="mt-5 text-base leading-relaxed text-(--muted)">
                {comparison.summary}
              </p>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              <div className="border border-(--line) p-6">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--muted)">
                  Version A
                </p>

                <p className="mt-4 font-serif text-6xl leading-none">
                  {comparison.originalScore}
                </p>

                <p className="mt-2 text-xs text-(--muted)">
                  Simulated signal
                </p>
              </div>

              <div className="border border-(--ink) p-6">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--accent)">
                  Version B
                </p>

                <p className="mt-4 font-serif text-6xl leading-none">
                  {comparison.revisedScore}
                </p>

                <p className="mt-2 text-xs text-(--muted)">
                  Simulated signal
                </p>
              </div>

              <div className="border border-(--line) p-6">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--muted)">
                  Difference
                </p>

                <p className="mt-4 font-serif text-6xl leading-none">
                  {comparison.scoreDifference > 0 ? "+" : ""}
                  {comparison.scoreDifference}
                </p>

                <p className="mt-2 text-xs text-(--muted)">
                  Simulation change
                </p>
              </div>
            </div>

            <div className="mt-10 border border-(--line)">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-(--line) px-6 py-5">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--muted)">
                  Observable changes
                </p>

                <p className="text-xs text-(--muted)">
                  Confidence: {comparison.confidence}
                </p>
              </div>

              <div className="divide-y divide-(--line)">
                {comparison.changes.map((change, index) => (
                  <article
                    key={`${change.category}-${index}`}
                    className="p-6"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <h3 className="text-sm font-medium">
                        {change.category}
                      </h3>

                      <span className="text-xs uppercase tracking-wide text-(--accent)">
                        {change.direction}
                      </span>
                    </div>

                    <p className="mt-4 max-w-3xl text-sm leading-relaxed">
                      {change.explanation}
                    </p>

                    <div className="mt-6 grid gap-6 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.12em] text-(--muted)">
                          Version A evidence
                        </p>

                        {change.originalEvidence.length > 0 ? (
                          <div className="mt-3 space-y-2 border-l-2 border-(--line) pl-4">
                            {change.originalEvidence.map(
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
                        ) : (
                          <p className="mt-3 text-sm text-(--muted)">
                            No direct evidence cited.
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.12em] text-(--muted)">
                          Version B evidence
                        </p>

                        {change.revisedEvidence.length > 0 ? (
                          <div className="mt-3 space-y-2 border-l-2 border-(--accent) pl-4">
                            {change.revisedEvidence.map(
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
                        ) : (
                          <p className="mt-3 text-sm text-(--muted)">
                            No direct evidence cited.
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="mt-10 border-l-2 border-(--accent) pl-5">
              <p className="text-sm leading-relaxed">
                {comparison.disclaimer}
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}