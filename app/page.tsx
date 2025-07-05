import React from 'react';
import ChatUI from "./components/ChatUI";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen p-4 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-center">Agentic AI Coding Assistant</h1>
      <ChatUI />
    </main>
  );
}
