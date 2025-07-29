import type { TextAnalyzerResponse } from "../model/text-analyzer-result-dto";

// Service layer for API calls
export async function analyzeText(text: string): Promise<TextAnalyzerResponse> {
  const res = await fetch("http://localhost:8000/analyze?statement=" + text, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok)
    throw new Error("Server error");
  return res.json();
}