import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import TranscriptPanel from "@/components/TranscriptPanel";

describe("TranscriptPanel", () => {
  test("renders empty state", () => {
    render(<TranscriptPanel segments={[]} />);
    expect(screen.getByText("No transcript yet.")).toBeInTheDocument();
    expect(screen.getByText("Start recording to see live transcription.")).toBeInTheDocument();
  });

  test("renders transcript segments with timestamps", () => {
    const segments = [
      { id: "1", text: "Hello class", timestamp: 0 },
      { id: "2", text: "Today we learn React", timestamp: 65 },
    ];
    render(<TranscriptPanel segments={segments} />);
    expect(screen.getByText("Hello class")).toBeInTheDocument();
    expect(screen.getByText("Today we learn React")).toBeInTheDocument();
    expect(screen.getByText("00:00")).toBeInTheDocument();
    expect(screen.getByText("01:05")).toBeInTheDocument();
  });

  test("formats timestamps correctly", () => {
    const segments = [
      { id: "1", text: "Test", timestamp: 3661 }, // 61:01
    ];
    render(<TranscriptPanel segments={segments} />);
    expect(screen.getByText("61:01")).toBeInTheDocument();
  });
});
