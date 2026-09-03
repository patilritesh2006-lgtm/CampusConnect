import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import AIAssistant from "./AIAssistant";
import API from "../api/api";

vi.mock("../api/api", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("🧠 AI Campus Copilot 2.0 Component", () => {
  it("opens Copilot drawer and responds to student queries", async () => {
    API.post.mockResolvedValueOnce({
      data: {
        success: true,
        reply: "Here are top events curated for your profile: Python Masterclass.",
        suggestedActions: [{ label: "Explore Events", link: "/student-events" }],
      },
    });

    render(
      <BrowserRouter>
        <AIAssistant />
      </BrowserRouter>
    );

    // Toggle button opens drawer
    const toggleButton = screen.getByText(/AI Campus Copilot/i);
    expect(toggleButton).toBeInTheDocument();
    fireEvent.click(toggleButton);

    // Verify Copilot header appears
    expect(screen.getByText(/AI Campus Copilot 2.0/i)).toBeInTheDocument();

    // Type query
    const input = screen.getByPlaceholderText(/Ask about events, skills, or achievements/i);
    fireEvent.change(input, { target: { value: "Recommend workshops" } });

    // Submit form
    fireEvent.submit(input.closest("form"));

    await waitFor(() => {
      expect(screen.getByText(/Python Masterclass/i)).toBeInTheDocument();
      expect(screen.getByText(/Explore Events/i)).toBeInTheDocument();
    });
  });
});