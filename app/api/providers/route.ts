import { NextRequest, NextResponse } from "next/server";

// Mock data for providers
const providers = [
  {
    id: "xai-marketplace",
    name: "xAIMarketplace",
    description: "An AI service with an efficient text model and a wide context image understanding model.",
    type: "native",
    installed: false,
    plans: ["Free", "Pro", "Enterprise"],
    website: "/docs/ai/xai",
    pricing: "See website",
    documentation: "/docs/ai/xai",
  },
  {
    id: "groq-marketplace",
    name: "GroqMarketplace",
    description: "A high-performance AI inference service with an ultra-fast Language Processing Unit (LPU) architecture.",
    type: "native",
    installed: false,
    plans: ["Basic", "Advanced"],
    website: "/docs/ai/groq",
    pricing: "See website",
    documentation: "/docs/ai/groq",
  },
  {
    id: "fal-marketplace",
    name: "falMarketplace",
    description: "A serverless AI inferencing platform for creative processes.",
    type: "native",
    installed: false,
    plans: ["Starter", "Business"],
    website: "/docs/ai/fal",
    pricing: "See website",
    documentation: "/docs/ai/fal",
  },
  {
    id: "deepinfra-marketplace",
    name: "DeepInfraMarketplace",
    description: "A platform with access to a vast library of open-source models.",
    type: "native",
    installed: false,
    plans: ["Free", "Premium"],
    website: "/docs/ai/deepinfra",
    pricing: "See website",
    documentation: "/docs/ai/deepinfra",
  },
  {
    id: "connectable-example",
    name: "Example Connectable Provider",
    description: "A connectable account provider example.",
    type: "connectable",
    installed: false,
    website: "https://example.com",
    pricing: "See website",
    documentation: "https://example.com/docs",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    description:
      "Advanced voice synthesis and audio processing technologies for natural-sounding speech and audio enhancements.",
    type: "connectable",
    installed: false,
    website: "https://elevenlabs.io",
    pricing: "See https://elevenlabs.io/pricing",
    documentation: "https://elevenlabs.io/docs",
  },
  {
    id: "lmnt",
    name: "LMNT",
    description:
      "Data processing and predictive analytics models for high quality text-to-speech and custom voices with low latency.",
    type: "connectable",
    installed: false,
    website: "https://lmnt.com",
    pricing: "See https://lmnt.com/pricing",
    documentation: "https://docs.lmnt.com",
  },
  {
    id: "pinecone",
    name: "Pinecone",
    description:
      "A vector database service for machine learning models, content recommendation, personalized search, and more.",
    type: "connectable",
    installed: false,
    website: "https://pinecone.io",
    pricing: "See https://pinecone.io/pricing",
    documentation: "https://docs.pinecone.io",
  },
];

export let installedProviders: string[] = [];

export async function GET(req: NextRequest) {
  // Return providers with installed flag updated
  const responseProviders = providers.map((p) => ({
    ...p,
    installed: installedProviders.includes(p.id),
  }));

  return NextResponse.json({ providers: responseProviders });
}
