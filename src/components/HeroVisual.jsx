export default function HeroVisual() {
  return (
    <aside className="relative hidden min-h-115 lg:block">
      <div className="absolute inset-6 border border-(--line)" />

      <div className="absolute left-0 top-10 w-[82%] border border-(--line) bg-(--paper) p-6">
        <div className="flex items-center justify-between border-b border-(--line) pb-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--muted)">
            Candidate profile
          </p>

          <span className="text-xs text-(--muted)">
            Version A
          </span>
        </div>

        <div className="mt-6 space-y-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-(--muted)">
              Experience
            </p>
            <p className="mt-1">
              Frontend development · React · JavaScript
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-(--muted)">
              Communication
            </p>
            <p className="mt-1">
              Collaborative, thoughtful, detail-oriented
            </p>
          </div>
        </div>
      </div>

      <div className="absolute right-0 top-0 w-64 border border-(--ink) bg-(--paper) p-6">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--muted)">
          Simulated read
        </p>

        <div className="mt-8">
          <div className="flex items-end justify-between">
            <span className="text-sm">
              Screening signal
            </span>

            <span className="font-serif text-4xl">
              68
            </span>
          </div>

          <div className="mt-4 h-px w-full bg-(--line)">
            <div className="h-px w-[68%] bg-(--accent)" />
          </div>
        </div>

        <div className="mt-8 space-y-4 text-sm">
          <div className="flex justify-between border-b border-(--line) pb-3">
            <span>Experience</span>
            <span>strong</span>
          </div>

          <div className="flex justify-between border-b border-(--line) pb-3">
            <span>Language</span>
            <span>mixed</span>
          </div>

          <div className="flex justify-between border-b border-(--line) pb-3">
            <span>Disclosure</span>
            <span>flagged</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-2 left-10 max-w-sm">
        <p className="font-serif text-4xl leading-[1.05]">
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