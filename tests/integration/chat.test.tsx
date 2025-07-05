import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import ChatUI from "../../app/components/ChatUI";

global.fetch = jest.fn();

describe("ChatUI Integration Test", () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it("renders chat UI and handles user input and streaming response", async () => {
    // Polyfill TextEncoder for Jest environment
    if (typeof global.TextEncoder === "undefined") {
      const { TextEncoder } = require("util");
      global.TextEncoder = TextEncoder;
    }

    // Polyfill ReadableStream for Jest environment
    if (typeof global.ReadableStream === "undefined") {
      const { ReadableStream } = require("web-streams-polyfill");
      global.ReadableStream = ReadableStream;
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode("Hello"));
        controller.enqueue(encoder.encode(" World"));
        controller.close();
      },
    });

    (fetch as jest.Mock).mockResolvedValue({
      body: stream,
      ok: true,
    });

    render(<ChatUI />);

    const input = screen.getByLabelText("Chat input");
    const sendButton = screen.getByRole("button", { name: /send/i });

    await userEvent.type(input, "Test message");
    fireEvent.click(sendButton);

    expect(input).toHaveValue("");
    expect(sendButton).toBeDisabled();

    await waitFor(() => {
      const messagesContainer = screen.getByTestId('messages-container');
      // Fix: use getAllByRole with 'listitem' and filter by class or text content instead of getAllByTestId
      const assistantMessages = Array.from(messagesContainer.querySelectorAll('li')).filter(li =>
        li.className.includes('bg-gray-200') || li.textContent?.includes('Hello World')
      );
      const lastMessage = assistantMessages[assistantMessages.length - 1];
      expect(lastMessage).toHaveTextContent('Hello World');
    });

    expect(sendButton).not.toBeDisabled();
  });

  it("shows error message on fetch failure", async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    render(<ChatUI />);

    const input = screen.getByLabelText("Chat input");
    const sendButton = screen.getByRole("button", { name: /send/i });

    await userEvent.type(input, "Test error");
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });
  });
});
