import { useState } from "react";
import Header from "../components/Header";

export default function Input({ onContinue }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  function handleContinue() {
    if (!text.trim()) {
      setError("Paste some application text before continuing.");
      return;
    }

    setError("");
    onContinue(text);
  }

  return (
    <div className="min-h-screen bg-(--paper) text-(--ink)">
      <Header />

      <main className="mx-auto max-w-3xl px-6 py-16 sm:px-10 lg:px-16">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.16em] text-(--accent)">
          Mirror check
        </p>

        <h1 className="font-serif text-5xl leading-[0.95] tracking-[-0.03em] sm:text-6xl">
          What are you applying with?
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-(--muted)">
          Paste the text you want Mirror to examine. Start with a resume,
          cover letter, or interview response.
        </p>

        <textarea
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            if (error) {
              setError("");
            }
          }}
          className="mt-10 min-h-80 w-full resize-y border border-(--line) bg-transparent p-5 text-base leading-relaxed outline-none transition-colors focus:border-(--ink)"
          placeholder="Paste your application text here..."
          aria-label="Application text"
        />

        {error && (
          <p className="mt-3 text-sm text-(--accent)" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleContinue}
          className="mt-6 border border-(--ink) bg-(--ink) px-6 py-3 text-sm font-medium text-(--paper) transition-colors hover:bg-(--paper) hover:text-(--ink)"
        >
          Continue
        </button>

        <p className="mt-5 max-w-md text-xs leading-relaxed text-(--muted)">
          Your text stays in this browser for now. AI analysis will be added
          in the next stage.
        </p>
      </main>
    </div>
  );
}