export async function evaluateApplication({
  text,
  applicationType,
  role,
  focusAreas,
}) {
  const response = await fetch("http://localhost:3001/api/evaluate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      applicationType,
      role,
      focusAreas,
    }),
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("Mirror received an invalid response from the API.");
  }

  if (!response.ok) {
    throw new Error(
      data?.error || "Mirror could not complete the analysis."
    );
  }

  return data;
}