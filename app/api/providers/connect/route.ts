import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const providerId = url.searchParams.get("providerId");

  if (!providerId) {
    return NextResponse.json({ message: "Missing providerId" }, { status: 400 });
  }

  // Redirect to real provider connection URLs based on providerId
  let redirectUrl = "";

  switch (providerId) {
    case "elevenlabs":
      redirectUrl = "https://elevenlabs.io/connect"; // Adjust if specific OAuth URL is known
      break;
    case "lmnt":
      redirectUrl = "https://lmnt.com/connect"; // Adjust if specific OAuth URL is known
      break;
    case "pinecone":
      redirectUrl = "https://app.pinecone.io/"; // Pinecone connection URL
      break;
    default:
      redirectUrl = `https://example.com/connect?providerId=${encodeURIComponent(providerId)}`;
  }

  return NextResponse.redirect(redirectUrl);
}
