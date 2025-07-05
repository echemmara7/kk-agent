"use client";

import React, { useState, useEffect, useRef } from "react";
import { m, Variants, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import AnimatedMessageBubble from "./AnimatedMessageBubble";
import ParticleBackground from "./ParticleBackground";
import ThinkingIndicator from "./ThinkingIndicator";
import CodePreviewWindow from "./CodePreviewWindow";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  isCodeSnippet?: boolean;
}

const messageVariants: Variants = {
  enter: (i: number) => ({
    opacity: 0,
    y: 50,
    rotateX: -90,
    transition: {
      delay: i * 0.05,
      type: "spring",
      bounce: 0.25,
      stiffness: 150,
    },
  }),
  active: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 },
  },
};

export default function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messageListRef = useRef<HTMLUListElement>(null);

  // Input dynamic height with useMotionValue and useTransform
  const inputRef = useRef<HTMLInputElement>(null);
  const inputHeight = useMotionValue(40);
  const maxInputHeight = 120;
  const inputScale = useTransform(inputHeight, [40, maxInputHeight], [1, 1.2]);

  // Emoji tray state
  const [showEmojiTray, setShowEmojiTray] = useState(false);

  useEffect(() => {
    // Scroll to bottom when messages update
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      const scrollHeight = inputRef.current.scrollHeight;
      const newHeight = Math.min(scrollHeight, maxInputHeight);
      inputHeight.set(newHeight);
    }
  }, [input, inputHeight]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let assistantMessage = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value);
          assistantMessage += chunk;
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.role === "assistant") {
              // Update last assistant message
              return [...prev.slice(0, -1), { role: "assistant", content: assistantMessage }];
            } else {
              // Add new assistant message
              return [...prev, { role: "assistant", content: assistantMessage }];
            }
          });
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto p-4 border rounded shadow relative bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <ParticleBackground density={30} interactionRadius={80} />
      <ul
        ref={messageListRef}
        className="flex-1 overflow-y-auto mb-4 p-2 border rounded bg-gray-50 dark:bg-gray-800"
        style={{ minHeight: "300px" }}
        data-testid="messages-container"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) =>
            msg.isCodeSnippet ? (
              <m.li
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                layout
                className="mb-2 p-2 rounded bg-gray-900 text-left text-sm font-mono overflow-auto"
              >
                <CodePreviewWindow language="typescript" code={msg.content} />
              </m.li>
            ) : (
              <AnimatedMessageBubble
                key={idx}
                variants={messageVariants}
                custom={idx}
                layoutRoot
                className={msg.role === "user" ? "bg-blue-200 text-right" : "bg-gray-200 text-left"}
              >
                <pre className="whitespace-pre-wrap">{msg.content}</pre>
              </AnimatedMessageBubble>
            )
          )}
          {isLoading && (
            <m.li
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-2 p-2 rounded bg-gray-200 text-left italic"
            >
              <ThinkingIndicator phase="active" />
            </m.li>
          )}
        </AnimatePresence>
      </ul>
      <form onSubmit={handleSubmit} className="flex items-center">
      <m.input
        ref={inputRef}
        type="text"
        className="flex-grow border rounded px-3 py-2 mr-2 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        placeholder="Type your message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => setShowEmojiTray(true)}
        onBlur={() => setShowEmojiTray(false)}
        disabled={isLoading}
        aria-label="Chat input"
        style={{ height: inputHeight, scale: inputScale, willChange: "transform" }}
        whileTap={{ scale: 0.95 }}
      />
      <AnimatePresence>
        {showEmojiTray && (
          <m.div
            key="emoji-tray"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-16 left-4 right-4 bg-white dark:bg-gray-800 border rounded shadow p-2 flex space-x-2 overflow-x-auto"
          >
            {["😀", "😂", "😍", "👍", "🎉", "🚀", "💡"].map((emoji) => (
              <m.button
                key={emoji}
                type="button"
                className="text-2xl"
                onClick={() => setInput((prev) => prev + emoji)}
                whileTap={{ scale: 0.8 }}
              >
                {emoji}
              </m.button>
            ))}
          </m.div>
        )}
      </AnimatePresence>
      <m.button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={isLoading}
        whileTap="tap"
        transition={{ type: "spring", bounce: 0.25, stiffness: 150 }}
      >
        Send
      </m.button>
      </form>
      {error && <div className="mt-2 text-red-600">{error}</div>}
    </div>
  );
}
