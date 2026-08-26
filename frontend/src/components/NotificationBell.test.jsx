import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import NotificationBell from "./NotificationBell";
import API from "../api/api";

// Mock API
vi.mock("../api/api", () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe("🔔 NotificationBell Component", () => {
  it("renders notification bell icon and shows unread badge counter", async () => {
    API.get.mockResolvedValueOnce({
      data: {
        success: true,
        unreadCount: 3,
        notifications: [
          {
            id: "notif-1",
            title: "Certificate Issued",
            message: "Your certificate is ready.",
            type: "CERTIFICATE",
            isRead: false,
            createdAt: new Date().toISOString(),
          },
        ],
      },
    });

    render(
      <BrowserRouter>
        <NotificationBell />
      </BrowserRouter>
    );

    // Verify Bell button renders
    const bellButton = screen.getByRole("button", { name: /notifications/i });
    expect(bellButton).toBeInTheDocument();

    // Verify unread badge count appears
    await waitFor(() => {
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    // Open dropdown
    fireEvent.click(bellButton);

    // Check title in dropdown
    expect(screen.getByText("Certificate Issued")).toBeInTheDocument();
    expect(screen.getByText("Your certificate is ready.")).toBeInTheDocument();
  });
});
