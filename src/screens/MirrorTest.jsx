import { useMemo, useState } from "react";
import Header from "../components/Header";
import {
  compareApplications,
  reviseApplication,
} from "../services/evaluateApplication";


function normalizeList(value) {
  return Array.isArray(value) ? value : [];
}

function buildRevisionPlan(analysis) {
  if (!analysis) {
    return {
      summary:
        "Mirror could not access the completed diagnosis. Generate a general fact-preserving revision.",
      items: [],
      prompt:
        "Improve clarity, specificity, technical credibility, and role alignment using only facts already present in the original application.",
    };
  }

  const weaknesses = normalizeList(analysis.weaknesses);
  const recommendations = normalizeList(analysis.recommendations);
  const languageAudit = normalizeList(analysis.aiLanguageAudit);
  const signals = normalizeList(analysis.signals);

  const items = [];

  weaknesses.slice(0, 4).forEach((item) => {
    items.push({
      type: "Weakness",
      title: item.title || "Identified weakness",
      detail: item.explanation || "",
      severity: item.severity || "Medium",
      evidence: normalizeList(item.evidence),
    });
  });

  recommendations.slice(0, 4).forEach((item) => {
    items.push({
      type: "Recommendation",
      title: item.issue || "Recommended change",
      detail: item.action || item.whyItMatters || "",
      severity: "Action",
      evidence: normalizeList(item.evidence),
    });
  });

  languageAudit.slice(0, 3).forEach((item) => {
    items.push({
      type: "Language",
      title: item.phrase || item.title || "Language issue",
      detail:
        item.whyItMayHurt ||
        item.reason ||
        item.rewriteDirection ||
        item.explanation ||
        "",
      severity: item.severity || "Medium",
      evidence: normalizeList(item.evidence || item.quotes),
    });
  });

  signals
    .filter(
      (item) =>
        item.status === "Potential risk" ||
        item.status === "Mixed signal"
    )
    .slice(0, 3)
    .forEach((item) => {
      items.push({
        type: "Screening signal",
        title: item.category || "Screening signal",
        detail: item.explanation || "",
        severity: item.status,
        evidence: normalizeList(item.quotes),
      });
    });

  const uniqueItems = [];
  const seen = new Set();

  for (const item of items) {
    const key = `${item.type}:${item.title}`.toLowerCase();

    if (!seen.has(key)) {
      seen.add(key);
      uniqueItems.push(item);
    }
  }

  const selectedItems = uniqueItems.slice(0, 8);

  const promptSections = [];

  if (selectedItems.length > 0) {
    promptSections.push(
      "TARGETED DIAGNOSIS:\n" +
        selectedItems
          .map((item, index) => {
            const evidence = item.evidence.length
              ? `\nEvidence: ${item.evidence.join(" | ")}`
              : "";

            return `${index + 1}. ${item.title}\n${item.detail}${evidence}`;
          })
          .join("\n\n")
    );
  }

  promptSections.push(`
REVISION OBJECTIVE:

Generate Version B specifically to address the diagnosed weaknesses above.

Do not rewrite unrelated parts just to make the resume sound different.

Improve the expression of existing experience.

If a weakness requires information that is not present in the original application,
do NOT invent that information. Leave the claim conservative or explain that the
missing information cannot safely be added.

Prioritize:
- clearer project descriptions
- stronger specificity where supported
- clearer technical contribution
- better role alignment using existing facts
- removal of vague or filler language
- removal of redundant wording
- stronger evidence presentation where existing evidence allows it

Do not add:
- metrics
- users
- scale
- technologies
- frameworks
- responsibilities
- outcomes
- deployment platforms
- employers
- certifications
- education
- project functionality
- teamwork claims
- leadership claims

unless they already exist in the original application.

The result must represent the SAME candidate, not a stronger fictional candidate.
`);

  return {
    summary:
      selectedItems.length > 0
        ? `Mirror identified ${selectedItems.length} targeted issue${
            selectedItems.length === 1 ? "" : "s"
          } to address in Version B.`
        : "Mirror found no high-priority targeted issue, so Version B will focus on conservative clarity improvements.",
    items: selectedItems,
    prompt: promptSections.join("\n\n"),
  };
}

