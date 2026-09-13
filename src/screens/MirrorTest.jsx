import { useState } from "react";
import Header from "../components/Header";

export default function MirrorTest({
  originalText,
  applicationType,
  role,
  onBack,
}) {
  const [revisedText, setRevisedText] = useState(originalText);

  const changed =
    revisedText.trim() !== originalText.trim() &&
    revisedText.trim().length > 0;

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
                onChange={(event) => setRevisedText(event.target.value)}
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
              disabled={!changed}
              className="border border-(--ink) bg-(--ink) px-7 py-3 text-sm font-medium text-(--paper) transition-colors hover:bg-(--paper) hover:text-(--ink) disabled:cursor-not-allowed disabled:opacity-40"
            >
              Compare the two reads
            </button>
          </div>
        </section>

        <div className="mt-12 border-l-2 border-(--accent) pl-5">
          <p className="text-sm leading-relaxed">
            Mirror does not determine whether disclosure is good or bad, and
            it never requires a candidate to conceal a disability. The
            comparison is designed to make screening patterns easier to
            understand.
          </p>
        </div>
      </main>
    </div>
  );
}