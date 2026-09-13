import { useState } from "react";
import Header from "../components/Header";

const applicationTypes = [
  "Resume",
  "Cover letter",
  "Interview response",
];

const focusAreas = [
  "Communication",
  "Experience",
  "Role alignment",
  "Potential screening risks",
];

export default function Input({ onContinue }) {
  const [text, setText] = useState("");
  const [applicationType, setApplicationType] = useState("Resume");
  const [role, setRole] = useState("");
  const [selectedFocus, setSelectedFocus] = useState(focusAreas);

  const [error, setError] = useState("");

  function toggleFocus(area) {
    setSelectedFocus((current) =>
      current.includes(area)
        ? current.filter((item) => item !== area)
        : [...current, area]
    );
  }

  function handleContinue() {
    if (!text.trim()) {
      setError("Paste some application text before continuing.");
      return;
    }

    setError("");

    onContinue({
      text: text.trim(),
      applicationType,
      role: role.trim(),
      focusAreas: selectedFocus,
    });
  }

  return (
    <div className="min-h-screen bg-(--paper) text-(--ink)">
      <Header />

      <main className="mx-auto max-w-5xl px-6 py-16 sm:px-10 lg:px-16">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.16em] text-(--accent)">
            Mirror check
          </p>

          <h1 className="font-serif text-5xl leading-[0.95] tracking-[-0.03em] sm:text-6xl">
            Show us what the system will read.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-(--muted)">
            Give Mirror enough context to examine the language, experience,
            and signals that an automated hiring system might encounter.
          </p>
        </div>

        <div className="mt-16 border-t border-(--line)">
          <div className="grid border-b border-(--line) py-8 lg:grid-cols-[220px_1fr] lg:gap-12">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--muted)">
                01 / Application type
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 lg:mt-0">
              {applicationTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setApplicationType(type)}
                  className={`border px-4 py-2 text-sm transition-colors ${
                    applicationType === type
                      ? "border-(--ink) bg-(--ink) text-(--paper)"
                      : "border-(--line) hover:border-(--ink)"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid border-b border-(--line) py-8 lg:grid-cols-[220px_1fr] lg:gap-12">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--muted)">
                02 / Target role
              </p>
            </div>

            <div className="mt-5 lg:mt-0">
              <input
                type="text"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                placeholder="e.g. Frontend Developer"
                className="w-full border-b border-(--line) bg-transparent py-3 text-lg outline-none transition-colors placeholder:text-(--muted) focus:border-(--ink)"
                aria-label="Target role"
              />

              <p className="mt-3 text-xs text-(--muted)">
                Optional, but it helps Mirror evaluate role alignment.
              </p>
            </div>
          </div>

          <div className="grid border-b border-(--line) py-8 lg:grid-cols-[220px_1fr] lg:gap-12">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--muted)">
                03 / Focus
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:mt-0">
              {focusAreas.map((area) => {
                const selected = selectedFocus.includes(area);

                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleFocus(area)}
                    className={`flex items-center justify-between border p-4 text-left text-sm transition-colors ${
                      selected
                        ? "border-(--ink)"
                        : "border-(--line) text-(--muted)"
                    }`}
                  >
                    <span>{area}</span>

                    <span className="text-xs">
                      {selected ? "Selected" : "Add"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="py-8">
            <div className="grid lg:grid-cols-[220px_1fr] lg:gap-12">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--muted)">
                  04 / Your application
                </p>
              </div>

              <div className="mt-5 lg:mt-0">
                <textarea
                  value={text}
                  onChange={(event) => {
                    setText(event.target.value);

                    if (error) {
                      setError("");
                    }
                  }}
                  className="min-h-96 w-full resize-y border border-(--line) bg-transparent p-5 text-base leading-relaxed outline-none transition-colors focus:border-(--ink)"
                  placeholder="Paste your resume, cover letter, or interview response here..."
                  aria-label="Application text"
                />

                <div className="mt-3 flex items-start justify-between gap-6">
                  <p className="max-w-md text-xs leading-relaxed text-(--muted)">
                    Mirror examines the text you provide. It does not know
                    your employer&apos;s actual screening model.
                  </p>

                  <p className="shrink-0 text-xs text-(--muted)">
                    {text.length} characters
                  </p>
                </div>

                {error && (
                  <p className="mt-4 text-sm text-(--accent)" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleContinue}
                  className="mt-8 border border-(--ink) bg-(--ink) px-7 py-3 text-sm font-medium text-(--paper) transition-colors hover:bg-(--paper) hover:text-(--ink)"
                >
                  Run the Mirror
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}