import { NextRequest, NextResponse } from "next/server";

import { createMatch } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const result = await createMatch(payload);
    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create match.";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
