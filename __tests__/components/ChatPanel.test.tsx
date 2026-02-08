import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ChatPanel from "@/components/ChatPanel";

describe("ChatPanel", () => {
  const defaultProps = {
    messages: [] as { id: string; role: "user" | "assistant"; content: string }[],
    onSendMessage: jest.fn(),
    sessionId: "s1",
  };

  test("renders empty state", () => {
    render(<ChatPanel {...defaultProps} />);
    expect(screen.getByText("Ask questions about the lecture.")).toBeInTheDocument();
  });

  test("renders messages", () => {
    const messages = [
      { id: "1", role: "user" as const, content: "What is React?" },
      { id: "2", role: "assistant" as const, content: "React is a library." },
    ];
    render(<ChatPanel {...defaultProps} messages={messages} />);
    expect(screen.getByText("What is React?")).toBeInTheDocument();
    expect(screen.getByText("React is a library.")).toBeInTheDocument();
  });

  test("sends message on button click", () => {
    const onSendMessage = jest.fn();
    render(<ChatPanel {...defaultProps} onSendMessage={onSendMessage} />);
    const input = screen.getByPlaceholderText("Ask about the lecture...");
    fireEvent.change(input, { target: { value: "Hello" } });
    fireEvent.click(screen.getByText("Send"));
    expect(onSendMessage).toHaveBeenCalledWith("Hello");
  });

  test("sends message on Enter", () => {
    const onSendMessage = jest.fn();
    render(<ChatPanel {...defaultProps} onSendMessage={onSendMessage} />);
    const input = screen.getByPlaceholderText("Ask about the lecture...");
    fireEvent.change(input, { target: { value: "Hello" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSendMessage).toHaveBeenCalledWith("Hello");
  });

  test("input disabled without session", () => {
    render(<ChatPanel {...defaultProps} sessionId={null} />);
    const input = screen.getByPlaceholderText("Select a session first");
    expect(input).toBeDisabled();
  });

  test("send button disabled when input empty", () => {
    render(<ChatPanel {...defaultProps} />);
    expect(screen.getByText("Send")).toBeDisabled();
  });
});
