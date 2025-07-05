import { NextRequest, NextResponse } from "next/server";

// Import or share installedProviders from index.ts
import { installedProviders } from "./index";

export async function POST(req: NextRequest) {
  try {
    const { providerId, plan, installationName } = await req.json();

    if (!providerId || !plan || !installationName) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // For demo, just add providerId to installedProviders if not already installed
    if (!installedProviders.includes(providerId)) {
      installedProviders.push(providerId);
    }

    // In real app, save installation details to DB or config

    return NextResponse.json({ message: "Provider installed successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Installation failed" },
      { status: 500 }
    );
  }
}
