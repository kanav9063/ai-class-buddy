import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function embedText(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return res.data[0].embedding;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });
  return res.data.map((d) => d.embedding);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10);
}

export interface ScoredChunk {
  text: string;
  score: number;
  source: "transcript" | "notes";
}

export function searchSimilar(
  queryEmbedding: number[],
  items: { text: string; embedding: number[]; source: "transcript" | "notes" }[],
  topK: number = 5
): ScoredChunk[] {
  const scored = items.map((item) => ({
    text: item.text,
    score: cosineSimilarity(queryEmbedding, item.embedding),
    source: item.source,
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

export function chunkText(text: string, chunkSize: number = 500, overlap: number = 50): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    if (chunk.trim()) chunks.push(chunk.trim());
  }
  return chunks;
}
