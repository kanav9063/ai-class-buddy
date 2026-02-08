import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import TopBar from "@/components/TopBar";

const defaultProps = {
  sessions: [{ id: "s1", name: "Lecture 1", className: "CS101" }],
  currentSessionId: "s1",
  isRecording: false,
  noteFiles: [],
  onSelectSession: jest.fn(),
  onCreateSession: jest.fn(),
  onStartRecording: jest.fn(),
  onStopRecording: jest.fn(),
  onUploadFile: jest.fn().mockResolvedValue({}),
};

describe("TopBar", () => {
  test("renders session selector with sessions", () => {
    render(<TopBar {...defaultProps} />);
    expect(screen.getByText("+ New")).toBeInTheDocument();
    expect(screen.getByDisplayValue("CS101: Lecture 1")).toBeTruthy();
  });

  test("shows new session form when clicking + New", () => {
    render(<TopBar {...defaultProps} />);
    fireEvent.click(screen.getByText("+ New"));
    expect(screen.getByPlaceholderText("Session name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Class")).toBeInTheDocument();
  });

  test("calls onCreateSession when creating", () => {
    const onCreateSession = jest.fn();
    render(<TopBar {...defaultProps} onCreateSession={onCreateSession} />);
    fireEvent.click(screen.getByText("+ New"));
    fireEvent.change(screen.getByPlaceholderText("Session name"), { target: { value: "New Lecture" } });
    fireEvent.change(screen.getByPlaceholderText("Class"), { target: { value: "MATH200" } });
    fireEvent.click(screen.getByText("Create"));
    expect(onCreateSession).toHaveBeenCalledWith("New Lecture", "MATH200");
  });

  test("shows recording buttons when not recording", () => {
    render(<TopBar {...defaultProps} />);
    expect(screen.getByText("🎤 Mic")).toBeInTheDocument();
    expect(screen.getByText("🔊 Tab Audio")).toBeInTheDocument();
  });

  test("shows stop button when recording", () => {
    render(<TopBar {...defaultProps} isRecording={true} />);
    expect(screen.getByText("Stop Recording")).toBeInTheDocument();
  });

  test("shows note count when files present", () => {
    render(<TopBar {...defaultProps} noteFiles={["a.pdf", "b.txt"]} />);
    expect(screen.getByText("📎 2 notes")).toBeInTheDocument();
  });

  test("upload button disabled without session", () => {
    render(<TopBar {...defaultProps} currentSessionId={null} />);
    const btn = screen.getByText("📄 Upload Notes");
    expect(btn).toBeDisabled();
  });
});
