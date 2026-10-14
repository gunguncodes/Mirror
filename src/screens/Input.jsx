
import { useState } from "react";
import Header from "../components/Header";

import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth/mammoth.browser";
import { createWorker } from "tesseract.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

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

const allowedTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/png",
  "image/jpeg",
  "image/webp",
];

export default function Input({ onContinue }) {
  const [text, setText] = useState("");
  const [applicationType, setApplicationType] = useState("Resume");
  const [role, setRole] = useState("");
  const [selectedFocus, setSelectedFocus] = useState(focusAreas);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  function toggleFocus(area) {
    setSelectedFocus((current) =>
      current.includes(area)
        ? current.filter((item) => item !== area)
        : [...current, area]
    );
  }

  async function handleFileUpload(event) {
    const input = event.target;
    const file = input.files?.[0];

    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      setError("Upload a PDF, DOCX, TXT, PNG, JPG, or WebP file.");
      input.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("The file must be smaller than 10 MB.");
      input.value = "";
      return;
    }

    setUploading(true);
    setError("");

    try {
      let extractedText = "";

      if (file.type === "application/pdf") {
        const pdf = await pdfjsLib.getDocument({
          data: await file.arrayBuffer(),
        }).promise;

        const pages = [];

        for (
          let pageNumber = 1;
          pageNumber <= pdf.numPages;
          pageNumber++
        ) {
          const page = await pdf.getPage(pageNumber);
          const content = await page.getTextContent();

          pages.push(
            content.items
              .map((item) => ("str" in item ? item.str : ""))
              .join(" ")
          );
        }

        extractedText = pages.join("\n\n");
      } else if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const result = await mammoth.extractRawText({
          arrayBuffer: await file.arrayBuffer(),
        });

        extractedText = result.value;
      } else if (file.type === "text/plain") {
        extractedText = await file.text();
      } else if (file.type.startsWith("image/")) {
        const worker = await createWorker("eng");

        try {
          const result = await worker.recognize(file);
          extractedText = result.data.text;
        } finally {
          await worker.terminate();
        }
      }

      if (!extractedText.trim()) {
        throw new Error(
          "No readable text found. Try a clearer image or a text-based PDF."
        );
      }

      setText(extractedText.trim());
      setFileName(file.name);
      setError("");
    } catch (err) {
      setError(
        err.message || "Could not read this file. Please try another."
      );
    } finally {
      setUploading(false);
      input.value = "";
    }
  }

  function handleContinue() {
    if (!text.trim()) {
      setError("Upload a file or paste your application text first.");
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
          {/* 01 — Application type */}
          <section className="grid border-b border-(--line) py-8 lg:grid-cols-[220px_1fr] lg:gap-12">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--muted)">
              01 / Application type
            </p>

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
          </section>

          {/* 02 — Target role */}
          <section className="grid border-b border-(--line) py-8 lg:grid-cols-[220px_1fr] lg:gap-12">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--muted)">
              02 / Target role
            </p>

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
          </section>

          {/* 03 — Focus */}
          <section className="grid border-b border-(--line) py-8 lg:grid-cols-[220px_1fr] lg:gap-12">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--muted)">
              03 / Focus
            </p>

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
          </section>

          {/* 04 — Your application */}
          <section className="grid py-8 lg:grid-cols-[220px_1fr] lg:gap-12">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-(--muted)">
              04 / Your application
            </p>

            <div className="mt-5 lg:mt-0">
              {/* Upload belongs here, inside section 04 */}
              <div className="mb-6 border border-(--line) p-5">
                <label
                  htmlFor="application-file"
                  className="block text-sm font-medium"
                >
                  Upload your application
                </label>

                <p className="mt-2 text-xs leading-relaxed text-(--muted)">
                  PDF, DOCX, TXT, PNG, JPG, or WebP · Maximum 10 MB
                </p>

                <input
                  id="application-file"
                  type="file"
                  accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="mt-4 block w-full text-sm file:mr-4 file:border file:border-(--line) file:bg-transparent file:px-4 file:py-2 file:text-sm file:font-medium hover:file:border-(--ink) disabled:opacity-50"
                />

                {uploading && (
                  <p className="mt-3 text-sm text-(--muted)" role="status">
                    Reading your file...
                  </p>
                )}

                {fileName && !uploading && (
                  <p className="mt-3 text-xs text-(--muted)">
                    Loaded: {fileName}
                  </p>
                )}

                <p className="mt-3 text-xs text-(--muted)">
                  Or paste your application below.
                </p>
              </div>

              <textarea
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                  setFileName("");

                  if (error) setError("");
                }}
                disabled={uploading}
                className="min-h-96 w-full resize-y border border-(--line) bg-transparent p-5 text-base leading-relaxed outline-none transition-colors focus:border-(--ink) disabled:opacity-60"
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
                disabled={uploading}
                className="mt-8 border border-(--ink) bg-(--ink) px-7 py-3 text-sm font-medium text-(--paper) transition-colors hover:bg-(--paper) hover:text-(--ink) disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading ? "Reading file..." : "Run the Mirror"}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
