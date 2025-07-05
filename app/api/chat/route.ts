import { xai } from '@ai-sdk/xai';
import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { route } from '@fal-ai/serverless-proxy/nextjs';

const systemPrompt =
  "You are CodeAgent, an autonomous full-stack coding assistant.\n\n" +
  "Your job is to:\n" +
  "- Understand complex software engineering tasks\n" +
  "- Design and implement full solutions across backend, frontend, and APIs\n" +
  "- Write complete code (well-structured, idiomatic, modular)\n" +
  "- Use reasoning to decide what files, libraries, or patterns to use\n" +
  "- Respond with clean, copy-paste-ready code blocks\n" +
  "- Explain decisions only when asked — otherwise, be direct and efficient\n\n" +
  "You have access to tools and capabilities including:\n" +
  "- JavaScript, TypeScript, Python, Go, Rust, SQL, and Shell scripting\n" +
  "- Frameworks: Next.js, React, Express, FastAPI, Flask, TailwindCSS, Prisma\n" +
  "- Vercel AI SDK for building agentic, streaming chat UIs\n" +
  "- File system simulation: You can create or modify files and return file paths and contents\n" +
  "- Git commands and CLI instructions\n" +
  "- MCP client to call external MCP servers and tools\n\n" +
  "Instructions:\n" +
  "- When given a user request, first plan the steps\n" +
  "- Then execute each step in order, returning the relevant code or explanation\n" +
  "- If asked to \"build X\", return the full code in a structured format\n" +
  "- Never hallucinate library names — check if they exist in npm or PyPI\n" +
  "- When unsure, ask clarifying questions before continuing\n\n" +
  "Behavior settings:\n" +
  "- Smart and focused\n" +
  "- Code-first: Always respond with code\n" +
  "- Structured output: Use folders/files structure when returning multi-file output\n" +
  "- You are allowed to make assumptions to move fast, but note them clearly\n";

export const runtime = "edge";

const xaiModel = xai('grok-2-1212');
const groqModel = groq('llama-3.1-8b-instant');

// MCP server URL - replace with your actual MCP server URL or get from env
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || "http://localhost:3000/api/mcp";

async function callMcpTool(userInput: string) {
  // Example: Call MCP server tool via HTTP POST to MCP server URL
  // This is a simplified example assuming the MCP server supports Streamable HTTP transport

  // List tools
  const listToolsResponse = await fetch(MCP_SERVER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      method: "listTools",
      params: {},
    }),
  });

  if (!listToolsResponse.ok) {
    throw new Error("Failed to list MCP tools");
  }

  const listToolsData = await listToolsResponse.json();
  const tools = listToolsData.result?.tools || [];
  if (tools.length === 0) {
    throw new Error("No tools available on MCP server");
  }

  const tool = tools[0];

  // Call the tool with userInput as argument if tool expects input
  const callToolResponse = await fetch(MCP_SERVER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      method: "callTool",
      params: {
        name: tool.name,
        arguments: { input: userInput },
      },
    }),
  });

  if (!callToolResponse.ok) {
    throw new Error("Failed to call MCP tool");
  }

  const callToolData = await callToolResponse.json();
  const content = callToolData.result?.content || [];
  const text = content.map((c: any) => c.text).join("\n") || "No response from MCP tool";

  return text;
}

export async function POST(req: Request) {
  const { messages, provider } = await req.json();

  const fullMessages = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  // Decide whether to call MCP tool or AI model based on messages and provider
  // For simplicity, if the last user message contains "mcp", call MCP tool
  const lastUserMessage = messages.filter((m: any) => m.role === "user").slice(-1)[0]?.content || "";
  let responseTextStream;

  try {
    if (lastUserMessage.toLowerCase().includes("mcp")) {
      // Call MCP tool and stream response
      const mcpText = await callMcpTool(lastUserMessage);

      // Create a ReadableStream to simulate streaming response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(mcpText));
          controller.close();
        },
      });
      responseTextStream = stream;
    } else {
      // Call selected AI model and stream response
      let selectedModel;
      if (provider === 'groq') {
        selectedModel = groqModel;
      } else if (provider === 'fal') {
        // Use fal serverless proxy route for fal provider
        // This example assumes fal proxy is set up at /api/fal/proxy
        // We forward the request to the fal proxy route
        const falResponse = await fetch(new URL('/api/fal/proxy', req.url).toString(), {
          method: 'POST',
          headers: req.headers,
          body: await req.text(),
        });
        return falResponse;
      } else {
        selectedModel = xaiModel;
      }
      if (selectedModel) {
        const response = await streamText({
          model: selectedModel,
          messages: fullMessages,
        });
        responseTextStream = response.textStream;
      }
    }
  } catch (error: any) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode("Error: " + error.message));
        controller.close();
      },
    });
    responseTextStream = stream;
  }

  return new Response(responseTextStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
