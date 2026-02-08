import { cosineSimilarity, searchSimilar, chunkText } from "@/lib/embeddings";

describe("cosineSimilarity", () => {
  test("identical vectors return ~1", () => {
    const v = [1, 2, 3];
    expect(cosineSimilarity(v, v)).toBeCloseTo(1, 5);
  });

  test("orthogonal vectors return ~0", () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0, 5);
  });

  test("opposite vectors return ~-1", () => {
    expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1, 5);
  });

  test("handles normalized vectors", () => {
    const a = [0.6, 0.8];
    const b = [0.8, 0.6];
    const expected = 0.6 * 0.8 + 0.8 * 0.6; // 0.96
    expect(cosineSimilarity(a, b)).toBeCloseTo(expected, 4);
  });
});

describe("searchSimilar", () => {
  test("returns top K results sorted by score", () => {
    const query = [1, 0];
    const items = [
      { text: "A", embedding: [1, 0], source: "notes" as const },
      { text: "B", embedding: [0, 1], source: "transcript" as const },
      { text: "C", embedding: [0.7, 0.7], source: "notes" as const },
    ];
    const results = searchSimilar(query, items, 2);
    expect(results).toHaveLength(2);
    expect(results[0].text).toBe("A");
    expect(results[0].score).toBeCloseTo(1, 3);
    expect(results[1].text).toBe("C");
  });

  test("returns all if fewer than topK", () => {
    const results = searchSimilar([1, 0], [{ text: "A", embedding: [1, 0], source: "notes" as const }], 5);
    expect(results).toHaveLength(1);
  });
});

describe("chunkText", () => {
  test("chunks text by word count with overlap", () => {
    const words = Array.from({ length: 20 }, (_, i) => `word${i}`).join(" ");
    const chunks = chunkText(words, 10, 2);
    expect(chunks.length).toBeGreaterThanOrEqual(2);
    // First chunk has 10 words
    expect(chunks[0].split(/\s+/)).toHaveLength(10);
  });

  test("returns single chunk for short text", () => {
    const chunks = chunkText("hello world", 500, 50);
    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toBe("hello world");
  });

  test("returns empty for empty text", () => {
    const chunks = chunkText("", 500, 50);
    expect(chunks).toHaveLength(0);
  });

  test("handles exact chunk size", () => {
    const words = Array.from({ length: 10 }, (_, i) => `w${i}`).join(" ");
    const chunks = chunkText(words, 10, 0);
    expect(chunks).toHaveLength(1);
  });
});
