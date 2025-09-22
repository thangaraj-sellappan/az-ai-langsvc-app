import type { TextAnalyzerResponse } from "../model/text-analyzer-result-dto";

// Service layer for API calls
export async function analyzeText(text: string): Promise<TextAnalyzerResponse> {
  const res = await fetch("http://localhost:8000/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      statement: text
    })
  });
  if (!res.ok)
    throw new Error("Server error");
  return res.json();
}