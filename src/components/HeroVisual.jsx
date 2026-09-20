export default function HeroVisual() {
  return (
    <aside className="relative hidden min-h-130 lg:block">
      {/* Candidate profile */}
      <div className="absolute left-0 top-8 w-[58%] border border-(--line) bg-(--paper) p-6">
        <div className="flex items-center justify-between border-b border-(--line) pb-4">
          <p className="text-xs font-medium uppercase tracking-widest text-(--muted)">
            Candidate profile
          </p>

          <span className="text-xs text-(--muted)">
            Version A
          </span>
        </div>

        <div className="mt-6 space-y-5 text-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-(--muted)">
              Experience
            </p>

            <p className="mt-1 leading-relaxed">
              Frontend development · React · JavaScript
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-(--muted)">
              Communication
            </p>

            <p className="mt-1 leading-relaxed">
              Collaborative, thoughtful, detail-oriented
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-(--muted)">
              Education
            </p>

            <p className="mt-1 leading-relaxed">
              B.Tech · Computer Science
            </p>
          </div>
        </div>
      </div>

      {/* Simulated read */}
      <div className="absolute right-0 top-0 z-10 w-[44%] border border-(--ink) bg-(--paper) p-6">
        <p className="text-xs font-medium uppercase tracking-widest text-(--muted)">
          Simulated read
        </p>

        <div className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <span className="text-sm">
              Screening signal
            </span>

            <span className="font-serif text-4xl leading-none">
              68
            </span>
          </div>

          <div className="mt-4 h-px w-full bg-(--line)">
            <div className="h-px w-[68%] bg-(--accent)" />
          </div>
        </div>

        <div className="mt-8 space-y-4 text-sm">
          <div className="flex items-center justify-between gap-4 border-b border-(--line) pb-3">
            <span>Experience</span>
            <span>strong</span>
          </div>

          <div className="flex items-center justify-between gap-4 border-b border-(--line) pb-3">
            <span>Language</span>
            <span>mixed</span>
          </div>

          <div className="flex items-center justify-between gap-4 border-b border-(--line) pb-3">
            <span>Disclosure</span>
            <span>flagged</span>
          </div>
        </div>

        <p className="mt-6 border-l-2 border-(--accent) pl-3 text-xs leading-relaxed text-(--muted)">
          A simulated interpretation, not a real employer&apos;s decision.
        </p>
      </div>

      {/* Product statement */}
      <div className="absolute bottom-2 left-0 max-w-[58%]">
        <p className="font-serif text-4xl leading-[1.05] tracking-tight">
          Same candidate.
          <br />
          Different read.
        </p>

        <div className="mt-5 h-px w-20 bg-(--accent)" />

        <p className="mt-4 max-w-xs text-xs leading-relaxed text-(--muted)">
          Mirror makes the hidden screening signals visible before they
          become someone else&apos;s decision.
        </p>
      </div>
    </aside>
  );
}