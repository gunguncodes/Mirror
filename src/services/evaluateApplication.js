export function evaluateApplication(text) {
  const normalizedText = text.toLowerCase();

  const signals = [];

  const experienceKeywords = [
    "experience",
    "years",
    "built",
    "developed",
    "managed",
    "led",
    "worked",
  ];

  const directLanguageKeywords = [
    "developed",
    "built",
    "created",
    "improved",
    "increased",
    "reduced",
    "delivered",
  ];

  const hedgingKeywords = [
    "i think",
    "i believe",
    "i feel",
    "maybe",
    "perhaps",
    "hopefully",
    "i would say",
    "i try to",
  ];

  const hasExperience = experienceKeywords.some((keyword) =>
    normalizedText.includes(keyword)
  );

  const directLanguageCount = directLanguageKeywords.filter((keyword) =>
    normalizedText.includes(keyword)
  ).length;

  const hedgingMatches = hedgingKeywords.filter((keyword) =>
    normalizedText.includes(keyword)
  );

  if (hasExperience) {
    signals.push({
      category: "Experience",
      status: "Strong signal",
      explanation:
        "The application contains language that clearly communicates experience or responsibility.",
    });
  } else {
    signals.push({
      category: "Experience",
      status: "Needs analysis",
      explanation:
        "The application does not clearly communicate experience using common action-oriented language.",
    });
  }

  if (directLanguageCount >= 2) {
    signals.push({
      category: "Language",
      status: "Strong signal",
      explanation:
        "Several statements use direct, action-oriented language that is easy to identify.",
    });
  } else if (hedgingMatches.length > 0) {
    signals.push({
      category: "Language",
      status: "Potential risk",
      explanation:
        "The application contains hedging or indirect phrasing that may be interpreted differently by an automated screening system.",
      quotes: hedgingMatches,
    });
  } else {
    signals.push({
      category: "Language",
      status: "Needs analysis",
      explanation:
        "The application contains limited evidence of strongly action-oriented language.",
    });
  }

  let score = 50;

  if (hasExperience) {
    score += 15;
  }

  score += Math.min(directLanguageCount * 5, 20);
  score -= Math.min(hedgingMatches.length * 5, 15);

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    signals,
    disclaimer:
      "This is an educational simulation based on documented patterns. It does not predict how any specific employer or hiring system will evaluate a candidate.",
  };
}