export interface AnalysisResult {
  species: string;
  confidence: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export async function analyzeAudio(
  audioBlob: Blob
): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.webm");

  const response = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(text || "Analysis request failed");
  }

  return response.json();
}
