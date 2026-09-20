const API_BASE_URL = "http://localhost:3001/api";

async function requestApi(endpoint, payload) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("Mirror received an invalid response from the API.");
  }

  if (!response.ok) {
    throw new Error(
      data?.error || "Mirror could not complete the request."
    );
  }

  return data;
}

export async function evaluateApplication({
  text,
  applicationType,
  role,
  focusAreas,
  jobDescription = "",
}) {
  return requestApi("/evaluate", {
    text,
    applicationType,
    role,
    focusAreas,
    jobDescription,
  });
}

export async function reviseApplication({
  originalText,
  applicationType,
  role,
  revisionIntent,
  jobDescription = "",
}) {
  return requestApi("/revise", {
    originalText,
    applicationType,
    role,
    revisionIntent,
    jobDescription,
  });
}

export async function compareApplications({
  originalText,
  revisedText,
  changeIntent,
  applicationType,
  role,
  focusAreas,
  jobDescription = "",
}) {
  return requestApi("/compare", {
    originalText,
    revisedText,
    changeIntent,
    applicationType,
    role,
    focusAreas,
    jobDescription,
  });
}