function Evidence({ items, accent = false }) {
  if (!items?.length) {
    return null;
  }

  return (
    <div
      className={`mt-4 border-l-2 pl-4 ${
        accent ? "border-(--accent)" : "border-(--line)"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-(--muted)">
        Evidence
      </p>

      <div className="mt-2 space-y-1">
        {items.map((item, index) => (
          <p
            key={`${item}-${index}`}
            className="text-sm italic leading-relaxed"
          >
            &ldquo;{item}&rdquo;
          </p>
        ))}
      </div>
    </div>
  );
}

export default function MirrorTest({
  originalText,
  applicationType,
  role,
  focusAreas,
  jobDescription,
  analysis,
  onBack,
}) {
  const [revisedText, setRevisedText] = useState("");
  const [revision, setRevision] = useState(null);
  const [comparison, setComparison] = useState(null);

  const [revisionLoading, setRevisionLoading] = useState(false);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [error, setError] = useState("");

  const revisionPlan = useMemo(
    () => buildRevisionPlan(analysis),
    [analysis]
  );

  const changed =
    revisedText.trim().length > 0 &&
    revisedText.trim() !== originalText.trim();

  async function handleGenerateRevision() {
    setRevisionLoading(true);
    setError("");
    setComparison(null);

    try {
      const result = await reviseApplication({
        originalText,
        applicationType,
        role,
        jobDescription,
        revisionIntent: revisionPlan.prompt,
      });

      setRevision(result);
      setRevisedText(result.revisedText || "");
    } catch (revisionError) {
      console.error("Mirror revision failed:", revisionError);

      setError(
        revisionError.message ||
          "Mirror could not generate Version B right now."
      );
    } finally {
      setRevisionLoading(false);
    }
  }

  async function handleCompare() {
    if (!changed) {
      setError(
        "Generate Version B or edit it before comparing the two versions."
      );
      return;
    }

    setComparisonLoading(true);
    setError("");
    setComparison(null);

    try {
      const result = await compareApplications({
        originalText,
        revisedText,
        changeIntent: "Diagnosis-driven revision",
        applicationType,
        role,
        focusAreas,
        jobDescription,
      });

      setComparison(result);
    } catch (comparisonError) {
      console.error("Mirror comparison failed:", comparisonError);

      setError(
        comparisonError.message ||
          "Mirror could not complete the comparison right now."
      );
    } finally {
      setComparisonLoading(false);
    }
  }

  function handleEditRevision(event) {
    setRevisedText(event.target.value);
    setComparison(null);

    if (error) {
      setError("");
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
           <div className="mt-8 border-y border-(--line) py-6">
            <p className="text-xs font-medium uppercase tracking-widest text-(--accent)">
              The Mirror Experiment
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-center">
              <div>
              <p className="text-xs uppercase tracking-widest text-(--muted)">
                Version A
              </p>
              <p className="mt-1 font-serif text-xl">
                Original application
              </p>
            </div>

            <span className="hidden text-(--muted) md:block">→</span>

              <div>
                <p className="text-xs uppercase tracking-widest text-(--muted)">
                  Controlled change
                </p>
                <p className="mt-1 font-serif text-xl">
                  Targeted revision
                </p>
              </div>

              <span className="hidden text-(--muted) md:block">→</span>

              <div>
               <p className="text-xs uppercase tracking-widest text-(--muted)">
                  Result
                </p>
                <p className="mt-1 font-serif text-xl">
                Compare the simulated read
                </p>
              </div>
            </div>

  <p className="mt-5 max-w-3xl text-sm leading-relaxed text-(--muted)">
    Same candidate. Same underlying experience. Mirror changes how the
    evidence is presented, then tests what changes in the simulated
    screening read.
  </p>
        </div>
          <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[0.95] tracking-[-0.03em] sm:text-6xl">
  Same candidate. One controlled change.
</h1>

<p className="mt-6 max-w-2xl text-lg leading-relaxed text-(--muted)">
  Mirror carries the diagnosis from The Read into a fact-preserving
  Version B, then tests whether the simulated screening read changes.
</p>
        </header>

        <section className="mt-16 border-t border-(--line) pt-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--accent)">
                01 / Diagnosis
              </p>

              <h2 className="mt-3 font-serif text-3xl">
                Mirror already knows what to target.
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-(--muted)">
                You do not need to guess whether the problem is clarity,
                specificity, or role alignment. Mirror carries the findings
                from The Read into the revision.
              </p>
            </div>

            <span className="shrink-0 text-xs uppercase tracking-[0.14em] text-(--muted)">
              Diagnosis-driven
            </span>
          </div>

          <div className="mt-8 border border-(--line)">
            <div className="border-b border-(--line) px-6 py-5">
              <p className="text-sm leading-relaxed">
                {revisionPlan.summary}
              </p>
            </div>

            {revisionPlan.items.length > 0 ? (
              <div className="divide-y divide-(--line)">
                {revisionPlan.items.map((item, index) => (
                  <article
                    key={`${item.type}-${item.title}-${index}`}
                    className="grid gap-6 p-6 sm:grid-cols-[220px_1fr]"
                  >
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-(--muted)">
                        {String(index + 1).padStart(2, "0")} / {item.type}
                      </p>

                      <h3 className="mt-3 text-base font-medium">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-xs uppercase tracking-widest text-(--accent)">
                        {item.severity}
                      </p>
                    </div>

                    <div>
                      <p className="max-w-2xl text-sm leading-relaxed">
                        {item.detail}
                      </p>

                      <Evidence items={item.evidence} />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="p-6">
                <p className="text-sm leading-relaxed text-(--muted)">
                  No high-priority diagnosis was available. Mirror will make
                  only conservative wording improvements supported by the
                  original application.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-12 border border-(--ink) p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--accent)">
                02 / Generate Controlled Version B
              </p>

              <h2 className="mt-3 font-serif text-3xl">
                 Run the controlled revision.
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-(--muted)">
                Version B targets the findings above using only evidence already
               present in Version A. Mirror then audits the revision to protect
               against invented qualifications.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGenerateRevision}
              disabled={revisionLoading}
              className="shrink-0 border border-(--ink) bg-(--ink) px-7 py-3 text-sm font-medium text-(--paper) transition-colors hover:bg-(--paper) hover:text-(--ink) disabled:cursor-not-allowed disabled:opacity-40"
            >
              {revisionLoading
                ? "Generating Version B…"
                : revision
                  ? "Regenerate Version B"
                  : "Generate Controlled Version B"}
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

        <section className="mt-12 grid gap-6 lg:grid-cols-2">
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
              <div className="h-150 overflow-y-auto border border-(--line) p-5">
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
                Diagnosis-driven revision
              </h2>
            </div>

            <div className="p-6">
              {revisedText ? (
                <textarea
                  value={revisedText}
                  onChange={handleEditRevision}
                  className="h-150 w-full resize-none overflow-y-auto border border-(--line) bg-transparent p-5 text-sm leading-relaxed outline-none transition-colors focus:border-(--ink)"
                  aria-label="Revised application"
                />
              ) : (
                <div className="flex h-150ms-center justify-center border border-dashed border-(--line) p-8 text-center">
                  <div className="max-w-sm">
                    <p className="font-serif text-2xl">
                      Version B is waiting.
                    </p>

                    <p className="mt-3 text-sm leading-relaxed text-(--muted)">
                      Generate it above and Mirror will automatically target
                      the weaknesses it found in The Read.
                    </p>
                  </div>
                </div>
              )}

              {revisedText && (
                <div className="mt-4 flex items-start justify-between gap-6">
                  <p className="max-w-md text-xs leading-relaxed text-(--muted)">
                    You can edit Version B yourself. The comparison will use
                    exactly what is currently in this box.
                  </p>

                  <span className="shrink-0 text-xs text-(--muted)">
                    {revisedText.length} characters
                  </span>
                </div>
              )}
            </div>
          </article>
        </section>

        {revision && (
          <section className="mt-10 border border-(--line)">
            <div className="border-b border-(--line) px-6 py-6">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--muted)">
                03 / What Mirror changed
              </p>

              <h2 className="mt-3 font-serif text-3xl">
                The revision, explained.
              </h2>

              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-(--muted)">
                {revision.summary}
              </p>
            </div>

            {revision.changes?.length > 0 && (
              <div className="divide-y divide-(--line)">
                {revision.changes.map((change, index) => (
                  <article
                    key={`${change.original}-${index}`}
                    className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[220px_1fr]"
                  >
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-(--muted)">
                        {String(index + 1).padStart(2, "0")}
                      </p>

                      <p className="mt-3 text-xs uppercase tracking-[0.12em] text-(--accent)">
                        {change.category}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.12em] text-(--muted)">
                        Why
                      </p>

                      <p className="mt-3 text-sm leading-relaxed">
                        {change.reason}
                      </p>

                      <div className="mt-6 grid gap-6 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-[0.12em] text-(--muted)">
                            Before
                          </p>

                          <p className="mt-3 border-l-2 border-(--line) pl-4 text-sm italic leading-relaxed">
                            &ldquo;{change.original}&rdquo;
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-[0.12em] text-(--muted)">
                            After
                          </p>

                          <p className="mt-3 border-l-2 border-(--accent) pl-4 text-sm italic leading-relaxed">
                            &ldquo;{change.revised}&rdquo;
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {revision.preservedFacts?.length > 0 && (
              <div className="border-t border-(--line) p-6 sm:p-8">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-(--muted)">
                  Preserved facts
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {revision.preservedFacts.map((fact, index) => (
                    <p
                      key={`${fact}-${index}`}
                      className="border border-(--line) p-4 text-sm leading-relaxed"
                    >
                      {fact}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {revision.warnings?.length > 0 && (
              <div className="border-t border-(--line) p-6 sm:p-8">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-(--accent)">
                  Integrity check
                </p>

                <div className="mt-4 space-y-3">
                  {revision.warnings.map((warning, index) => (
                    <p
                      key={`${warning}-${index}`}
                      className="text-sm leading-relaxed text-(--muted)"
                    >
                      {warning}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        <section className="mt-12 border-t border-(--line) pt-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--muted)">
                04 / Compare
              </p>

              <h2 className="mt-3 font-serif text-3xl">
                Did the simulated read change?
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-(--muted)">
                Mirror uses the same evaluation framework for both versions.
                It does not assume that Version B is better simply because it
                was rewritten.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCompare}
              disabled={!changed || comparisonLoading}
              className="border border-(--ink) bg-(--ink) px-7 py-3 text-sm font-medium text-(--paper) transition-colors hover:bg-(--paper) hover:text-(--ink) disabled:cursor-not-allowed disabled:opacity-40"
            >
              {comparisonLoading
                ? "Comparing the two reads…"
                : "Compare the two reads"}
            </button>
          </div>
        </section>

        {comparison && (
          <section className="mt-12 border-t border-(--line) pt-10">
            <div className="border-l-2 border-(--accent) pl-5">
  <p className="text-xs font-medium uppercase tracking-widest text-(--accent)">
    What changed in the read?
  </p>

  <h2 className="mt-3 font-serif text-4xl">
    Same candidate. Different simulated read.
  </h2>

  <p className="mt-5 max-w-3xl text-base leading-relaxed text-(--muted)">
    {comparison.summary}
  </p>

  <p className="mt-4 max-w-3xl text-sm leading-relaxed text-(--muted)">
    The underlying candidate has not changed. This comparison shows how
    changing the presentation of existing evidence affected Mirror&apos;s
    simulated interpretation.
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
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--muted)">
                    Observable changes
                  </p>

                  <p className="mt-2 text-sm text-(--muted)">
                    Controlled variable: Diagnosis-driven revision
                  </p>
                </div>

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

                        {change.originalEvidence?.length > 0 ? (
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

                        {change.revisedEvidence?.length > 0 ? (
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

        <section className="mt-12 border-t border-(--line) pt-10">
          <div className="border border-(--line) p-6">
            <p className="text-sm leading-relaxed text-(--muted)">
              Version B is an educational, fact-preserving rewrite. It should
              improve how existing experience is expressed, not manufacture
              qualifications. Review every generated claim before using it in
              a real application.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}