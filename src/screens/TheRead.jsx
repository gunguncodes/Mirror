import { useEffect, useState } from "react";
import Header from "../components/Header";
import { evaluateApplication } from "../services/evaluateApplication";

function SectionLabel({ children, accent = false }) {
  return (
    <p
      className={`text-xs font-medium uppercase tracking-[0.16em] ${
        accent ? "text-(--accent)" : "text-(--muted)"
      }`}
    >
      {children}
    </p>
  );
}

function EvidenceList({ items, accent = false }) {
  if (!items?.length) {
    return (
      <p className="mt-3 text-sm text-(--muted)">
        No direct evidence was cited.
      </p>
    );
  }

  return (
    <div
      className={`mt-3 space-y-2 border-l-2 pl-4 ${
        accent ? "border-(--accent)" : "border-(--line)"
      }`}
    >
      {items.map((item, index) => (
        <p
          key={`${item}-${index}`}
          className="text-sm italic leading-relaxed"
        >
          &ldquo;{item}&rdquo;
        </p>
      ))}
    </div>
  );
}

function StatusBadge({ children }) {
  return (
    <span className="inline-block border border-(--line) px-3 py-1.5 text-xs">
      {children}
    </span>
  );
}

export default function TheRead({
  applicationText,
  applicationType,
  role,
  focusAreas,
  jobDescription,
  onOpenMirrorTest,
  onAnalysisComplete,
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
        jobDescription,
        });

        if (!cancelled) {
          setEvaluation(result);
          onAnalysisComplete?.(result);
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
        <header className="max-w-4xl">
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

          <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[0.95] tracking-[-0.03em] sm:text-6xl">
            Here&apos;s how the application might be read.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-(--muted)">
            Mirror examines the application from a recruiter perspective and
            through observable screening signals. Every important finding is
            grounded in the text you supplied.
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
                  Building the recruiter, ATS, language, project, and evidence
                  read.
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
            <SectionLabel accent>Evaluation unavailable</SectionLabel>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed">
              {error}
            </p>

            <p className="mt-4 max-w-2xl text-xs leading-relaxed text-(--muted)">
              Make sure the Mirror API is running with{" "}
              <code className="font-mono">node server.js</code>, then refresh and
              try again.
            </p>
          </section>
        )}

        {evaluation && (
          <>
            {/* 01 — Executive read */}
            <section className="mt-16">
              <div className="border-t border-(--ink) pt-6">
                <SectionLabel accent>01 / Executive read</SectionLabel>

                <div className="mt-6 grid gap-10 lg:grid-cols-[0.55fr_1.45fr]">
                  <div className="border border-(--ink) p-7">
                    <SectionLabel>Simulated screening signal</SectionLabel>

                    <div className="mt-5 flex items-end gap-3">
                      <span className="font-serif text-8xl leading-none">
                        {evaluation.score}
                      </span>

                      <span className="mb-2 text-sm text-(--muted)">
                        / 100
                      </span>
                    </div>

                    <div className="mt-7 border-t border-(--line) pt-5">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm text-(--muted)">
                          Simulation confidence
                        </p>

                        <p className="text-sm font-medium">
                          {evaluation.confidence}
                        </p>
                      </div>

                      <p className="mt-4 text-xs leading-relaxed text-(--muted)">
                        This is a simulated screening signal, not an
                        employability score or prediction of a hiring outcome.
                      </p>
                    </div>
                  </div>

                  <div className="border border-(--line) p-7">
                    <SectionLabel>Candidate positioning</SectionLabel>

                    <p className="mt-5 max-w-3xl font-serif text-3xl leading-tight">
                      {evaluation.candidatePositioning}
                    </p>

                    <div className="mt-8 border-t border-(--line) pt-6">
                      <SectionLabel>Overall read</SectionLabel>

                      <p className="mt-4 max-w-3xl text-base leading-relaxed">
                        {evaluation.overallReasoning}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 02 — Recruiter */}
            <section className="mt-16">
              <div className="border-t border-(--line) pt-6">
                <SectionLabel>02 / Recruiter read</SectionLabel>

                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                  <article className="border border-(--line) p-6 lg:col-span-1">
                    <SectionLabel>10-second read</SectionLabel>

                    <p className="mt-5 text-base leading-relaxed">
                      {evaluation.recruiterRead?.tenSecondRead}
                    </p>
                  </article>

                  <article className="border border-(--line) p-6">
                    <SectionLabel>What keeps reading</SectionLabel>

                    <div className="mt-5 space-y-4">
                      {evaluation.recruiterRead?.whatKeepsReading?.map(
                        (item, index) => (
                          <div
                            key={`${item}-${index}`}
                            className="border-t border-(--line) pt-4 first:border-t-0 first:pt-0"
                          >
                            <p className="text-sm leading-relaxed">{item}</p>
                          </div>
                        )
                      )}
                    </div>
                  </article>

                  <article className="border border-(--line) p-6">
                    <SectionLabel accent>What creates concern</SectionLabel>

                    <div className="mt-5 space-y-4">
                      {evaluation.recruiterRead?.whatCreatesConcern?.map(
                        (item, index) => (
                          <div
                            key={`${item}-${index}`}
                            className="border-t border-(--line) pt-4 first:border-t-0 first:pt-0"
                          >
                            <p className="text-sm leading-relaxed">{item}</p>
                          </div>
                        )
                      )}
                    </div>
                  </article>
                </div>
              </div>
            </section>

            {/* 03 — Strengths / weaknesses */}
            <section className="mt-16">
              <div className="border-t border-(--line) pt-6">
                <SectionLabel>03 / Evidence check</SectionLabel>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <article className="border border-(--line)">
                    <div className="border-b border-(--line) px-6 py-5">
                      <SectionLabel>Strengths</SectionLabel>
                    </div>

                    <div className="divide-y divide-(--line)">
                      {evaluation.strengths?.map((item, index) => (
                        <article
                          key={`${item.title}-${index}`}
                          className="p-6"
                        >
                          <h2 className="text-base font-medium">
                            {item.title}
                          </h2>

                          <p className="mt-3 text-sm leading-relaxed">
                            {item.explanation}
                          </p>

                          <div className="mt-5">
                            <SectionLabel>Evidence</SectionLabel>
                            <EvidenceList items={item.evidence} accent />
                          </div>
                        </article>
                      ))}
                    </div>
                  </article>

                  <article className="border border-(--line)">
                    <div className="border-b border-(--line) px-6 py-5">
                      <SectionLabel accent>Weaknesses</SectionLabel>
                    </div>

                    <div className="divide-y divide-(--line)">
                      {evaluation.weaknesses?.map((item, index) => (
                        <article
                          key={`${item.title}-${index}`}
                          className="p-6"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <h2 className="text-base font-medium">
                              {item.title}
                            </h2>

                            <StatusBadge>{item.severity}</StatusBadge>
                          </div>

                          <p className="mt-3 text-sm leading-relaxed">
                            {item.explanation}
                          </p>

                          <div className="mt-5">
                            <SectionLabel>Evidence</SectionLabel>
                            <EvidenceList items={item.evidence} />
                          </div>
                        </article>
                      ))}
                    </div>
                  </article>
                </div>
              </div>
            </section>

            {/* 04 — ATS */}
            <section className="mt-16">
              <div className="border-t border-(--line) pt-6">
                <SectionLabel>04 / ATS & screening read</SectionLabel>

                <div className="mt-6 border border-(--line)">
                  <div className="grid gap-8 border-b border-(--line) p-6 lg:grid-cols-[0.7fr_1.3fr]">
                    <div>
                      <SectionLabel>Role match</SectionLabel>

                      <p className="mt-4 font-serif text-3xl leading-tight">
                        {evaluation.atsAnalysis?.estimatedRoleMatch}
                      </p>
                    </div>

                    <div>
                      <SectionLabel>ATS summary</SectionLabel>

                      <p className="mt-4 text-sm leading-relaxed">
                        {evaluation.atsAnalysis?.atsSummary}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-0 lg:grid-cols-2">
                    <div className="border-b border-(--line) lg:border-b-0 lg:border-r">
                      <div className="border-b border-(--line) px-6 py-5">
                        <SectionLabel>Keyword coverage</SectionLabel>
                      </div>

                      <div className="divide-y divide-(--line)">
                        {evaluation.atsAnalysis?.keywordCoverage?.map(
                          (item, index) => (
                            <article
                              key={`${item.keyword}-${index}`}
                              className="p-5"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <p className="text-sm font-medium">
                                  {item.keyword}
                                </p>

                                <StatusBadge>{item.status}</StatusBadge>
                              </div>

                              <p className="mt-3 text-xs leading-relaxed text-(--muted)">
                                {item.explanation}
                              </p>
                            </article>
                          )
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="border-b border-(--line) px-6 py-5">
                        <SectionLabel>Potential ATS risks</SectionLabel>
                      </div>

                      <div className="divide-y divide-(--line)">
                        {evaluation.atsAnalysis?.formattingRisks?.map(
                          (item, index) => (
                            <article
                              key={`${item.issue}-${index}`}
                              className="p-5"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <p className="text-sm font-medium">
                                  {item.issue}
                                </p>

                                <StatusBadge>{item.severity}</StatusBadge>
                              </div>

                              <p className="mt-3 text-sm leading-relaxed">
                                {item.explanation}
                              </p>

                              <p className="mt-4 text-xs leading-relaxed text-(--muted)">
                                <span className="font-medium text-(--ink)">
                                  Fix:
                                </span>{" "}
                                {item.fix}
                              </p>
                            </article>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-(--muted)">
                  ATS observations are based on the application text supplied
                  to Mirror. Mirror cannot inspect visual PDF formatting,
                  columns, text boxes, fonts, or parsing behavior unless that
                  information is actually available.
                </p>
              </div>
            </section>

            {/* 05 — Projects */}
            <section className="mt-16">
              <div className="border-t border-(--line) pt-6">
                <SectionLabel>05 / Project investigation</SectionLabel>

                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-(--muted)">
                  A project name alone does not demonstrate technical depth.
                  Mirror looks at what the application actually explains.
                </p>

                <div className="mt-6 divide-y divide-(--line) border border-(--line)">
                  {evaluation.projectAnalysis?.map((project, index) => (
                    <article
                      key={`${project.projectName}-${index}`}
                      className="p-6 sm:p-8"
                    >
                      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--muted)">
                            Project {String(index + 1).padStart(2, "0")}
                          </p>

                          <h2 className="mt-3 font-serif text-2xl leading-tight">
                            {project.projectName}
                          </h2>
                        </div>

                        <div>
                          <p className="text-sm leading-relaxed">
                            {project.assessment}
                          </p>

                          <div className="mt-7 grid gap-6 sm:grid-cols-2">
                            <div>
                              <SectionLabel>Strongest evidence</SectionLabel>
                              <EvidenceList
                                items={project.strongestEvidence}
                                accent
                              />
                            </div>

                            <div>
                              <SectionLabel>Weakest evidence</SectionLabel>
                              <EvidenceList
                                items={project.weakestEvidence}
                              />
                            </div>
                          </div>

                          <div className="mt-7 border-l-2 border-(--accent) pl-5">
                            <SectionLabel accent>
                              Recommended change
                            </SectionLabel>

                            <p className="mt-3 text-sm leading-relaxed">
                              {project.recommendedChange}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            {/* 06 — AI language */}
            <section className="mt-16">
              <div className="border-t border-(--line) pt-6">
                <SectionLabel>06 / Language audit</SectionLabel>

                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-(--muted)">
                  Mirror does not claim that text was written by AI. It flags
                  wording that is vague, generic, inflated, repetitive, or
                  unnecessarily abstract.
                </p>

                <div className="mt-6 divide-y divide-(--line) border border-(--line)">
                  {evaluation.aiLanguageAudit?.length > 0 ? (
                    evaluation.aiLanguageAudit.map((item, index) => (
                      <article
                        key={`${item.original}-${index}`}
                        className="grid gap-6 p-6 sm:grid-cols-[260px_1fr]"
                      >
                        <div>
                          <SectionLabel>Flagged wording</SectionLabel>

                          <p className="mt-4 text-sm italic leading-relaxed">
                            &ldquo;{item.original}&rdquo;
                          </p>
                        </div>

                        <div>
                          <p className="text-sm leading-relaxed">
                            {item.problem}
                          </p>

                          <div className="mt-5">
                            <SectionLabel>Why it may hurt</SectionLabel>

                            <p className="mt-3 text-sm leading-relaxed">
                              {item.whyItHurts}
                            </p>
                          </div>

                          <div className="mt-5">
                            <SectionLabel>Rewrite direction</SectionLabel>

                            <p className="mt-3 text-sm leading-relaxed text-(--muted)">
                              {item.suggestedDirection}
                            </p>
                          </div>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="p-6">
                      <p className="text-sm text-(--muted)">
                        Mirror did not identify high-value language concerns.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 07 — Skills */}
            <section className="mt-16">
              <div className="border-t border-(--line) pt-6">
                <SectionLabel>07 / Skills credibility</SectionLabel>

                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <article className="border border-(--line) p-5">
                    <SectionLabel>Supported</SectionLabel>

                    <div className="mt-4 space-y-3">
                      {evaluation.skillsAnalysis?.supported?.map(
                        (skill, index) => (
                          <p
                            key={`${skill}-${index}`}
                            className="text-sm leading-relaxed"
                          >
                            {skill}
                          </p>
                        )
                      )}
                    </div>
                  </article>

                  <article className="border border-(--line) p-5">
                    <SectionLabel>Weakly supported</SectionLabel>

                    <div className="mt-4 space-y-3">
                      {evaluation.skillsAnalysis?.weaklySupported?.map(
                        (skill, index) => (
                          <p
                            key={`${skill}-${index}`}
                            className="text-sm leading-relaxed"
                          >
                            {skill}
                          </p>
                        )
                      )}
                    </div>
                  </article>

                  <article className="border border-(--line) p-5">
                    <SectionLabel accent>
                      Reconsider
                    </SectionLabel>

                    <div className="mt-4 space-y-3">
                      {evaluation.skillsAnalysis?.removeOrReconsider?.map(
                        (skill, index) => (
                          <p
                            key={`${skill}-${index}`}
                            className="text-sm leading-relaxed"
                          >
                            {skill}
                          </p>
                        )
                      )}
                    </div>
                  </article>

                  <article className="border border-(--line) p-5">
                    <SectionLabel>Missing for role</SectionLabel>

                    <div className="mt-4 space-y-3">
                      {evaluation.skillsAnalysis?.missingForRole?.map(
                        (skill, index) => (
                          <p
                            key={`${skill}-${index}`}
                            className="text-sm leading-relaxed"
                          >
                            {skill}
                          </p>
                        )
                      )}
                    </div>
                  </article>
                </div>
              </div>
            </section>

            {/* 08 — Interview defensibility */}
            <section className="mt-16">
              <div className="border-t border-(--line) pt-6">
                <SectionLabel>08 / Interview defensibility</SectionLabel>

                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-(--muted)">
                  Anything you put on a resume can become an interview
                  question. Mirror surfaces claims that may need stronger
                  preparation.
                </p>

                <div className="mt-6 divide-y divide-(--line) border border-(--line)">
                  {evaluation.interviewDefensibility?.map((item, index) => (
                    <article
                      key={`${item.claim}-${index}`}
                      className="grid gap-6 p-6 sm:grid-cols-[1fr_1fr_100px]"
                    >
                      <div>
                        <SectionLabel>Resume claim</SectionLabel>

                        <p className="mt-3 text-sm leading-relaxed">
                          {item.claim}
                        </p>
                      </div>

                      <div>
                        <SectionLabel>Likely question</SectionLabel>

                        <p className="mt-3 text-sm leading-relaxed">
                          {item.question}
                        </p>
                      </div>

                      <div>
                        <SectionLabel>Risk</SectionLabel>

                        <p className="mt-3 text-sm font-medium">
                          {item.risk}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            {/* 09 — Signals */}
            <section className="mt-16">
              <div className="border-t border-(--line) pt-6">
                <SectionLabel>09 / Simulated screening signals</SectionLabel>

                <div className="mt-6 divide-y divide-(--line) border border-(--line)">
                  {evaluation.signals?.map((signal, index) => (
                    <article
                      key={`${signal.category}-${index}`}
                      className="grid gap-6 p-6 sm:grid-cols-[220px_1fr]"
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
                        <p className="max-w-3xl text-sm leading-relaxed">
                          {signal.explanation}
                        </p>

                        <div className="mt-5">
                          <SectionLabel>Evidence</SectionLabel>
                          <EvidenceList items={signal.quotes} />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            {/* 10 — Action */}
            <section className="mt-16">
              <div className="border border-(--ink)">
                <div className="border-b border-(--line) px-6 py-7 sm:px-8">
                  <SectionLabel accent>10 / What to change</SectionLabel>

                  <h2 className="mt-3 font-serif text-4xl">
                    Turn the diagnosis into a revision.
                  </h2>

                  <p className="mt-4 max-w-3xl text-sm leading-relaxed text-(--muted)">
                    Mirror identifies changes you can control: clearer
                    evidence, stronger specificity, better role alignment,
                    and more defensible wording.
                  </p>
                </div>

                <div className="divide-y divide-(--line)">
                  {evaluation.recommendations?.map(
                    (recommendation, index) => (
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
                                <SectionLabel>Evidence</SectionLabel>
                                <EvidenceList
                                  items={recommendation.evidence}
                                />
                              </div>
                            )}

                            <div className="mt-6">
                              <SectionLabel>Why it matters</SectionLabel>

                              <p className="mt-3 max-w-3xl text-sm leading-relaxed">
                                {recommendation.whyItMatters}
                              </p>
                            </div>

                            <div className="mt-6">
                              <SectionLabel>Action</SectionLabel>

                              <p className="mt-3 max-w-3xl text-sm leading-relaxed">
                                {recommendation.action}
                              </p>
                            </div>

                            {recommendation.suggestedRevision && (
                              <div className="mt-6 border border-(--line) p-5">
                                <SectionLabel>
                                  Possible revision
                                </SectionLabel>

                                <p className="mt-3 text-sm leading-relaxed">
                                  {recommendation.suggestedRevision}
                                </p>

                                <p className="mt-4 text-xs leading-relaxed text-(--muted)">
                                  Use this only if it accurately represents
                                  the candidate&apos;s real experience.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    )
                  )}
                </div>
              </div>
            </section>

            {/* 11 — Mirror Test */}
            {/* 11 — Mirror Experiment */}
<section className="mt-16 border border-(--ink)">
  <div className="border-b border-(--line) p-8 sm:p-10">
    <SectionLabel accent>11 / The Mirror experiment</SectionLabel>

    <h2 className="mt-3 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl">
      Don&apos;t just rewrite it. Test what changes.
    </h2>

    <p className="mt-5 max-w-3xl text-sm leading-relaxed text-(--muted)">
      Mirror found specific weaknesses in this application. It can use those
      findings to create a controlled Version B without inventing new
      qualifications, experience, or outcomes.
    </p>
  </div>

  <div className="grid divide-y divide-(--line) sm:grid-cols-3 sm:divide-x sm:divide-y-0">
    <div className="p-6 sm:p-7">
      <p className="text-xs font-medium uppercase tracking-widest text-(--accent)">
        01
      </p>

      <h3 className="mt-3 text-base font-medium">
        Read
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-(--muted)">
        Start with the original application and its simulated screening read.
      </p>
    </div>

    <div className="p-6 sm:p-7">
      <p className="text-xs font-medium uppercase tracking-widest text-(--accent)">
        02
      </p>

      <h3 className="mt-3 text-base font-medium">
        Controlled change
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-(--muted)">
        Generate a targeted Version B using the weaknesses Mirror identified.
      </p>
    </div>

    <div className="p-6 sm:p-7">
      <p className="text-xs font-medium uppercase tracking-widest text-(--accent)">
        03
      </p>

      <h3 className="mt-3 text-base font-medium">
        Compare
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-(--muted)">
        See what changed in the simulated read — not just in the wording.
      </p>
    </div>
  </div>

  <div className="flex flex-col gap-5 border-t border-(--line) p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
    <div>
      <p className="font-serif text-2xl">
        Same candidate. One controlled change.
      </p>

      <p className="mt-2 max-w-xl text-xs leading-relaxed text-(--muted)">
        The experiment compares the original application with a
        fact-preserving revision under the same simulated framework.
      </p>
    </div>

    <button
      type="button"
      onClick={onOpenMirrorTest}
      className="shrink-0 border border-(--ink) bg-(--ink) px-7 py-3 text-sm font-medium text-(--paper) transition-colors hover:bg-(--paper) hover:text-(--ink)"
    >
      Run the Mirror experiment →
    </button>
  </div>
</section>

            {/* Disclaimer */}
            <section className="mt-12 grid gap-8 border-t border-(--line) pt-10 lg:grid-cols-2">
              <div>
                <SectionLabel>What this means</SectionLabel>

                <div className="mt-5 border border-(--line) p-6">
                  <p className="text-sm leading-relaxed text-(--muted)">
                    {evaluation.disclaimer}
                  </p>

                  <p className="mt-5 text-sm leading-relaxed">
                    Disability status or disclosure should never be treated as
                    something a candidate is required to hide.
                  </p>
                </div>
              </div>

              <div className="border-l-2 border-(--accent) pl-5">
                <p className="text-sm leading-relaxed">
                  Educational simulation only. Mirror does not predict hiring
                  outcomes, determine employability, or represent the actual
                  screening system used by an employer.
                </p>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}