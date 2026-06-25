import { NextResponse } from "next/server";
import { getRiskModelResponse } from "@/lib/server/risk-intelligence/riskService";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getRiskModelResponse());
}
